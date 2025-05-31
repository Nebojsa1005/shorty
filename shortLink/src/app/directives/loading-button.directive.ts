import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[appLoadingButton]',
  standalone: true
})
export class LoadingButtonDirective implements OnChanges, OnDestroy {
  @Input('appLoadingButton') isLoading: boolean = false;

  private originalContent?: HTMLElement | null = null
  private spinner?: HTMLElement

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('isLoading' in changes) {
      this.toggleButtonState(this.isLoading);
    }
  }

  private toggleButtonState(loading: boolean) {
    const button = this.el.nativeElement as HTMLButtonElement;

    if (loading) {
      button.disabled = true;

      // Save original content
      if (!this.originalContent) {
        this.originalContent = this.renderer.createElement('span');
        this.originalContent!.innerHTML = button.innerHTML;
      }

      // Clear and add spinner
      this.renderer.setProperty(button, 'innerHTML', '');
      this.spinner = this.renderer.createElement('mat-spinner');
      this.renderer.setStyle(this.spinner, 'width', '20px');
      this.renderer.setStyle(this.spinner, 'height', '20px');
      this.renderer.setStyle(this.spinner, 'display', 'inline-block');
      this.renderer.setStyle(this.spinner, 'vertical-align', 'middle');
      this.renderer.setAttribute(this.spinner, 'color', 'primary')

      this.renderer.appendChild(button, this.spinner);
    } else {
      button.disabled = false;
      if (this.originalContent) {
        this.renderer.setProperty(button, 'innerHTML', this.originalContent.innerHTML);
        this.originalContent = null;
      }
    }
  }

  ngOnDestroy(): void {
    this.toggleButtonState(false);
  }
}
