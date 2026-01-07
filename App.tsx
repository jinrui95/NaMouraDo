import React, { useState, useCallback, useEffect } from 'react';
import { Pad } from './components/Pad';
import { audioService } from './services/audioService';
import { SoundSlot } from './types';

const INITIAL_TRIGGERS = 9;
const INITIAL_LOOPS = 3;

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveRecActive, setIsLiveRecActive] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  const [triggerSlots, setTriggerSlots] = useState<SoundSlot[]>(
    Array.from({ length: INITIAL_TRIGGERS }, (_, i) => ({
      id: `trigger-${i}`,
      name: `S${i + 1}`,
      buffer: null,
      isPlaying: false,
      type: 'trigger'
    }))
  );

  const [loopSlots, setLoopSlots] = useState<SoundSlot[]>(
    Array.from({ length: INITIAL_LOOPS }, (_, i) => ({
      id: `loop-${i}`,
      name: `L${i + 1}`,
      buffer: null,
      isPlaying: false,
      type: 'loop'
    }))
  );

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
  }, []);

  const handleUpload = useCallback(async (id: string, file: File, type: 'trigger' | 'loop') => {
    try {
      const buffer = await audioService.loadSound(file);
      if (type === 'trigger') {
        setTriggerSlots(prev => prev.map(s => s.id === id ? { ...s, buffer } : s));
      } else {
        setLoopSlots(prev => prev.map(s => s.id === id ? { ...s, buffer } : s));
      }
    } catch (err) {
      console.error("Failed to load sound:", err);
      alert("Error loading audio file.");
    }
  }, []);

  const handleTrigger = useCallback((slot: SoundSlot) => {
    if (!slot.buffer) return;
    
    if (slot.type === 'trigger') {
      audioService.playTrigger(slot.buffer);
    } else {
      if (slot.isPlaying) {
        audioService.stopLoop(slot.id);
        setLoopSlots(prev => prev.map(s => s.id === slot.id ? { ...s, isPlaying: false } : s));
      } else {
        audioService.startLoop(slot.id, slot.buffer);
        setLoopSlots(prev => prev.map(s => s.id === slot.id ? { ...s, isPlaying: true } : s));
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      audioService.stopRecording();
      setIsRecording(false);
    } else {
      audioService.startRecording();
      setIsRecording(true);
    }
  };

  const toggleLiveRec = async () => {
    if (isLiveRecActive) {
      audioService.disableLiveMic();
      setIsLiveRecActive(false);
    } else {
      const success = await audioService.enableLiveMic();
      if (success) {
        setIsLiveRecActive(true);
      } else {
        alert("Microphone access denied or unavailable.");
      }
    }
  };

  const windowStyles: React.CSSProperties = isTouchDevice ? {
    width: '100vw',
    height: '100vh',
    borderRadius: '0',
  } : {
    width: 'min(640px, 85vw)',
    height: 'min(840px, 90vh)',
    minWidth: '400px',
    minHeight: '560px',
    resize: 'both',
    overflow: 'hidden',
    containerType: 'size',
  };

  return (
    <div className={`w-full h-full flex items-center justify-center ${isTouchDevice ? '' : 'p-4'}`}>
      <div 
        style={windowStyles}
        className={`bg-[#1e1e20] flex flex-col shadow-[0_50px_100px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.08)] border border-slate-900 transition-shadow duration-300 relative ${isTouchDevice ? '' : 'rounded-[44px]'}`}
      >
        <div className="flex-1 flex flex-col p-[clamp(1.5rem,4cqw,2.5rem)] min-h-0 overflow-hidden">
          
          {/* Header Section - Height dynamic but capped */}
          <div className="flex items-center justify-between shrink-0 mb-[clamp(1rem,4cqh,2rem)] gap-4">
            <div className="flex flex-col min-w-0">
              <h1 className="text-[clamp(24px,7cqw,52px)] font-black text-slate-100 italic retro-70s-text leading-[1.1] truncate pb-2 pr-4">
                NaMoura<span className="text-indigo-500">Do</span>
              </h1>
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] shrink-0" />
                 <p className="text-[clamp(8px,1.8cqw,11px)] text-slate-500 uppercase tracking-[0.3em] font-bold truncate">Oeiras city original</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-black/60 p-[clamp(0.5rem,2cqw,1rem)] rounded-[1.5rem] border border-slate-800/60 shadow-inner shrink-0">
               <button 
                  onClick={toggleRecording}
                  className={`group flex items-center justify-center gap-2 px-[clamp(0.75rem,2.5cqw,1.25rem)] py-[clamp(0.4rem,1.5cqh,0.6rem)] rounded-full transition-all duration-300 border ${
                    isRecording 
                    ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
               >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-[clamp(8px,1.6cqw,10px)] font-black uppercase tracking-widest leading-none">Rec Master</span>
               </button>

               <div className="flex justify-end pr-1">
                 <button 
                    onClick={toggleLiveRec}
                    className={`flex items-center justify-center gap-1.5 px-2 py-0.5 md:py-1 rounded transition-all duration-200 border ${
                      isLiveRecActive 
                      ? 'bg-red-600 border-red-400 text-white' 
                      : 'bg-red-950/20 border-red-900/30 text-red-800/40 hover:text-red-700/60'
                    }`}
                 >
                    <span className="text-[clamp(6px,1.4cqw,8px)] font-black uppercase tracking-widest leading-none">Live Rec</span>
                    <div className={`w-1 h-1 rounded-full shrink-0 ${isLiveRecActive ? 'bg-white' : 'bg-red-900/60'}`} />
                 </button>
               </div>
            </div>
          </div>

          {/* Layer Loops Section - Scales proportionally */}
          <div className="flex flex-col flex-1 min-h-0 mb-[clamp(0.5rem,3cqh,1.5rem)]">
            <p className="text-[clamp(8px,1.6cqw,10px)] text-slate-500 font-bold uppercase tracking-[0.2em] mb-2 ml-2 shrink-0">Layer Loops</p>
            <div className="flex-1 grid grid-cols-3 gap-[clamp(0.5rem,3cqw,1.25rem)] bg-black/40 p-[clamp(0.5rem,3cqw,1.25rem)] rounded-[1.5rem] border border-slate-800/30 shadow-inner min-h-0">
               {loopSlots.map((slot) => (
                  <Pad
                    key={slot.id}
                    id={slot.id}
                    label={slot.name}
                    isLoop={true}
                    isActive={slot.isPlaying}
                    hasSound={!!slot.buffer}
                    onTrigger={() => handleTrigger(slot)}
                    onUpload={(file) => handleUpload(slot.id, file, 'loop')}
                  />
               ))}
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4 shrink-0 mb-[clamp(0.5rem,3cqh,1.5rem)]">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-800/40 to-transparent" />
            <div className="text-[clamp(7px,1.4cqw,9px)] font-mono text-slate-600 font-bold uppercase tracking-[0.4em]">Sounds Matrix</div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-800/40 to-transparent" />
          </div>

          {/* Sounds Matrix Section - Takes more space */}
          <div className="flex-[2.5] grid grid-cols-3 grid-rows-3 gap-[clamp(0.5rem,3cqw,1.25rem)] min-h-0">
            {triggerSlots.map((slot) => (
                <Pad
                  key={slot.id}
                  id={slot.id}
                  label={slot.name}
                  hasSound={!!slot.buffer}
                  onTrigger={() => handleTrigger(slot)}
                  onUpload={(file) => handleUpload(slot.id, file, 'trigger')}
                />
            ))}
          </div>
        </div>

        {/* Footer Area - Fixed height but relative to size */}
        <div className="p-[clamp(0.75rem,2.5cqh,1.5rem)] flex justify-center items-center bg-[#1e1e20] shrink-0 border-t border-slate-800/20">
          <div className="flex gap-4">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-900 shadow-inner" />
             <div className="w-1.5 h-1.5 rounded-full bg-slate-900 shadow-inner" />
             <div className="w-1.5 h-1.5 rounded-full bg-slate-900 shadow-inner" />
          </div>
        </div>

        {/* Resizer Hint */}
        {!isTouchDevice && (
          <div className="absolute bottom-1 right-1 w-3 h-3 pointer-events-none opacity-20">
            <svg viewBox="0 0 24 24" className="w-full h-full text-slate-400 fill-current">
              <path d="M22,22 L22,18 L18,22 L22,22 Z M22,14 L14,22 L17,22 L22,17 L22,14 Z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;