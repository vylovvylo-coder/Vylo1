import {
  AudioChannel,
  AudioFilterConfig,
  AudioPresetType,
  VoiceChangerEffect,
  AutoDuckingConfig,
} from '../types/studio';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private micStream: MediaStream | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;

  // Voice changer nodes on mic
  private voiceChangerEffect: VoiceChangerEffect = 'off';
  private ringModOsc: OscillatorNode | null = null;
  private ringModGain: GainNode | null = null;
  private voiceFormantFilter: BiquadFilterNode | null = null;
  private voiceDistortionNode: WaveShaperNode | null = null;

  // Auto-Ducking state
  private autoDuckingConfig: AutoDuckingConfig = {
    enabled: true,
    duckAmountDb: -10,
    attackMs: 20,
    releaseMs: 350,
    targetChannels: ['game_audio', 'media_player'],
  };
  private isCurrentlyDucking = false;

  // Channel processing nodes map
  private channels: Map<
    string,
    {
      sourceNode: AudioNode | null;
      aiHighPassNode: BiquadFilterNode;
      aiDenoiseGainNode: GainNode;
      duckGainNode: GainNode;
      gainNode: GainNode;
      pannerNode: StereoPannerNode;
      compressorNode: DynamicsCompressorNode;
      lowEqNode: BiquadFilterNode;
      midEqNode: BiquadFilterNode;
      highEqNode: BiquadFilterNode;
      makeupGainNode: GainNode;
      analyserNode: AnalyserNode;
      oscillator?: OscillatorNode;
      lfoNode?: OscillatorNode;
    }
  > = new Map();

  public init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  public ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getPresetConfig(preset: AudioPresetType): Partial<AudioFilterConfig> {
    switch (preset) {
      case 'warm_radio':
        return {
          aiNoiseSuppression: { enabled: true, intensity: 65 },
          noiseGate: { enabled: true, threshold: -45, attack: 10, release: 70 },
          eq: { enabled: true, low: 3.5, mid: -0.5, high: 2.0 },
          compressor: { enabled: true, threshold: -18, ratio: 3.5, attack: 0.015, release: 0.15, makeupGain: 3.0 },
          activePreset: 'warm_radio',
        };
      case 'crisp_voice':
        return {
          aiNoiseSuppression: { enabled: true, intensity: 80 },
          noiseGate: { enabled: true, threshold: -42, attack: 5, release: 50 },
          eq: { enabled: true, low: -2.5, mid: 2.5, high: 4.5 },
          compressor: { enabled: true, threshold: -16, ratio: 4.0, attack: 0.008, release: 0.09, makeupGain: 3.5 },
          activePreset: 'crisp_voice',
        };
      case 'bass_boost':
        return {
          aiNoiseSuppression: { enabled: false, intensity: 40 },
          noiseGate: { enabled: false, threshold: -50, attack: 15, release: 80 },
          eq: { enabled: true, low: 6.5, mid: -1.0, high: 0.5 },
          compressor: { enabled: true, threshold: -14, ratio: 2.8, attack: 0.02, release: 0.2, makeupGain: 2.0 },
          activePreset: 'bass_boost',
        };
      case 'gaming_comms':
        return {
          aiNoiseSuppression: { enabled: true, intensity: 90 },
          noiseGate: { enabled: true, threshold: -38, attack: 3, release: 40 },
          eq: { enabled: true, low: -4.0, mid: 4.0, high: 2.0 },
          compressor: { enabled: true, threshold: -12, ratio: 5.0, attack: 0.005, release: 0.08, makeupGain: 4.0 },
          activePreset: 'gaming_comms',
        };
      case 'clean_studio':
      default:
        return {
          aiNoiseSuppression: { enabled: true, intensity: 50 },
          noiseGate: { enabled: true, threshold: -48, attack: 10, release: 60 },
          eq: { enabled: true, low: 0, mid: 0, high: 0 },
          compressor: { enabled: true, threshold: -20, ratio: 2.5, attack: 0.02, release: 0.15, makeupGain: 1.5 },
          activePreset: 'clean_studio',
        };
    }
  }

  public setupChannel(channel: AudioChannel) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (this.channels.has(channel.id)) return;

    // AI Noise suppression simulated high-pass & noise floor attenuation
    const aiHighPassNode = this.ctx.createBiquadFilter();
    aiHighPassNode.type = 'highpass';
    aiHighPassNode.frequency.value = channel.filters.aiNoiseSuppression?.enabled ? 80 : 20;

    const aiDenoiseGainNode = this.ctx.createGain();
    aiDenoiseGainNode.gain.value = 1.0;

    // Auto-ducking dedicated attenuation node
    const duckGainNode = this.ctx.createGain();
    duckGainNode.gain.value = 1.0;

    // DSP chain:
    // AI HighPass -> AI Denoise -> Low EQ -> Mid EQ -> High EQ -> Compressor -> Makeup Gain -> Duck Gain -> Gain(Volume) -> Panner -> Analyser -> Destination
    const lowEqNode = this.ctx.createBiquadFilter();
    lowEqNode.type = 'lowshelf';
    lowEqNode.frequency.value = 120;
    lowEqNode.gain.value = channel.filters.eq.enabled ? channel.filters.eq.low : 0;

    const midEqNode = this.ctx.createBiquadFilter();
    midEqNode.type = 'peaking';
    midEqNode.frequency.value = 1200;
    midEqNode.gain.value = channel.filters.eq.enabled ? channel.filters.eq.mid : 0;

    const highEqNode = this.ctx.createBiquadFilter();
    highEqNode.type = 'highshelf';
    highEqNode.frequency.value = 8000;
    highEqNode.gain.value = channel.filters.eq.enabled ? channel.filters.eq.high : 0;

    const compressorNode = this.ctx.createDynamicsCompressor();
    if (channel.filters.compressor.enabled) {
      compressorNode.threshold.value = channel.filters.compressor.threshold;
      compressorNode.ratio.value = channel.filters.compressor.ratio;
      compressorNode.attack.value = channel.filters.compressor.attack;
      compressorNode.release.value = channel.filters.compressor.release;
    } else {
      compressorNode.threshold.value = 0;
      compressorNode.ratio.value = 1;
    }

    const makeupGainNode = this.ctx.createGain();
    makeupGainNode.gain.value = channel.filters.compressor.enabled
      ? Math.pow(10, channel.filters.compressor.makeupGain / 20)
      : 1;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = channel.muted ? 0 : channel.volume;

    const pannerNode = this.ctx.createStereoPanner();
    pannerNode.pan.value = channel.pan;

    const analyserNode = this.ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.6;

    // Connect the DSP nodes
    aiHighPassNode.connect(aiDenoiseGainNode);
    aiDenoiseGainNode.connect(lowEqNode);
    lowEqNode.connect(midEqNode);
    midEqNode.connect(highEqNode);
    highEqNode.connect(compressorNode);
    compressorNode.connect(makeupGainNode);
    makeupGainNode.connect(duckGainNode);
    duckGainNode.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(analyserNode);

    if (channel.filters.monitoring !== 'off') {
      pannerNode.connect(this.ctx.destination);
    }

    this.channels.set(channel.id, {
      sourceNode: null,
      aiHighPassNode,
      aiDenoiseGainNode,
      duckGainNode,
      gainNode,
      pannerNode,
      compressorNode,
      lowEqNode,
      midEqNode,
      highEqNode,
      makeupGainNode,
      analyserNode,
    });

    if (channel.id !== 'mic_aux') {
      this.attachSimulatedAudio(channel.id, aiHighPassNode);
    }
  }

  private attachSimulatedAudio(channelId: string, targetNode: AudioNode) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqs: { [key: string]: number } = {
        desktop_audio: 140,
        game_audio: 95,
        discord_audio: 220,
        media_player: 180,
      };

      osc.type = channelId === 'game_audio' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freqs[channelId] || 150, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.8 + Math.random() * 1.5, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      lfo.connect(lfoGain.gain);

      osc.connect(gain);
      gain.connect(targetNode);

      osc.start();
      lfo.start();

      const channelObj = this.channels.get(channelId);
      if (channelObj) {
        channelObj.oscillator = osc;
        channelObj.lfoNode = lfo;
      }
    } catch {
      // Audio autoplay policy
    }
  }

  public async connectMicrophone(): Promise<boolean> {
    this.ensureContext();
    if (!this.ctx) return false;

    try {
      if (this.micStream) {
        this.micStream.getTracks().forEach((t) => t.stop());
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micSourceNode = this.ctx.createMediaStreamSource(this.micStream);
      const micChannel = this.channels.get('mic_aux');
      if (micChannel) {
        this.micSourceNode.connect(micChannel.aiHighPassNode);
        micChannel.sourceNode = this.micSourceNode;
      }
      return true;
    } catch (err) {
      console.warn('Microphone permission not granted or device unavailable:', err);
      return false;
    }
  }

  public disconnectMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.micSourceNode) {
      this.micSourceNode.disconnect();
      this.micSourceNode = null;
    }
  }

  public updateVolume(channelId: string, volume: number, muted: boolean) {
    const ch = this.channels.get(channelId);
    if (!ch || !this.ctx) return;
    const targetGain = muted ? 0 : volume;
    ch.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.03);
  }

  public updatePan(channelId: string, pan: number) {
    const ch = this.channels.get(channelId);
    if (!ch || !this.ctx) return;
    ch.pannerNode.pan.setTargetAtTime(pan, this.ctx.currentTime, 0.03);
  }

  public updateFilters(channelId: string, filters: AudioFilterConfig) {
    const ch = this.channels.get(channelId);
    if (!ch || !this.ctx) return;

    // AI Noise Suppression
    if (filters.aiNoiseSuppression?.enabled) {
      ch.aiHighPassNode.frequency.setValueAtTime(85, this.ctx.currentTime);
      const intensityScale = 1 - (filters.aiNoiseSuppression.intensity / 100) * 0.2;
      ch.aiDenoiseGainNode.gain.setValueAtTime(intensityScale, this.ctx.currentTime);
    } else {
      ch.aiHighPassNode.frequency.setValueAtTime(20, this.ctx.currentTime);
      ch.aiDenoiseGainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
    }

    // EQ
    ch.lowEqNode.gain.setValueAtTime(filters.eq.enabled ? filters.eq.low : 0, this.ctx.currentTime);
    ch.midEqNode.gain.setValueAtTime(filters.eq.enabled ? filters.eq.mid : 0, this.ctx.currentTime);
    ch.highEqNode.gain.setValueAtTime(filters.eq.enabled ? filters.eq.high : 0, this.ctx.currentTime);

    // Compressor
    if (filters.compressor.enabled) {
      ch.compressorNode.threshold.setValueAtTime(filters.compressor.threshold, this.ctx.currentTime);
      ch.compressorNode.ratio.setValueAtTime(filters.compressor.ratio, this.ctx.currentTime);
      ch.compressorNode.attack.setValueAtTime(filters.compressor.attack, this.ctx.currentTime);
      ch.compressorNode.release.setValueAtTime(filters.compressor.release, this.ctx.currentTime);
      const makeupMultiplier = Math.pow(10, filters.compressor.makeupGain / 20);
      ch.makeupGainNode.gain.setValueAtTime(makeupMultiplier, this.ctx.currentTime);
    } else {
      ch.compressorNode.threshold.setValueAtTime(0, this.ctx.currentTime);
      ch.compressorNode.ratio.setValueAtTime(1, this.ctx.currentTime);
      ch.makeupGainNode.gain.setValueAtTime(1, this.ctx.currentTime);
    }

    // Voice Changer (if on mic channel)
    if (channelId === 'mic_aux' && filters.voiceChanger) {
      this.setVoiceChanger(filters.voiceChanger);
    }
  }

  // --- Live AI Voice Changer ---
  public setVoiceChanger(effect: VoiceChangerEffect) {
    this.voiceChangerEffect = effect;
    const micChannel = this.channels.get('mic_aux');
    if (!micChannel || !this.ctx) return;

    switch (effect) {
      case 'robot':
        // High Q metallic ringing
        micChannel.midEqNode.gain.setValueAtTime(12, this.ctx.currentTime);
        micChannel.lowEqNode.gain.setValueAtTime(-6, this.ctx.currentTime);
        micChannel.highEqNode.gain.setValueAtTime(8, this.ctx.currentTime);
        break;
      case 'deep_giant':
        // Deep low pitch resonance
        micChannel.lowEqNode.gain.setValueAtTime(14, this.ctx.currentTime);
        micChannel.midEqNode.gain.setValueAtTime(-4, this.ctx.currentTime);
        micChannel.highEqNode.gain.setValueAtTime(-8, this.ctx.currentTime);
        break;
      case 'synth_autotune':
        // Bright punchy synth presence
        micChannel.lowEqNode.gain.setValueAtTime(2, this.ctx.currentTime);
        micChannel.midEqNode.gain.setValueAtTime(8, this.ctx.currentTime);
        micChannel.highEqNode.gain.setValueAtTime(10, this.ctx.currentTime);
        break;
      case 'anime_helium':
        // High formant squeak
        micChannel.lowEqNode.gain.setValueAtTime(-12, this.ctx.currentTime);
        micChannel.midEqNode.gain.setValueAtTime(6, this.ctx.currentTime);
        micChannel.highEqNode.gain.setValueAtTime(12, this.ctx.currentTime);
        break;
      case 'walkie_talkie':
        // Narrow radio band
        micChannel.lowEqNode.gain.setValueAtTime(-15, this.ctx.currentTime);
        micChannel.midEqNode.gain.setValueAtTime(10, this.ctx.currentTime);
        micChannel.highEqNode.gain.setValueAtTime(-12, this.ctx.currentTime);
        break;
      case 'off':
      default:
        // Reset to normal
        micChannel.lowEqNode.gain.setValueAtTime(0, this.ctx.currentTime);
        micChannel.midEqNode.gain.setValueAtTime(0, this.ctx.currentTime);
        micChannel.highEqNode.gain.setValueAtTime(0, this.ctx.currentTime);
        break;
    }
  }

  public getVoiceChanger(): VoiceChangerEffect {
    return this.voiceChangerEffect;
  }

  // --- Auto-Ducking Logic ---
  public setAutoDucking(config: Partial<AutoDuckingConfig>) {
    this.autoDuckingConfig = { ...this.autoDuckingConfig, ...config };
  }

  public getAutoDuckingConfig(): AutoDuckingConfig {
    return this.autoDuckingConfig;
  }

  public applyAutoDucking(micPeakDb: number) {
    if (!this.autoDuckingConfig.enabled || !this.ctx) return;

    // Threshold for streamer voice presence: -34 dB
    const voicePresent = micPeakDb > -34;

    if (voicePresent && !this.isCurrentlyDucking) {
      this.isCurrentlyDucking = true;
      const duckScale = Math.pow(10, this.autoDuckingConfig.duckAmountDb / 20); // e.g. -10dB is ~0.316
      this.autoDuckingConfig.targetChannels.forEach((targetId) => {
        const ch = this.channels.get(targetId);
        if (ch) {
          ch.duckGainNode.gain.setTargetAtTime(duckScale, this.ctx!.currentTime, 0.04);
        }
      });
    } else if (!voicePresent && this.isCurrentlyDucking) {
      this.isCurrentlyDucking = false;
      this.autoDuckingConfig.targetChannels.forEach((targetId) => {
        const ch = this.channels.get(targetId);
        if (ch) {
          ch.duckGainNode.gain.setTargetAtTime(1.0, this.ctx!.currentTime, 0.35); // smooth release
        }
      });
    }
  }

  public isDuckingActive(): boolean {
    return this.isCurrentlyDucking;
  }

  // --- Audio Levels Metering ---
  public getChannelLevels(channelId: string): { peakDb: number; rmsDb: number } {
    const ch = this.channels.get(channelId);
    if (!ch) return { peakDb: -60, rmsDb: -60 };

    const dataArray = new Uint8Array(ch.analyserNode.frequencyBinCount);
    ch.analyserNode.getByteTimeDomainData(dataArray);

    let maxSample = 0;
    let sumSquares = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      const absVal = Math.abs(normalized);
      if (absVal > maxSample) maxSample = absVal;
      sumSquares += normalized * normalized;
    }

    const rms = Math.sqrt(sumSquares / dataArray.length);

    const peakDb = maxSample > 0.0001 ? Math.max(-60, Math.min(0, 20 * Math.log10(maxSample))) : -60;
    const rmsDb = rms > 0.0001 ? Math.max(-60, Math.min(0, 20 * Math.log10(rms))) : -60;

    // Run auto-ducking check if this is mic channel
    if (channelId === 'mic_aux') {
      this.applyAutoDucking(peakDb);
    }

    return { peakDb, rmsDb };
  }

  // --- Soundboard Audio Synthesizer ---
  public playSoundboardEffect(
    type: 'applause' | 'laughter' | 'airhorn' | 'rimshot' | 'buzzer' | 'victory' | 'boom' | 'laser'
  ) {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'airhorn': {
        // Classic 2-tone stadium horn (G4 + C5)
        const freqs = [392, 523.25];
        freqs.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);
          osc.frequency.setValueAtTime(f * 1.02, now + 0.1);
          g.gain.setValueAtTime(0.2, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.connect(g);
          g.connect(this.ctx!.destination);
          osc.start(now);
          osc.stop(now + 0.8);
        });
        break;
      }

      case 'victory': {
        // Trumpet fanfare: C4, E4, G4, C5
        const notes = [261.63, 329.63, 392, 523.25];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          g.gain.setValueAtTime(0.25, now + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);
          osc.connect(g);
          g.connect(this.ctx!.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.5);
        });
        break;
      }

      case 'buzzer': {
        // Failure buzzer (harsh dissonant saw)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(130, now);
        osc2.frequency.setValueAtTime(138, now); // dissonance
        g.gain.setValueAtTime(0.25, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc1.connect(g);
        osc2.connect(g);
        g.connect(this.ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.7);
        osc2.stop(now + 0.7);
        break;
      }

      case 'rimshot': {
        // Snare snap
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'boom': {
        // Sub-bass impact
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);
        g.gain.setValueAtTime(0.4, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }

      case 'laser': {
        // Sci-Fi laser
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
        g.gain.setValueAtTime(0.25, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'applause':
      case 'laughter':
      default: {
        // Rhythmic cheering burst
        const bursts = [0, 0.08, 0.16, 0.24, 0.32, 0.4];
        bursts.forEach((timeOffset) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(350 + Math.random() * 200, now + timeOffset);
          g.gain.setValueAtTime(0.18, now + timeOffset);
          g.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.1);
          osc.connect(g);
          g.connect(this.ctx!.destination);
          osc.start(now + timeOffset);
          osc.stop(now + timeOffset + 0.1);
        });
        break;
      }
    }
  }

  // --- Text-to-Speech (TTS) Engine ---
  public speakText(text: string, lang = 'ar-SA') {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported');
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find((v) => v.lang.startsWith(lang.split('-')[0])) || voices[0];
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS speak error:', e);
    }
  }

  // Play alert chime
  public playAlertSound(type: 'follow' | 'sub' | 'donation' | 'raid') {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === 'follow') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'donation') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'sub') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const subOsc = this.ctx!.createOscillator();
        const subGain = this.ctx!.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(freq, now + idx * 0.1);
        subGain.gain.setValueAtTime(0.18, now + idx * 0.1);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        subOsc.connect(subGain);
        subGain.connect(this.ctx!.destination);
        subOsc.start(now + idx * 0.1);
        subOsc.stop(now + idx * 0.1 + 0.35);
      });
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.start(now);
      osc.stop(now + 0.7);
    }
  }
}

export const audioEngine = new AudioEngine();
