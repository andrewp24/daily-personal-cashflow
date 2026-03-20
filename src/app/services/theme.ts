import { Injectable, signal } from "@angular/core";

const THEME_KEY = "pdc_theme";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  isLight = signal(true);

  constructor() {
    this.loadStoredTheme();
  }

  toggleTheme() {
    this.isLight.set(!this.isLight());
    localStorage.setItem(THEME_KEY, this.isLight() ? "light" : "dark");
  }

  resetTheme() {
    this.isLight.set(true);
  }

  private loadStoredTheme() {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === "dark") {
      this.isLight.set(false);
    }
  }
}
