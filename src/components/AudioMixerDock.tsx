import { AudioChannel, AudioPresetType, VoiceChangerEffect, FeatureFlags } from '../types/studio';
import {
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Mic,
  MicOff,
  Headphones,
  Settings,
  Sparkles,
  Zap,
  Shield,
  ShieldCheck,
  Radio,
  AppWindow,
  Sliders,
  Music,
  ArrowDownCircle,
} from 'lucide-react';

interface AudioMixerDockProps {
  channels: AudioChannel[];
  onUpdateVolume: (channelId: string, volume: number) => void;
  onToggleMute: (channelId: string) => void;
  onUpdatePan: (channelId: string, pan: number) => void;
  onOpenFilters: (channel: AudioChannel) => void;
  onApplyPreset: (channelId: string, preset: AudioPresetType) => void;
  onToggleAiDenoise: (channelId: string) => void;
  onToggleDmcaMute: (channelId: string) => void;
  onSelectIsolatedApp: (channelId: string, app: string) => void;
  onConnectMic: () => Promise<void>;
  isMicActive: boolean;
  isAutoDuckingEnabled: boolean;
  onToggleAutoDucking: () => void;
  isDuckingActive: boolean;
  activeVoiceEffect: VoiceChangerEffect;
  showSoundboard: boolean;
  onToggleSoundboard: () => void;
  featureFlags?: FeatureFlags;
}

export const AudioMixerDock: React.FC<AudioMixerDockProps> = ({
  channels,
  onUpdateVolume,
  onToggleMute,
  onUpdatePan,
  onOpenFilters,
  onApplyPreset,
  onToggleAiDenoise,
  onToggleDmcaMute,
  onSelectIsolatedApp,
  onConnectMic,
  isMicActive,
  isAutoDuckingEnabled,
  onToggleAutoDucking,
  isDuckingActive,
  activeVoiceEffect,
  showSoundboard,
  onToggleSoundboard,
  featureFlags,
}) => {
  const dbToPercent = (db: number) => {
    if (db <= -60) return 0;
    if (db >= 0) return 100;
    return ((db + 60) / 60) * 100;
  };

  const volumeToDbString = (vol: number) => {
    if (vol <= 0.001) return '-inf dB';
    const db = 20 * Math.log10(vol);
    return `${db >= 0 ? '+' : ''}${db.toFixed(1)} dB`;
  };

  const appIsolationOptions = [
    { id: 'all', label: 'كل أصوات النظام' },
    { id: 'game', label: 'اللعبة النشطة (DirectX/DXGI)' },
    { id: 'discord', label: 'ديسكورد (Discord Comms)' },
    { id: 'spotify', label: 'سبوتيفاي (Spotify Music)' },
    { id: 'browser', label: 'المتصفح (Chrome/Edge)' },
  ];

  return (
    <div className="flex-1 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full select-none overflow-hidden">
      {/* Header */}
      <div className="h-9 px-3 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-bold text-zinc-300">
            ميكسر الصوت الاحترافي (Advanced Audio Mixer)
          </span>

          {/* Auto-Ducking Live Badge */}
          <button
            onClick={onToggleAutoDucking}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
              isAutoDuckingEnabled
                ? isDuckingActive
                  ? 'bg-amber-600/30 text-amber-300 border-amber-500/50 animate-pulse'
                  : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
            title="الموازنة التلقائية (Auto-Ducking): خفض صوت اللعبة والموسيقى تلقائياً عند تحدث المذيع"
          >
            <ArrowDownCircle className={`w-3 h-3 ${isDuckingActive ? 'text-amber-400' : 'text-indigo-400'}`} />
            <span>
              {isAutoDuckingEnabled
                ? isDuckingActive
                  ? 'خفّض الصوت نشط (-10dB) 🎙️'
                  : 'Auto-Ducking مفعل'
                : 'Auto-Ducking معطل'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Soundboard Drawer Toggle (Conditioned by Admin Feature Flag) */}
          {(!featureFlags || featureFlags.voiceChanger) && (
            <button
              onClick={onToggleSoundboard}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer ${
                showSoundboard
                  ? 'bg-purple-600 text-white border-purple-500 shadow'
                  : 'bg-zinc-800 hover:bg-zinc-750 text-purple-300 border-purple-500/40'
              }`}
              title="فتح لوحة المؤثرات الصوتية ومغير الصوت الفوري"
            >
              <Music className="w-3 h-3" />
              <span>مغير الصوت والساوند بورد</span>
            </button>
          )}

          {/* Real Microphone Connect Button */}
          <button
            onClick={onConnectMic}
            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded font-semibold transition border cursor-pointer ${
              isMicActive
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border-zinc-700'
            }`}
            title="توصيل ميكروفون الحاسوب الحقيقي عبر Web Audio API"
          >
            {isMicActive ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-zinc-400" />}
            <span>{isMicActive ? 'الميكروفون متصل' : 'توصيل الميكروفون'}</span>
          </button>
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-x-auto p-2 flex gap-2">
        {channels.map((channel) => {
          const peakPct = channel.muted ? 0 : dbToPercent(channel.peakLevel);
          const rmsPct = channel.muted ? 0 : dbToPercent(channel.rmsLevel);
          const isAiDenoiseOn = channel.filters.aiNoiseSuppression?.enabled ?? false;
          const isMusicChannel = channel.id === 'media_player';
          const isMicChannel = channel.id === 'mic_aux';

          return (
            <div
              key={channel.id}
              className={`w-44 bg-zinc-950/60 rounded-xl border p-2 flex flex-col justify-between shrink-0 transition ${
                channel.dmcaVodMute ? 'border-amber-500/40' : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Channel Header & DMCA / Voice tag */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="truncate">
                    <div className="text-[11px] font-bold text-zinc-200 truncate flex items-center gap-1">
                      {channel.nameAr}
                    </div>
                    <div className="text-[9px] text-zinc-500 truncate">
                      {channel.name}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenFilters(channel)}
                    className="p-1 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded transition cursor-pointer"
                    title="فلاتر الصوت المتقدمة (EQ, Compressor, Noise Gate)"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* DMCA Protection Toggle (Controlled by Admin Feature Flag) */}
                {isMusicChannel && (!featureFlags || featureFlags.dmcaProtection) && (
                  <div className="mb-1">
                    <button
                      onClick={() => onToggleDmcaMute(channel.id)}
                      className={`w-full flex items-center justify-center gap-1 py-0.5 px-1.5 rounded text-[9px] font-bold border transition cursor-pointer ${
                        channel.dmcaVodMute
                          ? 'bg-amber-600/25 text-amber-300 border-amber-500/60 shadow'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                      title="حماية حقوق النشر الموسيقية DMCA: يعزل الموسيقى عن تسجيلات VOD تلقائياً لمنع الحظر"
                    >
                      <ShieldCheck className={`w-2.5 h-2.5 ${channel.dmcaVodMute ? 'text-amber-400' : 'text-zinc-500'}`} />
                      <span>{channel.dmcaVodMute ? '🛡️ حماية DMCA مفعلة' : 'تفعيل حماية DMCA'}</span>
                    </button>
                  </div>
                )}

                {/* Voice Changer Active Pill (On Mic Channel) */}
                {isMicChannel && activeVoiceEffect !== 'off' && (
                  <div className="mb-1 text-center">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[9px] font-bold">
                      <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                      مؤثر الصوت: {activeVoiceEffect}
                    </span>
                  </div>
                )}

                {/* App Audio Isolation Selector */}
                <div className="mb-1">
                  <select
                    value={channel.isolatedApp || 'all'}
                    onChange={(e) => onSelectIsolatedApp(channel.id, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 rounded px-1.5 py-0.5 outline-none font-sans"
                    title="فصل قناة الصوت لتطبيق محدد (Application Audio Isolation)"
                  >
                    {appIsolationOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AI Noise Suppression toggle */}
                <div className="flex items-center gap-1 mb-1">
                  <button
                    onClick={() => onToggleAiDenoise(channel.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-0.5 px-1.5 rounded text-[9px] font-bold border transition cursor-pointer ${
                      isAiDenoiseOn
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                    title="عزل الضوضاء الذكي (AI Noise Suppression)"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{isAiDenoiseOn ? 'AI عزل نشط' : 'عزل بالذكاء'}</span>
                  </button>
                </div>

                {/* Audio Presets Quick Dropdown */}
                <div className="flex items-center gap-1 mb-1">
                  <select
                    value={channel.filters.activePreset || 'custom'}
                    onChange={(e) => onApplyPreset(channel.id, e.target.value as AudioPresetType)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-[9px] text-indigo-300 font-semibold rounded px-1 py-0.5 outline-none cursor-pointer"
                    title="إعدادات صوت مسبقة احترافية جاهزة بنقرة واحدة"
                  >
                    <option value="custom">إعداد مخصص (Custom)</option>
                    <option value="warm_radio">🎙️ دافئ إذاعي (Warm Radio)</option>
                    <option value="crisp_voice">✨ صوت ناصع (Crisp Voice)</option>
                    <option value="bass_boost">🔊 تضخيم الباس (Bass Boost)</option>
                    <option value="gaming_comms">🎮 ألعاب وبودكاست (Podcast)</option>
                    <option value="clean_studio">🎧 استوديو نقي (Clean Studio)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic VU Meter Bar */}
              <div className="my-1.5 bg-zinc-900 rounded p-1 border border-zinc-850 flex flex-col gap-1">
                <div className="flex justify-between text-[8px] mono-font text-zinc-500 px-0.5">
                  <span>-60</span>
                  <span>-20</span>
                  <span>-9</span>
                  <span className="text-red-400">0</span>
                </div>

                {/* Left Channel Meter */}
                <div className="h-2 w-full bg-zinc-950 rounded-sm overflow-hidden relative">
                  <div
                    className="h-full transition-all duration-75"
                    style={{
                      width: `${peakPct}%`,
                      background: 'linear-gradient(to left, #ef4444 0%, #eab308 30%, #10b981 70%)',
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
                    style={{ left: `${rmsPct}%` }}
                  />
                </div>

                {/* Right Channel Meter */}
                <div className="h-2 w-full bg-zinc-950 rounded-sm overflow-hidden relative">
                  <div
                    className="h-full transition-all duration-75"
                    style={{
                      width: `${Math.max(0, peakPct * (1 + channel.pan * 0.2))}%`,
                      background: 'linear-gradient(to left, #ef4444 0%, #eab308 30%, #10b981 70%)',
                    }}
                  />
                </div>
              </div>

              {/* Fader & dB Readout */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] mono-font">
                  <span className="text-zinc-500">الحجم:</span>
                  <span
                    className={`font-bold ${
                      channel.muted ? 'text-red-400' : 'text-zinc-300'
                    }`}
                  >
                    {channel.muted ? 'مكتوم' : volumeToDbString(channel.volume)}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1.25"
                  step="0.01"
                  value={channel.volume}
                  onChange={(e) => onUpdateVolume(channel.id, Number(e.target.value))}
                  disabled={channel.muted}
                  className="w-full h-1.5 bg-zinc-800 rounded accent-indigo-500 cursor-pointer disabled:opacity-40"
                />

                {/* Balance / Pan Slider */}
                <div className="flex items-center justify-between text-[8px] text-zinc-500 pt-0.5">
                  <span>L</span>
                  <span className="mono-font text-zinc-400">
                    {channel.pan === 0 ? 'C' : `${Math.abs(Math.round(channel.pan * 100))}%`}
                  </span>
                  <span>R</span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={channel.pan}
                  onChange={(e) => onUpdatePan(channel.id, Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded accent-zinc-500 cursor-pointer"
                />
              </div>

              {/* Bottom Actions: Mute */}
              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-zinc-800/60 mt-1">
                <button
                  onClick={() => onToggleMute(channel.id)}
                  className={`flex-1 py-1 px-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                    channel.muted
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                  }`}
                  title={channel.muted ? 'إلغاء الكتم' : 'كتم الصوت'}
                >
                  {channel.muted ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span>{channel.muted ? 'مكتوم' : 'كتم'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
