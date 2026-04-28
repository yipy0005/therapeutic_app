/**
 * useNarration — wraps window.speechSynthesis for voice narration.
 * Validates: Requirements 12.4
 */
export function useNarration() {
  const isAvailable = typeof window !== 'undefined' && !!window.speechSynthesis;

  const speak = (text: string) => {
    if (!isAvailable) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return { speak, isAvailable };
}
