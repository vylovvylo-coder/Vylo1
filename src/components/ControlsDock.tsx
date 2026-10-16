import React from 'react';
import {
  Radio,
  Video,
  Camera,
  Tv,
  Sliders,
  Square,
} from 'lucide-react';

interface ControlsDockProps {
  isStreaming: boolean;
  isRecording: boolean;
  isVirtualCam: boolean;
  isStudioMode: boolean;
  onToggleStreaming: () => void;
  onToggleRecording: () => void;
  onToggleVirtualCam: () => void;
  onToggleStudioMode: () => void;
  onOpenSettings: () => void;
}

export const ControlsDock: React.FC<ControlsDockProps> = ({
  isStreaming,
  isRecording,
  isVirtualCam,
  isStudioMode,
  onToggleStreaming,
  onToggleRecording,
  onToggleVirtualCam,
  onToggleStudioMode,
  onOpenSettings,
}) => {
  return (
    <div className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full select-none shrink-0 p-2 justify-between">
      {/* Header */}
      <div className="text-[11px] font-bold text-zinc-400 px-1 pb-1 border-b border-zinc-800 flex items-center justify-between">
        <span>لوحة التحكم (Controls)</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      </div>

      {/* Main Broadcast & Record Action Buttons */}
      <div className="space-y-1.5 my-auto">
        {/* Start / Stop Streaming */}
        <button
          onClick={onToggleStreaming}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
            isStreaming
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/20'
          }`}
        >
          {isStreaming ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>إيقاف البث (Stop Stream)</span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4" />
              <span>بدء البث (Start Stream)</span>
            </>
          )}
        </button>

        {/* Start / Stop Recording */}
        <button
          onClick={onToggleRecording}
          className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer ${
            isRecording
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
              : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>إيقاف التسجيل وتنزيل MP4</span>
            </>
          ) : (
            <>
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span>بدء التسجيل (Recording)</span>
            </>
          )}
        </button>

        {/* Start Virtual Camera */}
        <button
          onClick={onToggleVirtualCam}
          className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer border ${
            isVirtualCam
              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
              : 'bg-zinc-950/40 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isVirtualCam ? 'إيقاف الكاميرا الافتراضية' : 'الكاميرا الافتراضية'}</span>
        </button>

        {/* Studio Mode Toggle */}
        <button
          onClick={onToggleStudioMode}
          className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer border ${
            isStudioMode
              ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
              : 'bg-zinc-950/40 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
          }`}
        >
          <Tv className="w-3.5 h-3.5 text-purple-400" />
          <span>نمط الاستوديو (Studio Mode)</span>
        </button>

        {/* Settings Modal */}
        <button
          onClick={onOpenSettings}
          className="w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 bg-zinc-950/40 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          <span>الإعدادات (Settings)</span>
        </button>
      </div>

      <div className="text-[10px] text-zinc-500 text-center py-1">
        جاهز للبث بدقة 1080p60
      </div>
    </div>
  );
};
