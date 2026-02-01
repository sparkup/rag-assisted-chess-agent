import { Component } from "@angular/core";
import { environment } from "../../environments/environment";

@Component({
    selector: "app-vector-search",
    templateUrl: "./openings.component.html",
    styleUrls: ["./openings.component.scss"],
})
export class OpeningsComponent {
    opening = "";
    topK = 5;
    results: any[] = [];

    private readonly base = environment.apiBaseUrl;

    async search(): Promise<void> {
        const res = await fetch(
            `${this.base}/vector-search?q=${encodeURIComponent(this.opening)}&top_k=${this.topK}`,
        );

        const data = await res.json();
        this.results = data.results || [];
    }
}
