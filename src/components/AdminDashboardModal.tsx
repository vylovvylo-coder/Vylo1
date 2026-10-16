import React, { useState } from 'react';
import {
  AdminConfig,
  FeatureFlags,
  OverlayTemplate,
  CustomIngest,
  StudioStats,
  StreamSettings,
  StreamProtocol,
} from '../types/studio';
import { BOILERPLATE_FILES, RECOMMENDED_PROJECT_STRUCTURE } from '../data/architectureDocs';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Sliders,
  Cpu,
  Zap,
  HardDrive,
  Activity,
  Layers,
  Palette,
  Server,
  Key,
  Code2,
  FileCode,
  FolderTree,
  Copy,
  Check,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Radio,
  Wifi,
  ArrowUpDown,
  Gauge,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminConfig: AdminConfig;
  onUpdateAdminConfig: (updates: Partial<AdminConfig>) => void;
  stats: StudioStats;
  streamSettings: StreamSettings;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  adminConfig,
  onUpdateAdminConfig,
  stats,
  streamSettings,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'features' | 'network' | 'overlays' | 'ingests' | 'code'>('telemetry');

  // Architecture code viewer inside Admin
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // New overlay template form state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCat, setNewTemplateCat] = useState<'gaming' | 'podcast' | 'minimal' | 'retro' | 'esports'>('gaming');
  const [newTemplateColor, setNewTemplateColor] = useState('#8b5cf6');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  // New ingest server form state
  const [newIngestName, setNewIngestName] = useState('');
  const [newIngestProto, setNewIngestProto] = useState<'RTMP' | 'SRT'>('SRT');
  const [newIngestUrl, setNewIngestUrl] = useState('');
  const [showAddIngest, setShowAddIngest] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'admin2026' || pinInput === 'admin' || pinInput === '8888') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleToggleFeature = (key: keyof FeatureFlags) => {
    const nextFlags = {
      ...adminConfig.featureFlags,
      [key]: !adminConfig.featureFlags[key],
    };
    onUpdateAdminConfig({ featureFlags: nextFlags });
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    const item: OverlayTemplate = {
      id: `tmpl_${Date.now()}`,
      name: newTemplateName.trim(),
      category: newTemplateCat,
      accentColor: newTemplateColor,
      description: newTemplateDesc.trim() || 'قالب تراكب مخصص للبث',
    };
    onUpdateAdminConfig({
      overlayTemplates: [...adminConfig.overlayTemplates, item],
    });
    setNewTemplateName('');
    setNewTemplateDesc('');
    setShowAddTemplate(false);
  };

  const handleDeleteTemplate = (id: string) => {
    onUpdateAdminConfig({
      overlayTemplates: adminConfig.overlayTemplates.filter((t) => t.id !== id),
    });
  };

  const handleAddIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngestName.trim() || !newIngestUrl.trim()) return;
    const item: CustomIngest = {
      id: `ingest_${Date.now()}`,
      name: newIngestName.trim(),
      protocol: newIngestProto,
      url: newIngestUrl.trim(),
      enabled: true,
    };
    onUpdateAdminConfig({
      customIngests: [...adminConfig.customIngests, item],
    });
    setNewIngestName('');
    setNewIngestUrl('');
    setShowAddIngest(false);
  };

  const handleDeleteIngest = (id: string) => {
    onUpdateAdminConfig({
      customIngests: adminConfig.customIngests.filter((i) => i.id !== id),
    });
  };

  const selectedFile = BOILERPLATE_FILES[selectedFileIdx];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  لوحة تحكم المشرف والمهندس (System Admin Panel)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  خوادم النواة والإدارة
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                إدارة ميزات النظام، مراقبة أداء المعالج والكرت، وهيكل الكود المرجعي
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

        {/* Authentication Gate */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4 text-zinc-400 shadow-xl">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              الوصول مقيد لإدارة النظام والمطورين
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
              تم فصل هيكل الكود وإعدادات النواة لتفادي إرباك صناع المحتوى. يرجى إدخال رمز الأمان للوصول.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="رمز المشرف (PIN)..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className={`w-full bg-zinc-950 border text-center font-mono text-sm tracking-widest px-4 py-2.5 rounded-xl text-white outline-none transition ${
                    pinError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-zinc-700 focus:border-red-500'
                  }`}
                  autoFocus
                />
                {pinError && (
                  <span className="text-[11px] text-red-400 mt-1 block">
                    الرمز غير صحيح! (الرمز الافتراضي: admin2026)
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition shadow-lg shadow-red-600/30 cursor-pointer"
              >
                تأكيد الدخول
              </button>

              <button
                type="button"
                onClick={() => {
                  setPinInput('admin2026');
                  setIsAuthenticated(true);
                }}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
              >
                الدخول السريع التجريبي (admin2026)
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Authenticated Admin Tabs */}
            <div className="h-11 bg-zinc-950 border-b border-zinc-800 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'telemetry'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>أداء النواة و NVENC</span>
                </button>

                <button
                  onClick={() => setActiveTab('features')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'features'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>إدارة الميزات (Feature Flags)</span>
                </button>

                <button
                  onClick={() => setActiveTab('network')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'network'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5 text-cyan-300" />
                  <span>الشبكة والبروتوكولات (Network & ABR)</span>
                </button>

                <button
                  onClick={() => setActiveTab('overlays')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'overlays'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>القوالب والتراكبات (Overlays)</span>
                </button>

                <button
                  onClick={() => setActiveTab('ingests')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'ingests'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>سيرفرات البث والمفاتيح</span>
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'code'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-300" />
                  <span>هيكل الكود المرجعي (C++/Rust)</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>AUTHENTICATED</span>
              </div>
            </div>

            {/* Tab 1: Core Telemetry & Hardware Engine */}
            {activeTab === 'telemetry' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    إحصائيات عتاد المعالجة والتشفير (Hardware Engine Diagnostics)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    قراءات آنية لحالة عتاد NVIDIA NVENC، استهلاك المعالج، ومعدلات البت.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <span className="text-xs text-zinc-400 block mb-1">حمولة تشفير NVENC</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400 mono-font">
                        {stats.nvencLoadPercent.toFixed(1)}%
                      </span>
                      <span className="text-xs text-zinc-500">ASIC Load</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${stats.nvencLoadPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <span className="text-xs text-zinc-400 block mb-1">استهلاك المعالج الرئيسي (CPU)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-sky-400 mono-font">
                        {stats.cpuPercent.toFixed(1)}%
                      </span>
                      <span className="text-xs text-zinc-500">Multithread</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full transition-all"
                        style={{ width: `${stats.cpuPercent * 4}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <span className="text-xs text-zinc-400 block mb-1">معدل الإطارات الفعلي (FPS)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-indigo-400 mono-font">
                        {stats.fps.toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-500">60 Target</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-2 font-mono">
                      Frame Time: ~16.6ms (Stable)
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <span className="text-xs text-zinc-400 block mb-1">سقوط الإطارات (Dropped)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-zinc-200 mono-font">
                        {stats.droppedFramesCount}
                      </span>
                      <span className="text-xs text-zinc-500">0.0%</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-2 font-mono">
                      Network Buffer: Optimal
                    </div>
                  </div>
                </div>

                {/* Subsystem Details */}
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-purple-400" />
                    معلومات بيئة التشغيل النواة (Core Subsystems):
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 block">Graphics API:</span>
                      <span className="font-bold text-white">Direct3D 11 / Vulkan</span>
                    </div>
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 block">Active Encoder:</span>
                      <span className="font-bold text-emerald-400">{streamSettings.encoder}</span>
                    </div>
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 block">Audio Engine Rate:</span>
                      <span className="font-bold text-white">48,000 Hz Stereo (DSP)</span>
                    </div>
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 block">Process Latency:</span>
                      <span className="font-bold text-indigo-400 mono-font">2.14 ms</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Feature Flags Manager */}
            {activeTab === 'features' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    إدارة ميزات المستخدمين (Dynamic Feature Flags)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    تحكم فوري في الميزات التي تظهر أو تختفي من واجهة صانع المحتوى.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      key: 'voiceChanger' as keyof FeatureFlags,
                      title: 'مغير الصوت الفوري (Live AI Voice Changer)',
                      desc: 'إظهار لوحة مغير الصوت وأنماط الروبوت والعملاق والأنمي.',
                    },
                    {
                      key: 'instantClip' as keyof FeatureFlags,
                      title: 'زر اللقطات السريعة (Instant Clip Button)',
                      desc: 'إظهار زر حفظ آخر 30 ثانية بتنسيق أفقي 16:9 وعمودي 9:16 للتيك توك.',
                    },
                    {
                      key: 'gameBoost' as keyof FeatureFlags,
                      title: 'وضع تسريع الألعاب (Game Boost Mode)',
                      desc: 'إتاحة خيار تخفيف استهلاك الكارت والمعالج لضمان عدم تقطيع الألعاب.',
                    },
                    {
                      key: 'dmcaProtection' as keyof FeatureFlags,
                      title: 'حماية حقوق النشر (DMCA Safe VOD Mute)',
                      desc: 'عزل مسار الموسيقى تلقائياً عن تسجيلات VOD لمنع المخالفات.',
                    },
                    {
                      key: 'textToSpeech' as keyof FeatureFlags,
                      title: 'القارئ الصوتي التفاعلي (Text-to-Speech TTS)',
                      desc: 'قراءة رسائل التبرعات والدعم تلقائياً بصوت مسموع.',
                    },
                    {
                      key: 'networkBooster' as keyof FeatureFlags,
                      title: 'مقوي الشبكة والبث الذكي (Network & Stream Booster)',
                      desc: 'إتاحة أدوات مقوي الشبكة وفحص سرعة السيرفرات ومؤشرات الـ Ping.',
                    },
                    {
                      key: 'emergencyNetBoost' as keyof FeatureFlags,
                      title: 'وضع مقوي الشبكة الطارئ (Emergency Net-Boost Mode)',
                      desc: 'إتاحة زر توجيه الإنترنت بالكامل لعملية البث وتفعيل وسوم DSCP QoS.',
                    },
                    {
                      key: 'adaptiveBitrate' as keyof FeatureFlags,
                      title: 'محرك التكيف التلقائي (Adaptive Bitrate ABR)',
                      desc: 'تخفيض دقة ومعدل البث تلقائياً عند هبوط سرعة الإنترنت لتفادي التقطيع.',
                    },
                  ].map((feat) => {
                    const isEnabled = adminConfig.featureFlags[feat.key];
                    return (
                      <div
                        key={feat.key}
                        className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition"
                      >
                        <div>
                          <div className="text-xs font-bold text-white mb-0.5">
                            {feat.title}
                          </div>
                          <div className="text-[11px] text-zinc-400">{feat.desc}</div>
                        </div>

                        <button
                          onClick={() => handleToggleFeature(feat.key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isEnabled
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {isEnabled ? <Check className="w-3.5 h-3.5" /> : null}
                          <span>{isEnabled ? 'مفعل للمستخدم' : 'معطل'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Network & Protocols Configuration */}
            {activeTab === 'network' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-cyan-400" />
                    <span>إعدادات تحكم الشبكة والبروتوكولات (Network & Protocol Controls)</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    التحكم في خوارزميات التكيف الذكي (ABR)، حماية فقدان الحزم، ووسوم جودة الخدمة (QoS) للمستخدمين.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Adaptive Bitrate Control */}
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ArrowUpDown className="w-4 h-4 text-emerald-400" />
                          محرك التكيف التلقائي (Adaptive Bitrate - ABR)
                        </span>
                        <p className="text-[11px] text-zinc-400">
                          تخفيض الدقة تلقائياً عند هبوط سرعة الإنترنت بدلاً من الانقطاع.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const curr = adminConfig.networkConfig?.abrEnabled ?? true;
                          onUpdateAdminConfig({
                            networkConfig: {
                              ...(adminConfig.networkConfig || {
                                abrEnabled: true,
                                fecRecoveryEnabled: true,
                                emergencyBoostEnabled: true,
                                preferredProtocol: 'SRT',
                                dscpQosTagging: true,
                                fecBufferMs: 120,
                                autoPingIntervalSeconds: 30,
                              }),
                              abrEnabled: !curr,
                            },
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          (adminConfig.networkConfig?.abrEnabled ?? true)
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {(adminConfig.networkConfig?.abrEnabled ?? true) ? 'مفعل بالنواة' : 'معطل'}
                      </button>
                    </div>

                    <div className="text-[11px] bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-850 text-zinc-400">
                      <strong>مستوى الحساسية:</strong> خفض بنسبة 20% عند ارتفاع Latency &gt; 50ms، وخفض 40% عند وجود Packet Loss &gt; 0.5%.
                    </div>
                  </div>

                  {/* Packet Loss Recovery (FEC) */}
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          بروتوكول استعادة الحزم المفقودة (FEC / ARQ)
                        </span>
                        <p className="text-[11px] text-zinc-400">
                          إعادة بناء الحزم المعطوبة تلقائياً بدون إعادة إرسال.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const curr = adminConfig.networkConfig?.fecRecoveryEnabled ?? true;
                          onUpdateAdminConfig({
                            networkConfig: {
                              ...(adminConfig.networkConfig || {
                                abrEnabled: true,
                                fecRecoveryEnabled: true,
                                emergencyBoostEnabled: true,
                                preferredProtocol: 'SRT',
                                dscpQosTagging: true,
                                fecBufferMs: 120,
                                autoPingIntervalSeconds: 30,
                              }),
                              fecRecoveryEnabled: !curr,
                            },
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          (adminConfig.networkConfig?.fecRecoveryEnabled ?? true)
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {(adminConfig.networkConfig?.fecRecoveryEnabled ?? true) ? 'مفعل بالنواة' : 'معطل'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] text-zinc-400">حجم ذاكرة الـ Buffer المؤقتة:</span>
                      <select
                        value={adminConfig.networkConfig?.fecBufferMs ?? 120}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onUpdateAdminConfig({
                            networkConfig: {
                              ...(adminConfig.networkConfig || {
                                abrEnabled: true,
                                fecRecoveryEnabled: true,
                                emergencyBoostEnabled: true,
                                preferredProtocol: 'SRT',
                                dscpQosTagging: true,
                                fecBufferMs: 120,
                                autoPingIntervalSeconds: 30,
                              }),
                              fecBufferMs: val,
                            },
                          });
                        }}
                        className="bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-white font-mono"
                      >
                        <option value={40}>40 ms (Ultra Low Latency)</option>
                        <option value={80}>80 ms (Recommended Live)</option>
                        <option value={120}>120 ms (Balanced Safe)</option>
                        <option value={250}>250 ms (Maximum Resilience)</option>
                      </select>
                    </div>
                  </div>

                  {/* DSCP Hardware QoS Priority */}
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-cyan-400" />
                          أولوية عتاد الشبكة (DSCP QoS AF41/CS4 Tagging)
                        </span>
                        <p className="text-[11px] text-zinc-400">
                          وسم حزم البث لمنحها الأولوية المطلقة داخل الراوتر ونظام التشغيل.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const curr = adminConfig.networkConfig?.dscpQosTagging ?? true;
                          onUpdateAdminConfig({
                            networkConfig: {
                              ...(adminConfig.networkConfig || {
                                abrEnabled: true,
                                fecRecoveryEnabled: true,
                                emergencyBoostEnabled: true,
                                preferredProtocol: 'SRT',
                                dscpQosTagging: true,
                                fecBufferMs: 120,
                                autoPingIntervalSeconds: 30,
                              }),
                              dscpQosTagging: !curr,
                            },
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          (adminConfig.networkConfig?.dscpQosTagging ?? true)
                            ? 'bg-cyan-600 text-white shadow'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {(adminConfig.networkConfig?.dscpQosTagging ?? true) ? 'QoS نشط' : 'معطل'}
                      </button>
                    </div>

                    <div className="text-[11px] bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-850 text-zinc-400">
                      يضمن عدم تأثر البث بتحميل ملفات في الخلفية أو ألعاب الأونلاين التنافسية.
                    </div>
                  </div>

                  {/* Preferred Protocol Policy */}
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-rose-400" />
                        البروتوكول الافتراضي الموصى به للمنصة:
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        تحديد البروتوكول الأفضل الذي يختاره النظام افتراضياً للمستخدمين.
                      </p>
                    </div>

                    <select
                      value={adminConfig.networkConfig?.preferredProtocol ?? 'SRT'}
                      onChange={(e) => {
                        const val = e.target.value as StreamProtocol;
                        onUpdateAdminConfig({
                          networkConfig: {
                            ...(adminConfig.networkConfig || {
                              abrEnabled: true,
                              fecRecoveryEnabled: true,
                              emergencyBoostEnabled: true,
                              preferredProtocol: 'SRT',
                              dscpQosTagging: true,
                              fecBufferMs: 120,
                              autoPingIntervalSeconds: 30,
                            }),
                            preferredProtocol: val,
                          },
                        });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 text-xs px-2.5 py-2 rounded-xl text-white font-mono"
                    >
                      <option value="SRT">SRT (Secure Reliable Transport - موصى به للأداء العالي)</option>
                      <option value="WebRTC-WHIP">WebRTC-WHIP (تأخير أقل من ثانية Ultra-Low Latency)</option>
                      <option value="RTMP">RTMP / RTMPS (توافقية عامة للتطبيقات التقليدية)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Overlay Presets & Templates */}
            {activeTab === 'overlays' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      إدارة قوالب التراكبات والتنبيهات (Overlays & Themes)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      إضافة قوالب وتصاميم جديدة ليتمكن صناع المحتوى من تطبيقها بنقرة واحدة.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddTemplate(!showAddTemplate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة قالب تراكب جديد</span>
                  </button>
                </div>

                {showAddTemplate && (
                  <form
                    onSubmit={handleAddTemplate}
                    className="p-4 bg-zinc-950 rounded-xl border border-red-500/40 space-y-3"
                  >
                    <span className="text-xs font-bold text-white block">
                      بيانات القالب الجديد:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">اسم القالب</label>
                        <input
                          type="text"
                          placeholder="مثال: سايبربانك نيون 2077"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 text-xs px-2.5 py-1.5 rounded-lg text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">التصنيف</label>
                        <select
                          value={newTemplateCat}
                          onChange={(e) => setNewTemplateCat(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-700 text-xs px-2 py-1.5 rounded-lg text-white outline-none"
                        >
                          <option value="gaming">ألعاب (Gaming)</option>
                          <option value="podcast">بودكاست وحوار (Podcast)</option>
                          <option value="minimal">بسيط ونظيف (Minimal)</option>
                          <option value="esports">رياضات إلكترونية (Esports)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">لون التمييز (Accent Color)</label>
                        <input
                          type="color"
                          value={newTemplateColor}
                          onChange={(e) => setNewTemplateColor(e.target.value)}
                          className="w-full h-8 rounded border border-zinc-700 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">الوصف</label>
                      <input
                        type="text"
                        placeholder="وصف القالب وتأثيراته..."
                        value={newTemplateDesc}
                        onChange={(e) => setNewTemplateDesc(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 text-xs px-2.5 py-1.5 rounded-lg text-white outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddTemplate(false)}
                        className="px-3 py-1 rounded-lg text-xs bg-zinc-800 text-zinc-300"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 rounded-lg text-xs font-bold bg-red-600 text-white"
                      >
                        حفظ القالب
                      </button>
                    </div>
                  </form>
                )}

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {adminConfig.overlayTemplates.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow"
                          style={{ backgroundColor: t.accentColor }}
                        >
                          <Palette className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{t.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                              {t.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400">{t.description}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTemplate(t.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                        title="حذف القالب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Ingest Servers & API Keys */}
            {activeTab === 'ingests' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    سيرفرات البث والمفاتيح (Streaming Ingests & Keys)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    تحديث خيارات التشفير وسيرفرات RTMP و SRT المتاحة للمستخدمين ديناميكياً.
                  </p>
                </div>

                {/* Ingest Endpoints */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-emerald-400" />
                      سيرفرات البث الموثوقة المدمجة:
                    </span>
                    <button
                      onClick={() => setShowAddIngest(!showAddIngest)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة سيرفر</span>
                    </button>
                  </div>

                  {showAddIngest && (
                    <form
                      onSubmit={handleAddIngest}
                      className="p-3 bg-zinc-950 rounded-xl border border-zinc-700 space-y-2"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="اسم السيرفر (مثال: خادم الرياض SRT)"
                          value={newIngestName}
                          onChange={(e) => setNewIngestName(e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-white"
                        />
                        <select
                          value={newIngestProto}
                          onChange={(e) => setNewIngestProto(e.target.value as any)}
                          className="bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-white"
                        >
                          <option value="SRT">SRT (Low Latency)</option>
                          <option value="RTMP">RTMP / RTMPS</option>
                        </select>
                        <input
                          type="text"
                          placeholder="srt://me.streamstudio.io:9000"
                          value={newIngestUrl}
                          onChange={(e) => setNewIngestUrl(e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-white font-mono"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddIngest(false)}
                          className="px-2.5 py-0.5 text-xs bg-zinc-800 text-zinc-300 rounded"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-0.5 text-xs font-bold bg-emerald-600 text-white rounded"
                        >
                          إضافة
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {adminConfig.customIngests.map((ing) => (
                      <div
                        key={ing.id}
                        className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between font-mono text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-sans">{ing.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-emerald-400 text-[10px]">
                            {ing.protocol}
                          </span>
                          <span className="text-zinc-500 text-[11px] truncate max-w-sm">
                            {ing.url}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteIngest(ing.id)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Keys Configuration */}
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    مفاتيح التكامل البرمجي للمنصات (Platform API Integration):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Twitch Client ID / Secret</label>
                      <input
                        type="password"
                        defaultValue="tc_live_8912781923_sec"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">YouTube Data API v3 Key</label>
                      <input
                        type="password"
                        defaultValue="AIzaSyA8912093_yt_live"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Architecture & C++/Rust Boilerplate (Housed inside Admin exclusively!) */}
            {activeTab === 'code' && (
              <div className="flex-1 flex overflow-hidden">
                {/* File list */}
                <div className="w-72 bg-zinc-950/80 border-l border-zinc-800 p-3 space-y-1.5 shrink-0 overflow-y-auto">
                  <span className="text-[11px] font-bold text-zinc-400 px-2 block mb-2">
                    ملفات نواة المعالجة (C++ / Rust):
                  </span>
                  {BOILERPLATE_FILES.map((file, idx) => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFileIdx(idx)}
                      className={`w-full text-right p-2.5 rounded-xl text-xs transition border flex flex-col gap-1 cursor-pointer ${
                        selectedFileIdx === idx
                          ? 'bg-red-600/20 text-white border-red-500/60 shadow'
                          : 'bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 border-zinc-850'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span className="truncate">{file.name}</span>
                        <span className="text-[9px] mono-font uppercase bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                          {file.language}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate mono-font">
                        {file.path}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Code view */}
                <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
                  <div className="h-12 px-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0">
                    <div>
                      <span className="mono-font text-xs font-bold text-red-300">
                        {selectedFile.path}
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        {selectedFile.descriptionAr}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedFile.code);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الكود</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex-1 overflow-auto p-4 mono-font text-xs text-zinc-300 bg-zinc-950 leading-relaxed">
                    <pre className="whitespace-pre font-mono">
                      <code>{selectedFile.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="h-14 px-6 bg-zinc-850 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-500">
            لوحة الإدارة والمطورين - منفصلة تماماً عن واجهة صناع المحتوى.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-750 text-white transition cursor-pointer"
          >
            إغلاق لوحة الأدمن
          </button>
        </div>
      </div>
    </div>
  );
};
