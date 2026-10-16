import React, { useState } from 'react';
import {
  X,
  Scissors,
  Download,
  Share2,
  Tv,
  Smartphone,
  Sparkles,
  Check,
  Play,
  Film,
} from 'lucide-react';

interface InstantClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string | null;
  clipBlob: Blob | null;
  activeFormat: '16:9' | '9:16';
  onChangeFormat: (format: '16:9' | '9:16') => void;
}

export const InstantClipModal: React.FC<InstantClipModalProps> = ({
  isOpen,
  onClose,
  previewUrl,
  clipBlob,
  activeFormat,
  onChangeFormat,
}) => {
  if (!isOpen) return null;

  const [clipTitle, setClipTitle] = useState('لقطة بث ملحمية | Epic Stream Moment');
  const [durationSecs, setDurationSecs] = useState(30);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    if (!clipBlob && !previewUrl) return;
    const url = previewUrl || (clipBlob ? URL.createObjectURL(clipBlob) : '');
    if (!url) return;

    const a = document.createElement('a');
    a.href = url;
    a.download = `${clipTitle.replace(/\s+/g, '_')}_${activeFormat.replace(':', 'x')}.png`;
    a.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                حفظ لقطة فورية (Instant Clip - Replay Buffer)
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  30s Buffer Ready
                </span>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Format Switcher */}
          <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
            <div>
              <span className="text-xs font-bold text-white block">تنسيق نشر اللقطة (Clip Aspect Ratio):</span>
              <span className="text-[11px] text-zinc-400">اختر التنسيق المناسب لمنصتك المفضلة بنقرة واحدة</span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => onChangeFormat('16:9')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeFormat === '16:9'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>أفقي 16:9 (YouTube / Twitch)</span>
              </button>

              <button
                onClick={() => onChangeFormat('9:16')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeFormat === '9:16'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-rose-300" />
                <span>عمودي 9:16 (TikTok / Reels / Shorts)</span>
              </button>
            </div>
          </div>

          {/* Clip Visual Preview */}
          <div className="flex justify-center bg-black/80 rounded-2xl p-4 border border-zinc-800 relative overflow-hidden">
            {previewUrl ? (
              <div
                className={`relative rounded-xl overflow-hidden shadow-2xl border border-zinc-700/80 ${
                  activeFormat === '9:16' ? 'w-64 aspect-[9/16]' : 'w-full max-w-xl aspect-video'
                }`}
              >
                <img
                  src={previewUrl}
                  alt="Clip Snapshot Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                  CLIP 30s
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs">
                <Film className="w-8 h-8 mb-2 opacity-40" />
                <span>جاري معالجة اللقطة من الذاكرة المؤقتة...</span>
              </div>
            )}
          </div>

          {/* Clip Title and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">عنوان اللقطة (Clip Title)</label>
              <input
                type="text"
                value={clipTitle}
                onChange={(e) => setClipTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">مدة اللقطة المحفوظة</label>
              <div className="flex gap-2">
                {[15, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setDurationSecs(sec)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                      durationSecs === sec
                        ? 'bg-rose-600 text-white border-rose-500 shadow'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    آخر {sec} ثانية
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-16 px-6 bg-zinc-850 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-400">
            جاهز للنشر مباشرة على يوتيوب، تيك توك، وإنستغرام ريلز بدون برامج مونتاج إضافية.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-300 transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>تم التنزيل بنجاح!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تنزيل اللقطة الفورية ({activeFormat})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
