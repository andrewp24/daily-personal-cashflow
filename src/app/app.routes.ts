import { Routes } from "@angular/router";
import { Home } from "./pages/home/home";
import { About } from "./pages/about/about";
import { HowItWorks } from "./pages/how-it-works/how-it-works";

export const routes: Routes = [
  { path: "", component: Home },
  { path: "about", component: About },
  { path: "how-it-works", component: HowItWorks },
];
