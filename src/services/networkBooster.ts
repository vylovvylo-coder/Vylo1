import { NetworkStats, IngestServerPing, StreamProtocol } from '../types/studio';

export class NetworkBoosterService {
  private stats: NetworkStats = {
    pingMs: 19,
    jitterMs: 1.4,
    packetLossPercent: 0.0,
    recoveredPacketsCount: 142,
    totalPacketsSent: 154200,
    targetBitrateKbps: 6000,
    actualBitrateKbps: 6000,
    isAdaptiveBitrateActive: true,
    isEmergencyBoostActive: false,
    congestionState: 'optimal',
    fecRecoveryRatio: 99.8,
    activeServerName: 'خادم الرياض فائق السرعة (Riyadh SRT Ultra)',
    activeServerProtocol: 'SRT',
  };

  private ingests: IngestServerPing[] = [
    {
      id: 'srv_riyadh',
      name: 'خادم الرياض فائق السرعة (Riyadh SRT Ultra)',
      location: 'الرياض، المملكة العربية السعودية',
      protocol: 'SRT',
      url: 'srt://riyadh.streamstudio.io:9000?latency=40',
      pingMs: 16,
      jitterMs: 0.8,
      status: 'optimal',
      packetLoss: 0.0,
    },
    {
      id: 'srv_dubai',
      name: 'خادم دبي المباشر (Dubai Ingest Hub)',
      location: 'دبي، الإمارات العربية المتحدة',
      protocol: 'SRT',
      url: 'srt://dxb.streamstudio.io:9000?latency=50',
      pingMs: 24,
      jitterMs: 1.2,
      status: 'optimal',
      packetLoss: 0.0,
    },
    {
      id: 'srv_frankfurt',
      name: 'خادم فرانكفورت المركزي (Frankfurt RTMP)',
      location: 'فرانكفورت، ألمانيا',
      protocol: 'RTMP',
      url: 'rtmp://fra.streamstudio.io/live',
      pingMs: 64,
      jitterMs: 2.1,
      status: 'good',
      packetLoss: 0.1,
    },
    {
      id: 'srv_london',
      name: 'خادم لندن الترددي (London WHIP/WebRTC)',
      location: 'لندن، المملكة المتحدة',
      protocol: 'WebRTC-WHIP',
      url: 'https://lon.whip.streamstudio.io/endpoint',
      pingMs: 72,
      jitterMs: 2.8,
      status: 'good',
      packetLoss: 0.1,
    },
    {
      id: 'srv_amsterdam',
      name: 'خادم أمستردام الدولي (Amsterdam SRT)',
      location: 'أمستردام، هولندا',
      protocol: 'SRT',
      url: 'srt://ams.streamstudio.io:9000?latency=80',
      pingMs: 69,
      jitterMs: 2.3,
      status: 'good',
      packetLoss: 0.2,
    },
    {
      id: 'srv_us_east',
      name: 'خادم فرجينيا السحابي (US East RTMP)',
      location: 'فرجينيا، الولايات المتحدة',
      protocol: 'RTMP',
      url: 'rtmp://va.streamstudio.io/live',
      pingMs: 132,
      jitterMs: 4.5,
      status: 'poor',
      packetLoss: 0.8,
    },
  ];

  private listeners: ((stats: NetworkStats) => void)[] = [];
  private loopTimer: any = null;
  private isTestingPing = false;

  constructor() {
    this.startSimulationLoop();
  }

  private startSimulationLoop() {
    if (this.loopTimer) clearInterval(this.loopTimer);
    this.loopTimer = setInterval(() => {
      this.tick();
    }, 1200);
  }

  private tick() {
    // Dynamic network telemetry fluctuation
    const basePing = this.stats.isEmergencyBoostActive ? 14 : 18;
    const pingFluctuation = (Math.random() - 0.48) * 4;
    const newPing = Math.max(10, Math.round(basePing + pingFluctuation));

    const newJitter = +(Math.random() * (this.stats.isEmergencyBoostActive ? 0.9 : 1.8)).toFixed(1);

    // Random packet loss simulation (0.0% to 0.4% under normal, 0.0% under emergency)
    const rawLoss = this.stats.isEmergencyBoostActive
      ? 0
      : Math.random() < 0.15
      ? +(Math.random() * 0.3).toFixed(1)
      : 0;

    // FEC Packet Loss Recovery: packets are recovered
    let recovered = this.stats.recoveredPacketsCount;
    if (rawLoss > 0) {
      recovered += Math.floor(Math.random() * 3) + 1;
    }

    // Adaptive Bitrate calculation:
    // If ping is high or packet loss occurs and ABR is enabled, scale down bitrate gracefully
    let currentActual = this.stats.targetBitrateKbps;
    let congestion: 'optimal' | 'moderate' | 'critical' = 'optimal';

    if (this.stats.isAdaptiveBitrateActive) {
      if (newPing > 65 || rawLoss > 0.5) {
        currentActual = Math.round(this.stats.targetBitrateKbps * 0.65); // step down to avoid buffer underrun
        congestion = 'critical';
      } else if (newPing > 40 || rawLoss > 0.1) {
        currentActual = Math.round(this.stats.targetBitrateKbps * 0.85);
        congestion = 'moderate';
      } else {
        currentActual = this.stats.targetBitrateKbps;
        congestion = 'optimal';
      }
    }

    if (this.stats.isEmergencyBoostActive) {
      currentActual = this.stats.targetBitrateKbps;
      congestion = 'optimal';
    }

    this.stats = {
      ...this.stats,
      pingMs: newPing,
      jitterMs: newJitter,
      packetLossPercent: rawLoss,
      recoveredPacketsCount: recovered,
      totalPacketsSent: this.stats.totalPacketsSent + 60,
      actualBitrateKbps: currentActual,
      congestionState: congestion,
      fecRecoveryRatio: rawLoss > 0 ? 99.6 : 100.0,
    };

    this.notify();
  }

  public getStats(): NetworkStats {
    return { ...this.stats };
  }

  public getIngests(): IngestServerPing[] {
    return [...this.ingests];
  }

  public subscribe(listener: (stats: NetworkStats) => void) {
    this.listeners.push(listener);
    listener(this.stats);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.stats }));
  }

  public setAdaptiveBitrate(enabled: boolean) {
    this.stats.isAdaptiveBitrateActive = enabled;
    if (!enabled) {
      this.stats.actualBitrateKbps = this.stats.targetBitrateKbps;
    }
    this.notify();
  }

  public setEmergencyBoost(enabled: boolean) {
    this.stats.isEmergencyBoostActive = enabled;
    if (enabled) {
      this.stats.pingMs = Math.max(11, this.stats.pingMs - 6);
      this.stats.jitterMs = 0.6;
      this.stats.packetLossPercent = 0.0;
      this.stats.actualBitrateKbps = this.stats.targetBitrateKbps;
      this.stats.congestionState = 'optimal';
      this.stats.fecRecoveryRatio = 100.0;
    }
    this.notify();
  }

  public setTargetBitrate(kbps: number) {
    this.stats.targetBitrateKbps = kbps;
    if (!this.stats.isAdaptiveBitrateActive || this.stats.congestionState === 'optimal') {
      this.stats.actualBitrateKbps = kbps;
    }
    this.notify();
  }

  public setActiveServer(server: IngestServerPing) {
    this.stats.activeServerName = server.name;
    this.stats.activeServerProtocol = server.protocol;
    this.stats.pingMs = server.pingMs;
    this.notify();
  }

  /**
   * Auto Ping and Best Server Selector test
   */
  public async runAutoPingTest(
    onProgress?: (currentList: IngestServerPing[]) => void
  ): Promise<IngestServerPing> {
    if (this.isTestingPing) return this.ingests[0];
    this.isTestingPing = true;

    // Reset status to checking
    const updated: IngestServerPing[] = this.ingests.map((s) => ({ ...s, status: 'checking' }));
    if (onProgress) onProgress([...updated]);

    for (let i = 0; i < updated.length; i++) {
      await new Promise((r) => setTimeout(r, 260));
      // Calculate realistic latency with distance factor
      const jitterFactor = +(Math.random() * 1.5).toFixed(1);
      const measuredPing = Math.round(
        i === 0 ? 14 + Math.random() * 5 :
        i === 1 ? 22 + Math.random() * 6 :
        i === 2 ? 62 + Math.random() * 8 :
        i === 3 ? 70 + Math.random() * 8 :
        i === 4 ? 66 + Math.random() * 7 :
        125 + Math.random() * 15
      );

      updated[i].pingMs = measuredPing;
      updated[i].jitterMs = jitterFactor;
      updated[i].packetLoss = measuredPing > 100 ? 0.6 : 0.0;
      updated[i].status = measuredPing < 35 ? 'optimal' : measuredPing < 80 ? 'good' : 'poor';

      if (onProgress) onProgress([...updated]);
    }

    // Sort by ping ascending
    updated.sort((a, b) => a.pingMs - b.pingMs);
    this.ingests = updated;

    const best = updated[0];
    this.setActiveServer(best);
    this.isTestingPing = false;

    if (onProgress) onProgress([...this.ingests]);
    return best;
  }
}

export const networkBooster = new NetworkBoosterService();
