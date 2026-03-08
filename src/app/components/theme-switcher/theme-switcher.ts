import { Component, OnInit } from "@angular/core";
import { Injectable, signal } from "@angular/core";

@Component({
  selector: "app-theme-switcher",
  imports: [],
  templateUrl: "./theme-switcher.html",
  styleUrl: "./theme-switcher.css",
})
export class ThemeSwitcher implements OnInit {
  isLight = signal(true);

  ngOnInit(): void {
    const theme = localStorage.getItem("dpc_theme");
    if (theme === "light") {
      console.log("found light theme in local storage");
      this.isLight.set(true);
    } else if (theme === "dark") {
      console.log("found dark theme in local storage");
      this.isLight.set(false);
    }
  }
  toggleTheme() {
    this.isLight.set(this.isLight() === true ? false : true);
    localStorage.setItem(
      "dpc_theme",
      this.isLight() === true ? "light" : "dark",
    );
  }
}
