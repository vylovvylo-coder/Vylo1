import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Scene, SourceItem, StreamAlert, ChatMessage } from '../types/studio';
import { compositor } from '../services/compositor';
import {
  ArrowLeftRight,
  Zap,
  Sliders,
  Eye,
  Crosshair,
  Maximize,
  Sparkles,
  Move,
} from 'lucide-react';

interface ViewportProps {
  activeScene: Scene | undefined;
  previewScene: Scene | undefined;
  isStudioMode: boolean;
  isGameBoost?: boolean;
  selectedSourceId: string | null;
  onSelectSource: (sourceId: string | null) => void;
  onUpdateSourceTransform: (sourceId: string, updates: Partial<SourceItem>) => void;
  onTransitionToProgram: (type: 'cut' | 'fade' | 'slide') => void;
  onDropMediaFile?: (file: File) => void;
  activeAlert: StreamAlert | null;
  chatMessages: ChatMessage[];
}

export const Viewport: React.FC<ViewportProps> = ({
  activeScene,
  previewScene,
  isStudioMode,
  isGameBoost = false,
  selectedSourceId,
  onSelectSource,
  onUpdateSourceTransform,
  onTransitionToProgram,
  onDropMediaFile,
  activeAlert,
  chatMessages,
}) => {
  const programCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [showSafeAreas, setShowSafeAreas] = useState(true);
  const [transitionDuration, setTransitionDuration] = useState(300);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  // Dragging and resizing state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; origX: number; origY: number; origW: number; origH: number }>({
    x: 0,
    y: 0,
    origX: 0,
    origY: 0,
    origW: 0,
    origH: 0,
  });

  // Keep compositor synced with alerts & chat
  useEffect(() => {
    compositor.setAlert(activeAlert);
  }, [activeAlert]);

  useEffect(() => {
    compositor.setChat(chatMessages);
  }, [chatMessages]);

  // Main rendering loop for Program canvas
  useEffect(() => {
    let animId: number;
    const canvas = programCanvasRef.current;
    if (canvas) {
      compositor.setCanvas(canvas);
      const loop = () => {
        compositor.render(activeScene, true);
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeScene]);

  // Separate render loop for Studio Mode Preview canvas
  useEffect(() => {
    if (!isStudioMode) return;
    let animId: number;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const sceneToRender = previewScene || activeScene;
      if (sceneToRender) {
        const sorted = [...sceneToRender.sources]
          .filter((s) => s.visible)
          .sort((a, b) => a.zIndex - b.zIndex);

        sorted.forEach((source) => {
          ctx.save();
          ctx.globalAlpha = source.opacity;
          const sx = (source.x / 1920) * canvas.width;
          const sy = (source.y / 1080) * canvas.height;
          const sw = (source.width / 1920) * canvas.width;
          const sh = (source.height / 1080) * canvas.height;

          // Render simplified preview representations
          ctx.fillStyle = source.type === 'camera' ? '#1e293b' : source.type === 'color' ? (source.customData?.bgColor || '#312e81') : '#0f172a';
          ctx.fillRect(sx, sy, sw, sh);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.strokeRect(sx, sy, sw, sh);

          ctx.fillStyle = '#ffffff';
          ctx.font = '12px "Cairo", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(source.name, sx + sw / 2, sy + sh / 2);
          ctx.restore();
        });
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isStudioMode, previewScene, activeScene]);

  // Calculate selected source bounding box for the overlay handles
  const targetScene = isStudioMode ? (previewScene || activeScene) : activeScene;
  const selectedSource = targetScene?.sources.find((s) => s.id === selectedSourceId);

  // Canvas coordinate transform helpers
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent) => {
      const canvas = programCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = 1920 / rect.width;
      const scaleY = 1080 / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const handleMouseDownOnSource = (e: React.MouseEvent, handle?: string) => {
    if (!selectedSource || selectedSource.locked) return;
    e.stopPropagation();
    const coords = getCanvasCoords(e);

    setDragStart({
      x: coords.x,
      y: coords.y,
      origX: selectedSource.x,
      origY: selectedSource.y,
      origW: selectedSource.width,
      origH: selectedSource.height,
    });

    if (handle) {
      setIsResizing(handle);
    } else {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedSource || (!isDragging && !isResizing)) return;
    const coords = getCanvasCoords(e);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    if (isDragging) {
      onUpdateSourceTransform(selectedSource.id, {
        x: Math.round(dragStart.origX + deltaX),
        y: Math.round(dragStart.origY + deltaY),
      });
    } else if (isResizing) {
      let newW = dragStart.origW;
      let newH = dragStart.origH;
      let newX = dragStart.origX;
      let newY = dragStart.origY;

      if (isResizing.includes('r')) {
        newW = Math.max(80, Math.round(dragStart.origW + deltaX));
      }
      if (isResizing.includes('b')) {
        newH = Math.max(50, Math.round(dragStart.origH + deltaY));
      }
      if (isResizing.includes('l')) {
        const potentialW = dragStart.origW - deltaX;
        if (potentialW >= 80) {
          newW = Math.round(potentialW);
          newX = Math.round(dragStart.origX + deltaX);
        }
      }
      if (isResizing.includes('t')) {
        const potentialH = dragStart.origH - deltaY;
        if (potentialH >= 50) {
          newH = Math.round(potentialH);
          newY = Math.round(dragStart.origY + deltaY);
        }
      }

      onUpdateSourceTransform(selectedSource.id, {
        x: newX,
        y: newY,
        width: newW,
        height: newH,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden select-none"
    >
      {/* Top viewport controls bar */}
      <div className="h-9 bg-zinc-900/90 border-b border-zinc-800/80 px-4 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {isStudioMode ? 'البث المباشر (Program Feed)' : 'منفذ العرض الرئيسي (Canvas Viewport)'}
          </span>
          <span className="mono-font text-[11px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
            1920 × 1080 | 60 FPS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Safe Area Guides Toggle */}
          <button
            onClick={() => setShowSafeAreas(!showSafeAreas)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition ${
              showSafeAreas ? 'bg-zinc-800 text-indigo-400 font-medium' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="إظهار حدود الأمان للشاشات (Action & Title Safe Margins)"
          >
            <Crosshair className="w-3.5 h-3.5" />
            حدود الأمان
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div className="flex-1 flex items-center justify-center p-3 gap-3 overflow-hidden relative">
        {/* Studio Mode Left Screen: PREVIEW */}
        {isStudioMode && (
          <div className="flex-1 h-full flex flex-col items-center justify-center relative">
            <div className="w-full text-center text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-900/40 py-1 rounded-t-md">
              المعاينة (PREVIEW) - المشهد القادم
            </div>
            <div className="relative w-full aspect-video bg-black rounded-b-md overflow-hidden border border-amber-900/30 shadow-2xl flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                width={1920}
                height={1080}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Studio Mode Transition Controls Bar (Middle) */}
        {isStudioMode && (
          <div className="flex flex-col items-center justify-center gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg shrink-0 z-20">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              انتقال
            </span>
            <button
              onClick={() => onTransitionToProgram('cut')}
              className="w-20 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow transition"
              title="انتقال فوري مباشر"
            >
              <Zap className="w-3.5 h-3.5" />
              قَطع (Cut)
            </button>
            <button
              onClick={() => onTransitionToProgram('fade')}
              className="w-20 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow transition"
              title="تلاشي تدريجي سلس"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              تلاشي (Fade)
            </button>
            <div className="w-full px-1 text-center">
              <span className="text-[10px] text-zinc-500 block">المدة</span>
              <span className="text-[11px] mono-font font-bold text-zinc-300">
                {transitionDuration}ms
              </span>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={transitionDuration}
                onChange={(e) => setTransitionDuration(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* PROGRAM Screen (Right in Studio Mode, or Full Center) */}
        <div className="flex-1 h-full flex flex-col items-center justify-center relative">
          {isStudioMode && (
            <div className="w-full text-center text-xs font-bold text-red-400 bg-red-950/40 border border-red-900/40 py-1 rounded-t-md">
              البث المباشر (PROGRAM) - ما يراه الجمهور الآن
            </div>
          )}

          <div
            className={`relative w-full aspect-video bg-black rounded-md overflow-hidden border shadow-2xl flex items-center justify-center group ${
              isDragOverCanvas ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-zinc-800'
            }`}
            onClick={() => onSelectSource(null)}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverCanvas(true);
            }}
            onDragLeave={() => setIsDragOverCanvas(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverCanvas(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0] && onDropMediaFile) {
                onDropMediaFile(e.dataTransfer.files[0]);
              }
            }}
          >
            {/* Primary Program Canvas */}
            <canvas
              ref={programCanvasRef}
              width={1920}
              height={1080}
              className="w-full h-full object-contain pointer-events-auto"
            />

            {/* Game Boost Mode Active Overlay Badge */}
            {isGameBoost && (
              <div className="absolute top-3 right-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur shadow flex items-center gap-1.5 z-20 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>GAME BOOST: -45% GPU Load • 60 FPS Hardware Encoding</span>
              </div>
            )}

            {/* Drag & Drop Visual Cue */}
            {isDragOverCanvas && (
              <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-xs flex flex-col items-center justify-center border-2 border-dashed border-indigo-400 z-40 pointer-events-none">
                <span className="text-sm font-bold text-white mb-1">أفلت الملف هنا للإضافة الفورية للمشهد</span>
                <span className="text-xs text-indigo-300">صور، فيديوهات، أو خلفيات</span>
              </div>
            )}

            {/* Safe Area Guidelines Overlay */}
            {showSafeAreas && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Action Safe (90%) */}
                <div className="absolute inset-[5%] border border-cyan-500/25 border-dashed">
                  <span className="absolute top-1 left-2 text-[9px] text-cyan-500/60 font-mono">
                    ACTION SAFE (90%)
                  </span>
                </div>
                {/* Title Safe (80%) */}
                <div className="absolute inset-[10%] border border-indigo-500/25 border-dotted">
                  <span className="absolute top-1 left-2 text-[9px] text-indigo-400/60 font-mono">
                    TITLE SAFE (80%)
                  </span>
                </div>
                {/* Center crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <div className="absolute top-0 left-1/2 w-[1px] h-4 bg-zinc-600/40 -translate-x-1/2"></div>
                  <div className="absolute top-1/2 left-0 w-4 h-[1px] bg-zinc-600/40 -translate-y-1/2"></div>
                </div>
              </div>
            )}

            {/* Interactive Transform Bounding Box for Selected Source */}
            {selectedSource && selectedSource.visible && !selectedSource.locked && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(selectedSource.x / 1920) * 100}%`,
                  top: `${(selectedSource.y / 1080) * 100}%`,
                  width: `${(selectedSource.width / 1920) * 100}%`,
                  height: `${(selectedSource.height / 1080) * 100}%`,
                }}
                onMouseDown={(e) => handleMouseDownOnSource(e)}
                className="border-2 border-red-500 cursor-move pointer-events-auto z-30 group/box"
              >
                {/* Source Name Tag */}
                <div className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none flex items-center gap-1">
                  <Move className="w-2.5 h-2.5" />
                  {selectedSource.name} ({selectedSource.width}×{selectedSource.height})
                </div>

                {/* 4 Corner Resize Handles */}
                <div
                  onMouseDown={(e) => handleMouseDownOnSource(e, 'tl')}
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-red-500 border border-white rounded-sm cursor-nwse-resize hover:scale-125 transition"
                />
                <div
                  onMouseDown={(e) => handleMouseDownOnSource(e, 'tr')}
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 border border-white rounded-sm cursor-nesw-resize hover:scale-125 transition"
                />
                <div
                  onMouseDown={(e) => handleMouseDownOnSource(e, 'bl')}
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-red-500 border border-white rounded-sm cursor-nesw-resize hover:scale-125 transition"
                />
                <div
                  onMouseDown={(e) => handleMouseDownOnSource(e, 'br')}
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-red-500 border border-white rounded-sm cursor-nwse-resize hover:scale-125 transition"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
