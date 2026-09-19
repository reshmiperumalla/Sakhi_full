/**
 * Web Speech API service for Speech-to-Text (STT) and Text-to-Speech (TTS).
 */

const LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN'
};

export const speechService = {
  activeRecognition: null,

  // Check if browser supports speech recognition
  isRecognitionSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  // Start continuous / single utterance speech listening
  startListening({ language = 'en', onResult, onError, onEnd }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return null;
    }

    this.stopListening();

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = LANG_MAP[language] || 'en-IN';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (onResult) onResult({ transcript: final || interim, isFinal: !!final });
    };

    recognition.onerror = (event) => {
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      this.activeRecognition = null;
      if (onEnd) onEnd();
    };

    try {
      recognition.start();
      this.activeRecognition = recognition;
      return recognition;
    } catch (err) {
      this.activeRecognition = null;
      if (onError) onError(err);
      return null;
    }
  },

  // Stop active speech listening
  stopListening() {
    if (this.activeRecognition) {
      try {
        this.activeRecognition.stop();
      } catch (err) {
        // Recognition might already be stopped
      }
      this.activeRecognition = null;
    }
  },

  // Speak text aloud using SpeechSynthesis
  speak(text, language = 'en') {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any active speech

    // Clean text of markdown asterisks/bullets for clean speech
    const cleanText = text
      .replace(/[*#_`•]/g, '')
      .replace(/₹/g, 'rupees ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = LANG_MAP[language] || 'en-IN';
    utterance.rate = 0.95; // Slightly slower for clear rural understanding
    utterance.pitch = 1.0;

    // Pick matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetLang = LANG_MAP[language] || 'en-IN';
    const matchedVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(language));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
