import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import gsap from 'gsap';
import { prefersReducedMotion } from '../../utils/gsap-animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-content">
      <span class="toast-message">{{ data.message }}</span>
      <button class="toast-close" (click)="dismiss()" aria-label="Close notification">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `,
  styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnInit {
  data = inject<{ message: string }>(MAT_SNACK_BAR_DATA);
  private ref = inject(MatSnackBarRef);
  private el = inject(ElementRef);

  ngOnInit() {
    if (prefersReducedMotion()) return;
    const surface = this.el.nativeElement.closest('.mat-mdc-snackbar-surface') as HTMLElement;
    if (surface) gsap.from(surface, { x: 80, opacity: 0, duration: 0.35, ease: 'power3.out' });
  }

  dismiss() {
    if (prefersReducedMotion()) { this.ref.dismiss(); return; }
    const surface = this.el.nativeElement.closest('.mat-mdc-snackbar-surface') as HTMLElement;
    if (surface) {
      gsap.to(surface, { x: 80, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => this.ref.dismiss() });
    } else {
      this.ref.dismiss();
    }
  }
}
