
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

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!hasSound) {
      fileInputRef.current?.click();
      return;
    }
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

  // Fully fluid container - size is dictated strictly by the grid parent
  const containerStyles = "relative w-full h-full p-[1px] rounded-lg bg-black/40 overflow-hidden";
  
  const padStyles = `relative flex flex-col items-center justify-center transition-all duration-75 select-none cursor-pointer h-full w-full rounded-md border-2`;
  
  let bgClass = "bg-slate-900/50";
  let borderClass = "border-slate-800/50";
  let shadowClass = "shadow-md";

  if (hasSound) {
    if (isLoop) {
      bgClass = "bg-indigo-950/80";
      borderClass = "border-indigo-800/60";
      shadowClass = "shadow-[0_2px_0_rgba(30,27,75,1)]";
    } else {
      bgClass = "bg-slate-800/80";
      borderClass = "border-slate-700/60";
      shadowClass = "shadow-[0_2px_0_rgba(31,41,55,1)]";
    }
  }

  if (isGlowing) {
    if (isLoop) {
      bgClass = "bg-indigo-600";
      borderClass = "border-indigo-400";
      shadowClass = "shadow-[0_0_12px_rgba(99,102,241,0.5)]";
    } else {
      bgClass = "bg-amber-600";
      borderClass = "border-amber-400";
      shadowClass = "shadow-[0_0_12px_rgba(245,158,11,0.5)]";
    }
  }

  if (isPressed) {
    shadowClass = "translate-y-[1px] shadow-none";
  }

  return (
    <div className={containerStyles}>
      <div 
        className={`${padStyles} ${bgClass} ${borderClass} ${shadowClass}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="audio/*"
        />
        
        {isLoop && (
          <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full transition-all duration-200 ${isActive ? 'bg-cyan-400 shadow-[0_0_6px_rgb(34,211,238)]' : 'bg-slate-950'}`} />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center p-1 text-center pointer-events-none w-full h-full">
          <span className={`text-[min(3.5cqw,13px)] font-black uppercase tracking-widest leading-none truncate w-full px-1 ${hasSound ? 'text-slate-200' : 'text-slate-500'}`}>
            {label}
          </span>
          {!hasSound && <span className="text-[min(2.5cqw,8px)] font-bold text-slate-600 uppercase tracking-tighter opacity-60">Empty</span>}
        </div>

        {hasSound && (
          <button 
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="absolute bottom-1 right-1 p-0.5 opacity-0 hover:opacity-100 transition-opacity z-20"
            title="Replace"
          >
            <svg className="w-2.5 h-2.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
