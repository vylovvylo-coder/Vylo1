import React from 'react';
import {
  Radio,
  Sliders,
  Tv,
  Maximize2,
  Minimize2,
  Scissors,
  Flame,
  Layers,
  Shield,
  Zap,
} from 'lucide-react';
import { Scene, FeatureFlags, NetworkStats } from '../types/studio';

interface HeaderBarProps {
  isStreaming: boolean;
  isRecording: boolean;
  isVirtualCam: boolean;
  isStudioMode: boolean;
  isGameBoost: boolean;
  featureFlags: FeatureFlags;
  scenes: Scene[];
  activeSceneId: string;
  networkStats?: NetworkStats;
  onOpenNetworkBooster?: () => void;
  onSelectScene: (id: string) => void;
  onToggleGameBoost: () => void;
  onInstantClip: () => void;
  onToggleStudioMode: () => void;
  onToggleVirtualCam: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isStreaming,
  isRecording,
  isVirtualCam,
  isStudioMode,
  isGameBoost,
  featureFlags,
  scenes,
  activeSceneId,
  networkStats,
  onOpenNetworkBooster,
  onSelectScene,
  onToggleGameBoost,
  onInstantClip,
  onToggleStudioMode,
  onToggleVirtualCam,
  onOpenSettings,
  onOpenAdmin,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3 select-none shrink-0 gap-2">
      {/* Brand & Broadcast Status */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Radio className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-wide text-zinc-100">
              StreamStudio <span className="text-indigo-400 font-black">PRO</span>
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-none">
            استوديو البث والتسجيل المباشر
          </p>
        </div>

        {/* Live Broadcast / Record indicators */}
        <div className="flex items-center gap-1.5 mr-2 border-r border-zinc-800 pr-2">
          {isStreaming ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
              LIVE
            </div>
          ) : (
            <div className="text-[10px] text-zinc-500 font-medium px-1.5 py-0.5 rounded bg-zinc-950/60 border border-zinc-850">
              OFFLINE
            </div>
          )}

          {isRecording && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping"></span>
              REC
            </div>
          )}
        </div>
      </div>

      {/* Middle: Instant Scene Profiles Quick Bar */}
      <div className="hidden md:flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 shrink-0">
        <span className="text-[10px] text-zinc-500 font-bold px-1.5 flex items-center gap-1">
          <Layers className="w-3 h-3 text-indigo-400" />
          المشاهد السريعة:
        </span>
        {scenes.slice(0, 4).map((s, idx) => {
          const isActive = s.id === activeSceneId;
          const hotkeys = ['F1', 'F2', 'F3', 'F4'];
          return (
            <button
              key={s.id}
              onClick={() => onSelectScene(s.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
              }`}
              title={`التبديل إلى ${s.name} (${hotkeys[idx]})`}
            >
              <span className="mono-font text-[9px] bg-black/40 px-1 py-0.2 rounded text-zinc-300">
                {hotkeys[idx]}
              </span>
              <span className="truncate max-w-[90px]">{s.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls: Filtered by Feature Flags for Clean Creator UI */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Network & Stream Booster Button (Controlled by Admin Feature Flag) */}
        {(!featureFlags || featureFlags.networkBooster) && (
          <button
            onClick={onOpenNetworkBooster}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
              networkStats?.isEmergencyBoostActive
                ? 'bg-cyan-600/25 text-cyan-300 border-cyan-500/60 shadow-lg shadow-cyan-500/10 animate-pulse'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-750'
            }`}
            title="مقوي الشبكة والبث الذكي: ABR، فحص السيرفرات، واستعادة الحزم المفقودة"
          >
            <Zap className={`w-3.5 h-3.5 ${networkStats?.isEmergencyBoostActive ? 'text-cyan-400 fill-current' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">
              {networkStats?.isEmergencyBoostActive ? 'Net-Boost نشط ⚡' : 'مقوي الشبكة'}
            </span>
            {networkStats && (
              <span className="mono-font text-[10px] px-1 py-0.2 rounded bg-black/40 text-emerald-400 font-bold">
                {networkStats.pingMs}ms
              </span>
            )}
          </button>
        )}

        {/* Game Boost Mode (Controlled by Admin Feature Flag) */}
        {featureFlags.gameBoost && (
          <button
            onClick={onToggleGameBoost}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
              isGameBoost
                ? 'bg-emerald-600/25 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-750'
            }`}
            title="وضع تسريع الألعاب: تخفيف استهلاك الكارت والمعالج لضمان عدم تقطيع الألعاب"
          >
            <Flame className={`w-3.5 h-3.5 ${isGameBoost ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`} />
            <span>{isGameBoost ? 'تسريع الألعاب نشط 🚀' : 'Game Boost'}</span>
          </button>
        )}

        {/* Instant Clip Button (Controlled by Admin Feature Flag) */}
        {featureFlags.instantClip && (
          <button
            onClick={onInstantClip}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md shadow-rose-600/20 transition cursor-pointer"
            title="حفظ لقطة فورية لآخر 30 ثانية بتنسيق 16:9 أو عمودي 9:16 للتيك توك"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>لقطة فورية (Clip)</span>
          </button>
        )}

        {/* Studio Mode Toggle */}
        <button
          onClick={onToggleStudioMode}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
            isStudioMode
              ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
              : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border-zinc-700'
          }`}
          title="تفعيل نمط الاستوديو (معاينة وبث مزدوج)"
        >
          <Tv className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">نمط الاستوديو</span>
        </button>

        {/* Creator Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-zinc-300 hover:text-white rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 transition cursor-pointer"
          title="إعدادات البث والتسجيل"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Dedicated Admin Portal Entrance */}
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-750 transition cursor-pointer"
          title="لوحة تحكم المشرف والمهندس (Admin Dashboard)"
        >
          <Shield className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden xl:inline">لوحة الأدمن</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          title="ملء الشاشة"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
