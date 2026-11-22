/**
 * Lazy Dynamic Confetti Utility
 * Dynamically imports canvas-confetti only when triggered, preventing
 * it from inflating the initial home page bundle.
 */
export async function fireConfetti(customOptions = {}) {
  try {
    const module = await import('canvas-confetti');
    const confetti = module.default || module;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#DC2626', '#F59E0B', '#10B981', '#000000'],
      ...customOptions,
    });
  } catch {
    // Graceful silent fallback if confetti is unavailable or blocked
  }
}
