
class AudioService {
  private context: AudioContext;
  private masterGain: GainNode;
  private destination: MediaStreamAudioDestinationNode;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private loopSources: Map<string, AudioBufferSourceNode> = new Map();
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micMonitorGain: GainNode | null = null;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.destination = this.context.createMediaStreamDestination();
    
    // Connect master gain to both the speakers and the recording destination
    this.masterGain.connect(this.context.destination);
    this.masterGain.connect(this.destination);
  }

  public async loadSound(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    return await this.context.decodeAudioData(arrayBuffer);
  }

  public resumeContext() {
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  public playTrigger(buffer: AudioBuffer) {
    this.resumeContext();
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.masterGain);
    source.start(0);
  }

  public startLoop(id: string, buffer: AudioBuffer) {
    this.resumeContext();
    this.stopLoop(id);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.masterGain);
    source.start(0);
    this.loopSources.set(id, source);
  }

  public stopLoop(id: string) {
    const existing = this.loopSources.get(id);
    if (existing) {
      existing.stop();
      this.loopSources.delete(id);
    }
  }

  public async enableLiveMic(): Promise<boolean> {
    try {
      this.resumeContext();
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micSource = this.context.createMediaStreamSource(this.micStream);
      
      // Monitor gain to control feedback if necessary, but here we connect directly
      // to the masterGain so it's heard and recorded.
      this.micMonitorGain = this.context.createGain();
      this.micMonitorGain.gain.value = 1.0; 
      
      this.micSource.connect(this.micMonitorGain);
      this.micMonitorGain.connect(this.masterGain);
      
      return true;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      return false;
    }
  }

  public disableLiveMic() {
    if (this.micMonitorGain) {
      this.micMonitorGain.disconnect();
      this.micMonitorGain = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
  }

  public startRecording() {
    this.chunks = [];
    this.recorder = new MediaRecorder(this.destination.stream);
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `namouradoxier-session-${Date.now()}.webm`;
      a.click();
    };
    this.recorder.start();
  }

  public stopRecording() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
  }
}

export const audioService = new AudioService();
