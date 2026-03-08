import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ThemeSwitcher } from "../theme-switcher/theme-switcher";

@Component({
  selector: "app-navigation",
  imports: [RouterLink, RouterLinkActive, ThemeSwitcher],
  templateUrl: "./navigation.html",
  styleUrl: "./navigation.css",
})
export class Navigation {}
