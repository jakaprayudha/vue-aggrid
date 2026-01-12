// src/main.js
import { createApp } from "vue";
import App from "./App.vue";

// AG Grid community modules
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

createApp(App).mount("#app");