// 基于 Web Audio API 的物理高保真金属硬币与玻璃罐撞击音效合成器
// 免去加载外部几十 MB 音频文件的网络延迟与权限问题

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * 播放清脆的金币掉入玻璃瓶碰撞声
   * 模拟硬币落入玻璃瓶的两次清脆反弹 (Tink-Tink)
   */
  playCoinDrop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 第一次撞击 (基频 + 泛音)
      this.triggerCoinImpact(ctx, now, 1850, 0.28, 0.12);
      // 第二次轻微弹跳
      this.triggerCoinImpact(ctx, now + 0.09, 2350, 0.16, 0.09);
    } catch {
      // 忽略部分浏览器禁用自动播放策略
    }
  }

  /**
   * 取出或支出轻微沉稳音效
   */
  playWithdraw() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.triggerTone(ctx, now, 620, 480, 0.15, "sine");
    } catch {}
  }

  /**
   * 储蓄满额 100% 达成庆祝大三和弦胜利琶音 (C5 - E5 - G5 - C6)
   */
  playGoalSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.11;
        this.triggerTone(ctx, time, freq, freq, 0.35, "triangle", 0.22);
      });
    } catch {}
  }

  private triggerCoinImpact(ctx: AudioContext, time: number, freq: number, volume: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 0.02);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.9, time + duration);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq, time);
    filter.Q.setValueAtTime(8, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerTone(ctx: AudioContext, time: number, startFreq: number, endFreq: number, duration: number, type: OscillatorType, maxVol = 0.2) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    gain.gain.setValueAtTime(maxVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }
}

export const soundFx = new SoundSynthesizer();
