import React, { useState } from 'react';
import { AudioChannel, AudioFilterConfig, AudioPresetType } from '../types/studio';
import { audioEngine } from '../services/audioEngine';
import {
  X,
  Volume2,
  Sliders,
  Check,
  Zap,
  Ear,
  Waves,
  Sparkles,
  Radio,
} from 'lucide-react';

interface AudioFiltersModalProps {
  isOpen: boolean;
  channel: AudioChannel | null;
  onClose: () => void;
  onSaveFilters: (channelId: string, filters: AudioFilterConfig) => void;
}

export const AudioFiltersModal: React.FC<AudioFiltersModalProps> = ({
  isOpen,
  channel,
  onClose,
  onSaveFilters,
}) => {
  if (!isOpen || !channel) return null;

  const [filters, setFilters] = useState<AudioFilterConfig>({ ...channel.filters });

  const handleApplyPreset = (preset: AudioPresetType) => {
    const presetConfig = audioEngine.getPresetConfig(preset);
    setFilters((prev) => ({
      ...prev,
      ...presetConfig,
      eq: { ...prev.eq, ...(presetConfig.eq || {}) },
      compressor: { ...prev.compressor, ...(presetConfig.compressor || {}) },
      noiseGate: { ...prev.noiseGate, ...(presetConfig.noiseGate || {}) },
      aiNoiseSuppression: {
        ...prev.aiNoiseSuppression,
        ...(presetConfig.aiNoiseSuppression || {}),
      },
      activePreset: preset,
    }));
  };

  const handleSave = () => {
    onSaveFilters(channel.id, filters);
    onClose();
  };

  const toggleTrack = (index: number) => {
    const newTracks = [...filters.tracks] as [boolean, boolean, boolean, boolean, boolean, boolean];
    newTracks[index] = !newTracks[index];
    setFilters({ ...filters, tracks: newTracks });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                فلاتر المعالجة الصوتية DSP لـ: {channel.nameAr}
                <span className="text-[11px] font-normal text-zinc-400">({channel.name})</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Scrollable List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets Selection */}
          <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                تطبيق إعداد مسبق فوري (Instant Audio Preset):
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset('warm_radio')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                  filters.activePreset === 'warm_radio'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                🎙️ دافئ إذاعي
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('crisp_voice')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                  filters.activePreset === 'crisp_voice'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                ✨ صوت ناصع
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('bass_boost')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                  filters.activePreset === 'bass_boost'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                🔊 تضخيم الباس
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('gaming_comms')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                  filters.activePreset === 'gaming_comms'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                🎮 ألعاب وحوار
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('clean_studio')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                  filters.activePreset === 'clean_studio'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                🎧 استوديو نقي
              </button>
            </div>
          </div>

          {/* 1. AI Noise Suppression */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ai_denoise_enable"
                  checked={filters.aiNoiseSuppression?.enabled ?? false}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      aiNoiseSuppression: {
                        enabled: e.target.checked,
                        intensity: filters.aiNoiseSuppression?.intensity ?? 70,
                      },
                    })
                  }
                  className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                />
                <label
                  htmlFor="ai_denoise_enable"
                  className="text-xs font-bold text-zinc-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  معالج عزل الضوضاء الذكي (AI Noise Suppression)
                </label>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                خوارزمية طيفية ذكية
              </span>
            </div>

            {filters.aiNoiseSuppression?.enabled && (
              <div className="space-y-3 pt-2 border-t border-zinc-850">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">قوة العزل وتصفية همسات المراوح:</span>
                    <span className="mono-font font-bold text-emerald-400">
                      {filters.aiNoiseSuppression.intensity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={filters.aiNoiseSuppression.intensity}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        aiNoiseSuppression: {
                          ...filters.aiNoiseSuppression,
                          intensity: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Noise Gate */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="gate_enable"
                  checked={filters.noiseGate.enabled}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      noiseGate: { ...filters.noiseGate, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
                <label
                  htmlFor="gate_enable"
                  className="text-xs font-bold text-zinc-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Waves className="w-4 h-4 text-sky-400" />
                  بوابة عزل الصوت التناظرية (Noise Gate)
                </label>
              </div>
              <span className="text-[10px] text-zinc-500">
                قطع الصوت عند التوقف عن الكلام
              </span>
            </div>

            {filters.noiseGate.enabled && (
              <div className="space-y-3 pt-2 border-t border-zinc-850">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">عتبة الفتح والإغلاق (Threshold):</span>
                    <span className="mono-font font-bold text-indigo-400">
                      {filters.noiseGate.threshold} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="-10"
                    step="1"
                    value={filters.noiseGate.threshold}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        noiseGate: { ...filters.noiseGate, threshold: Number(e.target.value) },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Dynamics Compressor */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="comp_enable"
                  checked={filters.compressor.enabled}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      compressor: { ...filters.compressor, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
                <label
                  htmlFor="comp_enable"
                  className="text-xs font-bold text-zinc-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  الضاغط الصوتي الديناميكي (Compressor)
                </label>
              </div>
              <span className="text-[10px] text-zinc-500">
                موازنة الأصوات المرتفعة ومنع التشويش (Clipping)
              </span>
            </div>

            {filters.compressor.enabled && (
              <div className="space-y-3 pt-2 border-t border-zinc-850">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">عتبة الضغط (Threshold):</span>
                      <span className="mono-font font-bold text-amber-400">
                        {filters.compressor.threshold} dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="0"
                      step="1"
                      value={filters.compressor.threshold}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          compressor: { ...filters.compressor, threshold: Number(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-zinc-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">نسبة الضغط (Ratio):</span>
                      <span className="mono-font font-bold text-amber-400">
                        {filters.compressor.ratio}:1
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={filters.compressor.ratio}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          compressor: { ...filters.compressor, ratio: Number(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-zinc-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">مكسب التعويض (Makeup Gain):</span>
                    <span className="mono-font font-bold text-emerald-400">
                      +{filters.compressor.makeupGain} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="0.5"
                    value={filters.compressor.makeupGain}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        compressor: { ...filters.compressor, makeupGain: Number(e.target.value) },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. 3-Band Parametric EQ */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="eq_enable"
                  checked={filters.eq.enabled}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      eq: { ...filters.eq, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
                <label
                  htmlFor="eq_enable"
                  className="text-xs font-bold text-zinc-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  موازن الترددات ثلاثي النطاق (3-Band EQ)
                </label>
              </div>
            </div>

            {filters.eq.enabled && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-850">
                <div className="text-center">
                  <span className="text-[11px] text-zinc-400 block mb-1">Low (120Hz Bass)</span>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="0.5"
                    value={filters.eq.low}
                    onChange={(e) =>
                      setFilters({ ...filters, eq: { ...filters.eq, low: Number(e.target.value) } })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded accent-purple-500 cursor-pointer"
                  />
                  <span className="mono-font text-[10px] text-purple-300">
                    {filters.eq.low >= 0 ? `+${filters.eq.low}` : filters.eq.low} dB
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-zinc-400 block mb-1">Mid (1.2kHz Voice)</span>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="0.5"
                    value={filters.eq.mid}
                    onChange={(e) =>
                      setFilters({ ...filters, eq: { ...filters.eq, mid: Number(e.target.value) } })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded accent-purple-500 cursor-pointer"
                  />
                  <span className="mono-font text-[10px] text-purple-300">
                    {filters.eq.mid >= 0 ? `+${filters.eq.mid}` : filters.eq.mid} dB
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-zinc-400 block mb-1">High (8kHz Air)</span>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="0.5"
                    value={filters.eq.high}
                    onChange={(e) =>
                      setFilters({ ...filters, eq: { ...filters.eq, high: Number(e.target.value) } })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded accent-purple-500 cursor-pointer"
                  />
                  <span className="mono-font text-[10px] text-purple-300">
                    {filters.eq.high >= 0 ? `+${filters.eq.high}` : filters.eq.high} dB
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 px-6 bg-zinc-850 border-t border-zinc-800 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-300 transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            تطبيق الفلاتر
          </button>
        </div>
      </div>
    </div>
  );
};
