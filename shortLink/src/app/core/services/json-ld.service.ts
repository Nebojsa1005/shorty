import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private doc = inject(DOCUMENT);
  private readonly scriptId = 'json-ld-schema';

  setSchema(schema: object): void {
    this.removeSchema();
    const script = this.doc.createElement('script');
    script.id = this.scriptId;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  removeSchema(): void {
    this.doc.getElementById(this.scriptId)?.remove();
  }
}
