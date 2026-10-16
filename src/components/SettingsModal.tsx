import React, { useState } from 'react';
import { StreamSettings, EncoderType, StreamProtocol, CustomIngest } from '../types/studio';
import {
  X,
  Radio,
  Sliders,
  Tv,
  Volume2,
  HardDrive,
  ShieldCheck,
  Zap,
  Check,
  Server,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StreamSettings;
  onSaveSettings: (settings: StreamSettings) => void;
  customIngests?: CustomIngest[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  customIngests = [],
}) => {
  const [localSettings, setLocalSettings] = useState<StreamSettings>(settings);
  const [activeTab, setActiveTab] = useState<'stream' | 'output' | 'video' | 'audio'>('stream');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              إعدادات الاستوديو (Studio Configuration)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar Tabs + Settings Fields */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-zinc-950/80 border-l border-zinc-800 p-3 space-y-1 shrink-0">
            <button
              onClick={() => setActiveTab('stream')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition text-right ${
                activeTab === 'stream'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>البث والبروتوكول</span>
            </button>

            <button
              onClick={() => setActiveTab('output')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition text-right ${
                activeTab === 'output'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>المخرجات و NVENC</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition text-right ${
                activeTab === 'video'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
              }`}
            >
              <Tv className="w-4 h-4 text-sky-400" />
              <span>الفيديو والأبعاد</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition text-right ${
                activeTab === 'audio'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
              }`}
            >
              <Volume2 className="w-4 h-4 text-purple-400" />
              <span>الصوت والترددات</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Stream Protocol Tab */}
            {activeTab === 'stream' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    منصة البث (Service)
                  </label>
                  <select
                    value={localSettings.service}
                    onChange={(e) => {
                      const s = e.target.value as StreamSettings['service'];
                      let proto: StreamProtocol = 'RTMP';
                      let url = 'rtmp://live.twitch.tv/app/';
                      if (s === 'youtube') {
                        url = 'rtmp://a.rtmp.youtube.com/live2';
                      } else if (s === 'kick') {
                        url = 'rtmps://fa723fc1b171.global-contribute.live-video.net';
                      } else if (s === 'srt_server') {
                        proto = 'SRT';
                        url = 'srt://127.0.0.1:9000?mode=caller&latency=120';
                      }
                      setLocalSettings({ ...localSettings, service: s, protocol: proto, serverUrl: url });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-400"
                  >
                    <option value="twitch">Twitch (RTMP)</option>
                    <option value="youtube">YouTube Live (RTMPS)</option>
                    <option value="kick">Kick.com (RTMP)</option>
                    <option value="srt_server">خادم SRT مخصص (Secure Reliable Transport)</option>
                    <option value="custom_rtmp">خادم RTMP مخصص (Custom Server)</option>
                    <option value="webrtc">WebRTC (WHIP Ultra-Low Latency)</option>
                  </select>
                </div>

                {/* Admin-Provided Ingest Servers */}
                {customIngests.length > 0 && (
                  <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      خوادم وسيرفرات البث المعتمدة من المشرف (Admin Configured):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {customIngests.map((ing) => (
                        <button
                          key={ing.id}
                          type="button"
                          onClick={() => {
                            setLocalSettings({
                              ...localSettings,
                              service: ing.protocol === 'SRT' ? 'srt_server' : 'custom_rtmp',
                              protocol: ing.protocol,
                              serverUrl: ing.url,
                            });
                          }}
                          className={`p-2 rounded-lg text-right text-xs transition border flex flex-col gap-0.5 cursor-pointer ${
                            localSettings.serverUrl === ing.url
                              ? 'bg-emerald-600/20 text-white border-emerald-500/60 shadow'
                              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>{ing.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-emerald-400 font-mono">
                              {ing.protocol}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono truncate">
                            {ing.url}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      بروتوكول البث (Protocol)
                    </label>
                    <select
                      value={localSettings.protocol}
                      onChange={(e) => setLocalSettings({ ...localSettings, protocol: e.target.value as StreamProtocol })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none"
                    >
                      <option value="RTMP">RTMP (Real-Time Messaging Protocol)</option>
                      <option value="RTMPS">RTMPS (RTMP over TLS/SSL)</option>
                      <option value="SRT">SRT (موصى به: جودة عالية وزمن استجابة منخفض)</option>
                      <option value="WebRTC-WHIP">WebRTC WHIP (تأخير أقل من ثانية)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      عنوان الخادم (Server URL)
                    </label>
                    <input
                      type="text"
                      value={localSettings.serverUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, serverUrl: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    مفتاح البث (Stream Key)
                  </label>
                  <input
                    type="password"
                    value={localSettings.streamKey}
                    onChange={(e) => setLocalSettings({ ...localSettings, streamKey: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                    placeholder="live_sec_••••••••••••••••"
                  />
                </div>

                {localSettings.protocol === 'SRT' && (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                    <span className="text-xs font-bold text-emerald-400 block">
                      إعدادات بروتوكول SRT المتقدمة:
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">زمن التخزين المؤقت (Latency ms)</label>
                        <input
                          type="number"
                          value={localSettings.srtLatency || 120}
                          onChange={(e) => setLocalSettings({ ...localSettings, srtLatency: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">كلمة مرور التشفير (Passphrase)</label>
                        <input
                          type="password"
                          value={localSettings.srtPassphrase || ''}
                          placeholder="AES-128 Key"
                          onChange={(e) => setLocalSettings({ ...localSettings, srtPassphrase: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Output & Hardware Acceleration Tab */}
            {activeTab === 'output' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                  <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs text-emerald-300">
                    <span className="font-bold">التسريع العتادي مفعل (Hardware Acceleration):</span> يتم توجيه معالجة وتشفير الفيديو لعتاد بطاقة الشاشة، مما يضمن 0% تقريباً من استهلاك المعالج الرئيسي.
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    مشفر الفيديو العتادي (Hardware Video Encoder)
                  </label>
                  <select
                    value={localSettings.encoder}
                    onChange={(e) => setLocalSettings({ ...localSettings, encoder: e.target.value as EncoderType })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none"
                  >
                    <option value="NVENC_H264">NVIDIA NVENC H.264 (الأعلى استقراراً وتوافقاً - GeForce RTX/GTX)</option>
                    <option value="NVENC_HEVC">NVIDIA NVENC HEVC / H.265 (كفاءة ضغط أعلى بـ 40%)</option>
                    <option value="NVENC_AV1">NVIDIA NVENC AV1 (أحدث تقنيات التشفير لبطاقات RTX 40)</option>
                    <option value="APPLE_VT">Apple VideoToolbox (Hardware M1/M2/M3 Silicon)</option>
                    <option value="AMD_AMF">AMD AMF H.264 (Radeon Hardware)</option>
                    <option value="INTEL_QSV">Intel QuickSync Video (QSV)</option>
                    <option value="X264_SOFTWARE">x264 Software (معالج حاسوبي بدون عتاد)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      التحكم بمعدل البت (Rate Control)
                    </label>
                    <select
                      value={localSettings.rateControl}
                      onChange={(e) => setLocalSettings({ ...localSettings, rateControl: e.target.value as 'CBR' | 'VBR' | 'CQP' })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none"
                    >
                      <option value="CBR">CBR (Constant Bitrate - موصى به للبث)</option>
                      <option value="VBR">VBR (Variable Bitrate)</option>
                      <option value="CQP">CQP (Constant Quantization Parameter - للتسجيل)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      معدل البت للفيديو (Bitrate)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="2500"
                        max="20000"
                        step="500"
                        value={localSettings.bitrate}
                        onChange={(e) => setLocalSettings({ ...localSettings, bitrate: Number(e.target.value) })}
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                      />
                      <span className="text-xs text-zinc-400">Kbps</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      النمط المسبق (Preset)
                    </label>
                    <select
                      value={localSettings.preset}
                      onChange={(e) => setLocalSettings({ ...localSettings, preset: e.target.value as StreamSettings['preset'] })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none"
                    >
                      <option value="P6_QUALITY">P6: جودة عالية (High Quality - الافتراضي)</option>
                      <option value="P7_MAX_QUALITY">P7: أقصى جودة (Max Quality)</option>
                      <option value="P5_BALANCED">P5: متوازن (Balanced)</option>
                      <option value="P3_FAST">P3: سريع (Fast)</option>
                      <option value="P1_FASTEST">P1: أسرع أداء بزمن استجابة فائق</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      فترة الإطارات المفتاحية (Keyframe Interval)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={localSettings.keyframeInterval}
                        onChange={(e) => setLocalSettings({ ...localSettings, keyframeInterval: Number(e.target.value) })}
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                      />
                      <span className="text-xs text-zinc-400">ثواني (2s موصى به)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Resolution & FPS Tab */}
            {activeTab === 'video' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      دقة اللوحة الأساسية (Base Canvas)
                    </label>
                    <select
                      value={localSettings.baseResolution}
                      onChange={(e) => setLocalSettings({ ...localSettings, baseResolution: e.target.value as StreamSettings['baseResolution'] })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                    >
                      <option value="1920x1080">1920 × 1080 (Full HD 16:9)</option>
                      <option value="2560x1440">2560 × 1440 (2K QHD 16:9)</option>
                      <option value="3840x2160">3840 × 2160 (4K UHD 16:9)</option>
                      <option value="1080x1920">1080 × 1920 (بث عمودي TikTok / Reels / Shorts 9:16)</option>
                      <option value="1280x720">1280 × 720 (HD 720p)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      دقة المخرجات المقاسة (Output Scaled)
                    </label>
                    <select
                      value={localSettings.outputResolution}
                      onChange={(e) => setLocalSettings({ ...localSettings, outputResolution: e.target.value as StreamSettings['outputResolution'] })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                    >
                      <option value="1920x1080">1920 × 1080 (1080p)</option>
                      <option value="1280x720">1280 × 720 (720p)</option>
                      <option value="2560x1440">2560 × 1440 (1440p)</option>
                      <option value="1080x1920">1080 × 1920 (عمودي)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    معدل الإطارات في الثانية (FPS)
                  </label>
                  <select
                    value={localSettings.fps}
                    onChange={(e) => setLocalSettings({ ...localSettings, fps: Number(e.target.value) as StreamSettings['fps'] })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                  >
                    <option value="60">60 إطار في الثانية (سلاسة فائقة للألعاب والبث)</option>
                    <option value="50">50 إطار في الثانية (PAL Standard)</option>
                    <option value="30">30 إطار في الثانية (قياسي لتوفير الباندويث)</option>
                    <option value="24">24 إطار في الثانية (سينمائي)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Audio Settings Tab */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      تردد العينات (Sample Rate)
                    </label>
                    <select className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono">
                      <option value="48000">48 kHz (البث الاحترافي والاستوديوهات)</option>
                      <option value="44100">44.1 kHz (CD Audio)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      معدل بت الصوت (Audio Bitrate)
                    </label>
                    <select
                      value={localSettings.audioBitrate}
                      onChange={(e) => setLocalSettings({ ...localSettings, audioBitrate: Number(e.target.value) as StreamSettings['audioBitrate'] })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                    >
                      <option value="160">160 Kbps (Twitch Recommended)</option>
                      <option value="192">192 Kbps (High Fidelity)</option>
                      <option value="320">320 Kbps (Studio Quality)</option>
                      <option value="128">128 Kbps (Standard)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 px-6 bg-zinc-850 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-500">
            يتم تطبيق إعدادات التشفير والبروتوكول تلقائياً على محرك البث.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-300 transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم الحفظ!</span>
                </>
              ) : (
                <span>حفظ التغييرات</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
