import React from 'react';
import { GameState, CameraMode } from '../types';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, ShieldAlert, Award, Grid, Star } from 'lucide-react';
import { useLanguage } from '../utils/translations';
import { motion, AnimatePresence } from 'motion/react';

interface GameUIProps {
  levelName: string;
  gameState: GameState;
  percentComplete: number;
  attempts: number;
  jumps: number;
  starsCollected: number;
  isPracticeMode: boolean;
  isAutopilotEnabled?: boolean;
  checkpointCount: number;
  cameraMode: CameraMode;
  audioMuted: boolean;
  score: number;
  onTogglePause: () => void;
  onRestart: () => void;
  onTogglePractice: () => void;
  onToggleAutopilot?: () => void;
  onPlaceCheckpoint: () => void;
  onClearCheckpoint: () => void;
  onToggleCamera: () => void;
  onToggleMute: () => void;
  onExitToMenu: () => void;
}

export default function GameUI({
  levelName,
  gameState,
  percentComplete,
  attempts,
  jumps,
  starsCollected,
  isPracticeMode,
  isAutopilotEnabled = false,
  checkpointCount,
  cameraMode,
  audioMuted,
  score,
  onTogglePause,
  onRestart,
  onTogglePractice,
  onToggleAutopilot,
  onPlaceCheckpoint,
  onClearCheckpoint,
  onToggleCamera,
  onToggleMute,
  onExitToMenu,
}: GameUIProps) {
  const { language, t } = useLanguage();
  
  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 z-20 font-sans">
      
      {/* TOP HEADER: Progress Bar and Level Metadata */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full flex justify-between items-center bg-black/60 p-4 border-2 border-white/10 backdrop-blur-md pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)]"
      >
        <div className="flex flex-col">
          <span className="text-white font-sans font-black text-lg tracking-tighter uppercase italic flex items-center gap-2 leading-none">
            {levelName} 
            {isPracticeMode && (
              <span className="text-[9px] bg-[#00FF95]/15 border border-[#00FF95]/40 text-[#00FF95] font-black px-2 py-0.5 uppercase tracking-widest animate-pulse">
                Practice Live
              </span>
            )}
          </span>
          <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider mt-1">JUMPS // {jumps} | ATTEMPTS // {attempts}</span>
        </div>

        {/* Floating Percentage Indicator */}
        <div className="flex-1 max-w-sm mx-6 hidden md:flex flex-col items-center gap-1 font-mono">
          <div className="w-full h-2 bg-white/5 border border-white/10 overflow-hidden">
            <div 
              className="h-full bg-[#00FF95] shadow-[0_0_8px_#00FF95] transition-all duration-100 ease-out"
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
          <span className="text-xs font-black text-[#00FF95] tracking-widest leading-none mt-1">{percentComplete}%</span>
        </div>

        {/* Small Percentage Indicator for Mobile */}
        <div className="md:hidden flex items-center bg-black border border-white/10 px-2.5 py-1 font-mono">
          <span className="text-xs font-black text-[#00FF95]">{percentComplete}%</span>
        </div>

        {/* Global Controls HUD (Mute, Camera, Pause) */}
        <div className="flex items-center gap-1.5 pointer-events-auto font-mono">
          <button
            id="toggle-camera-btn"
            onClick={onToggleCamera}
            title="Toggle Camera Mode"
            className="p-2.5 bg-black/60 hover:bg-white/10 border border-white/25 hover:border-[#00FF95]/50 text-white transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            id="toggle-mute-btn"
            onClick={onToggleMute}
            title={audioMuted ? "Unmute Beats" : "Mute Beats"}
            className="p-2.5 bg-black/60 hover:bg-white/10 border border-white/25 hover:border-[#00FF95]/50 text-white transition-colors cursor-pointer"
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-[#00FF95] drop-shadow-[0_0_6px_#00FF95]" />}
          </button>

          <button
            id="toggle-pause-btn"
            onClick={onTogglePause}
            className="p-2.5 bg-[#00FF95] text-black border border-[#00FF95] cursor-pointer hover:bg-opacity-95 flex items-center justify-center transition-all font-bold shadow-[0_0_10px_rgba(0,255,149,0.35)]"
          >
            {gameState === 'PLAYING' ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black animate-pulse" />}
          </button>
        </div>
      </motion.div>

      {/* GAME RUN STATS (Center notification area) */}
      <div className="flex-1 flex flex-col justify-center items-center font-sans">
        <AnimatePresence mode="wait">
          {gameState === 'PLAYING' && percentComplete < 2 && (
            <motion.div 
              key="attempt"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: [0.8, 1.1, 1.0] }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-black/90 border-2 border-[#00FF95]/50 px-8 py-4 text-center shadow-[0_0_20px_rgba(0,255,149,0.15)] pointer-events-auto animate-bounce"
            >
              <h1 className="text-2xl font-sans font-black text-white tracking-tighter uppercase italic">ATTEMPT {attempts}</h1>
              {language === 'DE' ? (
                <div className="space-y-1 mt-1 text-[8.5px]">
                  <p className="text-[#00FF95] font-mono tracking-widest uppercase font-bold">LEERTASTE ODER KLICK ZUM SPRINGEN</p>
                  <p className="text-zinc-400 font-mono tracking-wider font-bold">WISCHEN FÜR PAUSE • DOPPELTIPPEN FÜR CHECKPOINT 🤖</p>
                </div>
              ) : language === 'ES' ? (
                <div className="space-y-1 mt-1 text-[8.5px]">
                  <p className="text-[#00FF95] font-mono tracking-widest uppercase font-bold">ESPACIO O CLIC PARA SALTAR</p>
                  <p className="text-zinc-400 font-mono tracking-wider font-bold">DESLIZAR PARA PAUSA • DOBLE TOQUE PARA MARCADOR 🤖</p>
                </div>
              ) : language === 'FR' ? (
                <div className="space-y-1 mt-1 text-[8.5px]">
                  <p className="text-[#00FF95] font-mono tracking-widest uppercase font-bold">ESPACE OU CLIC POUR SAUTER</p>
                  <p className="text-zinc-400 font-mono tracking-wider font-bold">GLISSER POUR PAUSE • DOUBLE-TAP POUR CHECKPOINT 🤖</p>
                </div>
              ) : (
                <div className="space-y-1 mt-1 text-[8.5px]">
                  <p className="text-[#00FF95] font-mono tracking-widest uppercase font-bold">SPACE OR CLICK TO JUMP</p>
                  <p className="text-zinc-400 font-mono tracking-wider font-bold">SWIPE TO PAUSE • DOUBLE-TAP FOR CHECKPOINT 🤖</p>
                </div>
              )}
            </motion.div>
          )}

          {/* CRASHED POPUP OVERLAY */}
          {gameState === 'CRASHED' && (
            <motion.div
              key="crashed"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="bg-black/95 border-2 border-red-500 p-8 text-center shadow-[0_0_40px_rgba(239,68,68,0.4)] pointer-events-auto max-w-sm w-full relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
              <span className="text-red-500/80 font-mono text-[10px] tracking-widest uppercase mb-1 font-bold block">{t.crashDetected}</span>
              <h2 className="text-red-500 font-sans font-black text-4xl tracking-tighter uppercase italic leading-none mb-2">{t.respawning}</h2>
              <p className="text-xs text-zinc-400 mb-6 font-mono">{t.progress}: {percentComplete}%</p>
              
              <div className="space-y-3 font-mono">
                <button
                  id="crashed-tryagain-btn"
                  onClick={onRestart}
                  className="w-full py-4 bg-red-600 hover:bg-red-550 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] text-white font-black transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-widest border border-red-600"
                >
                  <RotateCcw className="w-4 h-4" /> {t.restartRun}
                </button>
                
                <button
                  onClick={onExitToMenu}
                  className="w-full py-3 bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-zinc-300 transition-all text-xxs font-black tracking-widest uppercase cursor-pointer"
                >
                  {t.backToMenu}
                </button>
              </div>
            </motion.div>
          )}

          {/* WON POPUP OVERLAY */}
          {gameState === 'WON' && (
            <motion.div
              key="won"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="bg-black/95 border-2 border-[#00FF95] p-8 text-center shadow-[0_0_40px_rgba(0,255,149,0.3)] pointer-events-auto max-w-sm w-full relative overflow-hidden backdrop-blur-lg"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#00FF95] shadow-[0_0_10px_#00FF95]"></div>
              <Award className="w-12 h-12 text-[#00FF95] mx-auto mb-4 drop-shadow-[0_0_8px_#00FF95]" />
              <span className="text-[#00FF95] font-mono text-[10px] tracking-widest uppercase mb-1 font-bold block">{t.levelCompleted}</span>
              <h2 className="text-white font-sans font-black text-4xl tracking-tighter uppercase italic leading-none mb-1">{t.levelCompleted}</h2>
              <p className="text-xs text-[#00FF95] font-black tracking-widest font-mono mb-6 uppercase">100% PERFECT Clearance</p>
              
              <div className="bg-white/[0.02] border border-white/10 p-5 mb-6 text-left space-y-2.5 font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase font-bold text-[10px]">{t.attempts}:</span>
                  <span className="text-white font-black">{attempts}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase font-bold text-[10px]">JUMPS:</span>
                  <span className="text-white font-black">{jumps}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase font-bold text-[10px]">{t.starsRecovered}</span>
                  <span className="text-[#00FF95] font-black flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> +{starsCollected}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 font-mono">
                <button
                  onClick={onRestart}
                  className="w-full py-4 bg-[#00FF95] hover:bg-opacity-90 text-black font-black transition-all text-xs tracking-widest uppercase cursor-pointer"
                >
                  {t.playAgain}
                </button>
                <button
                  onClick={onExitToMenu}
                  className="w-full py-3 bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-zinc-300 transition-all text-xxs font-black tracking-widest uppercase cursor-pointer"
                >
                  {t.backToMenu}
                </button>
              </div>
            </motion.div>
          )}

          {/* PAUSED POPUP OVERLAY */}
          {gameState === 'PAUSED' && (
            <motion.div
              key="paused"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="bg-black/95 border-2 border-white/20 p-8 text-center shadow-2xl pointer-events-auto max-w-sm w-full backdrop-blur-md"
            >
              <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase mb-1 font-bold block">SYSTEM COLD SHIELD</span>
              <h2 className="text-white font-sans font-black text-4xl tracking-tighter uppercase italic leading-none mb-2">{t.pauseTitle}_</h2>
              <p className="text-xs text-zinc-400 mb-6 font-mono">Sync track frozen. Press Resume to lock back in.</p>
              
              <div className="space-y-3 font-mono">
                <button
                  onClick={onTogglePause}
                  className="w-full py-4 bg-[#00FF95] hover:bg-opacity-90 text-black font-black transition-all flex items-center justify-center gap-2 text-xs tracking-widest uppercase cursor-pointer font-bold"
                >
                  <Play className="w-4 h-4 fill-current" /> {t.resume}
                </button>
                
                <button
                  onClick={onRestart}
                  className="w-full py-3 bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-zinc-350 transition-all text-xxs font-black tracking-widest uppercase cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {t.restartRun}
                </button>

                <button
                  onClick={onExitToMenu}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 text-xxs tracking-widest uppercase cursor-pointer transition-all font-bold"
                >
                  {t.backToMenu}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER CONTROLS: Practice mode controls & Mobile jumps pad */}
      <div className="w-full flex justify-between items-end pointer-events-auto z-10 p-2 sm:p-4 font-sans">
        
        {/* Practice Mode Flag Management Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -60, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 }}
          className="flex flex-col gap-2 bg-black/70 border-2 border-white/10 p-4 backdrop-blur-md max-w-xs transition-all pointer-events-auto"
        >
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="practice-toggle"
              checked={isPracticeMode}
              onChange={onTogglePractice}
              className="w-4 h-4 text-[#00FF95] accent-[#00FF95] bg-black border-white/20 cursor-pointer pointer-events-auto"
            />
            <label htmlFor="practice-toggle" className="text-xs font-black tracking-widest text-zinc-100 hover:text-white cursor-pointer select-none uppercase">
              PRACTICE MODE
            </label>
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 pt-2 mt-1">
            <input 
              type="checkbox" 
              id="autopilot-toggle"
              checked={isAutopilotEnabled}
              onChange={onToggleAutopilot}
              className="w-4 h-4 text-cyan-400 accent-cyan-400 bg-black border-white/20 cursor-pointer pointer-events-auto"
            />
            <label htmlFor="autopilot-toggle" className="text-xs font-black tracking-widest text-[#22D3EE] hover:text-cyan-300 cursor-pointer select-none uppercase flex items-center gap-1.5">
              <span>{language === 'DE' ? '🤖 KI-AUTOPILOT' : '🤖 AI AUTOPILOT'}</span>
            </label>
          </div>

          {isPracticeMode && (
            <div className="grid grid-cols-2 gap-2 mt-1 font-mono">
              <button
                id="place-checkpoint-btn"
                onClick={onPlaceCheckpoint}
                className="bg-[#00FF95]/10 hover:bg-[#00FF95]/20 text-[#00FF95] border border-[#00FF95]/30 text-[9px] py-2 px-2 font-mono font-black tracking-widest uppercase transition-all cursor-pointer flex justify-center items-center gap-1"
                title="Drop checkpoint flag (Z)"
              >
                <span>➕ DROP FLAG</span>
              </button>
              
              <button
                id="clear-checkpoint-btn"
                onClick={onClearCheckpoint}
                disabled={checkpointCount === 0}
                className={`text-[9px] py-2 px-2 font-mono font-black tracking-widest uppercase transition-all flex justify-center items-center gap-1 ${
                  checkpointCount > 0
                    ? 'bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/30 cursor-pointer'
                    : 'bg-white/5 text-zinc-650 border border-white/5 cursor-not-allowed'
                }`}
                title="Remove last checkpoint (X)"
              >
                <span>❌ POP FLAG</span>
              </button>
            </div>
          )}
          
          <div className="text-[9px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold font-mono">
            {isPracticeMode 
              ? `Flags deployed: ${checkpointCount}` 
              : 'Drops checkpoint flags at runtime'}
          </div>
        </motion.div>

        {/* Mobile Jump Area (Covers bottom right for comfortable right-hand trigger) */}
        <motion.div 
          initial={{ opacity: 0, x: 60, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 }}
          className="flex flex-col items-end gap-1.5 font-mono pointer-events-auto"
        >
          <span className="text-[9px] text-[#00FF95] tracking-widest select-none uppercase font-black">CAMERA // {cameraMode.replace('_', ' ')}</span>
          <div 
            id="viewport-touchpad-jump"
            className="w-20 h-20 border-2 border-white/20 bg-white/5 active:bg-[#00FF95]/20 active:border-[#00FF95] backdrop-blur-md flex items-center justify-center cursor-pointer select-none pointer-events-auto"
            title="Click or Tap to Jump"
          >
            <div className="w-14 h-14 border border-white/10 bg-white/5 flex items-center justify-center text-[10px] font-black text-white uppercase select-none tracking-widest">
              TAP JUMP
            </div>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
