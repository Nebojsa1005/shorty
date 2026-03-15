import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="coming-soon-container flex flex-col items-center justify-center h-full p-8 text-center">
      <mat-icon class="coming-soon-icon material-symbols-outlined" color="primary">bar_chart</mat-icon>
      <h1 class="coming-soon-title">Analytics Coming Soon</h1>
      <p class="coming-soon-body">We're working hard to bring you detailed insights about your links.</p>
      <ul class="coming-soon-list text-left">
        <li>Clicks over time</li>
        <li>Device breakdown</li>
        <li>Location insights</li>
        <li>Top performing links</li>
      </ul>
      <button mat-flat-button color="primary" (click)="goToDashboard()">Back to Dashboard</button>
    </div>
  `,
  styles: [`
    .coming-soon-container {
      max-width: 480px;
      margin: 0 auto;
    }
    .coming-soon-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      margin-bottom: 16px;
    }
    .coming-soon-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .coming-soon-body {
      font-size: 1rem;
      color: #666;
      margin-bottom: 16px;
    }
    .coming-soon-list {
      margin-bottom: 24px;
      padding-left: 20px;
      li {
        margin-bottom: 6px;
        color: #555;
      }
    }
  `],
})
export class ComingSoonComponent {
  private router = inject(Router);

  goToDashboard() {
    this.router.navigate(['/all-links']);
  }
}
