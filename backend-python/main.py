from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from google import genai
import json
import tempfile
import os
import re
from typing import Optional, List, Literal

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from pydantic import BaseModel

from outils import purifier_latex_integral, compiler_en_pdf, indexer_bo_fichiers
from vision_socratique import traiter_document_gemini, generer_remediation_socratique_pdf

# SQLite / SQLAlchemy Setup
DATABASE_URL = "sqlite:///./classes.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBClass(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    students_count = Column(Integer, default=0)
    average_grade = Column(Float, nullable=True)
    presence_rate = Column(Float, default=100.0)

# ---------------------------------------------------------------------------
# Resource Model
# ---------------------------------------------------------------------------

# Allowed enum values (enforced at the Pydantic level)
SCHOOL_TYPES = Literal["college", "lycee", "lycee_pro"]
RESOURCE_TYPES = Literal["pdf", "html_custom", "streamlit_app", "link"]
SUBJECT_TYPES = Literal["Mathematiques", "Sciences Physiques", "SNT"]

class DBResource(Base):
    """Collaborative resource shared between authenticated teachers."""
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    school_type = Column(String, nullable=False)   # college | lycee | lycee_pro
    grade_level = Column(String, nullable=False)   # 6eme | 5eme | seconde | terminale …
    resource_type = Column(String, nullable=False) # pdf | html_custom | streamlit_app | link
    subject = Column(String, nullable=False, default="Mathematiques")  # Mathematiques | Sciences Physiques | SNT
    content_url = Column(String, nullable=False)
    created_by = Column(String, nullable=False)    # email of the user who added the resource
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Pydantic schemas — Classes
# ---------------------------------------------------------------------------
class ClassBase(BaseModel):
    name: str
    description: Optional[str] = None
    students_count: int = 0
    average_grade: Optional[float] = None
    presence_rate: float = 100.0

class ClassCreate(ClassBase):
    pass

class ClassUpdate(ClassBase):
    pass

class ClassResponse(ClassBase):
    id: int
    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# Pydantic schemas — Resources
# ---------------------------------------------------------------------------
class ResourceBase(BaseModel):
    title: str
    school_type: SCHOOL_TYPES
    grade_level: str
    resource_type: RESOURCE_TYPES
    subject: SUBJECT_TYPES
    content_url: str
    created_by: str

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(ResourceBase):
    pass

class ResourceResponse(ResourceBase):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(title="Care Online Science Correction API", version="1.0.0")

# Setup CORS for production and development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://care-online.fr",
        "https://www.care-online.fr",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API client initialization helper — reads key from environment variable
def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="Clé API Gemini introuvable. Veuillez définir la variable d'environnement GEMINI_API_KEY sur le serveur.")
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'initialisation de l'API Gemini : {str(e)}")

@app.post("/api/correct")
async def correct_copy(
    model_name: str = Form("gemini-1.5-flash"),
    nom_eleve: Optional[str] = Form(None),
    sujet_file: Optional[UploadFile] = File(None),
    correction_file: Optional[UploadFile] = File(None),
    copie_file: UploadFile = File(...)
):
    """
    Reçoit le sujet, le barème et la copie de l'élève, appelle Gemini et compile la correction en PDF.
    La clé API Gemini est lue depuis la variable d'environnement GEMINI_API_KEY.
    """
    client = get_gemini_client()
    
    # Déterminer le nom de l'élève à partir du fichier s'il n'est pas fourni
    if not nom_eleve:
        nom_eleve = copie_file.filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()

    # Sauvegarder temporairement les fichiers reçus pour les envoyer à Gemini
    gemini_sujet = None
    gemini_corr = None
    gemini_copie = None
    
    temp_files = []
    
    try:
        # Traitement du sujet si fourni
        if sujet_file and sujet_file.filename:
            suffix = "." + sujet_file.filename.split('.')[-1].lower()
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(await sujet_file.read())
                temp_files.append(tmp.name)
                gemini_sujet = client.files.upload(file=tmp.name)
                
        # Traitement de la correction si fournie
        if correction_file and correction_file.filename:
            suffix = "." + correction_file.filename.split('.')[-1].lower()
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(await correction_file.read())
                temp_files.append(tmp.name)
                gemini_corr = client.files.upload(file=tmp.name)

        # Traitement obligatoire de la copie élève
        suffix = "." + copie_file.filename.split('.')[-1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await copie_file.read())
            temp_files.append(tmp.name)
            gemini_copie = client.files.upload(file=tmp.name)
            
        # Appel du cerveau de correction de vision_socratique
        diagnostic_complet = generer_remediation_socratique_pdf(
            client, model_name, gemini_sujet, gemini_corr, gemini_copie, nom_eleve
        )
        
        # 1. Extraction des données structurées
        note, forces, faiblesses = "Non spécifié", "Non spécifié", "Non spécifié"
        if "[DATA_SHEET]" in diagnostic_complet and "[END_DATA_SHEET]" in diagnostic_complet:
            data_block = diagnostic_complet.split("[DATA_SHEET]")[1].split("[END_DATA_SHEET]")[0]
            for line in data_block.split('\n'):
                if line.startswith("Note:"): note = line.replace("Note:", "").strip()
                elif line.startswith("Forces:"): forces = line.replace("Forces:", "").strip()
                elif line.startswith("Faiblesses:"): faiblesses = line.replace("Faiblesses:", "").strip()
                
        # 2. Extraction du code LaTeX
        code_latex = ""
        pdf_base64 = None
        has_pdf = False
        
        if "[DEBUT_LATEX]" in diagnostic_complet and "[FIN_LATEX]" in diagnostic_complet:
            code_latex = diagnostic_complet.split("[DEBUT_LATEX]")[1].split("[FIN_LATEX]")[0].strip()
            # Compiler en PDF
            pdf_data = compiler_en_pdf(code_latex)
            if pdf_data:
                import base64
                pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
                has_pdf = True

        return JSONResponse(content={
            "success": True,
            "nom_eleve": nom_eleve,
            "note": note,
            "forces": forces,
            "faiblesses": faiblesses,
            "has_pdf": has_pdf,
            "pdf_data": pdf_base64,
            "code_latex": code_latex
        })
        
    except Exception as e:
        return JSONResponse(status_code=500, content={
            "success": False,
            "detail": f"Erreur lors du traitement de la correction : {str(e)}"
        })
    finally:
        # Nettoyage des fichiers temporaires locaux
        for path in temp_files:
            if os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass

@app.post("/api/generate-subject")
async def generate_subject(
    model_name: str = Form("gemini-1.5-flash"),
    niveau: str = Form("seconde"),
    duree: str = Form("1 heure"),
    difficulte: str = Form("Expert"),
    type_doc: str = Form("DS Contextualisé"),
    opt_python: bool = Form(True),
    opt_dim: bool = Form(True),
    opt_incert: bool = Form(True),
    sujet: str = Form(...)
):
    """
    Génère un sujet d'examen ou TP au format LaTeX purifié et compile en PDF.
    La clé API Gemini est lue depuis la variable d'environnement GEMINI_API_KEY.
    """
    client = get_gemini_client()
    
    consigne_difficulte = "ATTENTION MODE EXPERT : Le sujet doit être très dense et transversal." if difficulte == "Expert" else ("MODE APPROFONDI : Inclus un exercice d'extraction de données graphique." if difficulte == "Approfondi" else "MODE STANDARD : Exercices très guidés.")
    consignes_specifiques = []
    if opt_python: consignes_specifiques.append("- Code Python.")
    if opt_dim: consignes_specifiques.append("- Analyse dimensionnelle.")
    if opt_incert: consignes_specifiques.append("- Calculs d'incertitudes.")
    
    bloc_options = "Compétences obligatoires :\n" + "\n".join(consignes_specifiques) if consignes_specifiques else ""
    
    sys_inst = f"""Tu es Professeur Agrégé de Physique-Chimie. NIVEAU : {niveau}. 
    Produis un document LaTeX complet pour une durée de {duree}.
    {consigne_difficulte}\n{bloc_options}
    RÈGLES ABSOLUES: 1. Grandeurs en math. 2. Unités en \\SI{{}}{{}}. 3. Chimie en \\ce{{}}. 
    4. Code Python sans accent. 5. Graphiques avec pgfplots.
    Encadre ton code par ```latex et ``` sans aucun texte autour."""
    
    requete = [f"Rédige un {type_doc} sur : {sujet}."]
    
    # Charger les BO si présents
    dict_bo = indexer_bo_fichiers(client)
    if dict_bo.get(niveau):
        requete.append(dict_bo.get(niveau))
        
    try:
        reponse = client.models.generate_content(
            model=model_name,
            config={'system_instruction': sys_inst, 'temperature': 0.2},
            contents=requete
        )
        
        reponse_text = reponse.text
        match = re.search(r'```latex\n(.*?)\n```', reponse_text, re.DOTALL)
        code_brut = match.group(1) if match else reponse_text
        code_propre = purifier_latex_integral(code_brut)
        
        pdf_data = compiler_en_pdf(code_propre)
        pdf_base64 = None
        has_pdf = False
        if pdf_data:
            import base64
            pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
            has_pdf = True
            
        return JSONResponse(content={
            "success": True,
            "code_latex": code_propre,
            "has_pdf": has_pdf,
            "pdf_data": pdf_base64
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={
            "success": False,
            "detail": f"Erreur de génération : {str(e)}"
        })

# ---------------------------------------------------------------------------
# CRUD Endpoints — Classes
# ---------------------------------------------------------------------------
@app.get("/api/classes", response_model=List[ClassResponse])
def read_classes(db: Session = Depends(get_db)):
    return db.query(DBClass).all()

@app.post("/api/classes", response_model=ClassResponse)
def create_class(class_data: ClassCreate, db: Session = Depends(get_db)):
    db_class = DBClass(**class_data.dict())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

@app.put("/api/classes/{class_id}", response_model=ClassResponse)
def update_class(class_id: int, class_data: ClassUpdate, db: Session = Depends(get_db)):
    db_class = db.query(DBClass).filter(DBClass.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Classe introuvable")
    for key, value in class_data.dict().items():
        setattr(db_class, key, value)
    db.commit()
    db.refresh(db_class)
    return db_class

@app.delete("/api/classes/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db)):
    db_class = db.query(DBClass).filter(DBClass.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Classe introuvable")
    db.delete(db_class)
    db.commit()
    return {"success": True, "detail": "Classe supprimée avec succès"}

# ---------------------------------------------------------------------------
# CRUD Endpoints — Resources (Hub de Ressources Collaboratif)
# All endpoints are accessible to any authenticated user.
# ---------------------------------------------------------------------------
@app.get("/api/resources", response_model=List[ResourceResponse])
def list_resources(
    school_type: Optional[str] = None,
    grade_level: Optional[str] = None,
    resource_type: Optional[str] = None,
    subject: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all resources. Optional query parameters allow filtering by
    school_type, grade_level, resource_type, or subject.
    """
    query = db.query(DBResource)
    if school_type:
        query = query.filter(DBResource.school_type == school_type)
    if grade_level:
        query = query.filter(DBResource.grade_level == grade_level)
    if resource_type:
        query = query.filter(DBResource.resource_type == resource_type)
    if subject:
        query = query.filter(DBResource.subject == subject)
    return query.order_by(DBResource.created_at.desc()).all()

@app.post("/api/resources", response_model=ResourceResponse, status_code=201)
def create_resource(resource_data: ResourceCreate, db: Session = Depends(get_db)):
    """Create a new resource in the collaborative hub."""
    db_resource = DBResource(**resource_data.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@app.put("/api/resources/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: int,
    resource_data: ResourceUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing resource."""
    db_resource = db.query(DBResource).filter(DBResource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Ressource introuvable")
    for key, value in resource_data.dict().items():
        setattr(db_resource, key, value)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@app.delete("/api/resources/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    """Delete a resource from the hub."""
    db_resource = db.query(DBResource).filter(DBResource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Ressource introuvable")
    db.delete(db_resource)
    db.commit()
    return {"success": True, "detail": "Ressource supprimée avec succès"}

@app.on_event("startup")
def startup_populate_db():
    # ---------------------------------------------------------------------------
    # Safe schema migration: add 'subject' column if it doesn't exist yet.
    # This handles the upgrade from the previous schema without data loss.
    # ---------------------------------------------------------------------------
    try:
        with engine.connect() as conn:
            conn.execute(text(
                "ALTER TABLE resources ADD COLUMN subject VARCHAR NOT NULL DEFAULT 'Mathematiques'"
            ))
            conn.commit()
    except Exception:
        # Column already exists — nothing to do.
        pass

    db = SessionLocal()
    try:
        if db.query(DBClass).count() == 0:
            mock_classes = [
                DBClass(name="Terminale S1", description="Mathématiques Spécialité", students_count=28, average_grade=14.2, presence_rate=98.2),
                DBClass(name="Seconde B", description="Mathématiques Générales", students_count=32, average_grade=12.8, presence_rate=95.5),
                DBClass(name="Première A", description="Sciences de l'Ingénieur", students_count=18, average_grade=15.1, presence_rate=97.0),
                DBClass(name="Terminale S2", description="Soutien Mathématiques", students_count=14, average_grade=11.5, presence_rate=94.8),
            ]
            db.bulk_save_objects(mock_classes)
            db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
