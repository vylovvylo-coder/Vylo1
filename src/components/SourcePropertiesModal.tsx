import React, { useState } from 'react';
import { SourceItem } from '../types/studio';
import {
  X,
  Sliders,
  Camera,
  Monitor,
  Eye,
  Check,
  Sparkles,
} from 'lucide-react';

interface SourcePropertiesModalProps {
  isOpen: boolean;
  source: SourceItem | null;
  onClose: () => void;
  onSaveSource: (sourceId: string, updates: Partial<SourceItem>) => void;
  onConnectWebcam: (sourceId: string) => Promise<void>;
  onConnectScreenCapture: (sourceId: string) => Promise<void>;
}

export const SourcePropertiesModal: React.FC<SourcePropertiesModalProps> = ({
  isOpen,
  source,
  onClose,
  onSaveSource,
  onConnectWebcam,
  onConnectScreenCapture,
}) => {
  if (!isOpen || !source) return null;

  const [name, setName] = useState(source.name);
  const [opacity, setOpacity] = useState(source.opacity);
  const [x, setX] = useState(source.x);
  const [y, setY] = useState(source.y);
  const [width, setWidth] = useState(source.width);
  const [height, setHeight] = useState(source.height);

  // Filters
  const [chromaEnabled, setChromaEnabled] = useState(source.filters.chromaKey?.enabled ?? false);
  const [chromaColor, setChromaColor] = useState(source.filters.chromaKey?.color ?? '#00ff00');
  const [chromaSimilarity, setChromaSimilarity] = useState(source.filters.chromaKey?.similarity ?? 0.4);
  const [chromaSmoothness, setChromaSmoothness] = useState(source.filters.chromaKey?.smoothness ?? 0.1);

  // Custom text / color
  const [customText, setCustomText] = useState(source.customData?.text ?? '');
  const [textColor, setTextColor] = useState(source.customData?.textColor ?? '#ffffff');
  const [bgColor, setBgColor] = useState(source.customData?.bgColor ?? '#1e1b4b');

  const handleSave = () => {
    onSaveSource(source.id, {
      name,
      opacity,
      x: Number(x),
      y: Number(y),
      width: Number(width),
      height: Number(height),
      filters: {
        ...source.filters,
        chromaKey: {
          enabled: chromaEnabled,
          color: chromaColor,
          similarity: Number(chromaSimilarity),
          smoothness: Number(chromaSmoothness),
        },
      },
      customData: {
        ...source.customData,
        text: customText,
        textColor,
        bgColor,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">
              خصائص المصدر: {source.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Real Media Capture Buttons */}
          {source.type === 'camera' && (
            <div className="p-3 bg-sky-950/30 border border-sky-500/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-300 block">كاميرا الويب الحقيقية</span>
                <span className="text-[11px] text-zinc-400">توصيل كاميرا جهازك وعرضها مباشرة داخل البث</span>
              </div>
              <button
                type="button"
                onClick={() => onConnectWebcam(source.id)}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>توصيل الكاميرا الحقيقية</span>
              </button>
            </div>
          )}

          {source.type === 'display' && (
            <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-300 block">التقاط الشاشة الفعلي</span>
                <span className="text-[11px] text-zinc-400">مشاركة سطح المكتب أو نافذة لعبة معينة</span>
              </div>
              <button
                type="button"
                onClick={() => onConnectScreenCapture(source.id)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>اختيار الشاشة الحقيقية</span>
              </button>
            </div>
          )}

          {/* Source Name */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">اسم المصدر (Source Name)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none"
            />
          </div>

          {/* Opacity */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300 font-bold">الشفافية (Opacity):</span>
              <span className="mono-font text-indigo-400 font-bold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Transform Bounds */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">الموضع الأفقي X</label>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">الموضع الرأسي Y</label>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">العرض (Width)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">الارتفاع (Height)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Chroma Key Filter (Green Screen) */}
          {(source.type === 'camera' || source.type === 'media') && (
            <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chroma_en"
                    checked={chromaEnabled}
                    onChange={(e) => setChromaEnabled(e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                  />
                  <label htmlFor="chroma_en" className="text-xs font-bold text-zinc-200 cursor-pointer">
                    فلتر عزل الكروما الخضراء (Chroma Key - Green Screen)
                  </label>
                </div>
              </div>

              {chromaEnabled && (
                <div className="space-y-3 pt-2 border-t border-zinc-850">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">لون الخلفية المراد عزله:</span>
                    <input
                      type="color"
                      value={chromaColor}
                      onChange={(e) => setChromaColor(e.target.value)}
                      className="w-8 h-8 rounded border border-zinc-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">درجة التشابه (Similarity):</span>
                      <span className="mono-font text-emerald-400">{Math.round(chromaSimilarity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.02"
                      value={chromaSimilarity}
                      onChange={(e) => setChromaSimilarity(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">سلاسة الحواف (Smoothness):</span>
                      <span className="mono-font text-emerald-400">{Math.round(chromaSmoothness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.4"
                      step="0.01"
                      value={chromaSmoothness}
                      onChange={(e) => setChromaSmoothness(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text source specific properties */}
          {source.type === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">نص الشريط المتحرك (Text Content)</label>
                <textarea
                  rows={2}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">لون الخط</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-8 rounded border border-zinc-700 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">لون خلفية الشريط</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-8 rounded border border-zinc-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
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
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
          >
            حفظ الخصائص
          </button>
        </div>
      </div>
    </div>
  );
};
