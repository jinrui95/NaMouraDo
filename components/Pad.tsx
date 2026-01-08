
import React, { useState, useRef } from 'react';

interface PadProps {
  id: string;
  label: string;
  isLoop?: boolean;
  isActive?: boolean; 
  onTrigger: () => void;
  onUpload: (file: File) => void;
  hasSound: boolean;
}

export const Pad: React.FC<PadProps> = ({ 
  label, 
  isLoop = false, 
  isActive = false, 
  onTrigger, 
  onUpload,
  hasSound
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [triggerActive, setTriggerActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const handlePadAction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    // Large button is strictly for sound production
    if (!hasSound) return;
    
    setIsPressed(true);
    onTrigger();

    if (!isLoop) {
      setTriggerActive(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setTriggerActive(false), 120);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const isGlowing = isLoop ? isActive : triggerActive;

  // Fully fluid container
  const containerStyles = "relative w-full h-full p-[1px] rounded-lg bg-black/40 overflow-hidden flex flex-col";
  
  const padStyles = `relative flex-1 flex flex-col items-center justify-center transition-all duration-75 select-none cursor-pointer rounded-t-md border-2 border-b-0`;
  
  let bgClass = "bg-slate-900/50";
  let borderClass = "border-slate-800/50";
  let shadowClass = "";

  if (hasSound) {
    if (isLoop) {
      bgClass = "bg-indigo-950/80";
      borderClass = "border-indigo-800/60";
    } else {
      bgClass = "bg-slate-800/80";
      borderClass = "border-slate-700/60";
    }
  }

  if (isGlowing) {
    if (isLoop) {
      bgClass = "bg-indigo-600";
      borderClass = "border-indigo-400";
    } else {
      bgClass = "bg-amber-600";
      borderClass = "border-amber-400";
    }
  }

  if (isPressed) {
    bgClass += " brightness-125";
  }

  return (
    <div className={containerStyles}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="audio/*"
      />
      
      {/* Main Sound Trigger Area */}
      <div 
        className={`${padStyles} ${bgClass} ${borderClass} ${shadowClass} ${!hasSound ? 'cursor-default opacity-40' : ''}`}
        onMouseDown={handlePadAction}
        onTouchStart={handlePadAction}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isLoop && (
          <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full transition-all duration-200 ${isActive ? 'bg-cyan-400 shadow-[0_0_6px_rgb(34,211,238)]' : 'bg-slate-950'}`} />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center p-1 text-center pointer-events-none w-full h-full">
          <span className={`text-[min(3.5cqw,13px)] font-black uppercase tracking-widest leading-none truncate w-full px-1 ${hasSound ? 'text-slate-200' : 'text-slate-500'}`}>
            {label}
          </span>
        </div>
      </div>

      {/* Tiny Dedicated Upload Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        className={`h-[clamp(12px,4cqh,20px)] w-full bg-slate-950/80 border-x-2 border-b-2 ${borderClass} hover:bg-slate-800 transition-colors flex items-center justify-center rounded-b-md z-20`}
        title={hasSound ? "Change Sound" : "Upload Sound"}
      >
        <span className="text-[min(2cqw,7px)] font-bold text-slate-500 uppercase tracking-tighter pointer-events-none">
          {hasSound ? 'LOAD' : 'EMPTY'}
        </span>
      </button>
    </div>
  );
};
