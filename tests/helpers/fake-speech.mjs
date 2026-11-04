// A stand-in for the Web Speech API recognizer, for Playwright (headless Chromium has no working
// speech service). Install with context.addInitScript(fakeSpeech). It "hears" window.__heard
// when set, otherwise the current exercise's sentence (through the ?qa hook).

export function fakeSpeech() {
  class FakeRecognition {
    static available() {
      return Promise.resolve('available');
    }

    start() {
      setTimeout(() => {
        const spec = window.__tolva?.spec();
        const text = window.__heard ?? (spec ? window.__tolva.sentence(spec.sentence).is : '');
        const alt = { transcript: text, confidence: 0.9 };
        const result = Object.assign([alt], { isFinal: true });
        this.onresult?.({ results: [result] });
        this.onend?.();
      }, 50);
    }

    stop() {}
  }
  window.SpeechRecognition = FakeRecognition;
  window.webkitSpeechRecognition = FakeRecognition;
}
