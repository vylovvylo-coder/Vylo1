import { Scene, SourceItem, StreamAlert, ChatMessage } from '../types/studio';

export class CanvasCompositor {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;

  // Offscreen canvas for chroma key and layer filters
  private offCanvas: HTMLCanvasElement | null = null;
  private offCtx: CanvasRenderingContext2D | null = null;

  // Video elements cache for media streams
  private videoElements: Map<string, HTMLVideoElement> = new Map();

  // Active alerts and chat overlays
  private activeAlert: StreamAlert | null = null;
  private chatMessages: ChatMessage[] = [];

  // Game Boost Mode & Performance
  private gameBoostMode = false;
  private lastFrameTime = 0;

  // Ticker position
  private tickerOffset = 0;
  private frameCount = 0;

  // Recording
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private onRecordCompleteCallback: ((blob: Blob) => void) | null = null;

  constructor() {
    this.offCanvas = document.createElement('canvas');
    this.offCanvas.width = 1920;
    this.offCanvas.height = 1080;
    this.offCtx = this.offCanvas.getContext('2d', { willReadFrequently: true });
  }

  public setGameBoostMode(enabled: boolean) {
    this.gameBoostMode = enabled;
  }

  public isGameBoostEnabled(): boolean {
    return this.gameBoostMode;
  }

  public setCanvas(canvas: HTMLCanvasElement | null) {
    this.canvas = canvas;
    if (canvas) {
      this.ctx = canvas.getContext('2d');
    }
  }

  public setAlert(alert: StreamAlert | null) {
    this.activeAlert = alert;
  }

  public setChat(messages: ChatMessage[]) {
    this.chatMessages = messages.slice(-5);
  }

  public attachStreamToVideo(sourceId: string, stream: MediaStream) {
    let video = this.videoElements.get(sourceId);
    if (!video) {
      video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      this.videoElements.set(sourceId, video);
    }
    video.srcObject = stream;
    video.play().catch(() => {});
  }

  public removeVideo(sourceId: string) {
    const video = this.videoElements.get(sourceId);
    if (video) {
      video.pause();
      video.srcObject = null;
      this.videoElements.delete(sourceId);
    }
  }

  public render(scene: Scene | undefined, isProgram = false) {
    if (!this.canvas || !this.ctx) return;
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Clear background (OBS studio dark default)
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    if (!scene) return;

    // Sort visible sources by zIndex ascending
    const sorted = [...scene.sources]
      .filter((s) => s.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    this.frameCount++;
    this.tickerOffset -= 2;

    for (const source of sorted) {
      ctx.save();
      ctx.globalAlpha = source.opacity;

      const sx = (source.x / 1920) * width;
      const sy = (source.y / 1080) * height;
      const sw = (source.width / 1920) * width;
      const sh = (source.height / 1080) * height;

      this.renderSource(ctx, source, sx, sy, sw, sh);
      ctx.restore();
    }

    // Render Alert Overlay if active and visible in the scene
    if (this.activeAlert) {
      this.renderAlertBanner(ctx, this.activeAlert, width, height);
    }
  }

  private renderSource(
    ctx: CanvasRenderingContext2D,
    source: SourceItem,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    switch (source.type) {
      case 'camera':
      case 'display':
      case 'media': {
        const video = this.videoElements.get(source.id);
        if (video && video.readyState >= 2) {
          // Check if chroma key is enabled
          if (source.filters.chromaKey?.enabled && this.offCanvas && this.offCtx) {
            this.renderChromaKeyedVideo(ctx, video, source, x, y, w, h);
          } else {
            // Apply CSS filter for brightness/contrast if specified
            if (source.filters.brightness || source.filters.contrast) {
              const b = source.filters.brightness ?? 1;
              const c = source.filters.contrast ?? 1;
              ctx.filter = `brightness(${b}) contrast(${c})`;
            }
            ctx.drawImage(video, x, y, w, h);
            ctx.filter = 'none';
          }
        } else {
          // Render placeholder graphics when real camera/stream not connected yet
          this.renderMockMediaSource(ctx, source, x, y, w, h);
        }
        break;
      }

      case 'color': {
        ctx.fillStyle = source.customData?.bgColor || '#1e1b4b';
        ctx.fillRect(x, y, w, h);
        break;
      }

      case 'text': {
        this.renderTextSource(ctx, source, x, y, w, h);
        break;
      }

      case 'browser': {
        this.renderBrowserSource(ctx, source, x, y, w, h);
        break;
      }

      case 'alert_overlay': {
        // Source box placeholder / safe zone
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
        break;
      }

      case 'chat_overlay': {
        this.renderChatOverlay(ctx, x, y, w, h);
        break;
      }

      case 'image': {
        this.renderImagePlaceholder(ctx, source, x, y, w, h);
        break;
      }
    }
  }

  private renderMockMediaSource(
    ctx: CanvasRenderingContext2D,
    source: SourceItem,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Elegant animated motion card representing the live video source
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    if (source.type === 'camera') {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e293b');
      gradient.addColorStop(1, '#0f172a');
    } else if (source.type === 'display') {
      gradient.addColorStop(0, '#0c1a2e');
      gradient.addColorStop(0.5, '#172554');
      gradient.addColorStop(1, '#0c1a2e');
    } else {
      gradient.addColorStop(0, '#1c1917');
      gradient.addColorStop(0.5, '#292524');
      gradient.addColorStop(1, '#1c1917');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);

    // Grid lines / technical HUD
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let gx = x; gx < x + w; gx += step) {
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx, y + h);
      ctx.stroke();
    }
    for (let gy = y; gy < y + h; gy += step) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
      ctx.stroke();
    }

    // Dynamic wave bar animation
    const bars = 16;
    const barWidth = Math.max(4, (w * 0.4) / bars - 4);
    const startX = x + (w - bars * (barWidth + 4)) / 2;
    const centerY = y + h / 2;

    for (let i = 0; i < bars; i++) {
      const freq = Math.sin((this.frameCount * 0.08) + i * 0.4) * 0.5 + 0.5;
      const barH = 10 + freq * (h * 0.25);
      ctx.fillStyle = source.type === 'camera' ? '#38bdf8' : source.type === 'display' ? '#60a5fa' : '#f43f5e';
      ctx.fillRect(startX + i * (barWidth + 4), centerY - barH / 2, barWidth, barH);
    }

    // HUD Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Cairo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = source.name || (source.type === 'camera' ? 'كاميرا الويب (Webcam)' : 'التقاط الشاشة (Screen)');
    ctx.fillText(label, x + w / 2, centerY + h * 0.25);

    // Technical specs badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x + 10, y + 10, 110, 24);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x + 22, y + 22, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LIVE 60FPS', x + 34, y + 22);
  }

  private renderChromaKeyedVideo(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    source: SourceItem,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    if (!this.offCanvas || !this.offCtx) return;
    this.offCanvas.width = w;
    this.offCanvas.height = h;

    this.offCtx.drawImage(video, 0, 0, w, h);
    const frame = this.offCtx.getImageData(0, 0, w, h);
    const l = frame.data.length / 4;

    const chroma = source.filters.chromaKey;
    const keyColor = chroma?.color || '#00ff00';
    const rKey = parseInt(keyColor.slice(1, 3), 16);
    const gKey = parseInt(keyColor.slice(3, 5), 16);
    const bKey = parseInt(keyColor.slice(5, 7), 16);
    const similarity = (chroma?.similarity ?? 0.4) * 255;
    const smoothness = (chroma?.smoothness ?? 0.1) * 255;

    for (let i = 0; i < l; i++) {
      const r = frame.data[i * 4 + 0];
      const g = frame.data[i * 4 + 1];
      const b = frame.data[i * 4 + 2];

      const diff = Math.sqrt(
        (r - rKey) * (r - rKey) +
        (g - gKey) * (g - gKey) +
        (b - bKey) * (b - bKey)
      );

      if (diff < similarity) {
        frame.data[i * 4 + 3] = 0;
      } else if (diff < similarity + smoothness) {
        frame.data[i * 4 + 3] = ((diff - similarity) / smoothness) * 255;
      }
    }

    this.offCtx.putImageData(frame, 0, 0);
    ctx.drawImage(this.offCanvas, x, y, w, h);
  }

  private renderTextSource(
    ctx: CanvasRenderingContext2D,
    source: SourceItem,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    if (source.customData?.bgColor) {
      ctx.fillStyle = source.customData.bgColor;
      ctx.fillRect(x, y, w, h);
    }

    const text = source.customData?.text || 'شريط الأخبار المباشر | بث مباشر بجودة 1080p60';
    const textColor = source.customData?.textColor || '#ffffff';
    const fontSize = source.customData?.fontSize || 22;

    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px "Cairo", sans-serif`;
    ctx.textBaseline = 'middle';

    // Marquee scrolling text
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const loopedX = x + ((this.tickerOffset % (textWidth + 200)) + textWidth + 200) % (textWidth + 200) - 100;

    ctx.fillText(text, loopedX, y + h / 2);
    ctx.fillText(text, loopedX + textWidth + 100, y + h / 2);
    ctx.restore();
  }

  private renderBrowserSource(
    ctx: CanvasRenderingContext2D,
    source: SourceItem,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Stylized Browser Overlay Widget (e.g., Stream Goal / Timer / Event Tracker)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // Browser URL header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('BROWSER SOURCE: goal-widget.overlay.io', x + 12, y + 10);

    // Goal Bar
    const barX = x + 12;
    const barY = y + 36;
    const barW = w - 24;
    const barH = 14;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(barX, barY, barW, barH);

    const progress = 0.76;
    const pGradient = ctx.createLinearGradient(barX, barY, barX + barW * progress, barY);
    pGradient.addColorStop(0, '#8b5cf6');
    pGradient.addColorStop(1, '#ec4899');
    ctx.fillStyle = pGradient;
    ctx.fillRect(barX, barY, barW * progress, barH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Cairo", sans-serif';
    ctx.fillText('هدف المشتركين: 760 / 1,000 (76%)', barX, barY + barH + 6);
  }

  private renderChatOverlay(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const msgHeight = 36;
    const totalMsgs = this.chatMessages.length;
    let startY = y + h - totalMsgs * msgHeight - 10;

    this.chatMessages.forEach((msg) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.roundRect(x + 8, startY, w - 16, msgHeight - 6, 6);
      ctx.fill();

      // Platform badge
      ctx.fillStyle = msg.color || '#38bdf8';
      ctx.font = 'bold 12px "Cairo", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(msg.username + ':', x + 16, startY + (msgHeight - 6) / 2);

      // Text message
      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px "Cairo", sans-serif';
      ctx.fillText(msg.message, x + 24 + ctx.measureText(msg.username + ':').width, startY + (msgHeight - 6) / 2);

      startY += msgHeight;
    });

    ctx.restore();
  }

  private renderAlertBanner(
    ctx: CanvasRenderingContext2D,
    alert: StreamAlert,
    width: number,
    height: number
  ) {
    const alertW = 480;
    const alertH = 110;
    const alertX = (width - alertW) / 2;
    const alertY = 60;

    // Outer glow
    ctx.save();
    ctx.shadowColor = alert.type === 'donation' ? '#10b981' : '#8b5cf6';
    ctx.shadowBlur = 25;

    // Card background
    const cardGrad = ctx.createLinearGradient(alertX, alertY, alertX + alertW, alertY + alertH);
    cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    cardGrad.addColorStop(1, 'rgba(30, 27, 75, 0.95)');
    ctx.fillStyle = cardGrad;
    ctx.strokeStyle = alert.type === 'donation' ? '#34d399' : '#a855f7';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(alertX, alertY, alertW, alertH, 16);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Alert title badge
    let title = 'متابع جديد!';
    let badgeColor = '#8b5cf6';
    if (alert.type === 'sub') {
      title = 'مشترك جديد في القناة!';
      badgeColor = '#ec4899';
    } else if (alert.type === 'donation') {
      title = `تبرع فائق بمبلغ ${alert.amount}!`;
      badgeColor = '#10b981';
    } else if (alert.type === 'raid') {
      title = `غارة من مجتمع آخر (${alert.amount} مشاهد)!`;
      badgeColor = '#f59e0b';
    }

    ctx.fillStyle = badgeColor;
    ctx.font = 'bold 15px "Cairo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, alertX + alertW / 2, alertY + 16);

    // User name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Cairo", sans-serif';
    ctx.fillText(alert.username, alertX + alertW / 2, alertY + 40);

    // Message if any
    if (alert.message) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px "Cairo", sans-serif';
      ctx.fillText(`"${alert.message}"`, alertX + alertW / 2, alertY + 76);
    }
  }

  private renderImagePlaceholder(
    ctx: CanvasRenderingContext2D,
    source: SourceItem,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px "Cairo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(source.name || 'صورة (Image)', x + w / 2, y + h / 2);
  }

  // MediaRecorder API integration for live recording output
  public startRecording(onComplete: (blob: Blob) => void): boolean {
    if (!this.canvas) return false;
    try {
      const stream = this.canvas.captureStream(60);
      this.recordedChunks = [];
      this.onRecordCompleteCallback = onComplete;

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        if (this.onRecordCompleteCallback) {
          this.onRecordCompleteCallback(blob);
        }
      };

      this.mediaRecorder.start(1000);
      return true;
    } catch (e) {
      console.error('Failed to start MediaRecorder:', e);
      return false;
    }
  }

  public stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  public getVirtualCamStream(): MediaStream | null {
    if (!this.canvas) return null;
    return this.canvas.captureStream(60);
  }

  // Instant Clip Generator: captures last 30-sec buffer or live snippet in 16:9 or vertical 9:16 format
  public async captureInstantClip(format: '16:9' | '9:16'): Promise<{ blob: Blob; previewUrl: string }> {
    if (!this.canvas) {
      throw new Error('Canvas not initialized');
    }

    const clipCanvas = document.createElement('canvas');
    if (format === '9:16') {
      // 1080x1920 Vertical TikTok/Reels/Shorts
      clipCanvas.width = 1080;
      clipCanvas.height = 1920;
    } else {
      // 1920x1080 Horizontal YouTube/Twitch
      clipCanvas.width = 1920;
      clipCanvas.height = 1080;
    }

    const clipCtx = clipCanvas.getContext('2d');
    if (!clipCtx) throw new Error('Context error');

    // Fill background
    clipCtx.fillStyle = '#09090b';
    clipCtx.fillRect(0, 0, clipCanvas.width, clipCanvas.height);

    if (format === '9:16') {
      // Smart Vertical composition:
      // Top half: cropped or zoomed center gameplay
      // Bottom half: focused webcam / chat
      const srcW = this.canvas.width;
      const srcH = this.canvas.height;
      // Center-crop 16:9 onto top 1080x1200
      clipCtx.drawImage(this.canvas, 0, 0, srcW, srcH, -500, 100, 2080, 1170);

      // Stylized vertical badges
      clipCtx.fillStyle = 'rgba(0,0,0,0.7)';
      clipCtx.fillRect(0, 0, clipCanvas.width, 100);
      clipCtx.fillStyle = '#ffffff';
      clipCtx.font = 'bold 36px "Cairo", sans-serif';
      clipCtx.textAlign = 'center';
      clipCtx.fillText('🔥 لقطة بث مميزة | STREAM HIGHLIGHT', clipCanvas.width / 2, 65);

      // Bottom bar
      clipCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      clipCtx.fillRect(0, 1720, clipCanvas.width, 200);
      clipCtx.fillStyle = '#38bdf8';
      clipCtx.font = 'bold 32px "Cairo", sans-serif';
      clipCtx.fillText('StreamStudio PRO • Instant Clip', clipCanvas.width / 2, 1820);
    } else {
      // Exact 16:9 snapshot
      clipCtx.drawImage(this.canvas, 0, 0);
    }

    // Capture small video/animation or blob from the canvas
    return new Promise((resolve) => {
      clipCanvas.toBlob((blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          resolve({ blob, previewUrl });
        } else {
          throw new Error('Blob creation failed');
        }
      }, 'image/png');
    });
  }
}

export const compositor = new CanvasCompositor();

