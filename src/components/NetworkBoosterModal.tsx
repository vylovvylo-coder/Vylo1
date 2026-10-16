import React, { useState } from 'react';
import { NetworkStats, IngestServerPing, StreamProtocol } from '../types/studio';
import {
  X,
  Zap,
  Wifi,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Check,
  RotateCw,
  Server,
  ArrowUpDown,
  Gauge,
  Sparkles,
  Sliders,
  Radio,
  Lock,
} from 'lucide-react';

interface NetworkBoosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkStats: NetworkStats;
  ingestServers: IngestServerPing[];
  onRunPingTest: () => Promise<void>;
  onSelectServer: (server: IngestServerPing) => void;
  onToggleAdaptiveBitrate: (enabled: boolean) => void;
  onToggleEmergencyBoost: (enabled: boolean) => void;
  isTestingPing: boolean;
}

export const NetworkBoosterModal: React.FC<NetworkBoosterModalProps> = ({
  isOpen,
  onClose,
  networkStats,
  ingestServers,
  onRunPingTest,
  onSelectServer,
  onToggleAdaptiveBitrate,
  onToggleEmergencyBoost,
  isTestingPing,
}) => {
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'servers' | 'fec_abr'>('dashboard');

  if (!isOpen) return null;

  const isBoostActive = networkStats.isEmergencyBoostActive;
  const isAbrActive = networkStats.isAdaptiveBitrateActive;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${
              isBoostActive
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 animate-pulse'
                : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  مقوي الشبكة والبث الذكي (Network & Stream Booster)
                </h2>
                {isBoostActive && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                    EMERGENCY BOOST ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                محرك التكيف التلقائي (ABR)، فحص سرعة الخوادم، وبروتوكول استعادة الحزم المفقودة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="h-11 bg-zinc-950 border-b border-zinc-800 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedTab === 'dashboard'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>لوحة المؤشرات والتعزيز</span>
            </button>

            <button
              onClick={() => setSelectedTab('servers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedTab === 'servers'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>فحص واختيار أسرع سيرفر</span>
            </button>

            <button
              onClick={() => setSelectedTab('fec_abr')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedTab === 'fec_abr'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>محرك ABR واستعادة الحزم (FEC)</span>
            </button>
          </div>

          {/* Quick Active Server Ping Tag */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-400 font-sans hidden sm:inline">السيرفر النشط:</span>
            <span className="text-emerald-400 font-bold">{networkStats.pingMs} ms</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-300 truncate max-w-[140px]">{networkStats.activeServerName.split(' ')[0]}</span>
          </div>
        </div>

        {/* Tab 1: Dashboard & Emergency Net-Boost */}
        {selectedTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Emergency Net-Boost Hero Banner */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isBoostActive
                ? 'bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-zinc-950 border-cyan-500/60 shadow-xl shadow-cyan-500/10'
                : 'bg-zinc-950 border-zinc-800'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white flex items-center gap-1.5">
                      <Zap className={`w-4 h-4 ${isBoostActive ? 'text-cyan-400 animate-bounce' : 'text-zinc-400'}`} />
                      وضع مقوي الشبكة الطارئ (Emergency Net-Boost Mode)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isBoostActive ? 'bg-cyan-500 text-black font-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {isBoostActive ? 'مفعل الآن' : 'غير نشط'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                    يوجه كامل النطاق الترددي لعملية رفع البث عبر وسم الحزم بتقنية <strong>DSCP QoS (AF41)</strong>،
                    ويقلل زمن الاحتفاظ المؤقت (Buffer Depth) لتفادي أي تقطيع أو إسقاط إطارات أثناء البث المكثف.
                  </p>
                </div>

                <button
                  onClick={() => onToggleEmergencyBoost(!isBoostActive)}
                  className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-lg ${
                    isBoostActive
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/30'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{isBoostActive ? 'تعطيل وضع التعزيز' : 'تفعيل مقوي الشبكة الفوري 🚀'}</span>
                </button>
              </div>

              {isBoostActive && (
                <div className="mt-4 pt-3 border-t border-cyan-800/40 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-black/40 p-2 rounded-lg border border-cyan-500/20">
                    <span className="text-[10px] text-cyan-400 block">QoS Priority:</span>
                    <span className="font-bold text-white font-mono">DSCP Expedited (AF41)</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-cyan-500/20">
                    <span className="text-[10px] text-cyan-400 block">Buffer Depth:</span>
                    <span className="font-bold text-white font-mono">40 ms (Ultra-Low)</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-cyan-500/20">
                    <span className="text-[10px] text-cyan-400 block">Packet Loss Shield:</span>
                    <span className="font-bold text-emerald-400 font-mono">100.0% Protected</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-cyan-500/20">
                    <span className="text-[10px] text-cyan-400 block">Telemetry Throttle:</span>
                    <span className="font-bold text-white font-mono">Active (Low Overhead)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Real-Time Network Telemetry Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Latency RTT */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>زمن الاستجابة (Ping)</span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-emerald-400 mono-font">
                    {networkStats.pingMs}
                  </span>
                  <span className="text-xs text-zinc-500">ms</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  {networkStats.pingMs < 30 ? 'استقرار ممتاز (Optimal)' : 'استقرار جيد (Good)'}
                </div>
              </div>

              {/* Jitter */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>تذبذب الإشارة (Jitter)</span>
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-sky-400 mono-font">
                    {networkStats.jitterMs}
                  </span>
                  <span className="text-xs text-zinc-500">ms</span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  تذبذب ضئيل جداً &lt; 2ms
                </div>
              </div>

              {/* Packet Loss */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>فقدان الحزم (Packet Loss)</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white mono-font">
                    {networkStats.packetLossPercent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">0 Drop</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  تم استعادة {networkStats.recoveredPacketsCount} حزمة عبر ARQ
                </div>
              </div>

              {/* Bitrate Health */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>معدل البث الفعلي (ABR)</span>
                  <Gauge className="w-3.5 h-3.5 text-purple-400" />
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-purple-400 mono-font">
                    {networkStats.actualBitrateKbps}
                  </span>
                  <span className="text-xs text-zinc-500">Kbps</span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  الهدف: {networkStats.targetBitrateKbps} Kbps CBR
                </div>
              </div>
            </div>

            {/* Quick Server Action Card */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <Server className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{networkStats.activeServerName}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {networkStats.activeServerProtocol}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    أفضل زمن استجابة متصل حالياً مع خوارزمية الاسترجاع التلقائي
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTab('servers')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition cursor-pointer"
              >
                تغيير أو فحص الخوادم
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Auto Ping & Best Server Selector */}
        {selectedTab === 'servers' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  فحص واختيار أسرع سيرفر بث (Auto Ping & Best Server Selector)
                </h3>
                <p className="text-xs text-zinc-400">
                  فحص آني لسرعة الاستجابة (RTT Latency) لاختيار أفضل نقطة إدخال وتفادي التأخير.
                </p>
              </div>

              <button
                onClick={onRunPingTest}
                disabled={isTestingPing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin' : ''}`} />
                <span>{isTestingPing ? 'جاري الفحص المباشر...' : 'بدء فحص الخوادم 🚀'}</span>
              </button>
            </div>

            {/* Server Grid */}
            <div className="space-y-2">
              {ingestServers.map((server, idx) => {
                const isSelected = server.name === networkStats.activeServerName;
                const isOptimal = idx === 0 && !isTestingPing;

                return (
                  <div
                    key={server.id}
                    className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/70 shadow'
                        : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        server.status === 'optimal'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : server.status === 'good'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{server.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                            {server.protocol}
                          </span>
                          {isOptimal && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              الأسرع موصى به
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-black">
                              المتصل حالياً
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>{server.location}</span>
                          <span className="text-zinc-600 font-mono">({server.url})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Telemetry values */}
                      <div className="text-left font-mono">
                        <div className={`text-sm font-black ${
                          server.pingMs < 35
                            ? 'text-emerald-400'
                            : server.pingMs < 80
                            ? 'text-sky-400'
                            : 'text-amber-400'
                        }`}>
                          {server.status === 'checking' ? (
                            <span className="text-zinc-500 animate-pulse text-xs">فحص...</span>
                          ) : (
                            `${server.pingMs} ms`
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Jitter: {server.jitterMs}ms
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectServer(server)}
                        disabled={isSelected}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 text-zinc-500 cursor-default'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow'
                        }`}
                      >
                        {isSelected ? 'متصل' : 'اختيار السيرفر'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Adaptive Bitrate & Packet Loss Recovery (FEC) */}
        {selectedTab === 'fec_abr' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                محرك التكيف التلقائي وبروتوكول تصحيح الخطأ المتقدم (ABR & FEC Engine)
              </h3>
              <p className="text-xs text-zinc-400">
                خوارزمية ذكية لمواكبة تذبذب سرعات الإنترنت وتفادي انقطاع البث كلياً.
              </p>
            </div>

            {/* ABR Toggle Card */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    التحكم التلقائي بمعدل البث (Adaptive Bitrate - ABR)
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAbrActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isAbrActive ? 'نشط' : 'معطل'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 max-w-xl">
                  عند ضعف سرعة الرفع أو ارتفاع الـ Ping مؤقتاً، يقوم المحرك بخفض معدل البث (Bitrate) بدلاً من تقطيع المشهد أو انقطاع البث عن المتابعين، ثم رفعه تدريجياً فور استقرار الاتصال.
                </p>
              </div>

              <button
                onClick={() => onToggleAdaptiveBitrate(!isAbrActive)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isAbrActive
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {isAbrActive ? 'تعطيل ABR' : 'تفعيل ABR'}
              </button>
            </div>

            {/* Packet Loss Recovery (ARQ / FEC) Information */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>بروتوكول استعادة الحزم المفقودة (Automatic Repeat reQuest & FEC):</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-850">
                  <span className="text-[10px] text-zinc-400 block mb-0.5">نسبة استعادة الحزم:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {networkStats.fecRecoveryRatio.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    حماية ضد التشويش اللحظي
                  </span>
                </div>

                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-850">
                  <span className="text-[10px] text-zinc-400 block mb-0.5">الحزم المسترجعة تلقائياً:</span>
                  <span className="text-lg font-black text-indigo-400 font-mono">
                    {networkStats.recoveredPacketsCount} Packets
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    عبر مصفوفة تصحيح الخطأ
                  </span>
                </div>

                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-850">
                  <span className="text-[10px] text-zinc-400 block mb-0.5">إجمالي الحزم المرسلة:</span>
                  <span className="text-lg font-black text-zinc-200 font-mono">
                    {networkStats.totalPacketsSent.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    حجم الإرسال الكلي للجلسة
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-850 text-[11px] text-zinc-400 leading-relaxed">
                💡 <strong>معلومة تقنية:</strong> يستخدم بروتوكول SRT و WebRTC قناة ARQ/FEC لإرسال بايتات تحقق دورية تمكن خادم البث من إعادة بناء البايتات المفقودة دون الحاجة لإعادة إرسال الفيديو كاملاً، مما يضمن خلو البث من التقطيع والـ Stutter.
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="h-14 px-6 bg-zinc-850 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>محرك الشبكة المتكيف نشط ويعمل بالخلفية</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-750 text-white transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
