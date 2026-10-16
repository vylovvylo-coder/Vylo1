import React from 'react';
import { StudioStats, StreamSettings, NetworkStats } from '../types/studio';
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';

interface StatsBarProps {
  stats: StudioStats;
  isStreaming: boolean;
  isRecording: boolean;
  streamDuration: number;
  recordDuration: number;
  settings: StreamSettings;
  networkStats?: NetworkStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  isStreaming,
  isRecording,
  streamDuration,
  recordDuration,
  settings,
  networkStats,
}) => {
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="h-8 bg-zinc-950 border-t border-zinc-800/90 px-3 flex items-center justify-between text-[11px] mono-font select-none shrink-0 text-zinc-400">
      {/* Left side: Live & Record Timers */}
      <div className="flex items-center gap-4">
        {/* Stream Status */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isStreaming ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'
            }`}
          />
          <span className="font-semibold text-zinc-300">LIVE:</span>
          <span className={isStreaming ? 'text-red-400 font-bold' : 'text-zinc-500'}>
            {isStreaming ? formatTime(streamDuration) : '00:00:00'}
          </span>
        </div>

        {/* Record Status */}
        <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-4">
          <span
            className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-amber-400 animate-ping' : 'bg-zinc-600'
            }`}
          />
          <span className="font-semibold text-zinc-300">REC:</span>
          <span className={isRecording ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
            {isRecording ? formatTime(recordDuration) : '00:00:00'}
          </span>
        </div>

        {/* Network & Protocol Status */}
        <div className="hidden sm:flex items-center gap-1.5 border-r border-zinc-800 pr-4 text-zinc-300">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span className="font-bold text-emerald-400">
            {settings.protocol}
          </span>
          <span className="text-zinc-500">|</span>
          <span>
            {isStreaming
              ? `${(networkStats?.actualBitrateKbps ?? settings.bitrate).toLocaleString()} kbps`
              : `${settings.bitrate.toLocaleString()} kbps`}
          </span>
          {networkStats && (
            <>
              <span className="text-zinc-600">|</span>
              <span className="text-emerald-400 font-bold">{networkStats.pingMs}ms</span>
              {networkStats.isEmergencyBoostActive && (
                <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-black text-[9px] border border-cyan-500/30">
                  BOOST
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right side: Hardware & Telemetry Metrics */}
      <div className="flex items-center gap-4">
        {/* Hardware Encoder Badge */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] text-zinc-400">تشفير عتادي:</span>
          <span className="font-bold text-emerald-400">{settings.encoder}</span>
        </div>

        {/* CPU Usage */}
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-sky-400" />
          <span className="text-zinc-500">CPU:</span>
          <span className="text-zinc-300 font-semibold">{stats.cpuPercent.toFixed(1)}%</span>
        </div>

        {/* GPU / NVENC Load */}
        <div className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-purple-400" />
          <span className="text-zinc-500">NVENC:</span>
          <span className="text-zinc-300 font-semibold">{stats.nvencLoadPercent.toFixed(1)}%</span>
        </div>

        {/* FPS */}
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-indigo-400" />
          <span className="text-zinc-500">FPS:</span>
          <span className="text-emerald-400 font-bold">{stats.fps.toFixed(2)}</span>
        </div>

        {/* Dropped Frames */}
        <div className="flex items-center gap-1">
          <span className="text-zinc-500">سقوط الإطارات:</span>
          <span
            className={`font-semibold ${
              stats.droppedFramesPercent > 1 ? 'text-red-400' : 'text-zinc-300'
            }`}
          >
            {stats.droppedFramesCount} ({stats.droppedFramesPercent.toFixed(1)}%)
          </span>
        </div>
      </div>
    </footer>
  );
};
