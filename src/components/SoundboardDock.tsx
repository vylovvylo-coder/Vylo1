import React, { useState, useEffect } from 'react';
import { VoiceChangerEffect, SoundboardItem, TtsConfig } from '../types/studio';
import { audioEngine } from '../services/audioEngine';
import {
  Volume2,
  Sparkles,
  Bot,
  Flame,
  Radio,
  Music,
  Laugh,
  Award,
  Bell,
  VolumeX,
  Play,
  Square,
  Mic,
  MessageSquare,
  Sliders,
  Check,
} from 'lucide-react';

interface SoundboardDockProps {
  activeVoiceEffect: VoiceChangerEffect;
  onSelectVoiceEffect: (effect: VoiceChangerEffect) => void;
  ttsConfig: TtsConfig;
  onUpdateTtsConfig: (updates: Partial<TtsConfig>) => void;
}

export const SoundboardDock: React.FC<SoundboardDockProps> = ({
  activeVoiceEffect,
  onSelectVoiceEffect,
  ttsConfig,
  onUpdateTtsConfig,
}) => {
  const [ttsInput, setTtsInput] = useState('شكراً يا أسطورة على الدعم الخرافي! ❤️');
  const [activePad, setActivePad] = useState<string | null>(null);

  const soundboardPads: SoundboardItem[] = [
    { id: 'sb_airhorn', nameAr: 'زامور هواء', nameEn: 'Airhorn', emoji: '📯', hotkey: '1', soundType: 'airhorn', color: 'from-amber-600 to-yellow-600' },
    { id: 'sb_applause', nameAr: 'تصفيق حار', nameEn: 'Applause', emoji: '👏', hotkey: '2', soundType: 'applause', color: 'from-emerald-600 to-teal-600' },
    { id: 'sb_laughter', nameAr: 'ضحك جمهور', nameEn: 'Laughter', emoji: '😂', hotkey: '3', soundType: 'laughter', color: 'from-pink-600 to-rose-600' },
    { id: 'sb_rimshot', nameAr: 'طبول دراما', nameEn: 'Rimshot', emoji: '🥁', hotkey: '4', soundType: 'rimshot', color: 'from-indigo-600 to-blue-600' },
    { id: 'sb_buzzer', nameAr: 'طنين الخطأ', nameEn: 'Buzzer', emoji: '❌', hotkey: '5', soundType: 'buzzer', color: 'from-red-600 to-rose-700' },
    { id: 'sb_victory', nameAr: 'نغمة الفوز', nameEn: 'Victory', emoji: '🏆', hotkey: '6', soundType: 'victory', color: 'from-purple-600 to-indigo-600' },
    { id: 'sb_boom', nameAr: 'انفجار Boom', nameEn: 'Impact', emoji: '💥', hotkey: '7', soundType: 'boom', color: 'from-orange-600 to-red-600' },
    { id: 'sb_laser', nameAr: 'ليزر فضائي', nameEn: 'Sci-Fi Laser', emoji: '🛸', hotkey: '8', soundType: 'laser', color: 'from-cyan-600 to-blue-600' },
  ];

  const handleTriggerSound = (pad: SoundboardItem) => {
    audioEngine.playSoundboardEffect(pad.soundType);
    setActivePad(pad.id);
    setTimeout(() => setActivePad(null), 400);
  };

  // Listen to keyboard hotkeys 1 to 8 when not typing in an input
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const targetPad = soundboardPads.find((p) => p.hotkey === e.key);
      if (targetPad) {
        e.preventDefault();
        handleTriggerSound(targetPad);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSpeakTts = () => {
    if (!ttsInput.trim()) return;
    audioEngine.speakText(ttsInput.trim(), ttsConfig.voiceLang);
  };

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-3 select-none flex flex-col md:flex-row gap-4">
      {/* 1. Live AI Voice Changer Section */}
      <div className="w-full md:w-72 bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800/80 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              مغير الصوت الفوري (Live Voice Changer)
            </span>
            <span className="text-[9px] mono-font text-purple-400 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-500/30">
              DSP Pitch & Ring
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'off', label: 'صوت طبيعي', icon: '🎙️' },
              { id: 'robot', label: 'روبوت معدني', icon: '🤖' },
              { id: 'deep_giant', label: 'عملاق عميق', icon: '🗿' },
              { id: 'synth_autotune', label: 'أوتوتيون سينث', icon: '🎵' },
              { id: 'anime_helium', label: 'صوت أنمي', icon: '🌸' },
              { id: 'walkie_talkie', label: 'لاسلكي راديو', icon: '📻' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => onSelectVoiceEffect(v.id as VoiceChangerEffect)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  activeVoiceEffect === v.id
                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                }`}
              >
                <span>{v.icon}</span>
                <span className="truncate">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 text-[10px] text-zinc-400 leading-tight">
          يتم تطبيق المؤثر مباشرة على مسار الميكروفون الحقيقي دون أي تأخير زمني.
        </div>
      </div>

      {/* 2. Interactive Soundboard Grid */}
      <div className="flex-1 bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            لوحة المؤثرات الصوتية (Soundboard Pads)
          </span>
          <span className="text-[10px] text-zinc-400">
            اضغط على الزر أو الأرقام [1 - 8] من لوحة المفاتيح
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {soundboardPads.map((pad) => (
            <button
              key={pad.id}
              onClick={() => handleTriggerSound(pad)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition transform active:scale-95 cursor-pointer ${
                activePad === pad.id
                  ? 'bg-gradient-to-r ' + pad.color + ' text-white border-white scale-105 shadow-xl'
                  : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span className="text-lg">{pad.emoji}</span>
              <div className="text-right truncate">
                <div className="text-xs font-bold truncate">{pad.nameAr}</div>
                <div className="text-[9px] mono-font text-zinc-400">[{pad.hotkey}] {pad.nameEn}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Text-to-Speech (TTS) Engine for Donations */}
      <div className="w-full md:w-80 bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800/80 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              القارئ الصوتي التفاعلي (TTS)
            </span>
            <label className="flex items-center gap-1 text-[10px] text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={ttsConfig.autoReadDonations}
                onChange={(e) => onUpdateTtsConfig({ autoReadDonations: e.target.checked })}
                className="w-3 h-3 rounded accent-sky-500"
              />
              <span>قراءة التبرعات آلياً</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <input
              type="text"
              value={ttsInput}
              onChange={(e) => setTtsInput(e.target.value)}
              placeholder="اكتب نصاً لتجربة القارئ الصوتي..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-sky-500"
            />

            <div className="flex items-center gap-2">
              <select
                value={ttsConfig.voiceLang}
                onChange={(e) => onUpdateTtsConfig({ voiceLang: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 text-[11px] rounded-lg p-1.5 text-zinc-300 outline-none"
              >
                <option value="ar-SA">🇸🇦 صوت عربي (Saudi Arabic)</option>
                <option value="en-US">🇺🇸 صوت إنجليزي (US English)</option>
              </select>

              <button
                onClick={handleSpeakTts}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="نطق الرسالة"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تشغيل</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-2 text-[10px] text-zinc-500 leading-tight">
          يدعم محرك Web Speech API لنطق رسائل الدعم والمحادثة تلقائياً على البث.
        </div>
      </div>
    </div>
  );
};
