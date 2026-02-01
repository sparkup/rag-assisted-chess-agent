import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
export class NgxChessBoardService {
    constructor() {
        this.componentMethodCallSource = new Subject();
        this.componentMethodCalled$ = this.componentMethodCallSource.asObservable();
    }
    reset() {
        this.componentMethodCallSource.next();
    }
    static { this.ɵfac = function NgxChessBoardService_Factory(t) { return new (t || NgxChessBoardService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: NgxChessBoardService, factory: NgxChessBoardService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxChessBoardService, [{
        type: Injectable,
        args: [{
                providedIn: 'root',
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWNoZXNzLWJvYXJkLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtY2hlc3MtYm9hcmQvc3JjL2xpYi9zZXJ2aWNlL25neC1jaGVzcy1ib2FyZC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7QUFLL0IsTUFBTSxPQUFPLG9CQUFvQjtJQUhqQztRQUlZLDhCQUF5QixHQUFHLElBQUksT0FBTyxFQUFPLENBQUM7UUFFdkQsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksRUFBRSxDQUFDO0tBSzFFO0lBSEcsS0FBSztRQUNELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxQyxDQUFDO3FGQVBRLG9CQUFvQjt1RUFBcEIsb0JBQW9CLFdBQXBCLG9CQUFvQixtQkFGakIsTUFBTTs7aUZBRVQsb0JBQW9CO2NBSGhDLFVBQVU7ZUFBQztnQkFDUixVQUFVLEVBQUUsTUFBTTthQUNyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuQEluamVjdGFibGUoe1xuICAgIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5leHBvcnQgY2xhc3MgTmd4Q2hlc3NCb2FyZFNlcnZpY2Uge1xuICAgIHByaXZhdGUgY29tcG9uZW50TWV0aG9kQ2FsbFNvdXJjZSA9IG5ldyBTdWJqZWN0PGFueT4oKTtcblxuICAgIGNvbXBvbmVudE1ldGhvZENhbGxlZCQgPSB0aGlzLmNvbXBvbmVudE1ldGhvZENhbGxTb3VyY2UuYXNPYnNlcnZhYmxlKCk7XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRNZXRob2RDYWxsU291cmNlLm5leHQoKTtcbiAgICB9XG59XG4iXX0=