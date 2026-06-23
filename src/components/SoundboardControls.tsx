import React, { useState, useEffect } from 'react';
import { GameAudio } from '../utils/audio';
import { Music, Sliders, Volume2, Key, Activity, Disc, RefreshCw, Zap } from 'lucide-react';

export default function SoundboardControls() {
  const [leadOsc, setLeadOsc] = useState<OscillatorType>('triangle');
  const [bassOsc, setBassOsc] = useState<OscillatorType>('sawtooth');
  const [bpmSkew, setBpmSkew] = useState<number>(0);
  const [scaleKey, setScaleKey] = useState<string>('AUTO');
  const [beatPulse, setBeatPulse] = useState<boolean>(false);
  const [activePad, setActivePad] = useState<string | null>(null);

  // Sync state initially
  useEffect(() => {
    // Read from the GameAudio global
    setLeadOsc(GameAudio.leadOscType);
    setBassOsc(GameAudio.bassOscType);
    setBpmSkew(GameAudio.userBpmOffset);
    setScaleKey(GameAudio.userKeyOverride || 'AUTO');
  }, []);

  const handleLeadChange = (type: OscillatorType) => {
    GameAudio.leadOscType = type;
    setLeadOsc(type);
    triggerBeatPulse();
  };

  const handleBassChange = (type: OscillatorType) => {
    GameAudio.bassOscType = type;
    setBassOsc(type);
    triggerBeatPulse();
  };

  const handleBpmSkewChange = (skew: number) => {
    GameAudio.userBpmOffset = skew;
    setBpmSkew(skew);
    // If music is playing, it will automatically skew the current BPM
  };

  const handleScaleKeyChange = (key: string) => {
    if (key === 'AUTO') {
      GameAudio.userKeyOverride = null;
    } else {
      GameAudio.userKeyOverride = key;
    }
    setScaleKey(key);
    triggerBeatPulse();
  };

  const triggerBeatPulse = () => {
    setBeatPulse(true);
    setTimeout(() => setBeatPulse(false), 200);
  };

  const playCustomPad = (soundType: 'kick' | 'snare' | 'hihat' | 'coin' | 'riser') => {
    setActivePad(soundType);
    setTimeout(() => setActivePad(null), 150);

    // Initial audio context trigger needs user interaction
    if (soundType === 'kick') {
      // @ts-ignore
      GameAudio.synthesizeKick(GameAudio.ctx?.currentTime || 0);
    } else if (soundType === 'snare') {
      // @ts-ignore
      GameAudio.synthesizeSnare(GameAudio.ctx?.currentTime || 0);
    } else if (soundType === 'hihat') {
      // @ts-ignore
      GameAudio.synthesizeHihat(GameAudio.ctx?.currentTime || 0, 0.12);
    } else if (soundType === 'coin') {
      GameAudio.playCollectStar();
    } else if (soundType === 'riser') {
      GameAudio.playPad();
    }
  };

  return (
    <div 
      id="retro-soundboard-controls"
      className="bg-black/90 p-5 sm:p-6 border-2 border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col justify-between font-sans text-white h-full"
    >
      {/* Decorative cyber line header */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-[#00FF95] to-purple-600"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Music className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-black text-xs tracking-wider text-white uppercase italic">CYBER_SYNTH STUDIO</span>
              <span className="px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[8px] font-mono tracking-widest uppercase font-black">DSP CORE</span>
            </div>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mt-1">Live procedural audio customizer</p>
          </div>
        </div>

        {/* Dynamic Beat Visualizer Element */}
        <div className="flex items-end gap-0.5 h-6 px-2 bg-black border border-white/5 rounded-md">
          <div className={`w-0.5 h-2 bg-cyan-400 transition-all rounded-full ${beatPulse ? 'h-5' : 'h-2 animate-bounce'}`} style={{ animationDelay: '0.1s' }} />
          <div className={`w-0.5 h-4 bg-[#00FF95] transition-all rounded-full ${beatPulse ? 'h-6' : 'h-3 animate-bounce'}`} style={{ animationDelay: '0.2s' }} />
          <div className={`w-0.5 h-3 bg-cyan-400 transition-all rounded-full ${beatPulse ? 'h-5' : 'h-1 animate-bounce'}`} style={{ animationDelay: '0s' }} />
          <div className={`w-0.5 h-5 bg-purple-500 transition-all rounded-full ${beatPulse ? 'h-6' : 'h-4 animate-bounce'}`} style={{ animationDelay: '0.3s' }} />
          <div className={`w-0.5 h-1 bg-[#00FF95] transition-all rounded-full ${beatPulse ? 'h-4' : 'h-2 animate-bounce'}`} style={{ animationDelay: '0.15s' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        
        {/* SYNTH OSCILLATORS CONFIG */}
        <div className="space-y-3.5 bg-zinc-950/40 p-4 border border-white/5 rounded-xl">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Oscillator Waveshapes</span>
          </div>

          {/* Lead Synth */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 font-sans">
              <span>LEAD MELODY VOICE</span>
              <span className="text-[9px] text-[#00FF95] uppercase font-bold font-mono">{leadOsc.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 font-mono text-[9px] font-bold">
              {['triangle', 'sawtooth', 'square', 'sine'].map((type) => (
                <button
                  key={`lead-${type}`}
                  type="button"
                  onClick={() => handleLeadChange(type as OscillatorType)}
                  className={`py-1.5 border hover:border-cyan-400/50 transition-all cursor-pointer ${
                    leadOsc === type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-black'
                      : 'bg-black border-white/5 text-zinc-500'
                  }`}
                >
                  {type.substring(0, 4).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bass Synth */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 font-sans">
              <span>SUB BASS ENGINE</span>
              <span className="text-[9px] text-purple-400 uppercase font-bold font-mono">{bassOsc.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 font-mono text-[9px] font-bold">
              {['sine', 'triangle', 'sawtooth', 'square'].map((type) => (
                <button
                  key={`bass-${type}`}
                  type="button"
                  onClick={() => handleBassChange(type as OscillatorType)}
                  className={`py-1.5 border hover:border-purple-400/50 transition-all cursor-pointer ${
                    bassOsc === type
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-black'
                      : 'bg-black border-white/5 text-zinc-500'
                  }`}
                >
                  {type.substring(0, 4).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TIMING & SCALE CONTROL */}
        <div className="space-y-3.5 bg-zinc-950/40 p-4 border border-white/5 rounded-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-[#00FF95]" />
                <span>Micro Tuning & Key</span>
              </div>
              <span className="text-xxs px-1 bg-white/5 font-normal tracking-normal text-zinc-500 lowercase border border-white/5">Scale quantization</span>
            </div>

            {/* Key Selector */}
            <div className="grid grid-cols-4 gap-1 font-mono text-[10px] font-black">
              {['AUTO', 'C', 'G', 'D', 'A', 'E', 'F#'].map((keyName) => (
                <button
                  key={`key-${keyName}`}
                  type="button"
                  onClick={() => handleScaleKeyChange(keyName)}
                  className={`py-1.5 border transition-all cursor-pointer ${
                    scaleKey === keyName
                      ? 'bg-[#00FF95]/20 border-[#00FF95] text-[#00FF95]'
                      : 'bg-black border-white/5 text-zinc-500 hover:text-white'
                  }`}
                >
                  {keyName}
                </button>
              ))}
            </div>
          </div>

          {/* BPM live skew slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-400 uppercase">
              <span>Live Tempo Skew</span>
              <span className="text-cyan-400 font-black">
                {bpmSkew >= 0 ? `+${bpmSkew}` : bpmSkew} BPM
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-zinc-600">-30</span>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={bpmSkew}
                onChange={(e) => handleBpmSkewChange(parseInt(e.target.value, 10))}
                className="flex-1 accent-[#00FF95] h-1.5 bg-zinc-900 border border-white/10 rounded-lg cursor-pointer"
              />
              <span className="text-[9px] font-mono text-zinc-600">+50</span>
              <button 
                onClick={() => handleBpmSkewChange(0)}
                disabled={bpmSkew === 0}
                className="p-1 text-zinc-400 hover:text-[#00FF95] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Reset BPM"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ELECTRONIC DRUM PAD BANK */}
      <div className="bg-zinc-950/40 p-3.5 border border-white/5 rounded-xl space-y-2.5">
        <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span>Interactive Beat Drums Pad Bank</span>
          </div>
          <span>TAP pad to triggers live synthesized DSP samples</span>
        </div>

        <div className="grid grid-cols-5 gap-2 font-mono text-[9px] font-black tracking-wider text-center">
          <button
            onClick={() => playCustomPad('kick')}
            className={`py-3.5 rounded-lg border uppercase transition-all cursor-pointer ${
              activePad === 'kick' 
                ? 'bg-cyan-500 text-black border-cyan-400 scale-95 shadow-[0_0_15px_#06b6d4]' 
                : 'bg-cyan-950/30 text-cyan-400 border-cyan-500/20 active:scale-95'
            }`}
          >
            🥁 KICK
          </button>
          <button
            onClick={() => playCustomPad('snare')}
            className={`py-3.5 rounded-lg border uppercase transition-all cursor-pointer ${
              activePad === 'snare' 
                ? 'bg-[#00FF95] text-black border-[#00FF95] scale-95 shadow-[0_0_15px_#00FF95]' 
                : 'bg-[#00FF95]/5 text-[#00FF95] border-[#00FF95]/15 active:scale-95'
            }`}
          >
            👏 SNARE
          </button>
          <button
            onClick={() => playCustomPad('hihat')}
            className={`py-3.5 rounded-lg border uppercase transition-all cursor-pointer ${
              activePad === 'hihat' 
                ? 'bg-yellow-400 text-black border-yellow-300 scale-95 shadow-[0_0_15px_#eab308]' 
                : 'bg-yellow-500/5 text-yellow-500/80 border-yellow-500/15 active:scale-95'
            }`}
          >
            ✨ HI-HAT
          </button>
          <button
            onClick={() => playCustomPad('coin')}
            className={`py-3.5 rounded-lg border uppercase transition-all cursor-pointer ${
              activePad === 'coin' 
                ? 'bg-purple-500 text-white border-purple-400 scale-95 shadow-[0_0_15px_#a855f7]' 
                : 'bg-purple-500/5 text-purple-400 border-purple-500/15 active:scale-95'
            }`}
          >
            💎 CHIME
          </button>
          <button
            onClick={() => playCustomPad('riser')}
            className={`py-3.5 rounded-lg border uppercase transition-all cursor-pointer ${
              activePad === 'riser' 
                ? 'bg-red-500 text-white border-red-400 scale-95 shadow-[0_0_15px_#ef4444]' 
                : 'bg-red-500/5 text-red-500 border-red-500/15 active:scale-95'
            }`}
          >
            🚀 RISER
          </button>
        </div>
      </div>
    </div>
  );
}
