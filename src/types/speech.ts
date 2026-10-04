export interface SpeechRecognitionResult {
  readonly [index: number]: { transcript: string };
}

export interface SpeechRecognitionEvent {
  readonly results: {
    readonly [index: number]: SpeechRecognitionResult;
  };
}

export interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

export interface IWindow extends Window {
  SpeechRecognition?: ISpeechRecognitionConstructor;
  webkitSpeechRecognition?: ISpeechRecognitionConstructor;
}

export type SpeechState = "idle" | "speaking" | "paused";
