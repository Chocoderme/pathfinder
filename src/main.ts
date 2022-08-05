import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "./assets/reset.css";
import "@/assets/styles/base.scss";
import "element-plus/theme-chalk/base.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
