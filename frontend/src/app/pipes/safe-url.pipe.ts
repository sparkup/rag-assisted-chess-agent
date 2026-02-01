import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
    constructor(private s: DomSanitizer) {}
    transform(url: string): SafeResourceUrl {
        return this.s.bypassSecurityTrustResourceUrl(url);
    }
}