/// <reference types="vite/client" />

interface Window {
  __appAudio?: AudioContext;
  __audioUnlocked?: boolean;
  webkitAudioContext?: typeof AudioContext;
}
