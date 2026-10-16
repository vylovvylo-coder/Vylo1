import React, { useState } from 'react';
import { SourceItem, SourceType, OverlayTemplate } from '../types/studio';
import {
  Boxes,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Sliders,
  ChevronUp,
  ChevronDown,
  Camera,
  Monitor,
  Video,
  Globe,
  Type,
  Palette,
  Bell,
  MessageSquare,
  Sparkles,
  Check,
} from 'lucide-react';

interface SourcesDockProps {
  sources: SourceItem[];
  selectedSourceId: string | null;
  onSelectSource: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteSource: (id: string) => void;
  onReorderSource: (id: string, direction: 'up' | 'down') => void;
  onAddSource: (type: SourceType) => void;
  onOpenProperties: (source: SourceItem) => void;
  overlayTemplates?: OverlayTemplate[];
  onApplyTemplate?: (template: OverlayTemplate) => void;
}

export const SourcesDock: React.FC<SourcesDockProps> = ({
  sources,
  selectedSourceId,
  onSelectSource,
  onToggleVisibility,
  onToggleLock,
  onDeleteSource,
  onReorderSource,
  onAddSource,
  onOpenProperties,
  overlayTemplates = [],
  onApplyTemplate,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);

  // Sources are stacked by zIndex ascending (top in UI is highest zIndex)
  const sortedSources = [...sources].sort((a, b) => b.zIndex - a.zIndex);

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'camera':
        return <Camera className="w-3.5 h-3.5 text-sky-400" />;
      case 'display':
        return <Monitor className="w-3.5 h-3.5 text-blue-400" />;
      case 'media':
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'browser':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-amber-400" />;
      case 'color':
        return <Palette className="w-3.5 h-3.5 text-purple-400" />;
      case 'alert_overlay':
        return <Bell className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'chat_overlay':
        return <MessageSquare className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <Boxes className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full select-none shrink-0 relative">
      {/* Dock Header */}
      <div className="h-9 px-3 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <Boxes className="w-3.5 h-3.5 text-indigo-400" />
          المصادر (Sources)
        </span>
        <div className="flex items-center gap-1.5">
          {overlayTemplates.length > 0 && (
            <button
              onClick={() => {
                setShowTemplatesMenu(!showTemplatesMenu);
                setShowAddMenu(false);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition cursor-pointer"
              title="قوالب التراكبات الجاهزة المصممة من المشرف"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>القوالب والتراكبات</span>
            </button>
          )}
          <span className="text-[10px] text-zinc-500 font-mono">
            {sources.length} مصدر
          </span>
        </div>
      </div>

      {/* Overlay Templates Menu (Admin-Configured Presets) */}
      {showTemplatesMenu && (
        <div className="absolute top-9 right-2 left-2 z-40 bg-zinc-900 border border-purple-500/40 rounded-xl shadow-2xl p-2.5 space-y-2 backdrop-blur-md animate-in fade-in">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
            <span className="text-[11px] font-bold text-white flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              قوالب وتراكبات البث الجاهزة:
            </span>
            <button
              onClick={() => setShowTemplatesMenu(false)}
              className="text-zinc-500 hover:text-white text-xs"
            >
              ×
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            اختر قالباً لتطبيقه فوراً على المشهد الحالي مع ألوان وإطارات متناسقة:
          </p>
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {overlayTemplates.map((t) => (
              <div
                key={t.id}
                className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-purple-500/50 transition flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow"
                    style={{ backgroundColor: t.accentColor }}
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{t.name}</div>
                    <div className="text-[9px] text-zinc-400 truncate">{t.description}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onApplyTemplate) onApplyTemplate(t);
                    setShowTemplatesMenu(false);
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold bg-purple-600 hover:bg-purple-500 text-white rounded transition shrink-0 cursor-pointer shadow"
                >
                  تطبيق
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {sortedSources.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center text-zinc-500 text-xs">
            <Boxes className="w-8 h-8 mb-2 opacity-30" />
            <p>لا توجد مصادر في هذا المشهد</p>
            <p className="text-[11px] text-zinc-600 mt-1">
              اضغط على زر (+) لإضافة كاميرا، شاشة، أو وسائط
            </p>
          </div>
        ) : (
          sortedSources.map((source) => {
            const isSelected = source.id === selectedSourceId;

            return (
              <div
                key={source.id}
                onClick={() => onSelectSource(source.id)}
                className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition cursor-pointer border ${
                  isSelected
                    ? 'bg-zinc-800 text-white border-indigo-500/80 shadow'
                    : 'bg-zinc-950/40 hover:bg-zinc-850 text-zinc-300 border-zinc-850'
                } ${!source.visible ? 'opacity-40' : ''}`}
              >
                {/* Left side: Icon & Title */}
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <span className="shrink-0">{getSourceIcon(source.type)}</span>
                  <span className="font-medium truncate">{source.name}</span>
                </div>

                {/* Right side: Quick Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Eye / Visibility */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(source.id);
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-200 transition"
                    title={source.visible ? 'إخفاء المصدر' : 'إظهار المصدر'}
                  >
                    {source.visible ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                    )}
                  </button>

                  {/* Lock / Unlock */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(source.id);
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-200 transition"
                    title={source.locked ? 'فتح التحريك' : 'قفل الموضع'}
                  >
                    {source.locked ? (
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </button>

                  {/* Properties Modal Cog */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProperties(source);
                    }}
                    className="p-1 text-zinc-400 hover:text-indigo-300 transition"
                    title="خصائص المصدر وفلاتر الكروما كى"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSource(source.id);
                    }}
                    className="p-1 text-zinc-500 hover:text-red-400 transition"
                    title="حذف المصدر"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Source Dropdown Menu */}
      {showAddMenu && (
        <div
          className="absolute bottom-11 right-2 left-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-bold text-zinc-400 px-2 py-1 border-b border-zinc-700/60 mb-1 flex items-center justify-between">
            <span>إضافة مصدر جديد</span>
            <button
              onClick={() => setShowAddMenu(false)}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <button
            onClick={() => {
              onAddSource('camera');
              setShowAddMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg hover:bg-zinc-700 text-zinc-200 transition text-right"
          >
            <Camera className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <div className="font-semibold">كاميرا الويب (Video Capture)</div>
              <div className="text-[10px] text-zinc-400">Webcam / بطاقة التقاط HDMI</div>
            </div>
          </button>

          <button
            onClick={() => {
              onAddSource('display');
              setShowAddMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg hover:bg-zinc-700 text-zinc-200 transition text-right"
          >
            <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="font-semibold">التقاط الشاشة (Display Capture)</div>
              <div className="text-[10px] text-zinc-400">سطح المكتب أو نافذة لعبة محددة</div>
            </div>
          </button>

          <button
            onClick={() => {
              onAddSource('media');
              setShowAddMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg hover:bg-zinc-700 text-zinc-200 transition text-right"
          >
            <Video className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <div className="font-semibold">مشغل وسائط (Media Source)</div>
              <div className="text-[10px] text-zinc-400">فيديو مسجل مسبقاً أو أنيميشن متكرر</div>
            </div>
          </button>

          <button
            onClick={() => {
              onAddSource('browser');
              setShowAddMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg hover:bg-zinc-700 text-zinc-200 transition text-right"
          >
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold">متصفح الويب (Browser Source)</div>
              <div className="text-[10px] text-zinc-400">ودجات HTML / مؤشرات Streamlabs</div>
            </div>
          </button>

          <button
            onClick={() => {
              onAddSource('text');
              setShowAddMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg hover:bg-zinc-700 text-zinc-200 transition text-right"
          >
            <Type className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-semibold">نص متحرك (Text GDI+)</div>
              <div className="text-[10px] text-zinc-400">شريط أخبار ماركي أو رسائل ثابتة</div>
            </div>
          </button>

          <button
            onClick={() => {
              onAddSource('alert_overlay');
              setShowAddMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg hover:bg-zinc-700 text-zinc-200 transition text-right"
          >
            <Bell className="w-4 h-4 text-fuchsia-400 shrink-0" />
            <div>
              <div className="font-semibold">طبقة التنبيهات (Alerts Overlay)</div>
              <div className="text-[10px] text-zinc-400">إشعارات المتابعين والاشتراكات الفورية</div>
            </div>
          </button>

          <button
            onClick={() => {
              onAddSource('chat_overlay');
              setShowAddMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg hover:bg-zinc-700 text-zinc-200 transition text-right"
          >
            <MessageSquare className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <div className="font-semibold">شات البث (Live Chat Overlay)</div>
              <div className="text-[10px] text-zinc-400">عرض رسائل الدردشة على شاشة البث</div>
            </div>
          </button>
        </div>
      )}

      {/* Dock Bottom Toolbar */}
      <div className="h-10 bg-zinc-900/90 border-t border-zinc-800 px-2 flex items-center justify-between">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة مصدر</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => selectedSourceId && onReorderSource(selectedSourceId, 'up')}
            disabled={!selectedSourceId}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition disabled:opacity-30"
            title="رفع لأعلى (تقديم الطبقة)"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedSourceId && onReorderSource(selectedSourceId, 'down')}
            disabled={!selectedSourceId}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition disabled:opacity-30"
            title="خفض لأسفل (تأخير الطبقة)"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
