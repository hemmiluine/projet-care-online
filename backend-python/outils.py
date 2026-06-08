import re
import os
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def purifier_latex_integral(text):
    """Nettoie le code LaTeX et éradique les problèmes liés à \qty et \SI."""
    # 1. Suppression des balises de l'IA
    text = re.sub(r'\[(span|source|cite|cite_start|cite_end).*?\]', '', text)
    text = re.sub(r'\((start|end)_?span\)', '', text)
    
    # 2. MÉTHODE RADICALE : Remplacement global de \qty par \SI
    text = text.replace(r'\qty', r'\SI')
    
    # 3. CORRECTIONS CHIRURGICALES POUR \SI
    text = re.sub(r'\\SI\{([^0-9=]+?)\}\{\}', r'$\1$', text)
    text = re.sub(r'\\SI\{([a-zA-Z_\\,^]+)\s*=\s*([0-9\.,eE-]+)\}', r'$\1 = \\SI{\2}', text)
    text = re.sub(r'\\SI\{(\d+)\}\{points\}', r'\1 points', text)
    
    # 4. CORRECTION DES VARIABLES MARKDOWN (Backticks & Caractères spéciaux)
    # Transforme `variable_nom` en \texttt{variable\_nom} pour éviter le crash LaTeX
    # On ignore les accents graves LaTeX (ex: \`e) grâce au lookbehind (?<!\\)
    def replace_backticks(match):
        # Échapper les caractères qui font crasher LaTeX à l'intérieur du texte classique
        content = match.group(1).replace('_', r'\_').replace('#', r'\#').replace('%', r'\%').replace('&', r'\&')
        return f'\\texttt{{{content}}}'
    text = re.sub(r'(?<!\\)`([^`]+)`', replace_backticks, text)
    
    # 5. SÉCURITÉ ANTI-BOUCLE INFINIE (Hallucination de l'IA)
    # Si l'IA pète les plombs et génère des milliers de \dots, on coupe court.
    text = re.sub(r'(\\dots\s*){5,}', r'\\dots\\dots\\dots ', text)
    
    # 6. Optimisations graphiques
    text = text.replace("right of=", "right=2.2cm of ")
    text = text.replace("node distance=2cm", "node distance=1.5cm and 2.5cm")
    
    # ATTENTION : La règle de suppression des espaces multiples a été RETIRÉE ici.
    # Elle écrasait l'indentation vitale des scripts Python !
    
    return text.strip()

def indexer_bo_fichiers(client):
    fichiers_bo = {}
    mapping = {
        "seconde": "bo_2nde.pdf", 
        "premiere": "bo_1ere.pdf", 
        "terminale": "bo_term.pdf"
    }
    for niveau, nom_fichier in mapping.items():
        chemin = BASE_DIR / nom_fichier
        if chemin.exists():
            try:
                fichiers_bo[niveau] = client.files.upload(file=str(chemin))
            except:
                pass
    return fichiers_bo

def compiler_en_pdf(code_source):
    nom_base = "doc_temp"
    with open(f"{nom_base}.tex", "w", encoding="utf-8") as f:
        f.write(code_source)
    try:
        for _ in range(2):
            subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", f"{nom_base}.tex"],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True
            )
        if os.path.exists(f"{nom_base}.pdf"):
            with open(f"{nom_base}.pdf", "rb") as f:
                return f.read()
    except:
        return None
    finally:
        for ext in [".tex", ".pdf", ".log", ".aux", ".out"]:
            if os.path.exists(nom_base + ext):
                os.remove(nom_base + ext)
