import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCopyClipboard]',
  standalone: true
})
export class CopyClipboardDirective {
  @Input('appCopyClipboard') copyText = '';

  @HostListener('click')
  copyToClipboard(): void {
    if (!this.copyText) return;

    navigator.clipboard.writeText(this.copyText).then(() => {
      console.log('Copied to clipboard:', this.copyText);
      // Optional: Show a toast or feedback
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
}