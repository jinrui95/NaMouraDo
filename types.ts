
export interface SoundSlot {
  id: string;
  name: string;
  buffer: AudioBuffer | null;
  isPlaying: boolean;
  type: 'trigger' | 'loop';
}

export interface PadState {
  isPressed: boolean;
}
