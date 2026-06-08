import tempfile
import os
import json

def traiter_document_gemini(client, uploaded_file):
    """Sauvegarde temporaire pour l'API Gemini"""
    if uploaded_file is None:
        return None
    extension = "." + uploaded_file.name.split('.')[-1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temp_doc:
        temp_doc.write(uploaded_file.read())
        temp_path = temp_doc.name
    try:
        fichier_gemini = client.files.upload(file=temp_path)
        return fichier_gemini
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def generer_remediation_socratique_pdf(client, modele, gemini_sujet, gemini_corr, gemini_copie, nom_eleve):
    """Extraction JSON avec nettoyage extrême et humanisation du texte."""
    
    sys_inst = """Tu es un expert en évaluation. Tu dois répondre EXCLUSIVEMENT avec un objet JSON valide.
    
    RÈGLES ABSOLUES POUR LE TEXTE : 
    1. Rédige le contenu des champs en TEXTE SIMPLE ET LISIBLE pour un humain. 
    2. N'utilise JAMAIS de symboles mathématiques complexes (_, ^, $, \\). Écris "H2O" et non "H_2O".
    3. N'utilise JAMAIS de listes informatiques [...] ou de dictionnaires {...} à l'intérieur de tes textes. 
    4. Utilise de simples tirets (-) pour faire des listes ou énumérer les points du barème.
    
    STRUCTURE EXACTE ATTENDUE :
    {
        "note": "la note estimée sur 20",
        "forces": "2 ou 3 mots clés max",
        "faiblesses": "2 ou 3 mots clés max",
        "diagnostic": "Analyse détaillée des réussites et des erreurs",
        "questions": "2 questions pour l'élève (en texte simple, sans crochets)",
        "evaluation": "Le détail des points (en texte simple avec des tirets, sans guillemets informatiques)"
    }
    """
    
    prompt = f"Analyse la copie de {nom_eleve}. Renvoie UNIQUEMENT le dictionnaire JSON (commençant par {{ et finissant par }})."
    
    contents = [prompt]
    if gemini_sujet: contents.extend(["\n--- SUJET ---", gemini_sujet])
    if gemini_corr: contents.extend(["\n--- BAREME ---", gemini_corr])
    if gemini_copie: contents.extend(["\n--- COPIE ---", gemini_copie])
        
    texte_ai = "Erreur initiale"
    try:
        reponse = client.models.generate_content(
            model=modele,
            contents=contents,
            config={
                'system_instruction': sys_inst, 
                'temperature': 0.0,
                'response_mime_type': 'application/json'
            }
        )
        texte_ai = reponse.text.strip()
        
        texte_clean = texte_ai.replace("```json", "").replace("```", "").strip()
        if not texte_clean.startswith('{'):
            texte_clean = '{' + texte_clean
        if not texte_clean.endswith('}'):
            texte_clean = texte_clean + '}'
            
        data = json.loads(texte_clean)
        
        # --- LE FILTRE ANTI-CRASH ET ANTI-ROBOT ---
        def rendre_latex_safe_et_humain(texte):
            texte = str(texte)
            # 1. Anti-Crash LaTeX
            texte = texte.replace("\\", "")
            texte = texte.replace("$", "\\$")
            texte = texte.replace("_", "\\_")
            texte = texte.replace("^", " exposant ")
            texte = texte.replace("%", "\\%")
            texte = texte.replace("&", "\\&")
            texte = texte.replace("#", "\\#")
            texte = texte.replace("~", "-")
            # 2. Anti-Robot (efface les formats listes/dictionnaires parasites)
            texte = texte.replace("['", "- ").replace("']", "")
            texte = texte.replace('["', "- ").replace('"]', "")
            texte = texte.replace("', '", "\n\n- ")
            texte = texte.replace('", "', "\n\n- ")
            texte = texte.replace("': '", " : ")
            texte = texte.replace("\": \"", " : ")
            return texte

        note = rendre_latex_safe_et_humain(data.get("note", "Non spécifié"))
        forces = rendre_latex_safe_et_humain(data.get("forces", "Non spécifié"))
        faiblesses = rendre_latex_safe_et_humain(data.get("faiblesses", "Non spécifié"))
        
        diagnostic = rendre_latex_safe_et_humain(data.get("diagnostic", "Non spécifié"))
        questions = rendre_latex_safe_et_humain(data.get("questions", "Non spécifié"))
        
        # Astuce pour forcer un saut de ligne propre dans l'évaluation
        evaluation_brute = rendre_latex_safe_et_humain(data.get("evaluation", "Non spécifié"))
        evaluation = evaluation_brute.replace("', '", "\\newline ").replace("',", "\\newline ").replace(" - ", "\\newline - ")
        
    except Exception as e:
        texte_safe = str(texte_ai).replace("%", "pourcent").replace("&", "et").replace("#", "").replace("\\", "").replace("_", " ")
        note, forces, faiblesses = "Erreur", "Erreur JSON", "Erreur JSON"
        diagnostic = f"Échec du formatage automatique."
        questions = "Veuillez relancer l'analyse."
        evaluation = f"Erreur technique : {str(e)} \\newline \\newline \\textbf{{Voici ce que l'IA a répondu en réalité :}} \\newline {texte_safe[:1500]}"

    data_sheet = f"Note: {note}\nForces: {forces}\nFaiblesses: {faiblesses}"
    
    # On ajoute des petits sauts de lignes (\vspace) pour aérer le PDF
    code_latex = f"""\\documentclass[11pt, a4paper]{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage[french]{{babel}}
\\usepackage{{geometry}}
\\geometry{{margin=2cm}}
\\usepackage{{amsmath, amssymb}}
\\begin{{document}}

\\begin{{center}}
\\Large\\textbf{{Bilan de Correction : {nom_eleve}}}
\\end{{center}}
\\vspace{{0.8cm}}

\\section*{{Diagnostic de l'Expert}}
{diagnostic}
\\vspace{{0.5cm}}

\\section*{{Questions Socratiques pour {nom_eleve}}}
{questions}
\\vspace{{0.5cm}}

\\section*{{Évaluation et Note}}
{evaluation}

\\end{{document}}"""

    reponse_formatee = f"[DATA_SHEET]\n{data_sheet}\n[END_DATA_SHEET]\n[DEBUT_LATEX]\n{code_latex}\n[FIN_LATEX]"
    return reponse_formatee

