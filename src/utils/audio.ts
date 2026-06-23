/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SynthAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.4;
  private sfxVolume: number = 0.5;
  
  // Custom synth controls
  public leadOscType: OscillatorType = 'triangle';
  public bassOscType: OscillatorType = 'sawtooth';
  public userKeyOverride: string | null = null;
  public userBpmOffset: number = 0; // +/- live BPM skew
  public musicMode: 'GAME' | 'MENU' | null = null;

  // Custom Menu Music Controller states
  public menuPreset: 'CHILL' | 'CHIPTUNE' | 'DARK' | 'CYBER' = 'CHILL';
  public menuBpm: number = 95;
  public menuKey: string = 'A';
  public menuMuteKick: boolean = false;
  public menuMuteHihat: boolean = false;
  public menuMutePad: boolean = false;
  public menuMuteLead: boolean = false;
  public currentPlayStep: number = 0;
  public menuStepCallback?: (step: number) => void;
  
  // Schedulers and nodes
  private schedulerId: number | null = null;
  private currentBeat: number = 0;
  public bpm: number = 130;
  private levelColor: string = '#3b82f6';
  private nextBeatTime: number = 0;
  private mainGainNode: GainNode | null = null;
  public currentKey: string = 'C';

  constructor() {
    // Initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      // Direct Web Audio API instantiation
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.mainGainNode = this.ctx.createGain();
        this.mainGainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.mainGainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.mainGainNode && this.ctx) {
      this.mainGainNode.gain.setValueAtTime(mute ? 0 : 1, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  public setVolumes(music: number, sfx: number) {
    this.musicVolume = music;
    this.sfxVolume = sfx;
  }

  // SOUND EFFECTS (SFX)
  
  public playJump() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Frequency sweeps upward quickly like a retro jump
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playOrb() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Deep spring jump: rapid frequency sweep up-down
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.25);

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playPad() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(660, now + 0.12);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(112, now);
    osc2.frequency.exponentialRampToValueAtTime(665, now + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  public playCrash() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    
    // Create random white noise for typical crash sound
    const bufferSize = this.ctx.sampleRate * 0.4; // 0.4 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter to make crash heavy/explosive
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noiseNode.connect(filter);
    filter.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    // Add extra sub bass drop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.linearRampToValueAtTime(30, now + 0.3);

    subGain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    subOsc.connect(subGain);
    if (this.mainGainNode) {
      subGain.connect(this.mainGainNode);
    }

    noiseNode.start(now);
    noiseNode.stop(now + 0.4);
    
    subOsc.start(now);
    subOsc.stop(now + 0.4);
  }

  public playCollectStar() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Arpeggiated tiny star chime
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1320, now + 0.06);
    osc.frequency.setValueAtTime(1760, now + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playDoubleJumpCollect() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554, now + 0.05);
    osc.frequency.setValueAtTime(659, now + 0.1);
    osc.frequency.setValueAtTime(880, now + 0.15);
    osc.frequency.setValueAtTime(1108, now + 0.2);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.25);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    osc2.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    osc.start(now);
    osc.stop(now + 0.35);
    osc2.start(now);
    osc2.stop(now + 0.35);
  }

  public playDoubleJumpUse() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const pitchMod = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const modGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.12); // rapid upward laser sweep

    pitchMod.frequency.setValueAtTime(25, now);
    modGain.gain.setValueAtTime(40, now);

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    pitchMod.connect(modGain);
    modGain.connect(osc.frequency);
    osc.connect(gain);

    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    osc.start(now);
    osc.stop(now + 0.25);
    pitchMod.start(now);
    pitchMod.stop(now + 0.25);
  }

  public playSpeedBoostCollect() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.4);

    lfo.frequency.setValueAtTime(15, now);
    lfoGain.gain.setValueAtTime(80, now);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);

    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    osc.start(now);
    osc.stop(now + 0.45);
    lfo.start(now);
    lfo.stop(now + 0.45);
  }

  public playCheckpoint() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

    gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playWin() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Ascending arpeggio of positive minor/major chord
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major triumphant chord
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(this.sfxVolume * 0.3, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.8);
      
      osc.connect(gain);
      if (this.mainGainNode) {
        gain.connect(this.mainGainNode);
      }
      
      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  // BACKGROUND DYNAMIC SYNTH RHYTHM MUSIC

  public startMusic(levelBpm: number, colorTheme: string) {
    this.initCtx();
    if (!this.ctx) return;

    this.bpm = levelBpm + this.userBpmOffset;
    this.levelColor = colorTheme;
    this.currentBeat = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.1;
    this.musicMode = 'GAME';

    if (this.userKeyOverride) {
      this.currentKey = this.userKeyOverride;
    } else {
      // Pick keys based on level color to create nice mood
      if (colorTheme.includes('ef4444') || colorTheme.includes('red')) {
        this.currentKey = 'D'; // Crimson/Demon -> D minor heavy/dark
      } else if (colorTheme.includes('10b981') || colorTheme.includes('green')) {
        this.currentKey = 'G'; // Emerald -> G major/minor upbeat
      } else if (colorTheme.includes('a855f7') || colorTheme.includes('purple')) {
        this.currentKey = 'A'; // Purple -> A minor psychedelic
      } else {
        this.currentKey = 'C'; // Default clean C minor
      }
    }

    if (this.schedulerId) {
      clearTimeout(this.schedulerId);
      this.schedulerId = null;
    }
    this.schedulerLoop();
  }

  public startMenuMusic() {
    this.initCtx();
    if (!this.ctx) return;

    this.bpm = this.menuBpm; // customizable chill speed
    this.currentBeat = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.1;
    this.currentKey = this.menuKey; // customizable key
    this.musicMode = 'MENU';

    if (this.schedulerId) {
      clearTimeout(this.schedulerId);
      this.schedulerId = null;
    }
    this.schedulerLoop();
  }

  public stopMusic() {
    if (this.schedulerId) {
      clearTimeout(this.schedulerId);
      this.schedulerId = null;
    }
    this.musicMode = null;
  }

  private schedulerLoop = () => {
    if (!this.ctx) return;

    const lookAhead = 0.2; // scheduled 200ms ahead
    const interval = 100; // run scheduler every 100ms
    const secondsPerBeat = 60.0 / this.bpm;
    const eighthNoteTime = secondsPerBeat / 2; // rhythmic step size

    const now = this.ctx.currentTime;

    while (this.nextBeatTime < now + lookAhead) {
      this.scheduleStep(this.currentBeat, this.nextBeatTime);
      this.nextBeatTime += eighthNoteTime;
      this.currentBeat = (this.currentBeat + 1) % 16; // Menu uses 16 steps generally, standard is 32. Keep inside 16 for cleaner looping step grid!
    }

    this.schedulerId = window.setTimeout(this.schedulerLoop, interval);
  };

  private scheduleStep(step: number, time: number) {
    if (!this.ctx || this.isMuted) return;

    if (this.musicMode === 'MENU') {
      this.scheduleMenuStep(step, time);
      return;
    }

    const isFirstBeatOfBar = step % 8 === 0;
    const isBeat = step % 4 === 0;
    const isOffbeat = step % 4 === 2;

    // SYNTHESIZED DRUMS
    if (isFirstBeatOfBar || isBeat) {
      this.synthesizeKick(time);
    }
    
    // Snare on beat 2 and 4 (step 8, 24 inside 32-step grid, or step % 8 === 4)
    if (step % 8 === 4) {
      this.synthesizeSnare(time);
    }

    if (isOffbeat || step % 2 === 1) {
      this.synthesizeHihat(time, step % 2 === 1 ? 0.05 : 0.12);
    }

    // MELODIC PROGRESSION
    this.synthesizeMelody(step, time);
  }

  private scheduleMenuStep(step: number, time: number) {
    if (!this.ctx) return;

    this.currentPlayStep = step;
    if (this.menuStepCallback) {
      // Execute menu step callback on main thread to sync sequencer visualization
      const currentStep = step;
      setTimeout(() => {
        if (this.menuStepCallback) this.menuStepCallback(currentStep);
      }, 0);
    }

    const scaleKeys: Record<string, number[]> = {
      C: [130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 233.08, 261.63],
      G: [98.00, 110.00, 116.54, 130.81, 146.83, 155.56, 174.61, 196.00],
      D: [146.83, 164.81, 174.61, 196.00, 220.00, 233.08, 261.63, 293.66],
      A: [110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00, 220.00],
      E: [164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63],
      'F#': [185.00, 207.65, 220.00, 246.94, 277.18, 293.66, 329.63, 369.99],
    };

    const scale = scaleKeys[this.currentKey] || scaleKeys.A;

    // 1. BEAT KICK
    if (step % 8 === 0 && !this.menuMuteKick) {
      if (this.menuPreset === 'CYBER') {
        this.synthesizeKick(time); // heavier punchy kick
      } else if (this.menuPreset === 'CHIPTUNE') {
        this.synthesizeMenuKick(time); // soft retro kick
      } else {
        this.synthesizeMenuKick(time); // gentle heartbeat kick
      }
    }

    // 2. SOFT CYBER SHAKER
    if ((step % 4 === 2 || step % 4 === 0) && !this.menuMuteHihat) {
      const dur = this.menuPreset === 'CHIPTUNE' ? 0.08 : 0.04;
      this.synthesizeHihat(time, dur);
    }

    // 3. AMBIENT LUSH PAD / ACCENTS
    if (!this.menuMutePad) {
      if (step % 16 === 0) {
        // Chord built from 1st, 3rd, 5th, 8th scale degree
        const freqs = [
          scale[0] * 0.5,
          scale[2 % scale.length],
          scale[4 % scale.length],
          scale[7 % scale.length]
        ];
        this.synthesizeMenuPad(freqs, time, 5.0);
      } else if (step % 16 === 8) {
        // Chord built from 4th, 6th, octave, and 9th
        const freqs = [
          scale[3 % scale.length] * 0.5,
          scale[5 % scale.length],
          scale[7 % scale.length],
          scale[1] * 2
        ];
        this.synthesizeMenuPad(freqs, time, 5.0);
      }
    }

    // 4. CHILL AMBIENT MELODIC BUBBLES
    const melodySteps = [2, 5, 6, 10, 13, 14];
    if (melodySteps.includes(step % 16) && !this.menuMuteLead) {
      this.synthesizeMenuLead(step, time, scale);
    }
  }

  private synthesizeMenuKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.16);

    gain.gain.setValueAtTime(this.musicVolume * 0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }
    osc.start(time);
    osc.stop(time + 0.22);
  }

  private synthesizeMenuPad(frequencies: number[], time: number, duration: number) {
    if (!this.ctx) return;

    frequencies.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Custom instrument selection for chord pads
      osc.type = this.bassOscType;
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      // Lowpass cutoff depends on preset for darker vs cyber vibes
      const cutoff = this.menuPreset === 'CYBER' ? 600 : (this.menuPreset === 'DARK' ? 220 : 320);
      filter.frequency.setValueAtTime(cutoff, time);
      filter.Q.setValueAtTime(1.2, time);

      // Slow lush decay
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(this.musicVolume * 0.12, time + 0.8);
      gain.gain.setValueAtTime(this.musicVolume * 0.12, time + duration - 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      if (this.mainGainNode) {
        gain.connect(this.mainGainNode);
      }

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  private synthesizeMenuLead(step: number, time: number, customScale?: number[]) {
    if (!this.ctx) return;

    const scale = customScale || [110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00];
    const notes = [7, 9, 11, 14, 11, 9, 7, 4];
    
    let octaveShift = 4;
    if (this.menuPreset === 'DARK') octaveShift = 2; // deeper synth leads
    if (this.menuPreset === 'CHIPTUNE') octaveShift = 6; // high retro arps

    const noteIdx = notes[step % notes.length];
    const freq = scale[noteIdx % scale.length] * octaveShift;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const delayGain = this.ctx.createGain();

    // Use current leadOscType Waveshaper dynamically!
    osc.type = this.leadOscType;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    const volumeAmt = this.menuPreset === 'CHIPTUNE' ? 0.05 : 0.08;
    gain.gain.linearRampToValueAtTime(this.musicVolume * volumeAmt, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

    delay.delayTime.setValueAtTime(0.32, time);
    delayGain.gain.setValueAtTime(0.35, time);

    osc.connect(gain);
    gain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay);

    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
      delayGain.connect(this.mainGainNode);
    }

    osc.start(time);
    osc.stop(time + 0.45);
  }

  // Synthesizes a rapid pitch sweep for the techno kick
  private synthesizeKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.1);

    gain.gain.setValueAtTime(this.musicVolume * 0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    osc.start(time);
    osc.stop(time + 0.18);
  }

  // Hi-hat using quick white-noise burst and high-pass filter
  private synthesizeHihat(time: number, duration: number) {
    if (!this.ctx) return;
    
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.musicVolume * 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.005, time + duration - 0.01);

    noiseNode.connect(filter);
    filter.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    noiseNode.start(time);
    noiseNode.stop(time + duration);
  }

  // Snare using noise filtered at mid-cut
  private synthesizeSnare(time: number) {
    if (!this.ctx) return;
    
    const duration = 0.14;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.musicVolume * 0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    noiseNode.connect(filter);
    filter.connect(gain);
    if (this.mainGainNode) {
      gain.connect(this.mainGainNode);
    }

    // Add snap oscillator
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(180, time);
    snapGain.gain.setValueAtTime(this.musicVolume * 0.3, time);
    snapGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    snapOsc.connect(snapGain);
    if (this.mainGainNode) {
      snapGain.connect(this.mainGainNode);
    }

    noiseNode.start(time);
    noiseNode.stop(time + duration);
    snapOsc.start(time);
    snapOsc.stop(time + duration);
  }

  // Melodic line following minor scales based on key
  private synthesizeMelody(step: number, time: number) {
    if (!this.ctx) return;

    // Define scales
    // C minor, G minor, D minor, A minor, E minor, F# minor
    const scales: Record<string, number[]> = {
      C: [130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 233.08, 261.63], // Octave 3 and 4
      G: [98.00, 110.00, 116.54, 130.81, 146.83, 155.56, 174.61, 196.00],
      D: [146.83, 164.81, 174.61, 196.00, 220.00, 233.08, 261.63, 293.66],
      A: [110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00, 220.00],
      E: [164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63],
      'F#': [185.00, 207.65, 220.00, 246.94, 277.18, 293.66, 329.63, 369.99],
    };

    const scale = scales[this.currentKey] || scales.C;

    // BASS ENGINE (Step-driven groovy bass)
    const bassIndices = [0, 0, 4, 4, 3, 3, 2, 5, 0, 0, 4, 4, 3, 3, 6, 7];
    const bassIdx = bassIndices[Math.floor(step / 2) % bassIndices.length];
    const bassFreq = scale[bassIdx] * 0.5; // low bass

    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    const bassFilter = this.ctx.createBiquadFilter();

    bassOsc.type = this.bassOscType;
    bassOsc.frequency.setValueAtTime(bassFreq, time);

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(350, time);

    bassGain.gain.setValueAtTime(this.musicVolume * 0.22, time);
    // short staccato pulsing bass note every eighth note
    bassGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    if (this.mainGainNode) {
      bassGain.connect(this.mainGainNode);
    }

    bassOsc.start(time);
    bassOsc.stop(time + 0.14);

    // LEAD HYPERPAY ARPEGGIATOR (Every odd/even sixteenth step)
    // Plays faster higher melodies for high energy adrenaline
    const isMelodyStep = step % 2 === 0;
    if (isMelodyStep) {
      const melodyPatterns = [
        [0, 2, 4, 7, 9, 7, 4, 2], // climbing arpeggio
        [7, 9, 11, 7, 4, 2, 0, 2],
        [4, 0, 4, 7, 3, 0, 3, 6],
        [7, 7, 4, 4, 11, 7, 0, 4]
      ];

      const barNumber = Math.floor(step / 8);
      const patternIdx = barNumber % melodyPatterns.length;
      const pattern = melodyPatterns[patternIdx];
      const noteIdx = pattern[step % 8];

      // Translate notes to higher frequencies
      const leadNote = scale[noteIdx % scale.length] * 4; // Shift up 2 octaves

      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      const delay = this.ctx.createDelay();
      const delayGain = this.ctx.createGain();

      leadOsc.type = this.leadOscType; // Smooth retro triangle chip tune
      leadOsc.frequency.setValueAtTime(leadNote, time);

      leadGain.gain.setValueAtTime(this.musicVolume * 0.16, time);
      leadGain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

      // Echo delay feedback
      delay.delayTime.setValueAtTime(0.12, time);
      delayGain.gain.setValueAtTime(0.3, time);

      leadOsc.connect(leadGain);
      
      // Delay circuit
      leadGain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(delay); // loop back

      if (this.mainGainNode) {
        leadGain.connect(this.mainGainNode);
        delayGain.connect(this.mainGainNode);
      }

      leadOsc.start(time);
      leadOsc.stop(time + 0.2);
    }
  }
}

export const GameAudio = new SynthAudioEngine();
