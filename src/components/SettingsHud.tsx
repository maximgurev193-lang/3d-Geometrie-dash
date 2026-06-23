import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Globe, 
  Camera, 
  Trash2, 
  Sliders, 
  Check, 
  RefreshCw, 
  Info 
} from 'lucide-react';
import { useLanguage, Language } from '../utils/translations';
import { CameraMode } from '../types';
import { GameAudio } from '../utils/audio';

interface SettingsHudProps {
  isOpen: boolean;
  onClose: () => void;
  cameraMode: CameraMode;
  onUpdateCameraMode: (mode: CameraMode) => void;
  onResetProgress: () => void;
}

export default function SettingsHud({
  isOpen,
  onClose,
  cameraMode,
  onUpdateCameraMode,
  onResetProgress
}: SettingsHudProps) {
  const { language, setLanguage, t } = useLanguage();
  const [activeMute, setActiveMute] = useState<boolean>(false);
  const [musicVol, setMusicVol] = useState<number>(40);
  const [sfxVol, setSfxVol] = useState<number>(50);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  // Sync state initially with local storage or active sound state
  useEffect(() => {
    setActiveMute(GameAudio.getMuted());
    const storedMusic = localStorage.getItem('gd3d_music_volume');
    const storedSfx = localStorage.getItem('gd3d_sfx_volume');
    
    if (storedMusic !== null) {
      setMusicVol(Math.round(parseFloat(storedMusic) * 100));
    }
    if (storedSfx !== null) {
      setSfxVol(Math.round(parseFloat(storedSfx) * 100));
    }
  }, [isOpen]);

  const handleToggleMute = () => {
    const nextMute = GameAudio.toggleMute();
    setActiveMute(nextMute);
  };

  const handleMusicVolChange = (val: number) => {
    setMusicVol(val);
    GameAudio.setVolumes(val / 100, sfxVol / 100);
    localStorage.setItem('gd3d_music_volume', (val / 100).toString());
  };

  const handleSfxVolChange = (val: number) => {
    setSfxVol(val);
    GameAudio.setVolumes(musicVol / 100, val / 100);
    localStorage.setItem('gd3d_sfx_volume', (val / 100).toString());
  };

  const triggerResetAction = () => {
    onResetProgress();
    setConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  const localLabels = {
    settingsTitle: language === 'DE' ? 'SYSTEM-EINSTELLUNGEN' : 'COGNITIVE PANEL // SETTINGS',
    settingsDesc: language === 'DE' ? 'Konfiguriere Audio, Video, Sprache und Daten-Engine.' : 'Fine-tune core simulation modules, audio mixes, and localized systems.',
    audioSettings: language === 'DE' ? 'AUDIO-MATRIX' : 'AUDIO DECK CONTROLS',
    musicVolLabel: language === 'DE' ? 'Musik-Lautstärke' : 'Music Deck Mix',
    sfxVolLabel: language === 'DE' ? 'Effekt-Lautstärke' : 'SFX Output Mix',
    camSettings: language === 'DE' ? 'SIMULATION-PERSPEKTIVE' : 'CAMERA FIELD VIEWPORT',
    camDesc: language === 'DE' ? 'Wähle den Standardwinkel für die 3D-Kamera.' : 'Adjust standard angles of physical 3D dimension vectors.',
    resetTitle: language === 'DE' ? 'GEFÄHRLICHE ZONE' : 'CORE HARDWARE RESET',
    resetDesc: language === 'DE' ? 'Dadurch werden alle Highscores, Sterne und Fortschritte gelöscht.' : 'Wipes all local attempt scores, stars balance, and custom clearances.',
    resetBtn: language === 'DE' ? 'FORT-SCHRITT ZURÜCKSETZEN' : 'INITIALIZE FULL SYSTEM ERASE',
    resetConfirm: language === 'DE' ? 'BIST DU SICHER?' : 'CONFIRM PURGE?',
    resetYes: language === 'DE' ? 'JA, LÖSCHEN!' : 'YES, ERASE FOREVER',
    resetSuccess: language === 'DE' ? 'SYSTEM ZURÜCKGESETZT!' : 'DATA FLUSHED SUCCESSFULLY!',
    langSelect: language === 'DE' ? 'SPRACHE WÄHLEN' : 'LANGUAGE MATRIX SELECT',
    close: language === 'DE' ? 'SCHLIEẞEN' : 'ENGAGE BACK TO PORTAL'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Main Settings Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
            className="relative w-full max-w-lg bg-[#0a0a0c] border border-[#00FF95]/30 shadow-[0_0_60px_rgba(0,255,149,0.15)] rounded-lg overflow-hidden select-none font-mono z-10 p-6"
          >
            {/* Glowing borders */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-[#00FF95] to-emerald-500 shadow-[0_2px_15px_#00FF95]" />
            <div className="absolute bottom-0 right-0 w-24 h-[1px] bg-cyan-400" />
            
            {/* Header section */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-[#00FF95] drop-shadow-[0_0_8px_#00FF95] animate-spin" style={{ animationDuration: '6s' }} />
                <div>
                  <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase">{localLabels.settingsTitle}</h3>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase">{localLabels.settingsDesc}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded bg-zinc-900 border border-white/5 hover:border-[#00FF95] text-zinc-400 hover:text-[#00FF95] transition-all cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable controls */}
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">

              {/* SECTION 1: LANGUAGE MATRIX */}
              <div className="bg-zinc-950/60 border border-white/5 p-4 rounded bg-gradient-to-b from-transparent to-zinc-950/40">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-[#00FF95]" />
                  <span className="text-[10px] uppercase tracking-wider text-white font-black">{localLabels.langSelect}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'EN', name: 'English 🇬🇧' },
                    { code: 'DE', name: 'Deutsch 🇩🇪' },
                    { code: 'ES', name: 'Español 🇪🇸' },
                    { code: 'FR', name: 'Français 🇫🇷' }
                  ].map((langObj) => {
                    const isSelected = language === langObj.code;
                    return (
                      <button
                        key={langObj.code}
                        onClick={() => setLanguage(langObj.code as Language)}
                        className={`py-2 px-3 text-[11px] font-bold tracking-wide rounded border transition-all text-left flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#00FF95]/10 border-[#00FF95] text-[#00FF95] font-black shadow-[0_0_12px_rgba(0,255,149,0.1)]'
                            : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <span>{langObj.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#00FF95] drop-shadow-[0_0_4px_#00FF95]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: AUDIO MIXER CONTROLS */}
              <div className="bg-zinc-950/60 border border-white/5 p-4 rounded bg-gradient-to-b from-transparent to-zinc-950/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] uppercase tracking-wider text-white font-black">{localLabels.audioSettings}</span>
                  </div>
                  
                  <button
                    onClick={handleToggleMute}
                    className={`py-1 px-2.5 rounded border text-[9px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeMute 
                        ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse'
                        : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {activeMute ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#00FF95]" />}
                    <span>{activeMute ? 'MUTED' : 'LIVE'}</span>
                  </button>
                </div>

                {/* Range Sliders */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1 text-[10px]">
                      <span className="text-zinc-400 font-bold">{localLabels.musicVolLabel}</span>
                      <span className="text-cyan-400 font-black">{musicVol}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={musicVol}
                      onChange={(e) => handleMusicVolChange(parseInt(e.target.value))}
                      className="w-full accent-[#00FF95] h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer border border-white/5"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1 text-[10px]">
                      <span className="text-zinc-400 font-bold">{localLabels.sfxVolLabel}</span>
                      <span className="text-cyan-400 font-black">{sfxVol}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={sfxVol}
                      onChange={(e) => handleSfxVolChange(parseInt(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer border border-white/5"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: RE-CONFIG VIEWPORTS */}
              <div className="bg-zinc-950/60 border border-white/5 p-4 rounded bg-gradient-to-b from-transparent to-zinc-950/40">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white font-black">{localLabels.camSettings}</span>
                  </div>
                </div>
                <p className="text-[9px] text-zinc-500 mb-3 bg-black/40 p-2 rounded-sm border border-white/5 leading-relaxed">{localLabels.camDesc}</p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['CLASSIC_3D', 'CHASE_3D', 'TOP_DOWN', 'BIRD_EYE_3D', 'ORTHO_2D'] as CameraMode[]).map((mode) => {
                    const isSelected = cameraMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => onUpdateCameraMode(mode)}
                        className={`py-1.5 px-2 text-[9px] font-black tracking-widest rounded border transition-all text-center cursor-pointer uppercase ${
                          isSelected
                            ? 'bg-purple-500/10 border-purple-400 text-purple-400 font-black shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                            : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {mode.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: PURGE SYSTEM MEMORY */}
              <div className="border border-red-500/20 bg-red-500/[0.02] p-4 rounded relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-red-500 font-black block">{localLabels.resetTitle}</span>
                    <span className="text-[9px] text-zinc-500 block leading-normal">{localLabels.resetDesc}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <AnimatePresence mode="wait">
                    {!confirmReset ? (
                      <motion.button
                        key="erase"
                        onClick={() => setConfirmReset(true)}
                        className="py-1.5 px-3 border border-red-500/20 rounded text-[9px] text-red-400/90 font-black hover:bg-red-500/[0.08] hover:border-red-500 transition-all cursor-pointer leading-none flex items-center gap-1 active:scale-95"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                        <span>{localLabels.resetBtn}</span>
                      </motion.button>
                    ) : (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[9px] font-black text-red-500 animate-pulse uppercase mr-2">{localLabels.resetConfirm}</span>
                        <button
                          onClick={triggerResetAction}
                          className="py-1 px-3 bg-red-600 hover:bg-red-500 border border-red-500 rounded text-[9px] text-white font-black transition-all cursor-pointer leading-none active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:brightness-110"
                        >
                          {localLabels.resetYes}
                        </button>
                        <button
                          onClick={() => setConfirmReset(false)}
                          className="py-1 px-2.5 bg-zinc-900 border border-white/10 rounded text-[9px] text-zinc-400 font-bold hover:text-white transition-all cursor-pointer leading-none"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {resetSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-center border-t border-red-500/10 pt-3 text-[10px] text-yellow-500 font-black animate-pulse uppercase leading-none"
                  >
                    🚀 {localLabels.resetSuccess}
                  </motion.div>
                )}
              </div>

            </div>

            {/* Footer action */}
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
              <button 
                onClick={onClose}
                className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-[#00FF95] text-black font-black text-[10px] tracking-widest rounded transition-all cursor-pointer hover:brightness-110 border border-transparent shadow-[0_0_15px_rgba(0,255,149,0.3)] active:scale-95 leading-none uppercase"
              >
                {localLabels.close}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
