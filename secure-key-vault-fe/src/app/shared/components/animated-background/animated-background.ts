import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-animated-background',
  standalone: true,
  template: `
    <div class="fixed inset-0 -z-10 overflow-hidden">
      <!-- Base gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"></div>

      <!-- Animated gradient orbs -->
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
      <div class="absolute top-3/4 -right-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-float-delayed"></div>
      <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow"></div>

      <!-- Grid pattern overlay -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <!-- Noise texture -->
      <div class="absolute inset-0 opacity-[0.015] noise-texture"></div>
    </div>
  `,
  styles: [`
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.05); }
      66% { transform: translate(-20px, 20px) scale(0.95); }
    }
    @keyframes float-delayed {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(-25px, 25px) scale(0.95); }
      66% { transform: translate(35px, -15px) scale(1.05); }
    }
    @keyframes float-slow {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(40px, 40px) scale(1.1); }
    }
    :host ::ng-deep .animate-float { animation: float 20s ease-in-out infinite; }
    :host ::ng-deep .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
    :host ::ng-deep .animate-float-slow { animation: float-slow 30s ease-in-out infinite; }
    .noise-texture {
      background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedBackground {}
