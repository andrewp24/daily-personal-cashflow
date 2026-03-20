import { Component, inject } from "@angular/core";
import { ThemeService } from "../../services/theme";

@Component({
  selector: "app-theme-switcher",
  imports: [],
  templateUrl: "./theme-switcher.html",
  styleUrl: "./theme-switcher.css",
})
export class ThemeSwitcher {
  protected theme = inject(ThemeService);
}
