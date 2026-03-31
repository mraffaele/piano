export async function unlockAudio(): Promise<boolean> {
  try {
    const C = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!C) return false;

    const ctx = new C();
    // create tiny buffer and play to ensure unlock on some iOS versions
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);

    try {
      await ctx.resume();
    } catch {}

    try {
      src.start(0);
    } catch {}

    // stop and close quickly
    try { src.stop(0); } catch {}
    try { await ctx.close(); } catch {}

    // mark unlocked globally for quick checks
    try { (window as any).__audioUnlocked = true; } catch {}

    return true;
  } catch (e) {
    return false;
  }
}
