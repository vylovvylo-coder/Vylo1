import React, { useState } from 'react';
import { StreamAlert, ChatMessage, UnifiedFeedItem } from '../types/studio';
import {
  MessageSquare,
  Bell,
  Send,
  Sparkles,
  Heart,
  DollarSign,
  Users,
  Copy,
  Check,
  Gift,
  Zap,
  Filter,
  Trash2,
  Share2,
} from 'lucide-react';

interface UnifiedChatAlertsDockProps {
  feedItems: UnifiedFeedItem[];
  onSendMessage: (msg: string) => void;
  onClearFeed: () => void;
  onTriggerAlert: (type: 'follow' | 'sub' | 'donation' | 'raid', customUser?: string, customAmount?: string) => void;
}

export const UnifiedChatAlertsDock: React.FC<UnifiedChatAlertsDockProps> = ({
  feedItems,
  onSendMessage,
  onClearFeed,
  onTriggerAlert,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'chat' | 'alerts'>('all');
  const [chatInput, setChatInput] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const handleQuickTrigger = (
    type: 'follow' | 'sub' | 'donation' | 'raid',
    user?: string,
    amount?: string
  ) => {
    onTriggerAlert(type, user, amount);
    setCelebrationActive(true);
    setTimeout(() => setCelebrationActive(false), 2500);
  };

  const copyOverlayUrl = () => {
    navigator.clipboard.writeText('https://streamstudio.local/overlays/unified?token=sec_live_9942');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const filteredItems = feedItems.filter((item) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'chat') return item.kind === 'chat';
    if (filterMode === 'alerts') return item.kind === 'alert';
    return true;
  });

  return (
    <div className="w-84 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full select-none shrink-0 relative">
      {/* Header with Unified Filter Controls */}
      <div className="h-10 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between px-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              الموجز الموحد (الكل)
            </button>
            <button
              onClick={() => setFilterMode('chat')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                filterMode === 'chat'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              شات
            </button>
            <button
              onClick={() => setFilterMode('alerts')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                filterMode === 'alerts'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              تنبيهات
            </button>
          </div>
        </div>

        <button
          onClick={onClearFeed}
          className="p-1 text-zinc-500 hover:text-red-400 transition"
          title="مسح سجل الشات والتنبيهات"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* One-Click Quick Alerts System Bar */}
      <div className="p-2 bg-zinc-950/90 border-b border-zinc-800/80 shrink-0">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            تنبيهات سريعة بنقرة واحدة (One-Click Alerts):
          </span>
          {celebrationActive && (
            <span className="text-[10px] font-black text-emerald-400 animate-pulse flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> تم البث على الشاشة!
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => handleQuickTrigger('follow', 'سلطان_الرياض')}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-purple-600/15 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-[10px] font-bold transition active:scale-95"
            title="إطلاق تنبيه متابع جديد"
          >
            <Heart className="w-3.5 h-3.5 text-purple-400 mb-0.5" />
            <span>متابع</span>
          </button>

          <button
            onClick={() => handleQuickTrigger('sub', 'فيصل_الغامدي', '5 اشتراكات')}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-pink-600/15 hover:bg-pink-600/30 border border-pink-500/30 text-pink-300 text-[10px] font-bold transition active:scale-95"
            title="إطلاق تنبيه إهداء اشتراكات"
          >
            <Gift className="w-3.5 h-3.5 text-pink-400 mb-0.5" />
            <span>إهداء ساب</span>
          </button>

          <button
            onClick={() => handleQuickTrigger('donation', 'سارة_ستريمز', '50.00$')}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition active:scale-95"
            title="إطلاق تنبيه تبرع وسوبرشات"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
            <span>دعم $50</span>
          </button>

          <button
            onClick={() => handleQuickTrigger('raid', 'كلان_الأساطير', '1,200')}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-amber-600/15 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition active:scale-95"
            title="إطلاق تنبيه غارة مشاهدين"
          >
            <Users className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
            <span>غارة Raid</span>
          </button>
        </div>
      </div>

      {/* Unified Live Messages & Alerts Feed */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 text-xs p-4">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
            <p>لا توجد تعليقات أو تنبيهات حالياً</p>
            <p className="text-[11px] text-zinc-600 mt-1">
              اضغط على أحد أزرار التنبيهات السريعة بالأعلى لتجربة ظهورها الفوري
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            if (item.kind === 'alert' && item.alert) {
              const a = item.alert;
              const isDonation = a.type === 'donation';
              const isSub = a.type === 'sub';

              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition shadow-sm ${
                    isDonation
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : isSub
                      ? 'bg-pink-950/40 border-pink-500/50 text-pink-200'
                      : 'bg-purple-950/40 border-purple-500/50 text-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-black px-1.5 py-0.5 rounded bg-black/40 border border-white/10 flex items-center gap-1">
                      {isDonation ? (
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                      ) : isSub ? (
                        <Gift className="w-3 h-3 text-pink-400" />
                      ) : (
                        <Heart className="w-3 h-3 text-purple-400" />
                      )}
                      {isDonation ? 'تبرع مالي فائق' : isSub ? 'اشتراك بالقناة' : 'متابعة جديدة'}
                    </span>
                    <span className="mono-font text-zinc-400">{item.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{a.username}</span>
                    {a.amount && (
                      <span className="mono-font text-xs font-black text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                        {a.amount}
                      </span>
                    )}
                  </div>

                  {a.message && (
                    <p className="text-[11px] text-zinc-300 mt-1 italic">
                      "{a.message}"
                    </p>
                  )}
                </div>
              );
            }

            if (item.kind === 'chat' && item.chat) {
              const msg = item.chat;
              return (
                <div
                  key={item.id}
                  className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-850 text-xs leading-relaxed hover:border-zinc-750 transition"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {msg.isMod && (
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-1 py-0.2 rounded">
                        MOD
                      </span>
                    )}
                    {msg.isSub && (
                      <span className="bg-purple-600 text-white text-[9px] font-black px-1 py-0.2 rounded">
                        SUB
                      </span>
                    )}
                    <span
                      className="font-bold cursor-pointer hover:underline"
                      style={{ color: msg.color || '#38bdf8' }}
                    >
                      {msg.username}
                    </span>
                    <span className="text-[9px] text-zinc-500 mr-auto mono-font">
                      {msg.timestamp}
                    </span>
                  </div>
                  <div className="text-zinc-200 break-words">{msg.message}</div>
                </div>
              );
            }
            return null;
          })
        )}
      </div>

      {/* Chat Input Box */}
      <form
        onSubmit={handleSend}
        className="p-2 bg-zinc-850 border-t border-zinc-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="إرسال تعليق للبث والشات..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 text-xs px-2.5 py-1.5 rounded-lg text-white outline-none focus:border-indigo-400"
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition cursor-pointer"
          title="إرسال التعليق"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Browser Source Link Footer */}
      <div className="px-2 py-1.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
        <span className="truncate">رابط ودجت المتصفح الموحد (Browser Source)</span>
        <button
          onClick={copyOverlayUrl}
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer shrink-0 ml-2"
        >
          {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copiedUrl ? 'تم النسخ!' : 'نسخ'}</span>
        </button>
      </div>
    </div>
  );
};
