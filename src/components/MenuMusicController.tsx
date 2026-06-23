import React, { useState, useEffect, useRef } from 'react';
import { GameAudio } from '../utils/audio';
import { Music, Sliders, Volume2, Key, Activity, Disc, RefreshCw, Zap, Sparkles, Pause, Play, Grid, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function MenuMusicController() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [preset, setPreset] = useState<'CHILL' | 'CHIPTUNE' | 'DARK' | 'CYBER'>('CHILL');
  const [bpm, setBpm] = useState<number>(95);
  const [scaleKey, setScaleKey] = useState<string>('A');
  
  // Track mute overrides
  const [muteKick, setMuteKick] = useState<boolean>(false);
  const [muteHihat, setMuteHihat] = useState<boolean>(false);
  const [mutePad, setMutePad] = useState<boolean>(false);
  const [muteLead, setMuteLead] = useState<boolean>(false);

  // Instument wave customizer
  const [leadOsc, setLeadOsc] = useState<OscillatorType>('triangle');
  const [bassOsc, setBassOsc] = useState<OscillatorType>('sawtooth');

  // Trigger effect pulses
  const [beatPulse, setBeatPulse] = useState<boolean>(false);

  // Read initial states from engine on mount
  useEffect(() => {
    setIsPlaying(GameAudio.musicMode === 'MENU');
    setPreset(GameAudio.menuPreset);
    setBpm(GameAudio.menuBpm);
    setScaleKey(GameAudio.menuKey);
    setMuteKick(GameAudio.menuMuteKick);
    setMuteHihat(GameAudio.menuMuteHihat);
    setMutePad(GameAudio.menuMutePad);
    setMuteLead(GameAudio.menuMuteLead);
    setLeadOsc(GameAudio.leadOscType);
    setBassOsc(GameAudio.bassOscType);

    // Register active sync callback from Web Audio API scheduler
    GameAudio.menuStepCallback = (step: number) => {
      setActiveStep(step);
      // Brief beat flash
      if (step % 4 === 0) {
        setBeatPulse(true);
        setTimeout(() => setBeatPulse(false), 120);
      }
    };

    return () => {
      GameAudio.menuStepCallback = undefined;
    };
  }, []);

  const handlePlayToggle = () => {
    if (GameAudio.musicMode === 'MENU') {
      GameAudio.stopMusic();
      setIsPlaying(false);
    } else {
      // Force start menu music
      GameAudio.stopMusic();
      GameAudio.menuPreset = preset;
      GameAudio.menuBpm = bpm;
      GameAudio.menuKey = scaleKey;
      GameAudio.startMenuMusic();
      setIsPlaying(true);
    }
  };

  const handlePresetSelect = (selectedPreset: 'CHILL' | 'CHIPTUNE' | 'DARK' | 'CYBER') => {
    GameAudio.menuPreset = selectedPreset;
    setPreset(selectedPreset);
    
    // Auto-adjust BPM and instruments to fit the mood vibe perfectly
    let targetBpm = 95;
    let targetLead: OscillatorType = 'triangle';
    let targetBass: OscillatorType = 'sawtooth';
    let targetKey = 'A';

    if (selectedPreset === 'CHILL') {
      targetBpm = 90;
      targetLead = 'sine';
      targetBass = 'triangle';
      targetKey = 'A';
    } else if (selectedPreset === 'CHIPTUNE') {
      targetBpm = 115;
      targetLead = 'square';
      targetBass = 'triangle';
      targetKey = 'C';
    } else if (selectedPreset === 'DARK') {
      targetBpm = 80;
      targetLead = 'sawtooth';
      targetBass = 'sine';
      targetKey = 'D';
    } else if (selectedPreset === 'CYBER') {
      targetBpm = 124;
      targetLead = 'sawtooth';
      targetBass = 'sawtooth';
      targetKey = 'G';
    }

    GameAudio.menuBpm = targetBpm;
    GameAudio.bpm = targetBpm; // modify running tempo directly
    setBpm(targetBpm);

    GameAudio.leadOscType = targetLead;
    setLeadOsc(targetLead);

    GameAudio.bassOscType = targetBass;
    setBassOsc(targetBass);

    GameAudio.currentKey = targetKey;
    GameAudio.menuKey = targetKey;
    setScaleKey(targetKey);

    // If already playing, force transition refresh
    if (GameAudio.musicMode === 'MENU') {
      // Just adjust the running keys/bpm
      GameAudio.currentKey = targetKey;
      GameAudio.bpm = targetBpm;
    }
  };

  const handleBpmChange = (newBpm: number) => {
    GameAudio.menuBpm = newBpm;
    GameAudio.bpm = newBpm; // live skew
    setBpm(newBpm);
  };

  const handleKeyChange = (newKey: string) => {
    GameAudio.menuKey = newKey;
    GameAudio.currentKey = newKey;
    setScaleKey(newKey);
  };

  const handleMuteToggle = (track: 'kick' | 'hihat' | 'pad' | 'lead') => {
    if (track === 'kick') {
      const val = !muteKick;
      GameAudio.menuMuteKick = val;
      setMuteKick(val);
    } else if (track === 'hihat') {
      const val = !muteHihat;
      GameAudio.menuMuteHihat = val;
      setMuteHihat(val);
    } else if (track === 'pad') {
      const val = !mutePad;
      GameAudio.menuMutePad = val;
      setMutePad(val);
    } else if (track === 'lead') {
      const val = !muteLead;
      GameAudio.menuMuteLead = val;
      setMuteLead(val);
    }
  };

  const handleLeadOscSelect = (type: OscillatorType) => {
    GameAudio.leadOscType = type;
    setLeadOsc(type);
  };

  const handleBassOscSelect = (type: OscillatorType) => {
    GameAudio.bassOscType = type;
    setBassOsc(type);
  };

  // Helper arrays for visualizer steps
  const stepsArray = Array.from({ length: 16 });

  return (
    <div 
      id="menu-music-deck-controller"
      className="bg-black/90 p-5 border-2 border-cyan-500/30 backdrop-blur-md shadow-[0_0_35px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col justify-between font-mono text-white h-full"
    >
      {/* Visual cyber glowing headers */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-[#00ff95] to-orange-500 animate-pulse"></div>

      {/* HEADER LOGO PANEL */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sliders className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-black text-xs tracking-wider text-white uppercase italic">MENU SYNTH CONSOLE</span>
              <span className="px-1.5 py-0.2 bg-[#00FF95]/10 text-[#00FF95] border border-[#00FF95]/30 text-[8px] font-mono tracking-widest uppercase font-black">ACTIVE</span>
            </div>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mt-1">Real-time modular menu audio driver</p>
          </div>
        </div>

        {/* Master Power Console Button */}
        <button
          onClick={handlePlayToggle}
          className={`px-3 py-1.5 font-bold text-[10px] tracking-widest uppercase border transition-all duration-200 cursor-pointer flex items-center gap-1.5 relative ${
            isPlaying 
              ? 'bg-[#00ff95]/10 border-[#00ff95] text-[#00ff95] shadow-[0_0_15px_rgba(0,255,149,0.25)]' 
              : 'bg-zinc-950/80 border-white/15 text-zinc-400 hover:text-white hover:border-white/30'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3 fill-current animate-pulse" />
              <span>LIVE MIXING ...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>ACTIVATE INTRO DSP</span>
          </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        
        {/* LEFT COLUMN: PRESETS & MIXING BOARD */}
        <div className="space-y-3">
          {/* Preset Selectors */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Acoustic Presets (Style)</span>
            <div className="grid grid-cols-4 gap-1.5 text-[8px] font-black">
              {(['CHILL', 'CHIPTUNE', 'DARK', 'CYBER'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePresetSelect(p)}
                  className={`py-2 border transition-all uppercase cursor-pointer text-center truncate ${
                    preset === p
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-extrabold'
                      : 'bg-black/40 border-white/5 text-zinc-500 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Mixing Slider Channels */}
          <div className="space-y-1.5 bg-black/40 p-3 border border-white/5 rounded-none">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block mb-1">MUTE DECKS (LIVE INJECTIONS)</span>
            
            <div className="grid grid-cols-4 gap-1 text-[8px] font-black tracking-tighter text-center">
              {/* Kick */}
              <button
                onClick={() => handleMuteToggle('kick')}
                className={`py-3 border cursor-pointer uppercase transition-all ${
                  muteKick
                    ? 'bg-red-950/20 border-red-500/20 text-zinc-500'
                    : 'bg-[#00FF95]/10 border-[#00FF95]/40 text-[#00FF95] shadow-[0_0_8px_rgba(0,255,149,0.1)]'
                }`}
              >
                🥁 KICK<br />
                <span className="text-[7px] text-white/50">{muteKick ? 'MUTED' : 'ON'}</span>
              </button>

              {/* Shaker/Hat */}
              <button
                onClick={() => handleMuteToggle('hihat')}
                className={`py-3 border cursor-pointer uppercase transition-all ${
                  muteHihat
                    ? 'bg-red-950/20 border-red-500/20 text-zinc-500'
                    : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                }`}
              >
                ✨ SHAKER<br />
                <span className="text-[7px] text-white/50">{muteHihat ? 'MUTED' : 'ON'}</span>
              </button>

              {/* Pad */}
              <button
                onClick={() => handleMuteToggle('pad')}
                className={`py-3 border cursor-pointer uppercase transition-all ${
                  mutePad
                    ? 'bg-red-950/20 border-red-500/20 text-zinc-500'
                    : 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                }`}
              >
                🎹 PAD<br />
                <span className="text-[7px] text-white/50">{mutePad ? 'MUTED' : 'ON'}</span>
              </button>

              {/* Lead */}
              <button
                onClick={() => handleMuteToggle('lead')}
                className={`py-3 border cursor-pointer uppercase transition-all ${
                  muteLead
                    ? 'bg-red-950/20 border-red-500/20 text-zinc-500'
                    : 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                }`}
              >
                🔮 LEAD<br />
                <span className="text-[7px] text-white/50">{muteLead ? 'MUTED' : 'ON'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MICRO-TUNING & LIVE BPM SKEWER */}
        <div className="space-y-2.5 flex flex-col justify-between">
          
          {/* BPM Slider with numerical control */}
          <div className="space-y-1 bg-black/40 p-2.5 border border-white/5 rounded-none">
            <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">
              <span>Intro BPM Clock Rate</span>
              <span className="text-cyan-400 font-bold">{bpm} BPM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] text-zinc-600 font-bold">50</span>
              <input
                type="range"
                min="50"
                max="160"
                step="2"
                value={bpm}
                onChange={(e) => handleBpmChange(parseInt(e.target.value, 10))}
                className="flex-1 accent-cyan-400 h-1 bg-zinc-900 border border-white/10 rounded-lg cursor-pointer"
              />
              <span className="text-[8px] text-zinc-600 font-bold">160</span>
              <button 
                onClick={() => handleBpmChange(95)}
                disabled={bpm === 95}
                className="p-1 text-zinc-500 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                title="Reset to 95 BPM"
              >
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Key selector quantization */}
          <div className="space-y-1 bg-black/40 p-2.5 border border-white/5 rounded-none">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block mb-1">Scale Transposition</span>
            <div className="grid grid-cols-6 gap-1 text-[9px] font-black">
              {['A', 'C', 'G', 'D', 'E', 'F#'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeyChange(k)}
                  className={`py-1 border text-center font-bold font-mono transition-all cursor-pointer ${
                    scaleKey === k
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-black/60 border-white/5 text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Lead Synthesizer Wave Select */}
          <div className="grid grid-cols-2 gap-2 text-[9px]">
            <div>
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Melody Voice</span>
              <select 
                value={leadOsc}
                onChange={(e) => handleLeadOscSelect(e.target.value as OscillatorType)}
                className="w-full bg-zinc-950 border border-white/10 text-zinc-300 py-1 px-1.5 focus:border-cyan-400 outline-none text-[9px] font-mono cursor-pointer"
              >
                <option value="triangle">🔺 Triangle</option>
                <option value="sawtooth">📈 Sawtooth</option>
                <option value="square">🔲 Square</option>
                <option value="sine">🌊 SineWave</option>
              </select>
            </div>
            <div>
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Harmony Base</span>
              <select 
                value={bassOsc}
                onChange={(e) => handleBassOscSelect(e.target.value as OscillatorType)}
                className="w-full bg-zinc-950 border border-white/10 text-zinc-300 py-1 px-1.5 focus:border-cyan-400 outline-none text-[9px] font-mono cursor-pointer"
              >
                <option value="sine">🌊 SineWave</option>
                <option value="triangle">🔺 Triangle</option>
                <option value="sawtooth">📈 Sawtooth</option>
                <option value="square">🔲 Square</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER SEQUENCER VISUALIZER DECK */}
      <div className="bg-zinc-950/70 p-3 border border-white/5 rounded-none space-y-2">
        <div className="flex justify-between items-center text-[8px] uppercase tracking-widest font-bold">
          <span className="text-zinc-400 flex items-center gap-1">
            <Grid className="w-3 h-3 text-cyan-400" />
            <span>Interactive 16-Step Procedural Sequencer Grid</span>
          </span>
          <span className="text-zinc-500">
            {isPlaying ? `CURRENT_STEP: 0x${activeStep.toString(16).toUpperCase()}` : 'STOPPED'}
          </span>
        </div>

        {/* Step Sequencer Dots Grid */}
        <div className="grid grid-cols-16 gap-1.5">
          {stepsArray.map((_, idx) => {
            const isActive = idx === activeStep && isPlaying;
            
            // Color segments: 0-3, 4-7, 8-11, 12-15
            let segmentBg = 'bg-zinc-900 border-zinc-800';
            if (isActive) {
              segmentBg = 'bg-gradient-to-t from-[#00ff95] to-cyan-400 shadow-[0_0_12px_#00ff95] border-white scale-110';
            } else if (idx % 4 === 0) {
              segmentBg = 'bg-zinc-800 border-zinc-700/60';
            }

            return (
              <div 
                key={idx} 
                className={`h-4 border transition-all duration-150 relative group ${segmentBg}`}
                title={`Sequencer Step ${idx + 1}`}
              >
                {/* Micro timing dots internally */}
                <div className={`absolute inset-0.5 rounded-full ${idx % 4 === 0 ? 'bg-zinc-700/30' : ''}`} />
                {isActive && (
                  <span className="absolute -inset-1 rounded-sm bg-cyan-400/20 animate-ping pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        {/* Synth status readout ticker */}
        <div className="flex items-center justify-between text-[8px] text-zinc-500 font-bold border-t border-white/5 pt-1.5 font-mono">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#00FF95] animate-ping' : 'bg-red-500'}`} />
            <span>MIDI_CLOCK: ACTIVE</span>
          </span>
          <span>SENSITIVITY: 44.1 KHZ / WEB_AUDIO BUFFER</span>
        </div>
      </div>
    </div>
  );
}
