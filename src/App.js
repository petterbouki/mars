import React, { useEffect, useState } from "react";
import "./App.css";

import parrains from "./data/parrains";
import fioles from "./data/fioles";

const STORAGE_KEY = "eliort_extend_draw_state_v1";

function App() {
  const [remainingParrains, setRemainingParrains] = useState([]);
  const [remainingFioles, setRemainingFioles] = useState([]);
  const [currentParrain, setCurrentParrain] = useState(null);
  const [currentFilleul, setCurrentFilleul] = useState(null);
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(8);
  const [showParrain, setShowParrain] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialisation
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRemainingParrains(parsed.remainingParrains ?? shuffleArray([...parrains]));
        setRemainingFioles(parsed.remainingFioles ?? shuffleArray([...fioles]));
        setCurrentParrain(parsed.currentParrain ?? null);
        setCurrentFilleul(parsed.currentFilleul ?? null);
        return;
      } catch (e) {
        console.warn("Erreur parse localStorage, reset lists", e);
      }
    }
    setRemainingParrains(shuffleArray([...parrains]));
    setRemainingFioles(shuffleArray([...fioles]));
  }, []);

  // Sauvegarde
  useEffect(() => {
    const stateToSave = {
      remainingParrains,
      remainingFioles,
      currentParrain,
      currentFilleul,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [remainingParrains, remainingFioles, currentParrain, currentFilleul]);

  // Timer + défilement images
  useEffect(() => {
    if (!loading) return;

    if (counter <= 0) {
      setShowParrain(true);
      setLoading(false);
      setCurrentImageIndex(0);
      return;
    }

    // Met à jour le compteur
    const t = setTimeout(() => setCounter((c) => c - 1), 1000);

    // Défilement rapide des images
    const scrollInterval = setInterval(() => {
      setCurrentImageIndex((i) => (i + 1) % remainingParrains.length);
    }, 100); // change d'image toutes les 100ms

    return () => {
      clearTimeout(t);
      clearInterval(scrollInterval);
    };
  }, [loading, counter, remainingParrains.length]);

  // Utils
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function resetRemainingIfEmpty(list, fullList) {
    if (!list || list.length === 0) {
      return shuffleArray([...fullList]);
    }
    return list;
  }

  const tirage = () => {
    setLoading(true);
    setShowParrain(false);
    setCounter(8);

    // Tirer un filleul
    let fiolesAvailable = [...remainingFioles];
    fiolesAvailable = resetRemainingIfEmpty(fiolesAvailable, fioles);
    const filleul = fiolesAvailable.shift();
    setCurrentFilleul(filleul);
    setRemainingFioles(fiolesAvailable);

    // Préparer le parrain
    let parrainsAvailable = [...remainingParrains];
    parrainsAvailable = resetRemainingIfEmpty(parrainsAvailable, parrains);
    const parrain = parrainsAvailable.shift();
    setCurrentParrain(parrain);
    setRemainingParrains(parrainsAvailable);
  };

  const forceResetAll = () => {
    setRemainingParrains(shuffleArray([...parrains]));
    setRemainingFioles(shuffleArray([...fioles]));
    setCurrentParrain(null);
    setCurrentFilleul(null);
    setShowParrain(false);
    setLoading(false);
    setCounter(8);
    setCurrentImageIndex(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  // ... reste du code inchangé

return (
  <div className="App">
    <header className="App-header">
      <h1>Tirage Parrains & Filleuls</h1>
      <p>
        Égalité, transparence et fun — chaque parrain et filleul tirés sans
        répétition jusqu'à épuisement
      </p>
    </header>

    <main className="main-content">
      {remainingFioles.length === 0 && remainingParrains.length === 0 ? (
        // Message de fin
        <div className="end-message">
          <h2>🎉 Tous les filleuls et parrains ont été attribués !</h2>
          <p>Merci à tous pour votre participation ! 🙏</p>
        </div>
      ) : (
        <div className="characters-container">
          {/* Filleul */}
          <div className="character-card">
            <h3 className="text-center">FILLEUL ou FILLEULE</h3>

            {currentFilleul ? (
              <>
                <div className="image-container">
                  <img
                    src={currentFilleul.image}
                    alt={`${currentFilleul.nom} ${currentFilleul.prenom}`}
                    className="character-image"
                  />
                </div>
                <div className="character-info">
                  <h3>
                    {currentFilleul.prenom} {currentFilleul.nom}
                  </h3>
                  <p>Numéro : {currentFilleul.numero}</p>
                  <p>ID : {currentFilleul.id}</p>
                </div>
              </>
            ) : (
              <div className="placeholder">
                Aucun(e) filleul(e) sélectionné(e)
              </div>
            )}
          </div>

          {/* Parrain */}
          <div className="character-card">
            <h3 className="text-center">PARRAIN ou MARRAINE</h3>

            {showParrain && currentParrain ? (
              <>
                <div className="image-container">
                  <img
                    src={currentParrain.image}
                    alt={currentParrain.nom}
                    className="character-image"
                  />
                </div>
                <div className="character-info">
                  <h3>
                    {currentParrain.prenom} {currentParrain.nom}
                  </h3>
                  <p>Numéro : {currentParrain.numero}</p>
                  <p>ID : {currentParrain.id}</p>
                </div>
              </>
            ) : (
              <div className="image-container">
                {loading && remainingParrains.length > 0 ? (
                  <img
                    src={remainingParrains[currentImageIndex].image}
                    alt="Défilement parrains"
                    className="character-image scrolling-image"
                  />
                ) : (
                  <p>Appuyez sur "Nouveau tirage" pour commencer</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Boutons */}
      <div className="controls">
        <button
          className="tirage-button"
          onClick={tirage}
          disabled={loading || remainingFioles.length === 0}
        >
          {loading
            ? `Tirage en cours (${counter}s)`
            : remainingFioles.length === 0
            ? "Tirage terminé"
            : "Nouveau tirage"}
        </button>
        <button className="reset-button" onClick={forceResetAll}>
          Réinitialiser
        </button>
      </div>

      <footer style={{ marginTop: 20 }}>
        <small>
          Restants — Parrains: {remainingParrains.length} | Filleuls:{" "}
          {remainingFioles.length}
        </small>
      </footer>
    </main>
  </div>
);

}

export default App;
