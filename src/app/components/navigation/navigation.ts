import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ThemeSwitcher } from "../theme-switcher/theme-switcher";
import { ProfileService } from "../../services/profile";
import { CalculatorService } from "../../services/calculator";

@Component({
  selector: "app-navigation",
  imports: [RouterLink, RouterLinkActive, ThemeSwitcher],
  templateUrl: "./navigation.html",
  styleUrl: "./navigation.css",
})
export class Navigation {
  profile = inject(ProfileService);
  private calculator = inject(CalculatorService);
  private router = inject(Router);

  switchProfile(id: number): void {
    this.profile.switchProfile(id);
    this.calculator.reloadFromStorage();
    // Force the current page component to re-create so it picks up new profile data
    const currentUrl = this.router.url;
    this.router
      .navigateByUrl("/", { skipLocationChange: true })
      .then(() => this.router.navigateByUrl(currentUrl));
  }
}
