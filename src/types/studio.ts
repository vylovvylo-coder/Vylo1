export type SourceType =
  | 'camera'
  | 'display'
  | 'media'
  | 'image'
  | 'color'
  | 'text'
  | 'browser'
  | 'alert_overlay'
  | 'chat_overlay';

export interface SourceFilters {
  chromaKey?: {
    enabled: boolean;
    color: string; // e.g. '#00ff00'
    similarity: number; // 0 to 1
    smoothness: number; // 0 to 1
  };
  blur?: number; // 0 to 20
  brightness?: number; // 0.5 to 2
  contrast?: number; // 0.5 to 2
  saturation?: number; // 0 to 3
}

export interface SourceItem {
  id: string;
  name: string;
  type: SourceType;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity: number;
  filters: SourceFilters;
  customData?: {
    text?: string;
    textColor?: string;
    bgColor?: string;
    fontSize?: number;
    url?: string;
    mediaUrl?: string;
    mediaPlaying?: boolean;
    loop?: boolean;
    fitMode?: 'contain' | 'cover' | 'stretch';
  };
  mediaStream?: MediaStream;
}

export interface Scene {
  id: string;
  name: string;
  hotkey?: string; // e.g. F1, F2, F3
  icon?: string;
  sources: SourceItem[];
}

export type AudioPresetType =
  | 'custom'
  | 'warm_radio'
  | 'crisp_voice'
  | 'bass_boost'
  | 'clean_studio'
  | 'gaming_comms';

export type VoiceChangerEffect =
  | 'off'
  | 'robot'
  | 'deep_giant'
  | 'synth_autotune'
  | 'anime_helium'
  | 'walkie_talkie';

export interface AutoDuckingConfig {
  enabled: boolean;
  duckAmountDb: number; // e.g. -6, -12, -18 dB
  attackMs: number;
  releaseMs: number;
  targetChannels: string[]; // e.g. ['game_audio', 'media_player']
}

export interface SoundboardItem {
  id: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  hotkey: string;
  soundType: 'applause' | 'laughter' | 'airhorn' | 'rimshot' | 'buzzer' | 'victory' | 'boom' | 'laser';
  color: string;
}

export interface TtsConfig {
  enabled: boolean;
  voiceLang: string;
  rate: number;
  pitch: number;
  volume: number;
  autoReadDonations: boolean;
}

export interface AudioFilterConfig {
  aiNoiseSuppression: {
    enabled: boolean;
    intensity: number; // 0 to 100%
  };
  noiseGate: {
    enabled: boolean;
    threshold: number; // -60 to -10 dB
    attack: number; // ms
    release: number; // ms
  };
  compressor: {
    enabled: boolean;
    threshold: number; // -50 to 0 dB
    ratio: number; // 1 to 20
    attack: number; // 0 to 1 s
    release: number; // 0.05 to 1 s
    makeupGain: number; // 0 to 24 dB
  };
  eq: {
    enabled: boolean;
    low: number; // -15 to +15 dB (100Hz)
    mid: number; // -15 to +15 dB (1kHz)
    high: number; // -15 to +15 dB (8kHz)
  };
  gain: {
    enabled: boolean;
    gainDb: number; // -30 to +30 dB
  };
  syncOffsetMs: number; // e.g. 0 to 1000ms
  monitoring: 'off' | 'monitor_only' | 'monitor_and_output';
  tracks: [boolean, boolean, boolean, boolean, boolean, boolean];
  activePreset?: AudioPresetType;
  voiceChanger?: VoiceChangerEffect;
}

export interface AudioChannel {
  id: string;
  name: string;
  nameAr: string;
  volume: number; // 0 to 1.25 (up to +2dB)
  volumeDb: number; // dB value
  muted: boolean;
  solo: boolean;
  pan: number; // -1 to 1
  peakLevel: number; // dB -60 to 0
  rmsLevel: number; // dB -60 to 0
  isLiveMic?: boolean;
  isolatedApp?: string; // e.g. 'all' | 'game' | 'discord' | 'spotify' | 'browser'
  dmcaVodMute?: boolean; // DMCA protection - strips music from VOD Track 2
  filters: AudioFilterConfig;
}

export type EncoderType =
  | 'NVENC_H264'
  | 'NVENC_HEVC'
  | 'NVENC_AV1'
  | 'X264_SOFTWARE'
  | 'APPLE_VT'
  | 'AMD_AMF'
  | 'INTEL_QSV';

export type StreamProtocol = 'RTMP' | 'RTMPS' | 'SRT' | 'WebRTC-WHIP';

export interface StreamSettings {
  service: 'twitch' | 'youtube' | 'kick' | 'custom_rtmp' | 'srt_server' | 'webrtc';
  protocol: StreamProtocol;
  serverUrl: string;
  streamKey: string;
  srtPassphrase?: string;
  srtLatency?: number; // ms
  srtMode?: 'caller' | 'listener';
  encoder: EncoderType;
  rateControl: 'CBR' | 'VBR' | 'CQP';
  bitrate: number; // kbps, e.g. 6000
  keyframeInterval: number; // seconds, e.g. 2
  preset: 'P1_FASTEST' | 'P3_FAST' | 'P5_BALANCED' | 'P6_QUALITY' | 'P7_MAX_QUALITY';
  profile: 'high' | 'main' | 'baseline';
  audioBitrate: 128 | 160 | 192 | 256 | 320;
  baseResolution: '1920x1080' | '2560x1440' | '3840x2160' | '1280x720' | '1080x1920';
  outputResolution: '1920x1080' | '2560x1440' | '3840x2160' | '1280x720' | '1080x1920';
  fps: 60 | 50 | 30 | 24;
}

export interface StreamAlert {
  id: string;
  type: 'follow' | 'sub' | 'donation' | 'raid';
  username: string;
  amount?: string;
  message?: string;
  timestamp: string;
  tier?: string;
}

export interface ChatMessage {
  id: string;
  platform: 'twitch' | 'youtube' | 'kick' | 'system';
  username: string;
  badge?: string;
  color: string;
  message: string;
  timestamp: string;
  isMod?: boolean;
  isSub?: boolean;
}

export interface UnifiedFeedItem {
  id: string;
  kind: 'chat' | 'alert';
  chat?: ChatMessage;
  alert?: StreamAlert;
  timestamp: string;
}

export interface StudioStats {
  fps: number;
  cpuPercent: number;
  gpuPercent: number;
  nvencLoadPercent: number;
  droppedFramesCount: number;
  droppedFramesPercent: number;
  currentBitrateKbps: number;
  memoryUsageMb: number;
  uptimeSeconds: number;
}

export interface InstantClip {
  id: string;
  title: string;
  timestamp: string;
  durationSeconds: number;
  format: '16:9' | '9:16';
  videoBlob: Blob;
  previewUrl: string;
}

export interface GameBoostState {
  enabled: boolean;
  gpuSavingsPercent: number;
  cpuSavingsPercent: number;
}

export interface NetworkStats {
  pingMs: number;
  jitterMs: number;
  packetLossPercent: number;
  recoveredPacketsCount: number;
  totalPacketsSent: number;
  targetBitrateKbps: number;
  actualBitrateKbps: number;
  isAdaptiveBitrateActive: boolean;
  isEmergencyBoostActive: boolean;
  congestionState: 'optimal' | 'moderate' | 'critical';
  fecRecoveryRatio: number; // e.g. 99.8%
  activeServerName: string;
  activeServerProtocol: StreamProtocol;
}

export interface IngestServerPing {
  id: string;
  name: string;
  location: string;
  protocol: StreamProtocol;
  url: string;
  pingMs: number;
  jitterMs: number;
  status: 'optimal' | 'good' | 'poor' | 'checking';
  packetLoss: number; // 0 to 100
}

export interface FeatureFlags {
  voiceChanger: boolean;
  instantClip: boolean;
  gameBoost: boolean;
  dmcaProtection: boolean;
  textToSpeech: boolean;
  virtualCam: boolean;
  networkBooster: boolean;
  adaptiveBitrate: boolean;
  emergencyNetBoost: boolean;
}

export interface OverlayTemplate {
  id: string;
  name: string;
  category: 'gaming' | 'podcast' | 'minimal' | 'retro' | 'esports';
  accentColor: string;
  description: string;
  isDefault?: boolean;
}

export interface CustomIngest {
  id: string;
  name: string;
  protocol: StreamProtocol;
  url: string;
  enabled: boolean;
}

export interface AdminNetworkConfig {
  abrEnabled: boolean;
  fecRecoveryEnabled: boolean;
  emergencyBoostEnabled: boolean;
  preferredProtocol: StreamProtocol;
  dscpQosTagging: boolean;
  fecBufferMs: number;
  autoPingIntervalSeconds: number;
}

export interface AdminConfig {
  featureFlags: FeatureFlags;
  overlayTemplates: OverlayTemplate[];
  customIngests: CustomIngest[];
  nvencGpuId: number;
  networkConfig: AdminNetworkConfig;
  apiKeys: {
    twitchClientId: string;
    youtubeApiKey: string;
    kickWebhookUrl: string;
  };
}

