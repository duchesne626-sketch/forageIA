import { useState } from "react"
import axios from "axios"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth"
import { auth, db } from "./firebase"
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore"
import jsPDF from "jspdf"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useTranslation } from "react-i18next"

function RecentrerCarte({ position }) {
  const map = useMap()
  map.setView(position, 14)
  return null
}

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function App() {
  const [page, setPage] = useState("accueil")
  const [plantes, setPlantes] = useState([])
  const [ingredientsFrigo, setIngredientsFrigo] = useState([])
  const [utilisateur, setUtilisateur] = useState(null)
  const [menuOuvert, setMenuOuvert] = useState(false)
  const { t, i18n } = useTranslation()

const changerLangue = () => {
  i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr")
}

  useState(() => {
    onAuthStateChanged(auth, (user) => {
      setUtilisateur(user)
    })
  }, [])

return (
    <div style={{ minHeight: "100vh", background: "#f0f7f0", fontFamily: "Arial, sans-serif" }}>
      <nav style={{ background: "#2D6A4F", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <span style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}>🌿 ForageIA</span>
        <button className="hamburger" onClick={() => setMenuOuvert(!menuOuvert)}>
          {menuOuvert ? "✕" : "☰"}
        </button>
        <div className={`nav-buttons ${menuOuvert ? "ouvert" : ""}`}>
          <button onClick={() => { setPage("foret"); setMenuOuvert(false) }} style={navBtn(page === "foret")}>{t("nav.foret")}</button>
          <button onClick={() => { setPage("frigo"); setMenuOuvert(false) }} style={navBtn(page === "frigo")}>{t("nav.frigo")}</button>
          <button onClick={() => { setPage("recette"); setMenuOuvert(false) }} style={navBtn(page === "recette")}>{t("nav.recette")}</button>
          <button onClick={() => { setPage("historique"); setMenuOuvert(false) }} style={navBtn(page === "historique")}>{t("nav.historique")}</button>
          <button onClick={() => { setPage("carte"); setMenuOuvert(false) }} style={navBtn(page === "carte")}>{t("nav.carte")}</button>
          <button onClick={() => { setPage("profil"); setMenuOuvert(false) }} style={navBtn(page === "profil")}>{t("nav.profil")}</button>
          <button onClick={() => { setPage("encyclopedie"); setMenuOuvert(false) }} style={navBtn(page === "encyclopedie")}>{t("nav.encyclopedie")}</button>
          <div>
            {utilisateur ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "white", fontSize: "13px" }}>👤 {utilisateur.email}</span>
                <button onClick={() => signOut(auth)} style={navBtn(false)}>{t("nav.deconnexion")}</button>
              </div>
            ) : (
              <button onClick={() => { setPage("auth"); setMenuOuvert(false) }} style={navBtn(page === "auth")}>{t("nav.connexion")}</button>
            )}
          </div>
          <button onClick={changerLangue} style={{ ...navBtn(false), background: "rgba(255,255,255,0.2)" }}>
            {i18n.language === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
          </button>
        </div>
      </nav>
      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
        {page === "accueil" && <Accueil setPage={setPage} />}
        {page === "foret" && (utilisateur ? <Foret plantes={plantes} setPlantes={setPlantes} /> : <Auth setPage={setPage} />)}
        {page === "frigo" && (utilisateur ? <Frigo ingredientsFrigo={ingredientsFrigo} setIngredientsFrigo={setIngredientsFrigo} /> : <Auth setPage={setPage} />)}
        {page === "recette" && (utilisateur ? <Recette plantes={plantes} ingredientsFrigo={ingredientsFrigo} /> : <Auth setPage={setPage} />)}
        {page === "auth" && <Auth setPage={setPage} />}
        {page === "historique" && (utilisateur ? <Historique utilisateur={utilisateur} /> : <Auth setPage={setPage} />)}
        {page === "carte" && (utilisateur ? <Carte plantes={plantes} /> : <Auth setPage={setPage} />)}
        {page === "profil" && (utilisateur ? <Profil utilisateur={utilisateur} plantes={plantes} /> : <Auth setPage={setPage} />)}
        {page === "encyclopedie" && <Encyclopedie />}
      </div>
    </div>
  )
}

function navBtn(actif) {
  return {
    background: actif ? "white" : "transparent",
    color: actif ? "#2D6A4F" : "white",
    border: "2px solid white",
    borderRadius: "20px",
    padding: "8px 18px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px"
  }
}

function Accueil({ setPage }) {
  const { t } = useTranslation()
  return (
    <div style={{ margin: "-40px -20px 0" }}>
      <div className="hero">
        <div className="float" style={{ fontSize: "64px", marginBottom: "24px" }}>🌿</div>
        <h1 style={{ color: "white", fontSize: "52px", fontWeight: "800", margin: "0 0 12px", letterSpacing: "-1px" }}>
          ForageIA
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", marginBottom: "8px", maxWidth: "500px" }}>
          {t("accueil.slogan")}
        </p>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "40px" }}>
          {t("accueil.sous_titre")}
        </p>
        <button onClick={() => setPage("foret")} className="btn-primary">
          {t("accueil.bouton")}
        </button>
      </div>

      <div style={{ padding: "50px 30px" }}>
        <p style={{ textAlign: "center", color: "#888", fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>{t("accueil.comment")}</p>
        <h2 style={{ textAlign: "center", color: "#1b4332", marginBottom: "35px", fontSize: "26px", fontWeight: "700" }}>
          {t("accueil.etapes")}
        </h2>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { emoji: "🌲", titre: t("accueil.etape1_titre"), desc: t("accueil.etape1_desc"), page: "foret", couleur: "#1b4332" },
            { emoji: "🧊", titre: t("accueil.etape2_titre"), desc: t("accueil.etape2_desc"), page: "frigo", couleur: "#2d6a4f" },
            { emoji: "🍽️", titre: t("accueil.etape3_titre"), desc: t("accueil.etape3_desc"), page: "recette", couleur: "#40916c" },
          ].map((item, i) => (
            <div key={i} className="carte-feature" onClick={() => setPage(item.page)}
              style={{ width: "210px", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", background: `${item.couleur}15`, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px" }}>
                {item.emoji}
              </div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: item.couleur, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
                {t("accueil.comment")} {i + 1}
              </div>
              <h3 style={{ color: "#1b4332", marginBottom: "8px", fontSize: "18px" }}>{item.titre}</h3>
              <p style={{ color: "#888", fontSize: "13px", lineHeight: "1.5" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="stats-section">
          <p style={{ textAlign: "center", color: "#888", fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "25px" }}>{t("accueil.stats_titre")}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "50px", flexWrap: "wrap" }}>
            {[
              { nb: "15+", label: t("carte.zones").replace("🌿 ", "") },
              { nb: "3", label: "Modules IA" },
              { nb: "∞", label: "Recettes" },
              { nb: "0", label: "Gaspillage" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "34px", fontWeight: "800", color: "#2D6A4F", lineHeight: 1 }}>{stat.nb}</div>
                <div style={{ color: "#aaa", fontSize: "12px", marginTop: "6px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#1b4332", borderRadius: "20px", padding: "35px", marginTop: "20px", textAlign: "center" }}>
          <h3 style={{ color: "white", fontSize: "22px", marginBottom: "20px" }}>{t("accueil.cta_titre")}</h3>
          <button onClick={() => setPage("foret")} style={{ background: "#52B788", color: "white", border: "none", borderRadius: "30px", padding: "12px 32px", cursor: "pointer", fontSize: "15px", fontWeight: "700" }}>
            {t("accueil.cta_bouton")}
          </button>
        </div>
      </div>
    </div>
  )
}

function CarteAccueil({ emoji, titre, desc, page, setPage }) {
  return (
    <div onClick={() => setPage(page)} style={{ background: "white", borderRadius: "16px", padding: "30px 25px", width: "180px", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      onMouseOver={e => e.currentTarget.style.transform = "translateY(-4px)"}
      onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>{emoji}</div>
      <div style={{ fontWeight: "bold", color: "#2D6A4F", marginBottom: "6px" }}>{titre}</div>
      <div style={{ color: "#888", fontSize: "13px" }}>{desc}</div>
    </div>
  )
}

function Foret({ plantes, setPlantes }) {
  const { t } = useTranslation()
  const [photo, setPhoto] = useState(null)
  const [resultat, setResultat] = useState(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)

  const analyser = async () => {
    if (!photo) return
    setChargement(true)
    setErreur(null)
    const formData = new FormData()
    formData.append("photo", photo)
    try {
      const res = await axios.post("https://forageia-backend.onrender.com/identifier-plante", formData)
      setResultat(res.data)
      if (res.data.comestible !== "non") {
        setPlantes(prev => [...new Set([...prev, res.data.nom_commun])])
      }
    } catch (e) {
      setErreur(e.response?.data?.detail || e.message)
    }
    setChargement(false)
  }

  return (
    <div>
      <h2 style={{ color: "#2D6A4F" }}>{t("foret.titre")}</h2>
      <div style={{ background: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
          <label style={{ ...btnPrincipal, background: "#52B788", cursor: "pointer", display: "inline-block" }}>
            {t("foret.choisir")}
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} style={{ display: "none" }} />
          </label>
          <label style={{ ...btnPrincipal, background: "#2D6A4F", cursor: "pointer", display: "inline-block" }}>
            {t("foret.prendre")}
            <input type="file" accept="image/*" capture="environment" onChange={e => setPhoto(e.target.files[0])} style={{ display: "none" }} />
          </label>
        </div>
        {photo && <p style={{ color: "#2D6A4F", fontSize: "13px" }}>{t("foret.photo_selectionnee")} : {photo.name}</p>}
        <button onClick={analyser} disabled={!photo || chargement} style={btnPrincipal}>
          {chargement ? t("foret.analyse") : t("foret.identifier")}
        </button>
      </div>
      {erreur && (
        <div style={{ background: "#ffe0e0", borderRadius: "12px", padding: "15px", marginTop: "15px", color: "#c0392b" }}>
          <strong>{t("erreur")} :</strong> {erreur}
        </div>
      )}
      {resultat && (
        <div style={{ background: "white", borderRadius: "16px", padding: "30px", marginTop: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <h3 style={{ color: "#2D6A4F", marginTop: 0 }}>{resultat.nom_commun}</h3>
          <p style={{ color: "#888", fontStyle: "italic" }}>{resultat.nom_latin}</p>
          <p><span style={badge(resultat.comestible)}>
            {resultat.comestible === "oui" ? "✅ Comestible" : resultat.comestible === "non" ? "❌ Non comestible" : "⚠️ Avec prudence"}
          </span></p>
          <p><strong>{t("foret.confiance")} :</strong> {resultat.niveau_confiance}%</p>
          <p>{resultat.description}</p>
          <p><strong>{t("foret.conseil")} :</strong> {resultat.conseil}</p>
          {resultat.sosies_dangereux && <p style={{ color: "#c0392b" }}><strong>{t("foret.sosies")} :</strong> {resultat.sosies_dangereux}</p>}
          <p style={{ color: "#888", fontSize: "12px", marginTop: "15px", fontStyle: "italic", borderTop: "1px solid #eee", paddingTop: "10px" }}>
            {t("foret.avertissement")}
          </p>
        </div>
      )}
      {plantes.length > 0 && (
        <div style={{ background: "#e8f5e9", borderRadius: "12px", padding: "15px", marginTop: "15px" }}>
          <strong>{t("foret.collectees")} :</strong> {plantes.join(", ")}
        </div>
      )}
    </div>
  )
}

function Frigo({ ingredientsFrigo, setIngredientsFrigo }) {
  const { t } = useTranslation()
  const [photo, setPhoto] = useState(null)
  const [resultat, setResultat] = useState(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)

  const analyser = async () => {
    if (!photo) return
    setChargement(true)
    setErreur(null)
    const formData = new FormData()
    formData.append("photo", photo)
    try {
      const res = await axios.post("https://forageia-backend.onrender.com/analyser-frigo", formData)
      setResultat(res.data)
      setIngredientsFrigo(res.data.ingredients.map(i => i.nom))
    } catch (e) {
      setErreur(e.response?.data?.detail || e.message)
    }
    setChargement(false)
  }

  return (
    <div>
      <h2 style={{ color: "#2D6A4F" }}>{t("frigo.titre")}</h2>
      <div style={{ background: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
          <label style={{ ...btnPrincipal, background: "#52B788", cursor: "pointer", display: "inline-block" }}>
            {t("frigo.choisir")}
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} style={{ display: "none" }} />
          </label>
          <label style={{ ...btnPrincipal, background: "#2D6A4F", cursor: "pointer", display: "inline-block" }}>
            {t("frigo.prendre")}
            <input type="file" accept="image/*" capture="environment" onChange={e => setPhoto(e.target.files[0])} style={{ display: "none" }} />
          </label>
        </div>
        {photo && <p style={{ color: "#2D6A4F", fontSize: "13px" }}>{t("foret.photo_selectionnee")} : {photo.name}</p>}
        <button onClick={analyser} disabled={!photo || chargement} style={btnPrincipal}>
          {chargement ? t("frigo.analyse") : t("frigo.analyser")}
        </button>
      </div>
      {erreur && (
        <div style={{ background: "#ffe0e0", borderRadius: "12px", padding: "15px", marginTop: "15px", color: "#c0392b" }}>
          <strong>{t("erreur")} :</strong> {erreur}
        </div>
      )}
      {resultat && (
        <div style={{ background: "white", borderRadius: "16px", padding: "30px", marginTop: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <p style={{ color: "#2D6A4F", fontStyle: "italic" }}>{resultat.message}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
            {resultat.ingredients.map((ing, i) => (
              <span key={i} style={{ background: "#e8f5e9", borderRadius: "20px", padding: "6px 14px", fontSize: "14px" }}>
                {ing.expire_bientot ? "⚡ " : "✅ "}{ing.nom} ({ing.quantite_estimee})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Recette({ plantes, ingredientsFrigo }) {
  const { t } = useTranslation()
  const [resultat, setResultat] = useState(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)

  const generer = async () => {
    setChargement(true)
    setErreur(null)
    try {
      const res = await axios.post("https://forageia-backend.onrender.com/generer-recette", { plantes, ingredients_frigo: ingredientsFrigo })
      setResultat(res.data)
    } catch (e) {
      setErreur(e.response?.data?.detail || e.message)
    }
    setChargement(false)
  }

  const exporterPDF = (recette) => {
    const pdf = new jsPDF()
    const marge = 20
    const largeur = 170
    let y = 20

    const ajouterTexte = (texte, taille, couleur, gras = false) => {
      pdf.setFontSize(taille)
      pdf.setTextColor(...couleur)
      if (gras) pdf.setFont("helvetica", "bold")
      else pdf.setFont("helvetica", "normal")
      const lignes = pdf.splitTextToSize(texte, largeur)
      lignes.forEach(ligne => {
        if (y > 275) { pdf.addPage(); y = 20 }
        pdf.text(ligne, marge, y)
        y += taille * 0.45
      })
      y += 3
    }

    ajouterTexte(recette.titre, 20, [45, 106, 79], true)
    ajouterTexte(`Temps: ${recette.temps_preparation}  |  Difficulte: ${recette.difficulte}  |  Portions: ${recette.portions}`, 11, [100, 100, 100])
    y += 3
    ajouterTexte(recette.histoire, 11, [80, 80, 80])
    y += 5
    ajouterTexte("Ingredients", 14, [45, 106, 79], true)
    recette.ingredients.forEach(ing => {
      const texte = typeof ing === "object" ? `- ${ing.quantite || ""} ${ing.unite || ""} ${ing.nom}`.trim() : `- ${ing}`
      ajouterTexte(texte, 11, [50, 50, 50])
    })
    y += 5
    ajouterTexte("Etapes", 14, [45, 106, 79], true)
    recette.etapes.forEach((etape, i) => {
      ajouterTexte(`${i + 1}. ${etape}`, 11, [50, 50, 50])
      y += 2
    })
    y += 5
    ajouterTexte(`Conseil du chef : ${recette.conseil_chef}`, 11, [45, 106, 79])
    y += 3
    ajouterTexte(recette.impact_environnemental, 10, [100, 100, 100])
    pdf.save(`${recette.titre}.pdf`)
  }

  return (
    <div>
      <h2 style={{ color: "#2D6A4F" }}>{t("recette.titre")}</h2>
      <div style={{ background: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        {plantes.length === 0 && ingredientsFrigo.length === 0 && (
          <p style={{ color: "#888" }}>{t("recette.conseil_frigo")}</p>
        )}
        {(plantes.length > 0 || ingredientsFrigo.length > 0) && (
          <>
            {plantes.length > 0 && <p><strong>{t("recette.plantes")} :</strong> {plantes.join(", ")}</p>}
            {ingredientsFrigo.length > 0 && <p><strong>{t("recette.frigo")} :</strong> {ingredientsFrigo.join(", ")}</p>}
            <button onClick={generer} disabled={chargement} style={btnPrincipal}>
              {chargement ? t("recette.generation") : t("recette.generer")}
            </button>
          </>
        )}
      </div>
      {erreur && (
        <div style={{ background: "#ffe0e0", borderRadius: "12px", padding: "15px", marginTop: "15px", color: "#c0392b" }}>
          <strong>{t("erreur")} :</strong> {erreur}
        </div>
      )}
      {resultat && (
        <div style={{ background: "white", borderRadius: "16px", padding: "30px", marginTop: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <h3 style={{ color: "#2D6A4F", marginTop: 0 }}>{resultat.titre}</h3>
          <p style={{ fontStyle: "italic", color: "#555", borderLeft: "3px solid #2D6A4F", paddingLeft: "15px" }}>{resultat.histoire}</p>
          <div style={{ display: "flex", gap: "20px", margin: "15px 0", flexWrap: "wrap" }}>
            <span>⏱️ {resultat.temps_preparation}</span>
            <span>📊 {resultat.difficulte}</span>
            <span>👥 {resultat.portions} portions</span>
          </div>
          <h4 style={{ color: "#2D6A4F" }}>{t("recette.ingredients")}</h4>
          <ul>{resultat.ingredients.map((ing, i) => (
            <li key={i}>
              {typeof ing === "object" ? `${ing.quantite || ""} ${ing.unite || ""} ${ing.nom}`.trim() : ing}
            </li>
          ))}</ul>
          <h4 style={{ color: "#2D6A4F" }}>{t("recette.etapes")}</h4>
          <ol>{resultat.etapes.map((e, i) => <li key={i} style={{ marginBottom: "8px" }}>{e}</li>)}</ol>
          <p style={{ background: "#e8f5e9", borderRadius: "8px", padding: "12px" }}>💡 <strong>{t("recette.conseil_chef")} :</strong> {resultat.conseil_chef}</p>
          <p style={{ color: "#2D6A4F", fontSize: "13px" }}>{t("recette.impact")} {resultat.impact_environnemental}</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "15px", flexWrap: "wrap" }}>
            <button onClick={async () => {
              await addDoc(collection(db, "recettes"), {
                ...resultat,
                userId: auth.currentUser.uid,
                date: new Date().toISOString(),
                plantes: plantes,
                ingredientsFrigo: ingredientsFrigo
              })
              alert(t("recette.sauvegarde_ok"))
            }} style={{ ...btnPrincipal, background: "#52B788" }}>
              {t("recette.sauvegarder")}
            </button>
            <button onClick={() => exporterPDF(resultat)} style={{ ...btnPrincipal, background: "#e67e22" }}>
              {t("recette.pdf")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Auth({ setPage }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [mode, setMode] = useState("connexion")
  const [erreur, setErreur] = useState(null)
  const [chargement, setChargement] = useState(false)
  const [resetEnvoye, setResetEnvoye] = useState(false)

  const reinitialiserMotDePasse = async () => {
    if (!email) {
      setErreur(t("auth.email") + " requis")
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setResetEnvoye(true)
      setErreur(null)
    } catch (e) {
      setErreur("Adresse e-mail introuvable.")
    }
  }

  const submit = async () => {
    setChargement(true)
    setErreur(null)
    try {
      if (mode === "inscription") {
        await createUserWithEmailAndPassword(auth, email, motDePasse)
      } else {
        await signInWithEmailAndPassword(auth, email, motDePasse)
      }
      setPage("accueil")
    } catch (e) {
      setErreur(e.message)
    }
    setChargement(false)
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <h2 style={{ color: "#2D6A4F", textAlign: "center", marginTop: 0 }}>
          {mode === "connexion" ? t("auth.connexion_titre") : t("auth.inscription_titre")}
        </h2>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#555" }}>{t("auth.email")}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("auth.placeholder_email")}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#555" }}>{t("auth.mot_de_passe")}</label>
          <input type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder={t("auth.placeholder_mdp")}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }} />
        </div>
        {erreur && (
          <div style={{ background: "#ffe0e0", borderRadius: "8px", padding: "10px", marginBottom: "15px", color: "#c0392b", fontSize: "13px" }}>
            {erreur}
          </div>
        )}
        <button onClick={submit} disabled={chargement} style={{ ...btnPrincipal, width: "100%" }}>
          {chargement ? t("auth.chargement") : mode === "connexion" ? t("auth.se_connecter") : t("auth.creer_compte")}
        </button>
        {resetEnvoye && (
          <div style={{ background: "#e8f5e9", borderRadius: "8px", padding: "10px", marginTop: "15px", color: "#27ae60", fontSize: "13px" }}>
            {t("auth.reset_envoye")}
          </div>
        )}
        {mode === "connexion" && (
          <p style={{ textAlign: "center", marginTop: "10px", fontSize: "13px" }}>
            <span onClick={reinitialiserMotDePasse} style={{ color: "#2D6A4F", cursor: "pointer" }}>
              {t("auth.mot_de_passe_oublie")}
            </span>
          </p>
        )}
        <p style={{ textAlign: "center", marginTop: "20px", color: "#888", fontSize: "14px" }}>
          {mode === "connexion" ? t("auth.pas_de_compte") : t("auth.deja_compte")}
          {" "}
          <span onClick={() => setMode(mode === "connexion" ? "inscription" : "connexion")}
            style={{ color: "#2D6A4F", cursor: "pointer", fontWeight: "bold" }}>
            {mode === "connexion" ? t("auth.inscrire") : t("auth.connecter")}
          </span>
        </p>
      </div>
    </div>
  )
}

function Historique({ utilisateur }) {
  const { t } = useTranslation()
  const [recettes, setRecettes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [recetteOuverte, setRecetteOuverte] = useState(null)

  const supprimer = async (id, e) => {
    e.stopPropagation()
    if (window.confirm(t("historique.confirmation"))) {
      await deleteDoc(doc(db, "recettes", id))
      setRecettes(prev => prev.filter(r => r.id !== id))
    }
  }

  useState(() => {
    const charger = async () => {
      try {
        const q = query(collection(db, "recettes"), where("userId", "==", utilisateur.uid))
        const snapshot = await getDocs(q)
        setRecettes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error(e)
      }
      setChargement(false)
    }
    charger()
  }, [])

  return (
    <div>
      <h2 style={{ color: "#2D6A4F" }}>{t("historique.titre")}</h2>
      {chargement && <p style={{ color: "#888" }}>{t("historique.chargement")}</p>}
      {!chargement && recettes.length === 0 && (
        <div style={{ background: "white", borderRadius: "16px", padding: "30px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <p style={{ color: "#888" }}>{t("historique.vide")}</p>
          <p style={{ color: "#888", fontSize: "14px" }}>{t("historique.vide_conseil")}</p>
        </div>
      )}
      {recettes.map((recette) => (
        <div key={recette.id} style={{ background: "white", borderRadius: "16px", padding: "25px", marginBottom: "15px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer" }}
          onClick={() => setRecetteOuverte(recetteOuverte === recette.id ? null : recette.id)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ color: "#2D6A4F", margin: "0 0 5px" }}>{recette.titre}</h3>
              <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
                📅 {new Date(recette.date).toLocaleDateString("fr-CA")} •
                ⏱️ {recette.temps_preparation} •
                📊 {recette.difficulte}
              </p>
              {recette.plantes?.length > 0 && (
                <p style={{ color: "#52B788", fontSize: "13px", margin: "5px 0 0" }}>
                  🌿 {recette.plantes.join(", ")}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "20px" }}>{recetteOuverte === recette.id ? "▲" : "▼"}</span>
              <button onClick={(e) => supprimer(recette.id, e)} style={{ background: "#e74c3c", color: "white", border: "none", borderRadius: "20px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" }}>
                {t("historique.supprimer")}
              </button>
            </div>
          </div>
          {recetteOuverte === recette.id && (
            <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
              <p style={{ fontStyle: "italic", color: "#555", borderLeft: "3px solid #2D6A4F", paddingLeft: "15px" }}>{recette.histoire}</p>
              <h4 style={{ color: "#2D6A4F" }}>{t("recette.ingredients")}</h4>
              <ul>{recette.ingredients?.map((ing, i) => (
                <li key={i}>{typeof ing === "object" ? `${ing.quantite || ""} ${ing.unite || ""} ${ing.nom}`.trim() : ing}</li>
              ))}</ul>
              <h4 style={{ color: "#2D6A4F" }}>{t("recette.etapes")}</h4>
              <ol>{recette.etapes?.map((e, i) => <li key={i} style={{ marginBottom: "8px" }}>{e}</li>)}</ol>
              <p style={{ background: "#e8f5e9", borderRadius: "8px", padding: "12px" }}>💡 <strong>{t("recette.conseil_chef")} :</strong> {recette.conseil_chef}</p>
              <p style={{ color: "#2D6A4F", fontSize: "13px" }}>🌍 {recette.impact_environnemental}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Carte({ plantes }) {
  const { t, i18n } = useTranslation()
  const [position, setPosition] = useState(null)
  const [ville, setVille] = useState("")
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [meteo, setMeteo] = useState(null)

  const moisActuel = new Date().getMonth() + 1
  const locale = i18n.language === "fr" ? "fr-CA" : "en-CA"

  const calendrierSaison = [
    { nom: i18n.language === "fr" ? "Pissenlit" : "Dandelion", mois: [4, 5, 6], emoji: "🌼", description: i18n.language === "fr" ? "Feuilles et fleurs comestibles" : "Edible leaves and flowers" },
    { nom: i18n.language === "fr" ? "Ail des ours" : "Wild garlic", mois: [4, 5], emoji: "🧄", description: i18n.language === "fr" ? "Feuilles très parfumées" : "Very fragrant leaves" },
    { nom: i18n.language === "fr" ? "Framboisier sauvage" : "Wild raspberry", mois: [7, 8], emoji: "🍓", description: i18n.language === "fr" ? "Fruits juteux et sucrés" : "Juicy and sweet fruits" },
    { nom: i18n.language === "fr" ? "Bleuet sauvage" : "Wild blueberry", mois: [7, 8, 9], emoji: "🔵", description: i18n.language === "fr" ? "Abondant dans les tourbières" : "Abundant in bogs" },
    { nom: "Chanterelle", mois: [7, 8, 9], emoji: "🍄", description: i18n.language === "fr" ? "Champignon doré très savoureux" : "Very tasty golden mushroom" },
    { nom: i18n.language === "fr" ? "Cèpe de Bordeaux" : "Porcini mushroom", mois: [8, 9, 10], emoji: "🍄", description: i18n.language === "fr" ? "Champignon noble des forêts" : "Noble forest mushroom" },
    { nom: i18n.language === "fr" ? "Morille" : "Morel", mois: [4, 5], emoji: "🍄", description: i18n.language === "fr" ? "Champignon printanier rare" : "Rare spring mushroom" },
    { nom: "Salicaire", mois: [6, 7, 8], emoji: "🌸", description: i18n.language === "fr" ? "Fleurs et feuilles comestibles" : "Edible flowers and leaves" },
    { nom: "Chicouté", mois: [7, 8], emoji: "🟡", description: i18n.language === "fr" ? "Fruit nordique très rare" : "Very rare nordic fruit" },
    { nom: i18n.language === "fr" ? "Sureau du Canada" : "Canadian elderberry", mois: [8, 9], emoji: "🍇", description: i18n.language === "fr" ? "Baies pour sirops et confitures" : "Berries for syrups and jams" },
    { nom: "Épilobe", mois: [6, 7, 8], emoji: "🌺", description: i18n.language === "fr" ? "Jeunes pousses comestibles" : "Edible young shoots" },
    { nom: "Pleurote", mois: [9, 10, 11], emoji: "🍄", description: i18n.language === "fr" ? "Sur les troncs d'arbres morts" : "On dead tree trunks" },
  ]

  const plantesEnSaison = calendrierSaison.filter(p => p.mois.includes(moisActuel))
  const plantesHorsSaison = calendrierSaison.filter(p => !p.mois.includes(moisActuel))

  const zonesComestibles = [
    { nom: "Salicaire", lat: 0.002, lng: 0.003, couleur: "#52B788", description: "Zones humides, bords de ruisseaux et lacs" },
    { nom: "Chanterelle", lat: -0.003, lng: 0.002, couleur: "#e67e22", description: "Sous les feuillus et conifères, forêts mixtes" },
    { nom: "Pissenlit", lat: 0.001, lng: -0.002, couleur: "#f1c40f", description: "Prairies, jardins et bords de chemins" },
    { nom: "Sureau du Canada", lat: -0.002, lng: -0.003, couleur: "#8e44ad", description: "Lisières de forêts et zones humides" },
    { nom: "Framboisier sauvage", lat: 0.004, lng: 0.001, couleur: "#e74c3c", description: "Clairières ensoleillées et coupes forestières" },
    { nom: "Ail des ours", lat: -0.001, lng: 0.004, couleur: "#27ae60", description: "Forêts humides et ombragées, près des ruisseaux" },
    { nom: "Bleuet sauvage", lat: 0.005, lng: -0.001, couleur: "#2980b9", description: "Tourbières, brûlis et sous-bois clairs" },
    { nom: "Chicouté", lat: -0.004, lng: 0.005, couleur: "#f39c12", description: "Tourbières et marais du nord du Québec" },
    { nom: "Pleurote en huître", lat: 0.003, lng: -0.004, couleur: "#bdc3c7", description: "Sur les troncs d'arbres morts, surtout le peuplier" },
    { nom: "Actée rouge", lat: -0.005, lng: -0.002, couleur: "#c0392b", description: "⚠️ TOXIQUE — Forêts mixtes, à éviter absolument" },
    { nom: "Matricaire odorante", lat: 0.002, lng: 0.005, couleur: "#16a085", description: "Bords de routes et champs ouverts" },
    { nom: "Épilobe à feuilles étroites", lat: -0.001, lng: -0.005, couleur: "#e91e63", description: "Clairières, coupes forestières et bords de routes" },
    { nom: "Cèpe de Bordeaux", lat: 0.006, lng: 0.002, couleur: "#795548", description: "Forêts de conifères et mixtes, été et automne" },
    { nom: "Trille blanc", lat: -0.006, lng: 0.003, couleur: "#ecf0f1", description: "Forêts feuillues riches, printemps" },
    { nom: "Morille commune", lat: 0.001, lng: 0.006, couleur: "#8d6e63", description: "Forêts mixtes au printemps, souvent près des ormes" },
  ]

  const rechercherVille = async () => {
    if (!ville.trim()) return
    setChargement(true)
    setErreur(null)
    try {
      const [geoRes, meteoRes] = await Promise.all([
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ville)}&format=json&limit=1`),
        axios.get(`https://forageia-backend.onrender.com/meteo/${encodeURIComponent(ville)}`)
      ])
      const geoData = await geoRes.json()
      if (geoData.length === 0) {
        setErreur("Ville introuvable, essaie un autre nom.")
      } else {
        setPosition([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)])
        setMeteo(meteoRes.data)
      }
    } catch (e) {
      setErreur("Erreur de connexion, réessaie.")
    }
    setChargement(false)
  }

  const localiser = () => {
    setChargement(true)
    setErreur(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude])
        setChargement(false)
      },
      () => {
        setErreur("GPS bloqué — utilise la recherche par ville ci-dessous.")
        setChargement(false)
      }
    )
  }

  return (
    <div>
      <h2 style={{ color: "#2D6A4F" }}>{t("carte.titre")}</h2>
      <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
        <p style={{ color: "#555", margin: "0 0 15px" }}>{t("carte.description")}</p>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <button onClick={localiser} disabled={chargement} style={btnPrincipal}>
            {chargement ? t("carte.en_cours") : t("carte.localiser")}
          </button>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input type="text" value={ville} onChange={e => setVille(e.target.value)}
            onKeyDown={e => e.key === "Enter" && rechercherVille()}
            placeholder={t("carte.placeholder")}
            style={{ flex: 1, padding: "10px", borderRadius: "25px", border: "2px solid #2D6A4F", fontSize: "14px", minWidth: "200px" }} />
          <button onClick={rechercherVille} disabled={chargement} style={btnPrincipal}>{t("carte.rechercher")}</button>
        </div>
        {erreur && <p style={{ color: "#c0392b", marginTop: "10px" }}>{erreur}</p>}
      </div>

      {position && (
        <>
          {meteo && (
            <div style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "15px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "15px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <img src={`https://openweathermap.org/img/wn/${meteo.icone}@2x.png`} alt="météo" style={{ width: "60px" }} />
                  <div>
                    <h3 style={{ margin: "0 0 3px", color: "#2D6A4F" }}>{meteo.ville}</h3>
                    <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#333" }}>{meteo.temperature}°C</p>
                    <p style={{ margin: 0, color: "#888", fontSize: "14px", textTransform: "capitalize" }}>{meteo.description}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "20px" }}>💧</p>
                    <p style={{ margin: 0, color: "#888", fontSize: "13px" }}>{meteo.humidite}%</p>
                    <p style={{ margin: 0, color: "#888", fontSize: "11px" }}>{t("carte.humidite")}</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "20px" }}>💨</p>
                    <p style={{ margin: 0, color: "#888", fontSize: "13px" }}>{meteo.vent} km/h</p>
                    <p style={{ margin: 0, color: "#888", fontSize: "11px" }}>{t("carte.vent")}</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "20px" }}>{meteo.bon_pour_cueillette ? "✅" : "⚠️"}</p>
                    <p style={{ margin: 0, color: meteo.bon_pour_cueillette ? "#27ae60" : "#e67e22", fontSize: "13px", fontWeight: "bold" }}>
                      {meteo.bon_pour_cueillette ? t("carte.bon") : t("carte.pas_bon")}
                    </p>
                    <p style={{ margin: 0, color: "#888", fontSize: "11px" }}>{t("carte.cueillette")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={{ background: "#e8f5e9", borderRadius: "12px", padding: "15px", marginBottom: "15px" }}>
            <strong>{t("carte.zones")}</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
              {zonesComestibles.map((z, i) => (
                <span key={i} style={{ background: z.couleur, color: "white", borderRadius: "20px", padding: "4px 12px", fontSize: "13px" }}>
                  {z.nom}
                </span>
              ))}
            </div>
          </div>
          <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <MapContainer center={position} zoom={14} style={{ height: "450px", width: "100%" }}>
              <RecentrerCarte position={position} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
              <Marker position={position}><Popup>{t("carte.ici")}</Popup></Marker>
              {zonesComestibles.map((zone, i) => (
                <Circle key={i} center={[position[0] + zone.lat, position[1] + zone.lng]} radius={200} color={zone.couleur} fillColor={zone.couleur} fillOpacity={0.3}>
                  <Popup><strong>{zone.nom}</strong><br />{zone.description}</Popup>
                </Circle>
              ))}
            </MapContainer>
          </div>
        </>
      )}

      {!position && !chargement && (
        <div style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "60px", marginBottom: "15px" }}>🗺️</div>
          <p style={{ color: "#888" }}>{t("carte.description")}</p>
        </div>
      )}

      <div style={{ background: "white", borderRadius: "16px", padding: "25px", marginTop: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <h3 style={{ color: "#2D6A4F", marginTop: 0 }}>
          {t("carte.calendrier")} — {new Date().toLocaleString(locale, { month: "long" })}
        </h3>
        <h4 style={{ color: "#27ae60", marginBottom: "10px" }}>{t("carte.en_saison")}</h4>
        {plantesEnSaison.length === 0 && (
          <p style={{ color: "#888", fontSize: "14px" }}>
            {i18n.language === "fr" ? "Aucune plante en saison ce mois-ci." : "No plants in season this month."}
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          {plantesEnSaison.map((plante, i) => (
            <div key={i} style={{ background: "#e8f5e9", borderRadius: "12px", padding: "12px 16px", minWidth: "150px" }}>
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>{plante.emoji}</div>
              <div style={{ fontWeight: "bold", color: "#2D6A4F", fontSize: "14px" }}>{plante.nom}</div>
              <div style={{ color: "#888", fontSize: "12px" }}>{plante.description}</div>
            </div>
          ))}
        </div>
        <h4 style={{ color: "#e67e22", marginBottom: "10px" }}>{t("carte.hors_saison")}</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {plantesHorsSaison.map((plante, i) => (
            <div key={i} style={{ background: "#f5f5f5", borderRadius: "12px", padding: "10px 14px", minWidth: "130px", opacity: 0.7 }}>
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>{plante.emoji}</div>
              <div style={{ fontWeight: "bold", color: "#888", fontSize: "13px" }}>{plante.nom}</div>
              <div style={{ color: "#aaa", fontSize: "11px" }}>
                {i18n.language === "fr" ? "Mois" : "Months"} : {plante.mois.map(m => new Date(2024, m - 1).toLocaleString(locale, { month: "short" })).join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Profil({ utilisateur, plantes }) {
  const { t } = useTranslation()
  const [nbRecettes, setNbRecettes] = useState(0)
  const [chargement, setChargement] = useState(true)
  const [motDePasseEnvoye, setMotDePasseEnvoye] = useState(false)

  useState(() => {
    const charger = async () => {
      try {
        const q = query(collection(db, "recettes"), where("userId", "==", utilisateur.uid))
        const snapshot = await getDocs(q)
        setNbRecettes(snapshot.size)
      } catch (e) {
        console.error(e)
      }
      setChargement(false)
    }
    charger()
  }, [])

  const changerMotDePasse = async () => {
    try {
      await sendPasswordResetEmail(auth, utilisateur.email)
      setMotDePasseEnvoye(true)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <h2 style={{ color: "#2D6A4F" }}>{t("profil.titre")}</h2>
      <div style={{ background: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
          <div style={{ background: "#2D6A4F", borderRadius: "50%", width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>
            🌿
          </div>
          <div>
            <h3 style={{ margin: "0 0 5px", color: "#2D6A4F" }}>{utilisateur.email}</h3>
            <p style={{ margin: 0, color: "#888", fontSize: "13px" }}>{t("profil.membre")}</p>
            <p style={{ margin: "3px 0 0", color: "#888", fontSize: "13px" }}>
              {t("profil.inscrit")} {new Date(utilisateur.metadata.creationTime).toLocaleDateString("fr-CA")}
            </p>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "20px" }}>
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>🍽️</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2D6A4F" }}>{chargement ? "..." : nbRecettes}</div>
          <div style={{ color: "#888", fontSize: "13px" }}>{t("profil.recettes")}</div>
        </div>
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>🌿</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2D6A4F" }}>{plantes.length}</div>
          <div style={{ color: "#888", fontSize: "13px" }}>{t("profil.plantes")}</div>
        </div>
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>🌲</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2D6A4F" }}>🍀</div>
          <div style={{ color: "#888", fontSize: "13px" }}>{t("profil.cueilleur")}</div>
        </div>
      </div>
      {plantes.length > 0 && (
        <div style={{ background: "white", borderRadius: "16px", padding: "25px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
          <h3 style={{ color: "#2D6A4F", marginTop: 0 }}>{t("profil.plantes_session")}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {plantes.map((plante, i) => (
              <span key={i} style={{ background: "#e8f5e9", color: "#2D6A4F", borderRadius: "20px", padding: "6px 14px", fontSize: "14px", fontWeight: "bold" }}>
                🌱 {plante}
              </span>
            ))}
          </div>
        </div>
      )}
      <div style={{ background: "white", borderRadius: "16px", padding: "25px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <h3 style={{ color: "#2D6A4F", marginTop: 0 }}>{t("profil.parametres")}</h3>
        {motDePasseEnvoye ? (
          <div style={{ background: "#e8f5e9", borderRadius: "8px", padding: "12px", color: "#27ae60" }}>
            {t("profil.mdp_envoye")} {utilisateur.email}
          </div>
        ) : (
          <button onClick={changerMotDePasse} style={{ ...btnPrincipal, background: "#888" }}>
            {t("profil.changer_mdp")}
          </button>
        )}
      </div>
    </div>
  )
}

function Encyclopedie() {
  const { t } = useTranslation()
  const [recherche, setRecherche] = useState("")
  const [planteSelectionnee, setPlanteSelectionnee] = useState(null)
  const [rechercheIA, setRechercheIA] = useState("")
  const [chargementIA, setChargementIA] = useState(false)
  const [erreurIA, setErreurIA] = useState(null)

  const rechercherIA = async () => {
    if (!rechercheIA.trim()) return
    setChargementIA(true)
    setErreurIA(null)
    try {
      const res = await axios.get(`https://forageia-backend.onrender.com/encyclopedie/${encodeURIComponent(rechercheIA)}`)
      if (res.data.erreur) {
        setErreurIA("Plante introuvable — essaie un autre nom.")
      } else {
        setPlanteSelectionnee({ ...res.data, emoji: "🌿" })
      }
    } catch (e) {
      setErreurIA("Erreur de connexion, réessaie.")
    }
    setChargementIA(false)
  }

  const plantes = [
    { nom: "Pissenlit", nom_latin: "Taraxacum officinale", emoji: "🌼", comestible: "oui", saison: [4, 5, 6], parties: "Feuilles, fleurs, racines", habitat: "Prairies, jardins, bords de chemins", description: "Le pissenlit est l'une des plantes sauvages les plus connues et les plus utiles. Toutes ses parties sont comestibles. Les jeunes feuilles se mangent en salade, les fleurs en beignets ou en sirop, et les racines torréfiées remplacent le café.", conseil: "Cueillir les jeunes feuilles au printemps avant la floraison pour un goût moins amer.", danger: null },
    { nom: "Ail des ours", nom_latin: "Allium ursinum", emoji: "🧄", comestible: "oui", saison: [4, 5], parties: "Feuilles, fleurs, bulbes", habitat: "Forêts humides et ombragées, près des ruisseaux", description: "L'ail des ours est une plante printanière très parfumée qui pousse en tapis dans les forêts humides. Ses feuilles ont un fort goût d'ail et sont excellentes en pesto, soupe ou omelette.", conseil: "Attention à ne pas confondre avec le muguet qui est très toxique ! L'ail des ours sent fortement l'ail quand on froisse ses feuilles.", danger: "Muguet (Convallaria majalis) — TRÈS TOXIQUE, feuilles similaires mais sans odeur d'ail" },
    { nom: "Chanterelle", nom_latin: "Cantharellus cibarius", emoji: "🍄", comestible: "oui", saison: [7, 8, 9], parties: "Chapeau et pied", habitat: "Sous les feuillus et conifères, forêts mixtes", description: "La chanterelle est l'un des champignons les plus appréciés en cuisine. De couleur dorée à orangée, elle pousse en forêt mixte de juillet à septembre. Son goût légèrement fruité et poivré en fait un ingrédient de choix.", conseil: "Ne jamais laver les chanterelles à l'eau. Les essuyer avec un linge humide pour préserver leur saveur.", danger: "Clitocybe de l'olivier (Omphalotus olearius) — toxique, pousse en touffe sur bois mort" },
    { nom: "Bleuet sauvage", nom_latin: "Vaccinium angustifolium", emoji: "🫐", comestible: "oui", saison: [7, 8, 9], parties: "Fruits", habitat: "Tourbières, brûlis, sous-bois clairs, rochers", description: "Le bleuet sauvage est le fruit emblématique du Québec. Beaucoup plus petit que le bleuet cultivé, il est bien plus savoureux et parfumé. Il pousse en abondance dans les brûlis et les tourbières.", conseil: "Les brûlis de 2 à 5 ans sont les meilleurs endroits pour trouver des bleuets en abondance.", danger: null },
    { nom: "Framboisier sauvage", nom_latin: "Rubus idaeus", emoji: "🫐", comestible: "oui", saison: [7, 8], parties: "Fruits, feuilles", habitat: "Clairières ensoleillées, coupes forestières, bords de routes", description: "Le framboisier sauvage produit des fruits plus petits mais plus parfumés que les framboises cultivées. Il colonise rapidement les clairières et les zones perturbées.", conseil: "Les fruits sont très fragiles, les cueillir délicatement et les consommer rapidement.", danger: null },
    { nom: "Salicaire", nom_latin: "Lythrum salicaria", emoji: "🌸", comestible: "avec prudence", saison: [6, 7, 8], parties: "Feuilles jeunes, fleurs", habitat: "Zones humides, bords de ruisseaux et lacs", description: "La salicaire est une belle plante aux épis de fleurs roses à violettes. Les jeunes feuilles et tiges peuvent être consommées, mais avec modération.", conseil: "Consommer avec modération. Les jeunes pousses printanières sont les meilleures.", danger: null },
    { nom: "Morille", nom_latin: "Morchella esculenta", emoji: "🍄", comestible: "oui", saison: [4, 5], parties: "Chapeau et pied", habitat: "Forêts mixtes, souvent près des ormes et pommiers", description: "La morille est l'un des champignons les plus recherchés et les plus chers au monde. Sa forme alvéolée caractéristique la rend facilement reconnaissable. Elle doit toujours être cuite.", conseil: "Ne jamais consommer crue ! Toujours bien cuire avant de manger.", danger: "Gyromitre (Gyromitra esculenta) — toxique cru, alvéoles irrégulières et tortueuses" },
    { nom: "Épilobe", nom_latin: "Epilobium angustifolium", emoji: "🌺", comestible: "oui", saison: [6, 7, 8], parties: "Jeunes pousses, feuilles, fleurs", habitat: "Clairières, coupes forestières, bords de routes", description: "L'épilobe à feuilles étroites est une plante pionnière aux belles fleurs roses. Les jeunes pousses printanières se mangent comme des asperges.", conseil: "Cueillir les jeunes pousses quand elles mesurent moins de 20 cm pour la meilleure saveur.", danger: null },
    { nom: "Sureau du Canada", nom_latin: "Sambucus canadensis", emoji: "🫐", comestible: "avec prudence", saison: [8, 9], parties: "Fleurs, fruits mûrs cuits", habitat: "Lisières de forêts, zones humides, bords de routes", description: "Le sureau produit de belles grappes de petites baies noires très utilisées pour les sirops, confitures et vins. Ses fleurs blanches sont comestibles en beignets.", conseil: "Les baies doivent absolument être cuites avant consommation.", danger: "Baies crues et feuilles TOXIQUES — toujours cuire les baies avant consommation" },
    { nom: "Chicouté", nom_latin: "Rubus chamaemorus", emoji: "🟡", comestible: "oui", saison: [7, 8], parties: "Fruits", habitat: "Tourbières et marais du nord du Québec", description: "La chicouté, aussi appelée plaquebière, est un fruit nordique très rare et précieux. Orange à maturité, elle a un goût acidulé unique.", conseil: "Fruit très rare et fragile. Le consommer rapidement après la cueillette.", danger: null },
    { nom: "Cèpe de Bordeaux", nom_latin: "Boletus edulis", emoji: "🍄", comestible: "oui", saison: [8, 9, 10], parties: "Chapeau et pied", habitat: "Forêts de conifères et mixtes", description: "Le cèpe est le roi des champignons. Son chapeau brun et son pied trapu le rendent reconnaissable. Excellent frais, séché ou en poudre.", conseil: "Vérifier que les pores sous le chapeau sont blancs à jaunes. Ne jamais bleuir à la coupe.", danger: "Bolet satan (Boletus satanas) — toxique, pores rouges et bleuissement à la coupe" },
    { nom: "Pleurote", nom_latin: "Pleurotus ostreatus", emoji: "🍄", comestible: "oui", saison: [9, 10, 11], parties: "Chapeau et pied", habitat: "Sur les troncs d'arbres morts, surtout le peuplier", description: "Le pleurote en huître pousse en touffes sur les troncs d'arbres morts ou affaiblis. De couleur grise à beige, il est facile à reconnaître et délicieux à cuisiner.", conseil: "Choisir les jeunes spécimens aux bords du chapeau encore enroulés vers le bas.", danger: null },
  ]

  const moisActuel = new Date().getMonth() + 1
  const plantesFiltrees = plantes.filter(p =>
    p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    p.nom_latin.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div>
      <h2 style={{ color: "#2D6A4F" }}>{t("encyclopedie.titre")}</h2>
      <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
        <input type="text" value={recherche} onChange={e => { setRecherche(e.target.value); setPlanteSelectionnee(null) }}
          placeholder={t("encyclopedie.recherche_liste")}
          style={{ width: "100%", padding: "12px 16px", borderRadius: "25px", border: "2px solid #2D6A4F", fontSize: "15px", boxSizing: "border-box", marginBottom: "15px" }} />
        <p style={{ color: "#888", fontSize: "13px", margin: "0 0 10px" }}>{t("encyclopedie.recherche_ia")}</p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input type="text" value={rechercheIA} onChange={e => setRechercheIA(e.target.value)}
            onKeyDown={e => e.key === "Enter" && rechercherIA()}
            placeholder={t("encyclopedie.placeholder_ia")}
            style={{ flex: 1, padding: "10px 16px", borderRadius: "25px", border: "2px solid #52B788", fontSize: "14px", minWidth: "150px" }} />
          <button onClick={rechercherIA} disabled={chargementIA} style={{ ...btnPrincipal, background: "#52B788" }}>
            {chargementIA ? t("encyclopedie.chargement") : t("encyclopedie.bouton_ia")}
          </button>
        </div>
        {erreurIA && <p style={{ color: "#c0392b", marginTop: "10px", fontSize: "13px" }}>{erreurIA}</p>}
      </div>

      {!planteSelectionnee && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
          {plantesFiltrees.map((plante, i) => (
            <div key={i} onClick={() => setPlanteSelectionnee(plante)}
              style={{ background: "white", borderRadius: "12px", padding: "16px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: `4px solid ${plante.comestible === "oui" ? "#27ae60" : plante.comestible === "avec prudence" ? "#f39c12" : "#e74c3c"}` }}
              onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>{plante.emoji}</div>
              <div style={{ fontWeight: "bold", color: "#2D6A4F", fontSize: "14px" }}>{plante.nom}</div>
              <div style={{ color: "#aaa", fontSize: "11px", fontStyle: "italic", marginBottom: "6px" }}>{plante.nom_latin}</div>
              <div style={{ fontSize: "11px" }}>
                {plante.comestible === "oui" ? <span style={{ color: "#27ae60" }}>{t("encyclopedie.comestible")}</span> :
                  plante.comestible === "avec prudence" ? <span style={{ color: "#f39c12" }}>{t("encyclopedie.prudence")}</span> :
                    <span style={{ color: "#e74c3c" }}>{t("encyclopedie.toxique")}</span>}
              </div>
              {plante.saison.includes(moisActuel) && (
                <div style={{ marginTop: "5px", fontSize: "11px", color: "#52B788", fontWeight: "bold" }}>{t("encyclopedie.en_saison")}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {planteSelectionnee && (
        <div style={{ background: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <button onClick={() => setPlanteSelectionnee(null)} style={{ background: "none", border: "none", color: "#2D6A4F", cursor: "pointer", fontSize: "14px", marginBottom: "15px" }}>
            {t("encyclopedie.retour")}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
            <span style={{ fontSize: "50px" }}>{planteSelectionnee.emoji}</span>
            <div>
              <h3 style={{ margin: "0 0 4px", color: "#2D6A4F", fontSize: "24px" }}>{planteSelectionnee.nom}</h3>
              <p style={{ margin: 0, color: "#aaa", fontStyle: "italic" }}>{planteSelectionnee.nom_latin}</p>
              <div style={{ marginTop: "6px" }}>
                {planteSelectionnee.comestible === "oui" ? <span style={{ background: "#27ae60", color: "white", borderRadius: "20px", padding: "3px 10px", fontSize: "13px" }}>{t("encyclopedie.comestible")}</span> :
                  planteSelectionnee.comestible === "avec prudence" ? <span style={{ background: "#f39c12", color: "white", borderRadius: "20px", padding: "3px 10px", fontSize: "13px" }}>{t("encyclopedie.prudence")}</span> :
                    <span style={{ background: "#e74c3c", color: "white", borderRadius: "20px", padding: "3px 10px", fontSize: "13px" }}>{t("encyclopedie.toxique")}</span>}
                {planteSelectionnee.saison.includes(moisActuel) && (
                  <span style={{ background: "#52B788", color: "white", borderRadius: "20px", padding: "3px 10px", fontSize: "13px", marginLeft: "8px" }}>{t("encyclopedie.en_saison")}</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: "#f9f9f9", borderRadius: "10px", padding: "12px" }}>
              <strong style={{ color: "#2D6A4F" }}>{t("encyclopedie.saison")}</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
                {planteSelectionnee.saison.map(m => new Date(2024, m - 1).toLocaleString("fr-CA", { month: "long" })).join(", ")}
              </p>
            </div>
            <div style={{ background: "#f9f9f9", borderRadius: "10px", padding: "12px" }}>
              <strong style={{ color: "#2D6A4F" }}>{t("encyclopedie.parties")}</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{planteSelectionnee.parties}</p>
            </div>
            <div style={{ background: "#f9f9f9", borderRadius: "10px", padding: "12px", gridColumn: "1 / -1" }}>
              <strong style={{ color: "#2D6A4F" }}>{t("encyclopedie.habitat")}</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{planteSelectionnee.habitat}</p>
            </div>
          </div>
          <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "15px" }}>{planteSelectionnee.description}</p>
          <div style={{ background: "#e8f5e9", borderRadius: "10px", padding: "15px", marginBottom: "15px" }}>
            <strong style={{ color: "#2D6A4F" }}>{t("encyclopedie.conseil")}</strong>
            <p style={{ margin: "6px 0 0", fontSize: "14px" }}>{planteSelectionnee.conseil}</p>
          </div>
          {planteSelectionnee.danger && (
            <div style={{ background: "#ffe0e0", borderRadius: "10px", padding: "15px" }}>
              <strong style={{ color: "#c0392b" }}>{t("encyclopedie.danger")}</strong>
              <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#c0392b" }}>{planteSelectionnee.danger}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const btnPrincipal = {
  background: "#2D6A4F",
  color: "white",
  border: "none",
  borderRadius: "25px",
  padding: "12px 28px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold"
}

function badge(comestible) {
  const couleur = comestible === "oui" ? "#27ae60" : comestible === "non" ? "#e74c3c" : "#f39c12"
  return { background: couleur, color: "white", borderRadius: "20px", padding: "4px 12px", fontSize: "14px" }
}

export default App