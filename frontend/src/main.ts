import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

// Enable Angular's production mode which disables assertions and other checks within the framework for better performance
if (environment.production) {
    enableProdMode();
}

// Bootstrap the Angular application by initializing the platform and loading the root module (AppModule)
platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
