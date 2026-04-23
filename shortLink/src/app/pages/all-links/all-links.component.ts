import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { TableSearchPipe } from 'src/app/shared/pipes/table-search.pipe';
import { StatusFilterPipe } from 'src/app/shared/pipes/status-filter.pipe';
import { SocketService } from '../../services/socket.service';
import { UrlService } from '../../services/url.service';
import { PlanFeaturesService } from '../../services/plan-features.service';
import { TableLinksComponent } from '../../shared/components/table-links/table-links.component';
import gsap from 'gsap';
import { prefersReducedMotion } from 'src/app/shared/utils/gsap-animations';

@Component({
  selector: 'app-all-links',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    TableLinksComponent,
    TableSearchPipe,
    StatusFilterPipe,
  ],
  templateUrl: './all-links.component.html',
  styleUrl: './all-links.component.scss',
})
export class AllLinksComponent implements AfterViewInit, OnDestroy {
  private urlService = inject(UrlService);
  private socketService = inject(SocketService);
  private planFeatures = inject(PlanFeaturesService);
  private el = inject(ElementRef<HTMLElement>);
  private gsapCtx?: gsap.Context;

  tableLoading = computed(() => this.urlService.allUrlsLoading());
  allUrls = computed(() => this.urlService.allUrls());
  canCreateLink = computed(() => this.urlService.canCreateLink());
  linksUsed = computed(() => this.urlService.allUrls().length);
  linksAllowed = computed(() => this.planFeatures.linksAllowed());
  isCreateEditLinkDrawerOpened = computed(() => this.urlService.isCreateEditLinkDrawerOpened());

  searchControl = new FormControl<string>('');
  statusFilter = new FormControl<string>('all');

  searchControlValueChanges$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  constructor() {
    this.urlService.updateState('allUrlsLoading', true);
    this.urlService
      .fetchAllUrls()
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.urlService.updateState('allUrlsLoading', false));

    this.socketService.linksUpdated$
      .pipe(
        debounceTime(500),
        switchMap(() => this.urlService.fetchAllUrls()),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    if (prefersReducedMotion()) return;

    this.gsapCtx = gsap.context(() => {
      gsap.from('.header-row, .w-full.flex', {
        opacity: 0,
        y: 16,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
      });
      gsap.from('app-table-links', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        delay: 0.18,
        ease: 'power2.out',
        clearProps: 'all',
      });
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
  }

  ionViewDidLeave() {
    this.searchControl.reset();
  }

  newLink() {
    this.urlService.updateState('isCreateEditLinkDrawerOpened', true);
  }
}
