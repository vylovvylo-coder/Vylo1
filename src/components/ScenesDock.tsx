import React, { useState } from 'react';
import { Scene } from '../types/studio';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  X,
} from 'lucide-react';

interface ScenesDockProps {
  scenes: Scene[];
  activeSceneId: string;
  onSelectScene: (id: string) => void;
  onAddScene: (name: string) => void;
  onDuplicateScene: (id: string) => void;
  onDeleteScene: (id: string) => void;
  onReorderScene: (id: string, direction: 'up' | 'down') => void;
  onRenameScene: (id: string, newName: string) => void;
}

export const ScenesDock: React.FC<ScenesDockProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onReorderScene,
  onRenameScene,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    if (!newSceneName.trim()) return;
    onAddScene(newSceneName.trim());
    setNewSceneName('');
    setIsAdding(false);
  };

  const startRename = (scene: Scene) => {
    setEditingId(scene.id);
    setEditingName(scene.name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      onRenameScene(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full select-none shrink-0">
      {/* Dock Header */}
      <div className="h-9 px-3 bg-zinc-850 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          المشاهد (Scenes)
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">
          {scenes.length} مشهد
        </span>
      </div>

      {/* Scenes List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {scenes.map((scene, idx) => {
          const isActive = scene.id === activeSceneId;
          const isEditing = scene.id === editingId;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer border ${
                isActive
                  ? 'bg-indigo-600/20 text-white border-indigo-500/50 shadow-sm'
                  : 'bg-zinc-950/40 hover:bg-zinc-800/80 text-zinc-300 border-zinc-850 hover:border-zinc-700'
              }`}
            >
              {isEditing ? (
                <div
                  className="flex items-center gap-1 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveRename(scene.id)}
                    className="flex-1 bg-zinc-800 border border-indigo-500 text-xs px-1.5 py-0.5 rounded text-white outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => saveRename(scene.id)}
                    className="p-1 hover:text-emerald-400"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-indigo-400 shadow-sm shadow-indigo-400' : 'bg-zinc-600'
                      }`}
                    />
                    <span className="font-medium truncate">{scene.name}</span>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(scene);
                      }}
                      className="p-1 text-zinc-400 hover:text-zinc-200"
                      title="إعادة التسمية"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateScene(scene.id);
                      }}
                      className="p-1 text-zinc-400 hover:text-zinc-200"
                      title="نسخ المشهد"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {scenes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScene(scene.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-red-400"
                        title="حذف المشهد"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {isAdding && (
          <div className="p-2 bg-zinc-800 rounded-lg border border-indigo-500/50 space-y-2 mt-2">
            <input
              type="text"
              placeholder="اسم المشهد الجديد..."
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="w-full bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-white outline-none focus:border-indigo-400"
              autoFocus
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => setIsAdding(false)}
                className="px-2 py-0.5 text-[11px] rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-650"
              >
                إلغاء
              </button>
              <button
                onClick={handleAdd}
                className="px-2.5 py-0.5 text-[11px] font-bold rounded bg-indigo-600 text-white hover:bg-indigo-500"
              >
                إضافة
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dock Bottom Toolbar */}
      <div className="h-10 bg-zinc-900/90 border-t border-zinc-800 px-2 flex items-center justify-between">
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>مشهد جديد</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onReorderScene(activeSceneId, 'up')}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition"
            title="تحريك لأعلى"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onReorderScene(activeSceneId, 'down')}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition"
            title="تحريك لأسفل"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
