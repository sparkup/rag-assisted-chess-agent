import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
// Angular core modules
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

// Root component
import { AppComponent } from "./app.component";

// Application page components
import { HomeComponent } from "./pages/home.component";
import { PlayComponent } from "./pages/play.component";
import { AnalysisComponent } from "./pages/analysis.component";
import { OpeningsComponent } from "./pages/openings.component";
import { VideosComponent } from "./pages/videos.component";

// Custom pipes
import { SafeUrlPipe } from "./pipes/safe-url.pipe";

// Third-party libraries
import { NgxChessBoardModule } from "ngx-chess-board";

// Application-level routing configuration
// Defines routes and associates each path with a component
const routes: Routes = [
    { path: "", component: HomeComponent }, // Home page
    { path: "play", component: PlayComponent }, // Play chess page
    { path: "analysis", component: AnalysisComponent }, // Analysis page
    { path: "openings", component: OpeningsComponent }, // Openings page
    { path: "videos", component: VideosComponent }, // Videos page
];

// Main application module declaration
@NgModule({
    declarations: [
        // Components and pipes that belong to this module
        AppComponent,
        PlayComponent,
        HomeComponent,
        AnalysisComponent,
        OpeningsComponent,
        VideosComponent,
        SafeUrlPipe,
    ],
    imports: [
        // External modules needed by this module
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(routes),
        NgxChessBoardModule,
    ],
    bootstrap: [
        // Root component to bootstrap when this module is bootstrapped
        AppComponent,
    ],
    schemas: [
        // Schemas to allow non-Angular elements and attributes
        NO_ERRORS_SCHEMA,
    ],
})
export class AppModule {}
