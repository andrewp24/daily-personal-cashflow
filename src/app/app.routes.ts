import { Routes } from "@angular/router";
import { Home } from "./pages/home/home";
import { Inflows } from "./pages/inflows/inflows";
import { Outflows } from "./pages/outflows/outflows";
import { HowItsLooking } from "./pages/how-its-looking/how-its-looking";
import { About } from "./pages/about/about";
import { HowItWorks } from "./pages/how-it-works/how-it-works";
import { Settings } from "./pages/settings/settings";

export const routes: Routes = [
  { path: "", component: Home },
  { path: "inflows", component: Inflows },
  { path: "outflows", component: Outflows },
  { path: "how-its-looking", component: HowItsLooking },
  { path: "about", component: About },
  { path: "how-it-works", component: HowItWorks },
  { path: "settings", component: Settings },
];
