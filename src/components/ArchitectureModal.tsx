import React, { useState } from 'react';
import { BOILERPLATE_FILES, RECOMMENDED_PROJECT_STRUCTURE, ArchitectureFile } from '../data/architectureDocs';
import {
  X,
  Code2,
  FolderTree,
  FileCode,
  Copy,
  Check,
  Cpu,
  Zap,
  Radio,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'boilerplate' | 'structure'>('boilerplate');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedFile = BOILERPLATE_FILES[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                الهيكل البرمجي الموصى به وأكواد البناء (Architecture & Boilerplate)
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  OBS Architecture Reference
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                توثيق الربط بين واجهة المستخدم ومحرك المعالجة النواة C++/Rust وتسريع NVENC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="h-11 bg-zinc-950 border-b border-zinc-800 px-6 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('boilerplate')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'boilerplate'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>أكواد النواة التأسيسية (Boilerplate Code)</span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'structure'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>هيكل المجلدات (Project Monorepo Structure)</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>مخطط تدفق البيانات (Architecture Pipeline)</span>
          </button>
        </div>

        {/* Tab 1: Boilerplate Code Explorer */}
        {activeTab === 'boilerplate' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left/Right Sidebar: File Selector */}
            <div className="w-72 bg-zinc-950/80 border-l border-zinc-800 p-3 space-y-1.5 shrink-0 overflow-y-auto">
              <span className="text-[11px] font-bold text-zinc-400 px-2 block mb-2">
                ملفات كود الربط التأسيسي:
              </span>
              {BOILERPLATE_FILES.map((file, idx) => (
                <button
                  key={file.name}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-right p-2.5 rounded-xl text-xs transition border flex flex-col gap-1 ${
                    selectedFileIndex === idx
                      ? 'bg-indigo-600/20 text-white border-indigo-500/60 shadow'
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

              <div className="mt-4 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                <span className="font-bold text-indigo-400 block mb-1">
                  💡 سرعة واستقرار البث:
                </span>
                تعتمد برامج البث الكبرى (مثل OBS Studio) على فصل واجهة المستخدم تماماً عن محرك الرسوم والتشفير لتفادي أي تجميد أثناء الضغط.
              </div>
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
              {/* File Info & Copy Button */}
              <div className="h-12 px-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0">
                <div>
                  <span className="mono-font text-xs font-bold text-indigo-300">
                    {selectedFile.path}
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    {selectedFile.descriptionAr}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition cursor-pointer"
                >
                  {copied ? (
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

              {/* Code Text Area */}
              <div className="flex-1 overflow-auto p-4 mono-font text-xs text-zinc-300 bg-zinc-950 leading-relaxed">
                <pre className="whitespace-pre font-mono">
                  <code>{selectedFile.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Project Structure Explorer */}
        {activeTab === 'structure' && (
          <div className="flex-1 overflow-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  الهيكل البرمجي الموصى به للمشروع (Monorepo Repository Architecture)
                </h3>
                <p className="text-xs text-zinc-400">
                  تنظيم متكامل يفصل بين تطبيق سطح المكتب (Desktop UI)، محرك C++/Rust، ووحدات الالتقاط والشبكة.
                </p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(RECOMMENDED_PROJECT_STRUCTURE)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:text-white transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الهيكل</span>
              </button>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mono-font text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              <pre className="whitespace-pre font-mono">
                {RECOMMENDED_PROJECT_STRUCTURE}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Architecture Pipeline Diagram */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-base font-bold text-white">
                مخطط تدفق البيانات بين الواجهة والمحرك العتادي
              </h3>
              <p className="text-xs text-zinc-400">
                كيف تتدفق إطارات الفيديو وعينات الصوت من أجهزة الإدخال حتى خوادم البث (Twitch / YouTube) بدون أي بطء
              </p>
            </div>

            {/* Pipeline Flow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1: Input & UI */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold mb-3">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    واجهة المستخدم (React / Tauri)
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    إدارة المشاهد، المصادر، الميكسر، والتنبيهات. ترسل أوامر التغيير خفيفة الوزن عبر IPC Message Bus (Shared Memory / Unix Sockets).
                  </p>
                </div>
                <div className="mt-3 text-[10px] mono-font text-sky-400 bg-sky-950/40 p-1.5 rounded">
                  Latency: &lt; 0.5ms (IPC)
                </div>
              </div>

              {/* Step 2: Compositor & DSP */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-3">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    محرك الدمج الرسومي (C++ / D3D11)
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    دمج أسطح الفيديو (GPU Textures)، عزل الكروما الخضراء، وتطبيق مؤثرات الصوت (Noise Gate + Compressor) في ذاكرة موازية.
                  </p>
                </div>
                <div className="mt-3 text-[10px] mono-font text-indigo-400 bg-indigo-950/40 p-1.5 rounded">
                  DirectX 11 / Vulkan Pipeline
                </div>
              </div>

              {/* Step 3: Hardware NVENC */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-emerald-500/40 flex flex-col justify-between shadow-lg shadow-emerald-500/10">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    المشفر العتادي (NVIDIA NVENC)
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    تشفير حزم الفيديو H.264 / AV1 مباشرة داخل عتاد كارت الشاشة (ASIC Chip) بمعدل CBR ثابت وتأخير صفر إطارات.
                  </p>
                </div>
                <div className="mt-3 text-[10px] mono-font text-emerald-400 bg-emerald-950/40 p-1.5 rounded">
                  Encode Time: ~2.1ms (0% CPU)
                </div>
              </div>

              {/* Step 4: RTMP / SRT Network */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mb-3">
                    4
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    مقسم البث (RTMP / SRT Muxer)
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    دمج الفيديو والصوت في حاويات FLV/MPEG-TS وإرسالها عبر بروتوكول RTMP أو SRT المقاوم لفقدان الحزم إلى Twitch / YouTube.
                  </p>
                </div>
                <div className="mt-3 text-[10px] mono-font text-rose-400 bg-rose-950/40 p-1.5 rounded">
                  SRT Latency Buffer: 120ms
                </div>
              </div>
            </div>

            {/* Architectural Recommendations Summary */}
            <div className="bg-zinc-850 p-5 rounded-2xl border border-zinc-700 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                توصيات المهندسين لبناء النسخة الإنتاجية:
              </h4>
              <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-white">إطار العمل للواجهة (UI Framework):</strong> يُفضل استخدام <strong className="text-indigo-400">Tauri v2 (Rust)</strong> أو <strong className="text-indigo-400">Electron</strong> مع React و Tailwind CSS. Tauri يستهلك 30MB فقط من الذاكرة مقارنة بـ 200MB في Electron.
                </li>
                <li>
                  <strong className="text-white">نواة المعالجة (Processing Engine):</strong> يمكن إعادة استخدام مكتبة <strong className="text-indigo-400">libobs</strong> (النواة البرمجية المفتوحة المصدر لـ OBS Studio المكتوبة بلغة C) وربطها عبر C++ N-API مع واجهة المستخدم.
                </li>
                <li>
                  <strong className="text-white">التشفير العتادي (Hardware NVENC):</strong> استخدام NVIDIA Video Codec SDK مباشرة أو عبر مكتبة FFmpeg المترجمة مع دعم <code className="text-emerald-400 bg-zinc-900 px-1 rounded">--enable-nvenc</code> لضمان استقرار فائق.
                </li>
                <li>
                  <strong className="text-white">فصل قنوات الصوت (Application Audio Isolation):</strong> على نظام ويندوز يتم استخدام واجهة <strong className="text-indigo-400">Windows Audio Session API (WASAPI Loopback)</strong> لالتقاط صوت كل تطبيق (مثل Discord أو اللعبة) بشكل مستقل تماماً.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="h-14 px-6 bg-zinc-850 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-400">
            يمكنك نسخ أي كود واستخدامه مباشرة في مشروعك الإنتاجي.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
