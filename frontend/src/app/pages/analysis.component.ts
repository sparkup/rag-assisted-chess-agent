import { Component } from "@angular/core";
import { environment } from "../../environments/environment";

@Component({
    selector: "app-moves-evaluate",
    templateUrl: "./analysis.component.html",
    styleUrls: ["./analysis.component.scss"],
})
export class AnalysisComponent {
    fen = "";
    fenEval = "";
    suggestion: any;
    evaluation: any;

    private readonly base = environment.apiBaseUrl;

    async suggest(): Promise<void> {
        const res = await fetch(
            `${this.base}/moves/${encodeURIComponent(this.fen)}`,
        );
        this.suggestion = await res.json();
    }

    async evaluate(): Promise<void> {
        const res = await fetch(
            `${this.base}/evaluate/${encodeURIComponent(this.fenEval)}`,
        );
        this.evaluation = await res.json();
    }
}
