import streamlit as st
from google import genai
import re
import time
import os
import json
import gspread
from gspread.exceptions import SpreadsheetNotFound
from google.oauth2.service_account import Credentials
from PIL import Image

# Importation de vos modules
from outils import purifier_latex_integral, compiler_en_pdf, indexer_bo_fichiers
from vision_socratique import traiter_document_gemini, generer_remediation_socratique_pdf

st.set_page_config(page_title="Expert Agrégé Phys-Chim v8.8", layout="wide", page_icon="🎓")

B = chr(96) * 3

# --- INITIALISATION DES CLÉS ---
apiKey = st.secrets.get("GEMINI_API_KEY", "")
client = genai.Client(api_key=apiKey) if apiKey else None

def connect_gspread():
    try:
        if "GOOGLE_CREDENTIALS" in st.secrets:
            creds_dict = json.loads(st.secrets["GOOGLE_CREDENTIALS"])
            scopes = [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive"
            ]
            creds = Credentials.from_service_account_info(creds_dict, scopes=scopes)
            return gspread.authorize(creds)
    except Exception as e:
        st.error(f"Erreur d'authentification Google : {e}")
    return None

@st.cache_resource
def obtenir_modeles_autorises():
    try:
        modeles_dispos = []
        for m in client.models.list():
            nom_propre = m.name.replace("models/", "")
            if ("flash" in nom_propre or "pro" in nom_propre) and "2.0" not in nom_propre:
                modeles_dispos.append(nom_propre)
        if "gemini-1.5-flash" in modeles_dispos:
            modeles_dispos.insert(0, modeles_dispos.pop(modeles_dispos.index("gemini-1.5-flash")))
        return modeles_dispos if modeles_dispos else ["gemini-1.5-flash"]
    except Exception:
        return ["gemini-1.5-flash"]

liste_modeles = obtenir_modeles_autorises()

st.sidebar.title("🤖 Moteur IA")
NOM_MODELE = st.sidebar.selectbox("Modèle actif", options=liste_modeles)
st.sidebar.success(f"Modèle prêt : {NOM_MODELE}")

st.title("👨‍🏫 Expert Agrégé Sciences Physiques v8.8")
st.caption("Création de Devoirs, Correction & Suivi Trimestriel Automatisé")

dict_bo = indexer_bo_fichiers(client) if client else {}

tab_conception, tab_vision, tab_notebook = st.tabs(["📝 Conception de Sujet", "💬 Correction & Suivi Trimestre", "🧠 NotebookLM"])

# --- ONGLET 1 : CONCEPTION ---
with tab_conception:
    c_gauche, c_droite = st.columns([1, 2])
    with c_gauche:
        st.subheader("⚙️ Paramètres généraux")
        niveau = st.selectbox("Niveau", ["seconde", "premiere", "terminale"])
        duree = st.selectbox("Durée de l'épreuve", ["30 minutes", "1 heure", "1,5 heure", "2 heures", "4 heures (Type Bac)"])
        difficulte = st.select_slider("Difficulté", options=["Standard", "Approfondi", "Expert"], value="Expert")
        type_doc = st.selectbox("Format", ["DS Contextualisé", "Activité TP", "Cours", "Quiz"])
        
        st.subheader("🎯 Exigences spécifiques")
        opt_python = st.checkbox("🐍 Inclure du code Python", value=True)
        opt_dim = st.checkbox("📐 Inclure une analyse dimensionnelle", value=True)
        opt_incert = st.checkbox("⚖️ Inclure des calculs d'incertitudes", value=True)
        
        st.divider()
        sujet = st.text_input("Thème précis", placeholder="Ex: Titrage de la vitamine C")
        btn_generer = st.button("🚀 GÉNÉRER LE DOCUMENT", use_container_width=True)
        
        if dict_bo.get(niveau):
            st.success(f"✅ Programme {niveau} chargé")

    with c_droite:
        if btn_generer and sujet and client:
            with st.spinner(f"Rédaction d'un sujet de {duree} via {NOM_MODELE}..."):
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
                Encadre ton code par {B}latex et {B} sans aucun texte autour."""
                
                requete = [f"Rédige un {type_doc} sur : {sujet}."]
                if dict_bo.get(niveau): requete.append(dict_bo.get(niveau))

                try:
                    reponse = None
                    for wait_time in [1, 2, 4]:
                        try:
                            reponse = client.models.generate_content(
                                model=NOM_MODELE,
                                config={'system_instruction': sys_inst, 'temperature': 0.2},
                                contents=requete
                            )
                            if reponse: break
                        except Exception as e:
                            time.sleep(wait_time)
                    
                    if reponse and hasattr(reponse, 'text') and reponse.text:
                        match = re.search(B + r'(?:latex)?\n(.*?)\n' + B, reponse.text, re.DOTALL)
                        code_brut = match.group(1) if match else reponse.text
                        code_propre = purifier_latex_integral(code_brut)
                        
                        st.subheader("📄 Code Source Purifié")
                        st.code(code_propre, language='latex')
                        
                        b_tex, b_pdf = st.columns(2)
                        with b_tex: st.download_button("📥 TÉLÉCHARGER .TEX", code_propre, f"{sujet}.tex")
                        with b_pdf:
                            pdf_data = compiler_en_pdf(code_propre)
                            if pdf_data: st.download_button("📕 TÉLÉCHARGER LE PDF", pdf_data, f"{sujet}.pdf", "application/pdf")
                            else: st.error("⚠️ Compilation PDF impossible.")
                except Exception as e:
                    st.error(f"❌ Erreur système : {e}")

# --- ONGLET 2 : VISION SOCRATIQUE AVANCÉE ---
with tab_vision:
    st.subheader("📁 Étape 1 : Classement et Suivi Trimestriel")
    col_archive1, col_archive2, col_archive3, col_archive4 = st.columns(4)
    with col_archive1:
        archive_classe = st.text_input("Classe (ex: 1ere_Spe)", value="1ere_Spe")
    with col_archive2:
        archive_theme = st.text_input("Évaluation (ex: DS_Redox)", value="DS_Redox")
    with col_archive3:
        nom_google_sheet = st.text_input("Fichier Google Sheets", value="Suivi_Trimestre_Physique")
    with col_archive4:
        email_prof = st.text_input("Votre Email (si 1ère création)", placeholder="prof@email.com")
    
    st.divider()
    
    st.subheader("📄 Étape 2 : Dépôt des documents")
    col1, col2, col3 = st.columns(3)
    with col1:
        st.info("📑 1. Le Sujet")
        pdf_sujet = st.file_uploader("Fichier sujet", type=["pdf"])
    with col2:
        st.info("✅ 2. Le Barème")
        pdf_correction = st.file_uploader("Fichier correction", type=["pdf"])
    with col3:
        st.info("✍️ 3. La Copie (Élève)")
        pdf_copie = st.file_uploader("Scan de l'élève", type=["pdf", "jpg", "jpeg", "png"])
        
    if pdf_copie and client:
        nom_eleve = pdf_copie.name.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
        st.success(f"🎓 Élève détecté : **{nom_eleve}**")
        
        if st.button("🧠 GÉNÉRER LA CORRECTION ET ARCHIVER LES DONNÉES", use_container_width=True):
            with st.spinner(f"Analyse de la copie de {nom_eleve} en cours (mode économique)..."):
                try:
                    gemini_sujet = traiter_document_gemini(client, pdf_sujet)
                    gemini_corr = traiter_document_gemini(client, pdf_correction)
                    gemini_copie = traiter_document_gemini(client, pdf_copie)
                    
                    diagnostic_complet = generer_remediation_socratique_pdf(
                        client, NOM_MODELE, gemini_sujet, gemini_corr, gemini_copie, nom_eleve
                    )
                    
                    # 1. EXTRACTION DES DONNÉES POUR LE TABLEUR
                    if "[DATA_SHEET]" in diagnostic_complet and "[END_DATA_SHEET]" in diagnostic_complet:
                        data_block = diagnostic_complet.split("[DATA_SHEET]")[1].split("[END_DATA_SHEET]")[0]
                        note, forces, faiblesses = "", "", ""
                        
                        for line in data_block.split('\n'):
                            if line.startswith("Note:"): note = line.replace("Note:", "").strip()
                            elif line.startswith("Forces:"): forces = line.replace("Forces:", "").strip()
                            elif line.startswith("Faiblesses:"): faiblesses = line.replace("Faiblesses:", "").strip()
                            
                        # Envoi vers Google Sheets
                        try:
                            gc = connect_gspread()
                            if gc:
                                try:
                                    sh = gc.open(nom_google_sheet)
                                    worksheet = sh.sheet1
                                except SpreadsheetNotFound:
                                    if email_prof:
                                        sh = gc.create(nom_google_sheet)
                                        sh.share(email_prof, perm_type='user', role='writer')
                                        worksheet = sh.sheet1
                                        worksheet.append_row(["Classe", "Évaluation", "Nom Élève", "Note", "Points Forts", "Axes d'amélioration"])
                                    else:
                                        raise ValueError("Fichier introuvable.")
                                        
                                worksheet.append_row([archive_classe, archive_theme, nom_eleve, note, forces, faiblesses])
                                st.toast(f"📊 Statistiques de {nom_eleve} envoyées dans Google Sheets !")
                            else:
                                st.warning("Impossible de se connecter à Google Sheets.")
                        except Exception as e:
                            st.error(f"⚠️ Erreur Google Sheets : {e}")
                    
                    # 2. EXTRACTION DU LATEX ET CREATION DU PDF
                    if "[DEBUT_LATEX]" in diagnostic_complet and "[FIN_LATEX]" in diagnostic_complet:
                        code_latex_brut = diagnostic_complet.split("[DEBUT_LATEX]")[1].split("[FIN_LATEX]")[0].strip()
                        
                        with st.spinner("🖨️ Compilation du PDF officiel..."):
                            # ON NE PASSE PLUS PAR L'ANCIEN PURIFICATEUR ICI ! On compile direct le code nettoyé par notre Kärcher.
                            pdf_data = compiler_en_pdf(code_latex_brut)
                            
                            st.write("") 
                            if pdf_data:
                                st.success(f"✅ Fiche d'évaluation de {nom_eleve} prête et données archivées !")
                                st.download_button(
                                    label=f"📥 TÉLÉCHARGER LA FICHE DE {nom_eleve.upper()} (PDF)",
                                    data=pdf_data,
                                    file_name=f"Correction_{archive_theme}_{nom_eleve}.pdf",
                                    mime="application/pdf",
                                    type="primary",
                                    use_container_width=True
                                )
                            else:
                                # LE MODE DÉTECTIVE EST ICI !
                                st.error("⚠️ La compilation LaTeX a échoué. L'IA a dû insérer un caractère interdit. Voici le code exact pour trouver l'erreur :")
                                st.code(code_latex_brut, language='latex')
                    else:
                        st.error("Le format de réponse de l'IA est invalide.")
                        
                except Exception as e:
                    st.error(f"Erreur d'analyse API : {e}")

with tab_notebook:
    st.subheader("🧠 Préparateur NotebookLM")
    theme_pod = st.text_input("Sujet de la synthèse")
    if theme_pod and client and st.button("💎 GÉNÉRER LA SOURCE"):
        with st.spinner("Synthèse en cours..."):
            try:
                res_n = client.models.generate_content(
                    model=NOM_MODELE,
                    contents=[f"Rédige une source pour NotebookLM sur : {theme_pod}."]
                )
                st.text_area("Texte", res_n.text, height=300)
            except Exception as e:
                st.error(f"Erreur de synthèse : {e}")


