import { Component } from "@angular/core";
import { environment } from "../../environments/environment";

@Component({
    selector: "app-youtube-videos",
    templateUrl: "./videos.component.html",
    styleUrls: ["./videos.component.scss"],
})
export class VideosComponent {
    opening = "";
    maxResults = 5;
    videos: any[] = [];
    loading = false;
    hasSearched = false;
    selected: any | null = null;

    private readonly base = environment.apiBaseUrl;

    async load() {
        const q = (this.opening ?? "").trim();
        const max = Math.max(1, Math.min(20, Number(this.maxResults) || 5));
        this.maxResults = max;

        if (!q) return;

        this.loading = true;
        this.hasSearched = true;
        this.videos = [];

        try {
            const res = await fetch(
                `${this.base}/videos/${encodeURIComponent(q)}?max_results=${max}`,
            );
            const data = await res.json();
            const results = (data?.results ?? data ?? []) as any[];
            this.videos = Array.isArray(results) ? results.slice(0, max) : [];
        } catch (e) {
            // Keep the UI graceful on errors
            this.videos = [];
        } finally {
            this.loading = false;
        }
    }

    openVideo(v: any) {
        if (!v?.embed_url) {
            // Fallback: open YouTube in a new tab if embed is not available
            if (v?.url) window.open(v.url, "_blank", "noopener,noreferrer");
            return;
        }
        this.selected = v;
    }

    closeModal() {
        this.selected = null;
    }
}
