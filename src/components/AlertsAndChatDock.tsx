import React, { useState } from 'react';
import { StreamAlert, ChatMessage } from '../types/studio';
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
  Volume2,
  Trash2,
} from 'lucide-react';

interface AlertsAndChatDockProps {
  chatMessages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  onClearChat: () => void;
  onTriggerAlert: (type: 'follow' | 'sub' | 'donation' | 'raid', customUser?: string, customAmount?: string) => void;
}

export const AlertsAndChatDock: React.FC<AlertsAndChatDockProps> = ({
  chatMessages,
  onSendMessage,
  onClearChat,
  onTriggerAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'alerts'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [testUser, setTestUser] = useState('أحمد الجيمنج');
  const [testAmount, setTestAmount] = useState('25.00$');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const copyOverlayUrl = () => {
    navigator.clipboard.writeText('https://streamstudio.local/overlays/alerts?token=live_sec_89201a');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full select-none shrink-0">
      {/* Tab Switcher Header */}
      <div className="h-10 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between px-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>الشات المباشر (Chat)</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === 'alerts'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>التنبيهات (Alerts)</span>
          </button>
        </div>

        {activeTab === 'chat' && (
          <button
            onClick={onClearChat}
            className="p-1 text-zinc-500 hover:text-red-400 transition"
            title="مسح سجل الدردشة"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tab 1: Live Chat */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 text-xs p-4">
                <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                <p>لا توجد رسائل شات حالياً</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  اكتب رسالة تجريبية بالأسفل لاختبار ظهورها في البث
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-850 text-xs leading-relaxed hover:border-zinc-750 transition"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {msg.isMod && (
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                        MOD
                      </span>
                    )}
                    {msg.isSub && (
                      <span className="bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
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
              ))
            )}
          </div>

          {/* Chat Input Box */}
          <form
            onSubmit={handleSend}
            className="p-2 bg-zinc-850 border-t border-zinc-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="اكتب رسالة إلى الشات..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 text-xs px-2.5 py-1.5 rounded-lg text-white outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition"
              title="إرسال"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Alerts Engine */}
      {activeTab === 'alerts' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Simulation Trigger Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-300 block">
              اختبار التنبيهات المباشرة (Event Simulation)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onTriggerAlert('follow', testUser)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition text-right"
              >
                <Heart className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div>متابع جديد</div>
                  <div className="text-[10px] text-zinc-400">New Follower</div>
                </div>
              </button>

              <button
                onClick={() => onTriggerAlert('sub', testUser)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-600/15 hover:bg-pink-600/25 border border-pink-500/30 text-pink-300 text-xs font-semibold transition text-right"
              >
                <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                <div>
                  <div>مشترك Tier 3</div>
                  <div className="text-[10px] text-zinc-400">Subscriber</div>
                </div>
              </button>

              <button
                onClick={() => onTriggerAlert('donation', testUser, testAmount)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition text-right"
              >
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div>تبرع ودعم مالي</div>
                  <div className="text-[10px] text-zinc-400">SuperChat / Tip</div>
                </div>
              </button>

              <button
                onClick={() => onTriggerAlert('raid', 'قناة_الأسطورة', '850')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition text-right"
              >
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div>غارة مشاهدين</div>
                  <div className="text-[10px] text-zinc-400">Stream Raid</div>
                </div>
              </button>
            </div>
          </div>

          {/* Test Customization Parameters */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 block">
              تخصيص بيانات التجربة:
            </span>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-0.5">اسم المستخدم التجريبي</label>
              <input
                type="text"
                value={testUser}
                onChange={(e) => setTestUser(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-0.5">مبلغ التبرع</label>
              <input
                type="text"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-white outline-none"
              />
            </div>
          </div>

          {/* Browser Source URL Generator */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">
                رابط المتصفح للتنبيهات (Browser Source URL)
              </span>
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              يمكنك نسخ هذا الرابط ووضعه في أي تطبيق OBS آخر كـ Browser Source للدمج التلقائي للتنبيهات.
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value="https://streamstudio.local/overlays/alerts?token=live_sec_89201a"
                className="flex-1 bg-zinc-900 border border-zinc-800 text-[10px] mono-font px-2 py-1.5 rounded text-zinc-400 truncate outline-none"
              />
              <button
                onClick={copyOverlayUrl}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition"
                title="نسخ الرابط"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
