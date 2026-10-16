import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Scene,
  SourceItem,
  SourceType,
  AudioChannel,
  AudioFilterConfig,
  AudioPresetType,
  VoiceChangerEffect,
  TtsConfig,
  StreamSettings,
  StreamAlert,
  ChatMessage,
  UnifiedFeedItem,
  StudioStats,
  AdminConfig,
  OverlayTemplate,
  NetworkStats,
  IngestServerPing,
} from './types/studio';
import { audioEngine } from './services/audioEngine';
import { compositor } from './services/compositor';
import { networkBooster } from './services/networkBooster';
import { HeaderBar } from './components/HeaderBar';
import { Viewport } from './components/Viewport';
import { ScenesDock } from './components/ScenesDock';
import { SourcesDock } from './components/SourcesDock';
import { AudioMixerDock } from './components/AudioMixerDock';
import { SoundboardDock } from './components/SoundboardDock';
import { ControlsDock } from './components/ControlsDock';
import { UnifiedChatAlertsDock } from './components/UnifiedChatAlertsDock';
import { StatsBar } from './components/StatsBar';
import { SettingsModal } from './components/SettingsModal';
import { AudioFiltersModal } from './components/AudioFiltersModal';
import { SourcePropertiesModal } from './components/SourcePropertiesModal';
import { InstantClipModal } from './components/InstantClipModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { NetworkBoosterModal } from './components/NetworkBoosterModal';

export default function App() {
  // Admin Configuration & Dynamic Feature Flags
  const [adminConfig, setAdminConfig] = useState<AdminConfig>({
    featureFlags: {
      voiceChanger: true,
      instantClip: true,
      gameBoost: true,
      dmcaProtection: true,
      textToSpeech: true,
      virtualCam: true,
      networkBooster: true,
      adaptiveBitrate: true,
      emergencyNetBoost: true,
    },
    networkConfig: {
      abrEnabled: true,
      fecRecoveryEnabled: true,
      emergencyBoostEnabled: true,
      preferredProtocol: 'SRT',
      dscpQosTagging: true,
      fecBufferMs: 120,
      autoPingIntervalSeconds: 30,
    },
    overlayTemplates: [
      {
        id: 'tmpl_1',
        name: 'سايبربانك نيون 2077',
        category: 'gaming',
        accentColor: '#ec4899',
        description: 'إطار كاميرا مشع باللون الوردي والأزرق مع شريط أهداف متوهج',
      },
      {
        id: 'tmpl_2',
        name: 'بودكاست هادئ ونظيف',
        category: 'podcast',
        accentColor: '#38bdf8',
        description: 'تصميم بسيط غير مشتت يركز على الكاميرات وأسماء المتحدثين',
      },
      {
        id: 'tmpl_3',
        name: 'رياضات إلكترونية وبطولات',
        category: 'esports',
        accentColor: '#f59e0b',
        description: 'إحصائيات الفرق، شريط النتيجة المباشر، وتنبيهات الرعاة',
      },
    ],
    customIngests: [
      {
        id: 'ing_1',
        name: 'خادم الشرق الأوسط فائق السرعة (SRT)',
        protocol: 'SRT',
        url: 'srt://me-central.streamstudio.io:9000?latency=80',
        enabled: true,
      },
      {
        id: 'ing_2',
        name: 'سيرفر النسخ الاحتياطي (RTMP Backup)',
        protocol: 'RTMP',
        url: 'rtmp://backup.streamstudio.io/live',
        enabled: true,
      },
    ],
    nvencGpuId: 0,
    apiKeys: {
      twitchClientId: 'tc_live_8912781923_sec',
      youtubeApiKey: 'AIzaSyA8912093_yt_live',
      kickWebhookUrl: 'https://webhook.kick.com/api/v1/streamstudio',
    },
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Initial Scenes & Sources
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: 'scene_main',
      name: 'مشهد البث واللعب (Main Live)',
      hotkey: 'F1',
      sources: [
        {
          id: 'src_game',
          name: 'التقاط الشاشة والألعاب (Display Capture)',
          type: 'display',
          visible: true,
          locked: false,
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          zIndex: 1,
          opacity: 1,
          filters: {},
        },
        {
          id: 'src_camera',
          name: 'كاميرا الويب (Facecam)',
          type: 'camera',
          visible: true,
          locked: false,
          x: 1420,
          y: 680,
          width: 460,
          height: 360,
          zIndex: 2,
          opacity: 1,
          filters: {
            chromaKey: {
              enabled: true,
              color: '#00ff00',
              similarity: 0.4,
              smoothness: 0.1,
            },
          },
        },
        {
          id: 'src_widget',
          name: 'ودجت الهدف (Browser Source)',
          type: 'browser',
          visible: true,
          locked: false,
          x: 40,
          y: 40,
          width: 380,
          height: 90,
          zIndex: 3,
          opacity: 0.95,
          filters: {},
        },
        {
          id: 'src_ticker',
          name: 'شريط الأخبار (News Ticker)',
          type: 'text',
          visible: true,
          locked: false,
          x: 0,
          y: 1020,
          width: 1920,
          height: 60,
          zIndex: 4,
          opacity: 0.9,
          filters: {},
          customData: {
            text: '🔴 بث مباشر بجودة 1080p60 | مرحباً بكم في البث التفاعلي | لا تنسوا دعم القناة والاشتراك 🚀',
            textColor: '#ffffff',
            bgColor: 'rgba(15, 23, 42, 0.85)',
            fontSize: 22,
          },
        },
        {
          id: 'src_alerts',
          name: 'طبقة التنبيهات (Alerts Overlay)',
          type: 'alert_overlay',
          visible: true,
          locked: true,
          x: 720,
          y: 60,
          width: 480,
          height: 110,
          zIndex: 5,
          opacity: 1,
          filters: {},
        },
        {
          id: 'src_chat',
          name: 'شات البث المباشر (Chat Overlay)',
          type: 'chat_overlay',
          visible: true,
          locked: false,
          x: 40,
          y: 720,
          width: 360,
          height: 280,
          zIndex: 6,
          opacity: 0.9,
          filters: {},
        },
      ],
    },
    {
      id: 'scene_facecam',
      name: 'كاميرا كاملة (Full Facecam)',
      hotkey: 'F2',
      sources: [
        {
          id: 'src_camera_full',
          name: 'كاميرا الويب الرئيسية (Webcam)',
          type: 'camera',
          visible: true,
          locked: true,
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          zIndex: 1,
          opacity: 1,
          filters: {},
        },
        {
          id: 'src_chat_facecam',
          name: 'شات البث (Live Chat)',
          type: 'chat_overlay',
          visible: true,
          locked: false,
          x: 60,
          y: 700,
          width: 380,
          height: 320,
          zIndex: 2,
          opacity: 0.95,
          filters: {},
        },
      ],
    },
    {
      id: 'scene_starting',
      name: 'البداية والانتظار (Starting Soon)',
      hotkey: 'F3',
      sources: [
        {
          id: 'src_bg_starting',
          name: 'خلفية البداية (Color/Wallpaper)',
          type: 'color',
          visible: true,
          locked: true,
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          zIndex: 1,
          opacity: 1,
          filters: {},
          customData: {
            bgColor: '#0f172a',
          },
        },
        {
          id: 'src_title_starting',
          name: 'عنوان البداية (Title)',
          type: 'text',
          visible: true,
          locked: false,
          x: 460,
          y: 480,
          width: 1000,
          height: 120,
          zIndex: 2,
          opacity: 1,
          filters: {},
          customData: {
            text: 'البث سيبدأ قريباً... جهز مشروبك واستعد!',
            textColor: '#38bdf8',
            bgColor: 'transparent',
            fontSize: 36,
          },
        },
      ],
    },
    {
      id: 'scene_ending',
      name: 'نهاية البث (Stream Ending)',
      hotkey: 'F4',
      sources: [
        {
          id: 'src_bg_ending',
          name: 'خلفية النهاية',
          type: 'color',
          visible: true,
          locked: true,
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          zIndex: 1,
          opacity: 1,
          filters: {},
          customData: {
            bgColor: '#18181b',
          },
        },
        {
          id: 'src_title_ending',
          name: 'شكراً للمشاهدة',
          type: 'text',
          visible: true,
          locked: false,
          x: 500,
          y: 500,
          width: 920,
          height: 100,
          zIndex: 2,
          opacity: 1,
          filters: {},
          customData: {
            text: 'شكراً لحضوركم البث المباشر! نلقاكم في البث القادم ❤️',
            textColor: '#f43f5e',
            bgColor: 'transparent',
            fontSize: 32,
          },
        },
      ],
    },
  ]);

  const [activeSceneId, setActiveSceneId] = useState<string>('scene_main');
  const [previewSceneId, setPreviewSceneId] = useState<string>('scene_facecam');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Audio Channels with Presets and App Audio Isolation
  const [audioChannels, setAudioChannels] = useState<AudioChannel[]>([
    {
      id: 'desktop_audio',
      name: 'Desktop Audio',
      nameAr: 'صوت النظام (Desktop)',
      volume: 0.85,
      volumeDb: -1.4,
      muted: false,
      solo: false,
      pan: 0,
      peakLevel: -12,
      rmsLevel: -18,
      isolatedApp: 'all',
      filters: {
        aiNoiseSuppression: { enabled: false, intensity: 50 },
        noiseGate: { enabled: false, threshold: -45, attack: 10, release: 50 },
        compressor: { enabled: true, threshold: -18, ratio: 3.5, attack: 0.02, release: 0.15, makeupGain: 2 },
        eq: { enabled: true, low: 1.5, mid: 0, high: 2 },
        gain: { enabled: false, gainDb: 0 },
        syncOffsetMs: 0,
        monitoring: 'off',
        tracks: [true, true, false, false, false, false],
        activePreset: 'clean_studio',
      },
    },
    {
      id: 'mic_aux',
      name: 'Mic / Aux',
      nameAr: 'الميكروفون (Mic / Aux)',
      volume: 1.0,
      volumeDb: 0,
      muted: false,
      solo: false,
      pan: 0,
      peakLevel: -24,
      rmsLevel: -30,
      isLiveMic: false,
      filters: {
        aiNoiseSuppression: { enabled: true, intensity: 75 },
        noiseGate: { enabled: true, threshold: -42, attack: 5, release: 60 },
        compressor: { enabled: true, threshold: -16, ratio: 4.0, attack: 0.01, release: 0.1, makeupGain: 3.5 },
        eq: { enabled: true, low: -2.5, mid: 2.5, high: 4.0 },
        gain: { enabled: true, gainDb: 2 },
        syncOffsetMs: 0,
        monitoring: 'off',
        tracks: [true, false, true, false, false, false],
        activePreset: 'crisp_voice',
        voiceChanger: 'off',
      },
    },
    {
      id: 'game_audio',
      name: 'Game Capture Audio',
      nameAr: 'صوت اللعبة (Game Audio)',
      volume: 0.75,
      volumeDb: -2.5,
      muted: false,
      solo: false,
      pan: 0,
      peakLevel: -15,
      rmsLevel: -22,
      isolatedApp: 'game',
      filters: {
        aiNoiseSuppression: { enabled: false, intensity: 30 },
        noiseGate: { enabled: false, threshold: -50, attack: 10, release: 50 },
        compressor: { enabled: false, threshold: -12, ratio: 2.0, attack: 0.05, release: 0.2, makeupGain: 0 },
        eq: { enabled: false, low: 0, mid: 0, high: 0 },
        gain: { enabled: false, gainDb: 0 },
        syncOffsetMs: 0,
        monitoring: 'off',
        tracks: [true, false, false, true, false, false],
        activePreset: 'custom',
      },
    },
    {
      id: 'discord_audio',
      name: 'Discord / Voice Chat',
      nameAr: 'صوت الاتصال (Discord)',
      volume: 0.8,
      volumeDb: -1.9,
      muted: false,
      solo: false,
      pan: 0,
      peakLevel: -20,
      rmsLevel: -26,
      isolatedApp: 'discord',
      filters: {
        aiNoiseSuppression: { enabled: true, intensity: 85 },
        noiseGate: { enabled: true, threshold: -46, attack: 10, release: 70 },
        compressor: { enabled: true, threshold: -14, ratio: 3.0, attack: 0.02, release: 0.15, makeupGain: 1.5 },
        eq: { enabled: false, low: 0, mid: 1, high: 1 },
        gain: { enabled: false, gainDb: 0 },
        syncOffsetMs: 0,
        monitoring: 'off',
        tracks: [true, false, false, false, true, false],
        activePreset: 'gaming_comms',
      },
    },
    {
      id: 'media_player',
      name: 'Media Player Sound',
      nameAr: 'صوت الموسيقى (Spotify)',
      volume: 0.7,
      volumeDb: -3.1,
      muted: false,
      solo: false,
      pan: 0,
      peakLevel: -18,
      rmsLevel: -24,
      isolatedApp: 'spotify',
      dmcaVodMute: true,
      filters: {
        aiNoiseSuppression: { enabled: false, intensity: 20 },
        noiseGate: { enabled: false, threshold: -50, attack: 10, release: 50 },
        compressor: { enabled: false, threshold: -12, ratio: 2.0, attack: 0.05, release: 0.2, makeupGain: 0 },
        eq: { enabled: false, low: 0, mid: 0, high: 0 },
        gain: { enabled: false, gainDb: 0 },
        syncOffsetMs: 0,
        monitoring: 'off',
        tracks: [true, false, false, false, false, true],
        activePreset: 'custom',
      },
    },
  ]);

  // Streaming & Hardware Settings
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    service: 'twitch',
    protocol: 'RTMP',
    serverUrl: 'rtmp://live.twitch.tv/app/',
    streamKey: 'live_user_xyz_98234821',
    srtLatency: 120,
    srtMode: 'caller',
    encoder: 'NVENC_H264',
    rateControl: 'CBR',
    bitrate: 6000,
    keyframeInterval: 2,
    preset: 'P6_QUALITY',
    profile: 'high',
    audioBitrate: 160,
    baseResolution: '1920x1080',
    outputResolution: '1920x1080',
    fps: 60,
  });

  // State flags
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVirtualCam, setIsVirtualCam] = useState(false);
  const [isStudioMode, setIsStudioMode] = useState(false);
  const [isGameBoost, setIsGameBoost] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);

  // Voice Changer, Soundboard, Auto-Ducking & TTS state
  const [activeVoiceEffect, setActiveVoiceEffect] = useState<VoiceChangerEffect>('off');
  const [showSoundboard, setShowSoundboard] = useState(false);
  const [isAutoDuckingEnabled, setIsAutoDuckingEnabled] = useState(true);
  const [ttsConfig, setTtsConfig] = useState<TtsConfig>({
    enabled: true,
    voiceLang: 'ar-SA',
    rate: 1.05,
    pitch: 1.0,
    volume: 1.0,
    autoReadDonations: true,
  });

  // Timers & Stats
  const [streamDuration, setStreamDuration] = useState(0);
  const [recordDuration, setRecordDuration] = useState(0);

  const [stats, setStats] = useState<StudioStats>({
    fps: 60.0,
    cpuPercent: 3.4,
    gpuPercent: 18.5,
    nvencLoadPercent: 14.8,
    droppedFramesCount: 0,
    droppedFramesPercent: 0,
    currentBitrateKbps: 6000,
    memoryUsageMb: 320,
    uptimeSeconds: 0,
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFiltersChannel, setActiveFiltersChannel] = useState<AudioChannel | null>(null);
  const [activePropertySource, setActivePropertySource] = useState<SourceItem | null>(null);

  // Instant Clip modal state
  const [isInstantClipOpen, setIsInstantClipOpen] = useState(false);
  const [clipFormat, setClipFormat] = useState<'16:9' | '9:16'>('16:9');
  const [clipPreviewUrl, setClipPreviewUrl] = useState<string | null>(null);
  const [clipBlob, setClipBlob] = useState<Blob | null>(null);

  // Network Booster & Server Selector State
  const [networkStats, setNetworkStats] = useState<NetworkStats>(networkBooster.getStats());
  const [ingestServers, setIngestServers] = useState<IngestServerPing[]>(networkBooster.getIngests());
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);

  // Subscribe to live network booster telemetry
  useEffect(() => {
    const unsub = networkBooster.subscribe((newStats) => {
      setNetworkStats(newStats);
    });
    return () => unsub();
  }, []);

  // Sync stream target bitrate with network booster
  useEffect(() => {
    networkBooster.setTargetBitrate(streamSettings.bitrate);
  }, [streamSettings.bitrate]);

  // Unified Feed: Chat + Alerts
  const [activeAlert, setActiveAlert] = useState<StreamAlert | null>(null);
  const [unifiedFeed, setUnifiedFeed] = useState<UnifiedFeedItem[]>([
    {
      id: 'feed_1',
      kind: 'chat',
      timestamp: '19:42',
      chat: {
        id: 'msg_1',
        platform: 'twitch',
        username: 'سلطان_الرياض',
        color: '#38bdf8',
        message: 'السلام عليكم يا أسطورة، جودة البث خرافية اليوم! 🔥',
        timestamp: '19:42',
        isSub: true,
      },
    },
    {
      id: 'feed_2',
      kind: 'alert',
      timestamp: '19:43',
      alert: {
        id: 'alert_init_1',
        type: 'donation',
        username: 'عبدالله_الشمري',
        amount: '20.00$',
        message: 'استمر يا بطل، أحسن ستريمر!',
        timestamp: '19:43',
      },
    },
    {
      id: 'feed_3',
      kind: 'chat',
      timestamp: '19:44',
      chat: {
        id: 'msg_2',
        platform: 'youtube',
        username: 'Gamer_Pro_99',
        color: '#f43f5e',
        message: 'الصوت متناسق جداً مع صورة اللعبة بدون أي تأخير 👏',
        timestamp: '19:44',
        isMod: true,
      },
    },
  ]);

  // Extract raw chat messages for on-canvas overlay
  const chatMessages: ChatMessage[] = unifiedFeed
    .filter((f) => f.kind === 'chat' && f.chat)
    .map((f) => f.chat!);

  // Audio Context Initialization
  useEffect(() => {
    const handleFirstGesture = () => {
      audioEngine.ensureContext();
      audioChannels.forEach((ch) => audioEngine.setupChannel(ch));
      window.removeEventListener('click', handleFirstGesture);
    };
    window.addEventListener('click', handleFirstGesture);
    return () => window.removeEventListener('click', handleFirstGesture);
  }, [audioChannels]);

  // Global hotkeys for Instant Scene Profiles (F1, F2, F3, F4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['F1', 'F2', 'F3', 'F4'].includes(e.key)) {
        e.preventDefault();
        const index = ['F1', 'F2', 'F3', 'F4'].indexOf(e.key);
        if (scenes[index]) {
          setActiveSceneId(scenes[index].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenes]);

  // Audio Meters Real-time Animation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioChannels((prevChannels) =>
        prevChannels.map((channel) => {
          if (channel.muted) {
            return { ...channel, peakLevel: -60, rmsLevel: -60 };
          }
          const levels = audioEngine.getChannelLevels(channel.id);
          const jitter = (Math.random() - 0.5) * 4;
          const peak = Math.max(-60, Math.min(0, (levels.peakDb > -58 ? levels.peakDb : -24) + jitter));
          const rms = Math.max(-60, Math.min(0, peak - 6));
          return {
            ...channel,
            peakLevel: peak,
            rmsLevel: rms,
          };
        })
      );
    }, isGameBoost ? 120 : 60);

    return () => clearInterval(interval);
  }, [isGameBoost]);

  // Telemetry loop for Stats (modulating with Game Boost mode)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isStreaming) setStreamDuration((d) => d + 1);
      if (isRecording) setRecordDuration((d) => d + 1);

      const cpuBase = isGameBoost ? 1.4 : 3.4;
      const gpuBase = isGameBoost ? 8.5 : 18.2;
      const nvencBase = isGameBoost ? 9.8 : 14.5;

      setStats((prev) => ({
        ...prev,
        fps: 59.95 + (Math.random() - 0.5) * 0.1,
        cpuPercent: cpuBase + Math.random() * 0.5,
        gpuPercent: gpuBase + Math.random() * 1.5,
        nvencLoadPercent: isStreaming || isRecording ? nvencBase + Math.random() * 1.2 : 1.8,
        currentBitrateKbps: isStreaming ? streamSettings.bitrate + Math.round((Math.random() - 0.5) * 60) : 0,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [isStreaming, isRecording, isGameBoost, streamSettings.bitrate]);

  // Active scene lookup
  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];
  const previewScene = scenes.find((s) => s.id === previewSceneId) || scenes[1];

  // Game Boost Mode Toggle
  const handleToggleGameBoost = () => {
    const nextState = !isGameBoost;
    setIsGameBoost(nextState);
    compositor.setGameBoostMode(nextState);
  };

  // Instant Clip Generator
  const handleInstantClip = async (format: '16:9' | '9:16' = '16:9') => {
    try {
      setClipFormat(format);
      const result = await compositor.captureInstantClip(format);
      setClipBlob(result.blob);
      setClipPreviewUrl(result.previewUrl);
      setIsInstantClipOpen(true);
    } catch (e) {
      console.warn('Failed to capture instant clip:', e);
    }
  };

  const handleChangeClipFormat = async (newFormat: '16:9' | '9:16') => {
    setClipFormat(newFormat);
    try {
      const result = await compositor.captureInstantClip(newFormat);
      setClipBlob(result.blob);
      setClipPreviewUrl(result.previewUrl);
    } catch (e) {
      console.warn('Format change clip capture error:', e);
    }
  };

  // Network Booster Handlers
  const handleRunPingTest = async () => {
    setIsTestingPing(true);
    const best = await networkBooster.runAutoPingTest((currentList) => {
      setIngestServers(currentList);
    });
    setIsTestingPing(false);
    setStreamSettings((prev) => ({
      ...prev,
      serverUrl: best.url,
      protocol: best.protocol,
    }));
    setUnifiedFeed((prev) => [
      ...prev,
      {
        id: `feed_${Date.now()}`,
        kind: 'chat',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chat: {
          id: `msg_${Date.now()}`,
          platform: 'system',
          username: 'Network Booster',
          color: '#06b6d4',
          message: `⚡ تم فحص الخوادم واختيار الأسرع تلقائياً: ${best.name} (${best.pingMs}ms)`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      },
    ]);
  };

  const handleSelectIngestServer = (server: IngestServerPing) => {
    networkBooster.setActiveServer(server);
    setStreamSettings((prev) => ({
      ...prev,
      serverUrl: server.url,
      protocol: server.protocol,
    }));
    setUnifiedFeed((prev) => [
      ...prev,
      {
        id: `feed_${Date.now()}`,
        kind: 'chat',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chat: {
          id: `msg_${Date.now()}`,
          platform: 'system',
          username: 'Network Selector',
          color: '#06b6d4',
          message: `🌐 تم الاتصال مع خادم [${server.name}] عبر بروتوكول ${server.protocol}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      },
    ]);
  };

  const handleToggleAdaptiveBitrate = (enabled: boolean) => {
    networkBooster.setAdaptiveBitrate(enabled);
  };

  const handleToggleEmergencyBoost = (enabled: boolean) => {
    networkBooster.setEmergencyBoost(enabled);
    setUnifiedFeed((prev) => [
      ...prev,
      {
        id: `feed_${Date.now()}`,
        kind: 'chat',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chat: {
          id: `msg_${Date.now()}`,
          platform: 'system',
          username: 'Net-Boost QoS',
          color: '#06b6d4',
          message: enabled
            ? '🚀 تم تفعيل وضع مقوي الشبكة الطارئ: توجيه كامل النطاق للبث وتفعيل وسم DSCP AF41'
            : 'تم إيقاف وضع مقوي الشبكة الطارئ',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      },
    ]);
  };

  // Scene Operations
  const handleSelectScene = (id: string) => {
    if (isStudioMode) {
      setPreviewSceneId(id);
    } else {
      setActiveSceneId(id);
    }
  };

  const handleAddScene = (name: string) => {
    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      name,
      sources: [
        {
          id: `src_${Date.now()}`,
          name: 'خلفية المشهد (Background)',
          type: 'color',
          visible: true,
          locked: true,
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          zIndex: 1,
          opacity: 1,
          filters: {},
          customData: { bgColor: '#0f172a' },
        },
      ],
    };
    setScenes([...scenes, newScene]);
    setActiveSceneId(newScene.id);
  };

  const handleDuplicateScene = (id: string) => {
    const original = scenes.find((s) => s.id === id);
    if (!original) return;
    const duplicated: Scene = {
      ...original,
      id: `scene_${Date.now()}`,
      name: `${original.name} (نسخة)`,
      sources: original.sources.map((src) => ({
        ...src,
        id: `src_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      })),
    };
    setScenes([...scenes, duplicated]);
  };

  const handleDeleteScene = (id: string) => {
    if (scenes.length <= 1) return;
    const filtered = scenes.filter((s) => s.id !== id);
    setScenes(filtered);
    if (activeSceneId === id) {
      setActiveSceneId(filtered[0].id);
    }
  };

  const handleReorderScene = (id: string, direction: 'up' | 'down') => {
    const idx = scenes.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= scenes.length) return;
    const newScenes = [...scenes];
    const [moved] = newScenes.splice(idx, 1);
    newScenes.splice(newIdx, 0, moved);
    setScenes(newScenes);
  };

  const handleRenameScene = (id: string, newName: string) => {
    setScenes(scenes.map((s) => (s.id === id ? { ...s, name: newName } : s)));
  };

  // Source Operations
  const handleToggleSourceVisibility = (sourceId: string) => {
    setScenes(
      scenes.map((scene) => {
        if (scene.id !== activeSceneId) return scene;
        return {
          ...scene,
          sources: scene.sources.map((src) =>
            src.id === sourceId ? { ...src, visible: !src.visible } : src
          ),
        };
      })
    );
  };

  const handleToggleSourceLock = (sourceId: string) => {
    setScenes(
      scenes.map((scene) => {
        if (scene.id !== activeSceneId) return scene;
        return {
          ...scene,
          sources: scene.sources.map((src) =>
            src.id === sourceId ? { ...src, locked: !src.locked } : src
          ),
        };
      })
    );
  };

  const handleDeleteSource = (sourceId: string) => {
    setScenes(
      scenes.map((scene) => {
        if (scene.id !== activeSceneId) return scene;
        return {
          ...scene,
          sources: scene.sources.filter((src) => src.id !== sourceId),
        };
      })
    );
    if (selectedSourceId === sourceId) {
      setSelectedSourceId(null);
    }
    compositor.removeVideo(sourceId);
  };

  const handleReorderSource = (sourceId: string, direction: 'up' | 'down') => {
    setScenes(
      scenes.map((scene) => {
        if (scene.id !== activeSceneId) return scene;
        const sorted = [...scene.sources].sort((a, b) => b.zIndex - a.zIndex);
        const idx = sorted.findIndex((s) => s.id === sourceId);
        if (idx === -1) return scene;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= sorted.length) return scene;

        const tempZ = sorted[idx].zIndex;
        sorted[idx].zIndex = sorted[targetIdx].zIndex;
        sorted[targetIdx].zIndex = tempZ;

        return { ...scene, sources: sorted };
      })
    );
  };

  const handleAddSource = (type: SourceType) => {
    const names: Record<SourceType, string> = {
      camera: 'كاميرا الويب (Camera)',
      display: 'التقاط الشاشة (Display Capture)',
      media: 'مشغل الوسائط (Media Player)',
      image: 'صورة (Image)',
      color: 'مصدر لون (Color Source)',
      text: 'نص متحرك (Text Ticker)',
      browser: 'متصفح ويب (Browser Source)',
      alert_overlay: 'طبقة التنبيهات (Alerts Overlay)',
      chat_overlay: 'شات البث (Chat Overlay)',
    };

    const maxZ = Math.max(0, ...activeScene.sources.map((s) => s.zIndex));

    const newSource: SourceItem = {
      id: `src_${Date.now()}`,
      name: names[type] || 'مصدر جديد',
      type,
      visible: true,
      locked: false,
      x: type === 'camera' ? 1400 : 200,
      y: type === 'camera' ? 650 : 200,
      width: type === 'camera' ? 480 : type === 'text' ? 1520 : 800,
      height: type === 'camera' ? 360 : type === 'text' ? 60 : 450,
      zIndex: maxZ + 1,
      opacity: 1,
      filters: {},
      customData: {
        text: type === 'text' ? 'شريط نصي مخصص للبث المباشر' : undefined,
        bgColor: type === 'color' ? '#1e293b' : undefined,
      },
    };

    setScenes(
      scenes.map((s) => (s.id === activeSceneId ? { ...s, sources: [...s.sources, newSource] } : s))
    );
    setSelectedSourceId(newSource.id);
  };

  const handleApplyOverlayTemplate = (template: OverlayTemplate) => {
    const maxZ = Math.max(0, ...activeScene.sources.map((s) => s.zIndex));
    const overlaySource: SourceItem = {
      id: `overlay_${Date.now()}`,
      name: `تراكب [${template.name}]`,
      type: 'browser',
      visible: true,
      locked: false,
      x: 35,
      y: 35,
      width: 460,
      height: 95,
      zIndex: maxZ + 1,
      opacity: 0.95,
      filters: {},
      customData: {
        bgColor: template.accentColor,
        text: template.name,
      },
    };

    setScenes(
      scenes.map((s) =>
        s.id === activeSceneId ? { ...s, sources: [...s.sources, overlaySource] } : s
      )
    );
    setSelectedSourceId(overlaySource.id);

    // Notify stream feed
    setUnifiedFeed((prev) => [
      ...prev,
      {
        id: `feed_${Date.now()}`,
        kind: 'chat',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chat: {
          id: `msg_${Date.now()}`,
          platform: 'system',
          username: 'Overlay Engine',
          color: template.accentColor,
          message: `✨ تم تطبيق قالب [${template.name}] بنجاح على المشهد الحاضر!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      },
    ]);
  };

  const handleDropMediaFile = (file: File) => {
    const isVideo = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');
    const type: SourceType = isVideo ? 'media' : isImg ? 'image' : 'color';

    const maxZ = Math.max(0, ...activeScene.sources.map((s) => s.zIndex));
    const newSource: SourceItem = {
      id: `src_drop_${Date.now()}`,
      name: file.name,
      type,
      visible: true,
      locked: false,
      x: 300,
      y: 200,
      width: 800,
      height: 450,
      zIndex: maxZ + 1,
      opacity: 1,
      filters: {},
    };

    setScenes(
      scenes.map((s) => (s.id === activeSceneId ? { ...s, sources: [...s.sources, newSource] } : s))
    );
    setSelectedSourceId(newSource.id);
  };

  const handleUpdateSourceTransform = (sourceId: string, updates: Partial<SourceItem>) => {
    setScenes(
      scenes.map((scene) => {
        if (scene.id !== activeSceneId) return scene;
        return {
          ...scene,
          sources: scene.sources.map((src) =>
            src.id === sourceId ? { ...src, ...updates } : src
          ),
        };
      })
    );
  };

  // Real Hardware Media Attachments
  const handleConnectWebcam = async (sourceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      compositor.attachStreamToVideo(sourceId, stream);
      handleUpdateSourceTransform(sourceId, { mediaStream: stream });
    } catch (err) {
      console.warn('Webcam permission not granted or device unavailable:', err);
    }
  };

  const handleConnectScreenCapture = async (sourceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      compositor.attachStreamToVideo(sourceId, stream);
      handleUpdateSourceTransform(sourceId, { mediaStream: stream });
    } catch (err) {
      console.warn('Screen capture cancelled or unavailable:', err);
    }
  };

  const handleConnectMicrophone = async () => {
    const success = await audioEngine.connectMicrophone();
    setIsMicActive(success);
  };

  // Voice Changer & Auto-Ducking
  const handleSelectVoiceEffect = (effect: VoiceChangerEffect) => {
    setActiveVoiceEffect(effect);
    audioEngine.setVoiceChanger(effect);
  };

  const handleToggleAutoDucking = () => {
    const next = !isAutoDuckingEnabled;
    setIsAutoDuckingEnabled(next);
    audioEngine.setAutoDucking({ enabled: next });
  };

  // Audio Mixer Updates & Presets
  const handleUpdateVolume = (channelId: string, volume: number) => {
    setAudioChannels(
      audioChannels.map((c) => {
        if (c.id !== channelId) return c;
        const volumeDb = volume > 0 ? 20 * Math.log10(volume) : -60;
        audioEngine.updateVolume(channelId, volume, c.muted);
        return { ...c, volume, volumeDb };
      })
    );
  };

  const handleToggleMute = (channelId: string) => {
    setAudioChannels(
      audioChannels.map((c) => {
        if (c.id !== channelId) return c;
        const newMuted = !c.muted;
        audioEngine.updateVolume(channelId, c.volume, newMuted);
        return { ...c, muted: newMuted };
      })
    );
  };

  const handleUpdatePan = (channelId: string, pan: number) => {
    setAudioChannels(
      audioChannels.map((c) => {
        if (c.id !== channelId) return c;
        audioEngine.updatePan(channelId, pan);
        return { ...c, pan };
      })
    );
  };

  const handleApplyPreset = (channelId: string, preset: AudioPresetType) => {
    const presetConfig = audioEngine.getPresetConfig(preset);
    setAudioChannels(
      audioChannels.map((c) => {
        if (c.id !== channelId) return c;
        const updatedFilters: AudioFilterConfig = {
          ...c.filters,
          ...presetConfig,
          eq: { ...c.filters.eq, ...(presetConfig.eq || {}) },
          compressor: { ...c.filters.compressor, ...(presetConfig.compressor || {}) },
          noiseGate: { ...c.filters.noiseGate, ...(presetConfig.noiseGate || {}) },
          aiNoiseSuppression: {
            ...c.filters.aiNoiseSuppression,
            ...(presetConfig.aiNoiseSuppression || {}),
          },
          activePreset: preset,
        };
        audioEngine.updateFilters(channelId, updatedFilters);
        return { ...c, filters: updatedFilters };
      })
    );
  };

  const handleToggleAiDenoise = (channelId: string) => {
    setAudioChannels(
      audioChannels.map((c) => {
        if (c.id !== channelId) return c;
        const currentlyOn = c.filters.aiNoiseSuppression?.enabled ?? false;
        const updatedFilters: AudioFilterConfig = {
          ...c.filters,
          aiNoiseSuppression: {
            enabled: !currentlyOn,
            intensity: c.filters.aiNoiseSuppression?.intensity || 75,
          },
        };
        audioEngine.updateFilters(channelId, updatedFilters);
        return { ...c, filters: updatedFilters };
      })
    );
  };

  const handleToggleDmcaMute = (channelId: string) => {
    setAudioChannels(
      audioChannels.map((c) => (c.id === channelId ? { ...c, dmcaVodMute: !c.dmcaVodMute } : c))
    );
  };

  const handleSelectIsolatedApp = (channelId: string, app: string) => {
    setAudioChannels(
      audioChannels.map((c) => (c.id === channelId ? { ...c, isolatedApp: app } : c))
    );
  };

  const handleSaveFilters = (channelId: string, filters: AudioFilterConfig) => {
    setAudioChannels(
      audioChannels.map((c) => {
        if (c.id !== channelId) return c;
        audioEngine.updateFilters(channelId, filters);
        return { ...c, filters };
      })
    );
  };

  // Creator Services: Unified Chat & Alerts + TTS
  const handleTriggerAlert = (
    type: 'follow' | 'sub' | 'donation' | 'raid',
    customUser?: string,
    customAmount?: string
  ) => {
    audioEngine.playAlertSound(type);

    const usernames = ['فيصل_الغامدي', 'سارة_ستريمز', 'عبدالله_الشمري', 'Nawaf_Knight'];
    const selectedUser = customUser || usernames[Math.floor(Math.random() * usernames.length)];

    const alertItem: StreamAlert = {
      id: `alert_${Date.now()}`,
      type,
      username: selectedUser,
      amount: customAmount || (type === 'donation' ? '50.00$' : type === 'raid' ? '450' : undefined),
      message: type === 'donation' ? 'استمر يا مبدع، محتوى أسطوري!' : undefined,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveAlert(alertItem);
    setTimeout(() => {
      setActiveAlert(null);
    }, 4500);

    // TTS Speech Trigger on donations/subs if enabled in Admin Feature Flags
    if (adminConfig.featureFlags.textToSpeech && ttsConfig.autoReadDonations) {
      if (type === 'donation') {
        audioEngine.speakText(`تبرع جديد من ${selectedUser} بمبلغ ${alertItem.amount}. يقول: ${alertItem.message}`, ttsConfig.voiceLang);
      } else if (type === 'sub') {
        audioEngine.speakText(`مشترك جديد بالقناة: ${selectedUser}`, ttsConfig.voiceLang);
      }
    }

    // Push into unified feed
    setUnifiedFeed((prev) => [
      ...prev,
      {
        id: `feed_alert_${Date.now()}`,
        kind: 'alert',
        alert: alertItem,
        timestamp: alertItem.timestamp,
      },
    ]);
  };

  const handleSendMessage = (msg: string) => {
    const newChat: ChatMessage = {
      id: `chat_${Date.now()}`,
      platform: 'twitch',
      username: 'صانع_المحتوى (أنت)',
      color: '#a855f7',
      message: msg,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      isMod: true,
    };

    setUnifiedFeed((prev) => [
      ...prev,
      {
        id: `feed_chat_${Date.now()}`,
        kind: 'chat',
        chat: newChat,
        timestamp: newChat.timestamp,
      },
    ]);
  };

  // Broadcast & Recording controls
  const handleToggleStreaming = () => {
    if (!isStreaming) {
      audioEngine.ensureContext();
      setIsStreaming(true);
      setStreamDuration(0);
    } else {
      setIsStreaming(false);
    }
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      audioEngine.ensureContext();
      const started = compositor.startRecording((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `streamstudio-recording-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      });
      if (started) {
        setIsRecording(true);
        setRecordDuration(0);
      }
    } else {
      compositor.stopRecording();
      setIsRecording(false);
    }
  };

  const handleToggleVirtualCam = () => {
    setIsVirtualCam(!isVirtualCam);
  };

  const handleTransitionToProgram = (type: 'cut' | 'fade' | 'slide') => {
    setActiveSceneId(previewSceneId);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-['Cairo',sans-serif]">
      {/* Top Streamlined Navigation Bar for Creator */}
      <HeaderBar
        isStreaming={isStreaming}
        isRecording={isRecording}
        isVirtualCam={isVirtualCam}
        isStudioMode={isStudioMode}
        isGameBoost={isGameBoost}
        featureFlags={adminConfig.featureFlags}
        scenes={scenes}
        activeSceneId={activeSceneId}
        networkStats={networkStats}
        onOpenNetworkBooster={() => setIsNetworkModalOpen(true)}
        onSelectScene={handleSelectScene}
        onToggleGameBoost={handleToggleGameBoost}
        onInstantClip={() => handleInstantClip('16:9')}
        onToggleStudioMode={() => setIsStudioMode(!isStudioMode)}
        onToggleVirtualCam={handleToggleVirtualCam}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Scenes & Sources & Viewport & Audio */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas Viewport (Top stage) */}
          <div className="flex-1 flex overflow-hidden border-b border-zinc-800 min-h-[300px]">
            <Viewport
              activeScene={activeScene}
              previewScene={previewScene}
              isStudioMode={isStudioMode}
              isGameBoost={isGameBoost}
              selectedSourceId={selectedSourceId}
              onSelectSource={setSelectedSourceId}
              onUpdateSourceTransform={handleUpdateSourceTransform}
              onTransitionToProgram={handleTransitionToProgram}
              onDropMediaFile={handleDropMediaFile}
              activeAlert={activeAlert}
              chatMessages={chatMessages}
            />
          </div>

          {/* Soundboard Drawer (Collapsible & Conditioned by Admin Flag) */}
          {showSoundboard && adminConfig.featureFlags.voiceChanger && (
            <SoundboardDock
              activeVoiceEffect={activeVoiceEffect}
              onSelectVoiceEffect={handleSelectVoiceEffect}
              ttsConfig={ttsConfig}
              onUpdateTtsConfig={(u) => setTtsConfig((prev) => ({ ...prev, ...u }))}
            />
          )}

          {/* Bottom Docks Row: Scenes + Sources + Audio Mixer + Controls */}
          <div className="h-48 flex overflow-hidden bg-zinc-900/50 shrink-0">
            {/* 1. Scenes Dock */}
            <ScenesDock
              scenes={scenes}
              activeSceneId={activeSceneId}
              onSelectScene={handleSelectScene}
              onAddScene={handleAddScene}
              onDuplicateScene={handleDuplicateScene}
              onDeleteScene={handleDeleteScene}
              onReorderScene={handleReorderScene}
              onRenameScene={handleRenameScene}
            />

            {/* 2. Sources Dock */}
            <SourcesDock
              sources={activeScene.sources}
              selectedSourceId={selectedSourceId}
              onSelectSource={setSelectedSourceId}
              onToggleVisibility={handleToggleSourceVisibility}
              onToggleLock={handleToggleSourceLock}
              onDeleteSource={handleDeleteSource}
              onReorderSource={handleReorderSource}
              onAddSource={handleAddSource}
              onOpenProperties={(src) => setActivePropertySource(src)}
              overlayTemplates={adminConfig.overlayTemplates}
              onApplyTemplate={handleApplyOverlayTemplate}
            />

            {/* 3. Audio Mixer Dock */}
            <AudioMixerDock
              channels={audioChannels}
              onUpdateVolume={handleUpdateVolume}
              onToggleMute={handleToggleMute}
              onUpdatePan={handleUpdatePan}
              onOpenFilters={(ch) => setActiveFiltersChannel(ch)}
              onApplyPreset={handleApplyPreset}
              onToggleAiDenoise={handleToggleAiDenoise}
              onToggleDmcaMute={handleToggleDmcaMute}
              onSelectIsolatedApp={handleSelectIsolatedApp}
              onConnectMic={handleConnectMicrophone}
              isMicActive={isMicActive}
              isAutoDuckingEnabled={isAutoDuckingEnabled}
              onToggleAutoDucking={handleToggleAutoDucking}
              isDuckingActive={audioEngine.isDuckingActive()}
              activeVoiceEffect={activeVoiceEffect}
              showSoundboard={showSoundboard}
              onToggleSoundboard={() => setShowSoundboard(!showSoundboard)}
              featureFlags={adminConfig.featureFlags}
            />

            {/* 4. Controls Dock */}
            <ControlsDock
              isStreaming={isStreaming}
              isRecording={isRecording}
              isVirtualCam={isVirtualCam}
              isStudioMode={isStudioMode}
              onToggleStreaming={handleToggleStreaming}
              onToggleRecording={handleToggleRecording}
              onToggleVirtualCam={handleToggleVirtualCam}
              onToggleStudioMode={() => setIsStudioMode(!isStudioMode)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>

        {/* Right Side: Unified Interactive Chat & Alerts Widget */}
        <UnifiedChatAlertsDock
          feedItems={unifiedFeed}
          onSendMessage={handleSendMessage}
          onClearFeed={() => setUnifiedFeed([])}
          onTriggerAlert={handleTriggerAlert}
        />
      </div>

      {/* Bottom Technical Telemetry & Stats Bar */}
      <StatsBar
        stats={stats}
        isStreaming={isStreaming}
        isRecording={isRecording}
        streamDuration={streamDuration}
        recordDuration={recordDuration}
        settings={streamSettings}
        networkStats={networkStats}
      />

      {/* Creator Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={streamSettings}
        onSaveSettings={setStreamSettings}
        customIngests={adminConfig.customIngests}
      />

      <AudioFiltersModal
        isOpen={!!activeFiltersChannel}
        channel={activeFiltersChannel}
        onClose={() => setActiveFiltersChannel(null)}
        onSaveFilters={handleSaveFilters}
      />

      <SourcePropertiesModal
        isOpen={!!activePropertySource}
        source={activePropertySource}
        onClose={() => setActivePropertySource(null)}
        onSaveSource={handleUpdateSourceTransform}
        onConnectWebcam={handleConnectWebcam}
        onConnectScreenCapture={handleConnectScreenCapture}
      />

      {adminConfig.featureFlags.instantClip && (
        <InstantClipModal
          isOpen={isInstantClipOpen}
          onClose={() => setIsInstantClipOpen(false)}
          previewUrl={clipPreviewUrl}
          clipBlob={clipBlob}
          activeFormat={clipFormat}
          onChangeFormat={handleChangeClipFormat}
        />
      )}

      {/* Network & Stream Booster Modal (Interactive ABR, Best Server Selector, and Emergency Boost) */}
      <NetworkBoosterModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        networkStats={networkStats}
        ingestServers={ingestServers}
        onRunPingTest={handleRunPingTest}
        onSelectServer={handleSelectIngestServer}
        onToggleAdaptiveBitrate={handleToggleAdaptiveBitrate}
        onToggleEmergencyBoost={handleToggleEmergencyBoost}
        isTestingPing={isTestingPing}
      />

      {/* Dedicated Admin Dashboard Modal (Protected by PIN / Developer Key) */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminConfig={adminConfig}
        onUpdateAdminConfig={(u) => setAdminConfig((prev) => ({ ...prev, ...u }))}
        stats={stats}
        streamSettings={streamSettings}
      />
    </div>
  );
}
