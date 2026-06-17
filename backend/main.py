from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os
from PIL import Image
import io
import json
import requests

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

@app.get("/")
def root():
    return {"message": "ForageIA backend fonctionne !"}

@app.post("/identifier-plante")
async def identifier_plante(photo: UploadFile = File(...)):
    try:
        contenu = await photo.read()
        image = Image.open(io.BytesIO(contenu))
        if image.mode == "RGBA":
            image = image.convert("RGB")
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
        buffer.seek(0)
        image_bytes = buffer.read()
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                types.Part.from_text(text="Tu es un expert botaniste. Analyse cette photo et reponds en francais avec ce JSON: {nom_commun, nom_latin, comestible, niveau_confiance, description, conseil, sosies_dangereux}. JSON seulement.")
            ]
        )
        texte = response.text.strip()
        if texte.startswith("```"):
            texte = texte.split("```")[1]
            if texte.startswith("json"):
                texte = texte[4:]
        return json.loads(texte.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyser-frigo")
async def analyser_frigo(photo: UploadFile = File(...)):
    try:
        contenu = await photo.read()
        image = Image.open(io.BytesIO(contenu))
        if image.mode == "RGBA":
            image = image.convert("RGB")
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
        buffer.seek(0)
        image_bytes = buffer.read()
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                types.Part.from_text(text="Tu es un assistant culinaire. Analyse cette photo de frigo et reponds en francais avec ce JSON: {ingredients: [{nom, quantite_estimee, expire_bientot}], message}. JSON seulement.")
            ]
        )
        texte = response.text.strip()
        if texte.startswith("```"):
            texte = texte.split("```")[1]
            if texte.startswith("json"):
                texte = texte[4:]
        return json.loads(texte.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generer-recette")
async def generer_recette(data: dict):
    try:
        plantes = data.get("plantes", [])
        ingredients_frigo = data.get("ingredients_frigo", [])
        plantes_texte = ", ".join(plantes) if plantes else "aucune plante sauvage"
        frigo_texte = ", ".join(ingredients_frigo) if ingredients_frigo else "aucun ingredient"
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[
                types.Part.from_text(text=f"Tu es un chef cuisinier nature. Plantes sauvages: {plantes_texte}. Frigo: {frigo_texte}. Cree une recette pour 4 personnes et reponds en francais avec ce JSON: {{titre, histoire, temps_preparation, difficulte, portions, ingredients: [{{nom, quantite, unite}}], etapes, conseil_chef, impact_environnemental}}. Chaque ingredient doit avoir une quantite precise et une unite (g, ml, tsp, piece, etc). JSON seulement.")
            ]
        )
        texte = response.text.strip()
        if texte.startswith("```"):
            texte = texte.split("```")[1]
            if texte.startswith("json"):
                texte = texte[4:]
        return json.loads(texte.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/meteo/{ville}")
async def get_meteo(ville: str):
    try:
        api_key = os.getenv("OPENWEATHER_API_KEY")
        url = f"https://api.openweathermap.org/data/2.5/weather?q={ville}&appid={api_key}&units=metric&lang=fr"
        res = requests.get(url)
        data = res.json()
        if data.get("cod") != 200:
            raise HTTPException(status_code=404, detail="Ville introuvable")
        return {
            "ville": data["name"],
            "temperature": round(data["main"]["temp"]),
            "description": data["weather"][0]["description"],
            "icone": data["weather"][0]["icon"],
            "humidite": data["main"]["humidity"],
            "vent": round(data["wind"]["speed"] * 3.6),
            "bon_pour_cueillette": data["weather"][0]["main"] in ["Clear", "Clouds"] and data["main"]["temp"] > 5
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/encyclopedie/{nom_plante}")
async def get_encyclopedie(nom_plante: str):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[
                types.Part.from_text(text=f"""Tu es un expert botaniste. Génère une fiche complète sur la plante "{nom_plante}" et réponds en français avec exactement ce JSON :
{{
  "nom": "nom commun",
  "nom_latin": "nom latin",
  "comestible": "oui" ou "non" ou "avec prudence",
  "saison": [mois en chiffres, ex: 4, 5, 6],
  "parties": "parties comestibles",
  "habitat": "où elle pousse",
  "description": "description détaillée 3-4 phrases",
  "conseil": "conseil de cueillette",
  "danger": "sosie dangereux ou null",
  "trouvee_au_quebec": true ou false
}}
Si la plante n'existe pas ou n'est pas reconnue, retourne {{"erreur": "Plante introuvable"}}.
JSON seulement, sans texte avant ou après.""")
            ]
        )
        texte = response.text.strip()
        if texte.startswith("```"):
            texte = texte.split("```")[1]
            if texte.startswith("json"):
                texte = texte[4:]
        return json.loads(texte.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))