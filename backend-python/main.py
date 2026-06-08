from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from google import genai
import json
import tempfile
import os
import re
from typing import Optional

from outils import purifier_latex_integral, compiler_en_pdf, indexer_bo_fichiers
from vision_socratique import traiter_document_gemini, generer_remediation_socratique_pdf

app = FastAPI(title="Care Online Science Correction API", version="1.0.0")

# Setup CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API client initialization helper
def get_gemini_client(api_key: str):
    if not api_key:
        raise HTTPException(status_code=400, detail="Clé API Gemini (GEMINI_API_KEY) manquante.")
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'initialisation de l'API Gemini : {str(e)}")

@app.post("/api/correct")
async def correct_copy(
    gemini_api_key: str = Form(...),
    model_name: str = Form("gemini-1.5-flash"),
    nom_eleve: Optional[str] = Form(None),
    sujet_file: Optional[UploadFile] = File(None),
    correction_file: Optional[UploadFile] = File(None),
    copie_file: UploadFile = File(...)
):
    """
    Reçoit le sujet, le barème et la copie de l'élève, appelle Gemini et compile la correction en PDF.
    """
    client = get_gemini_client(gemini_api_key)
    
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
    gemini_api_key: str = Form(...),
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
    """
    client = get_gemini_client(gemini_api_key)
    
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
