import { useState } from "react";
import { Piano } from "./components/Piano";
import RotateOverlay from "./components/RotateOverlay";
import "./index.css";
import { unlockAudio } from "./utils/unlockAudio";

function App() {
  const [started, setStarted] = useState(false);

  const startExperience = async () => {
    // Try unlocking audio proactively and then show the piano
    await unlockAudio();
    setStarted(true);
  };

  return (
    <div className="app">
      {!started ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "white", marginBottom: 12 }}>
              Hello Finn & Noah
            </h1>
            <button
              onClick={startExperience}
              style={{
                padding: "12px 20px",
                fontSize: 18,
                borderRadius: 8,
                border: "none",
                background: "#ffd166",
              }}
            >
              Start Playing
            </button>
          </div>
        </div>
      ) : (
        <>
          <RotateOverlay />
          <Piano />
        </>
      )}
    </div>
  );
}

export default App;
