import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxChessBoardComponent } from './ngx-chess-board.component';
import { PiecePromotionModalComponent } from './piece-promotion/piece-promotion-modal/piece-promotion-modal.component';
import { NgxChessBoardService } from './service/ngx-chess-board.service';
import * as i0 from "@angular/core";
export class NgxChessBoardModule {
    static forRoot() {
        return {
            ngModule: NgxChessBoardModule,
            providers: [NgxChessBoardService],
        };
    }
    static { this.ɵfac = function NgxChessBoardModule_Factory(t) { return new (t || NgxChessBoardModule)(); }; }
    static { this.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NgxChessBoardModule }); }
    static { this.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [CommonModule, DragDropModule] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxChessBoardModule, [{
        type: NgModule,
        args: [{
                declarations: [NgxChessBoardComponent, PiecePromotionModalComponent],
                imports: [CommonModule, DragDropModule],
                exports: [NgxChessBoardComponent],
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(NgxChessBoardModule, { declarations: [NgxChessBoardComponent, PiecePromotionModalComponent], imports: [CommonModule, DragDropModule], exports: [NgxChessBoardComponent] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWNoZXNzLWJvYXJkLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jaGVzcy1ib2FyZC9zcmMvbGliL25neC1jaGVzcy1ib2FyZC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQXVCLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNyRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSx5RUFBeUUsQ0FBQztBQUN2SCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQzs7QUFPekUsTUFBTSxPQUFPLG1CQUFtQjtJQUM1QixNQUFNLENBQUMsT0FBTztRQUNWLE9BQU87WUFDSCxRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDO1NBQ3BDLENBQUM7SUFDTixDQUFDO29GQU5RLG1CQUFtQjttRUFBbkIsbUJBQW1CO3VFQUhsQixZQUFZLEVBQUUsY0FBYzs7aUZBRzdCLG1CQUFtQjtjQUwvQixRQUFRO2VBQUM7Z0JBQ04sWUFBWSxFQUFFLENBQUMsc0JBQXNCLEVBQUUsNEJBQTRCLENBQUM7Z0JBQ3BFLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUM7Z0JBQ3ZDLE9BQU8sRUFBRSxDQUFDLHNCQUFzQixDQUFDO2FBQ3BDOzt3RkFDWSxtQkFBbUIsbUJBSmIsc0JBQXNCLEVBQUUsNEJBQTRCLGFBQ3pELFlBQVksRUFBRSxjQUFjLGFBQzVCLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERyYWdEcm9wTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2RyYWctZHJvcCc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5neENoZXNzQm9hcmRDb21wb25lbnQgfSBmcm9tICcuL25neC1jaGVzcy1ib2FyZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGllY2VQcm9tb3Rpb25Nb2RhbENvbXBvbmVudCB9IGZyb20gJy4vcGllY2UtcHJvbW90aW9uL3BpZWNlLXByb21vdGlvbi1tb2RhbC9waWVjZS1wcm9tb3Rpb24tbW9kYWwuY29tcG9uZW50JztcbmltcG9ydCB7IE5neENoZXNzQm9hcmRTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlL25neC1jaGVzcy1ib2FyZC5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHtcbiAgICBkZWNsYXJhdGlvbnM6IFtOZ3hDaGVzc0JvYXJkQ29tcG9uZW50LCBQaWVjZVByb21vdGlvbk1vZGFsQ29tcG9uZW50XSxcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBEcmFnRHJvcE1vZHVsZV0sXG4gICAgZXhwb3J0czogW05neENoZXNzQm9hcmRDb21wb25lbnRdLFxufSlcbmV4cG9ydCBjbGFzcyBOZ3hDaGVzc0JvYXJkTW9kdWxlIHtcbiAgICBzdGF0aWMgZm9yUm9vdCgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPE5neENoZXNzQm9hcmRNb2R1bGU+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5nTW9kdWxlOiBOZ3hDaGVzc0JvYXJkTW9kdWxlLFxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbTmd4Q2hlc3NCb2FyZFNlcnZpY2VdLFxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==