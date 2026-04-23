import gsap from 'gsap';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface StaggerOptions {
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  ease?: string;
}

/**
 * Creates a GSAP context scoped to `scope`. Call .revert() in ngOnDestroy
 * to automatically kill all tweens and restore original styles.
 */
export function createAnimationContext(
  scope: Element,
  fn: (ctx: gsap.Context) => void
): gsap.Context | null {
  if (prefersReducedMotion()) return null;
  const ctx = gsap.context(() => {}, scope);
  fn(ctx);
  return ctx;
}

export function staggerIn(selector: string, opts: StaggerOptions = {}): gsap.core.Tween | null {
  if (prefersReducedMotion()) return null;
  const { y = 22, duration = 0.5, stagger = 0.08, delay = 0, ease = 'power2.out' } = opts;
  return gsap.from(selector, { opacity: 0, y, duration, stagger, delay, ease, clearProps: 'all' });
}

export function fadeSlideIn(selector: string, opts: Omit<StaggerOptions, 'stagger'> = {}): gsap.core.Tween | null {
  if (prefersReducedMotion()) return null;
  const { y = 20, duration = 0.5, delay = 0, ease = 'power2.out' } = opts;
  return gsap.from(selector, { opacity: 0, y, duration, delay, ease, clearProps: 'all' });
}
