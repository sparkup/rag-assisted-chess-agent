import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./pages/home.component";
import { PlayComponent } from "./pages/play.component";
import { AnalysisComponent } from "./pages/analysis.component";
import { OpeningsComponent } from "./pages/openings.component";
import { VideosComponent } from "./pages/videos.component";

const routes: Routes = [
    // Main demo pages
    { path: "", component: HomeComponent },
    { path: "play", component: PlayComponent },
    { path: "analysis", component: AnalysisComponent },
    { path: "openings", component: OpeningsComponent },
    { path: "videos", component: VideosComponent },

    // Catch-all
    { path: "**", redirectTo: "" },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
