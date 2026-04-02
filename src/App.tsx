import { useState } from "react";
import { Piano } from "./components/Piano";
import RotateOverlay from "./components/RotateOverlay";
import PracticePanel from "./components/PracticePanel";
import "./index.css";
import "./App.css";
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
        <div className="start-screen">
          <div className="start-content">
            <h1 className="start-title">Hello Finn & Noah</h1>
            <button onClick={startExperience} className="start-button">
              Start Playing
            </button>
          </div>
        </div>
      ) : (
        <>
          <RotateOverlay />
          <Piano />

          <PracticePanel onPlayNote={() => {}} onStopNote={() => {}} />
        </>
      )}
    </div>
  );
}

export default App;
