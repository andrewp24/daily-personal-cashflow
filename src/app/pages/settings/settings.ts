import { Component, inject, OnDestroy, signal } from "@angular/core";
import { Router } from "@angular/router";
import { CalculatorService } from "../../services/calculator";
import { ProfileService } from "../../services/profile";
import { ThemeService } from "../../services/theme";
import { SaveFile } from "./interfaces";

declare const APP_VERSION: string;

@Component({
  selector: "app-settings",
  imports: [],
  templateUrl: "./settings.html",
  styleUrl: "./settings.css",
})
export class Settings implements OnDestroy {
  private calculator = inject(CalculatorService);
  profile = inject(ProfileService);
  private theme = inject(ThemeService);
  private router = inject(Router);
  appVersion = APP_VERSION;
  exportSuccess = signal<string | null>(null);
  exportFailure = signal<string | null>(null);
  importSuccess = signal<string | null>(null);
  importFailure = signal<string | null>(null);
  importWarning = signal<string | null>(null);
  newProfileName = signal("");
  renameProfileId = signal<number | null>(null);
  renameProfileName = signal("");
  deleteProfileTarget = signal<number | null>(null);
  private timeoutId: number | undefined;

  // TODO: look into saving a pdc_settings localstorage string that has things like isImported (boolean), whenSaved (timestamp), whenImported (can be null)
  // TODO: Then display that information somewhere in the settings page so that you know some of that info

  ngOnDestroy(): void {
    // Clear the timeout when the component is destroyed
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      console.log("Timeout cleared in ngOnDestroy");
    }
  }

  // --- Profile management ---

  /** Force the current route to re-create so page components pick up new profile data */
  private reloadCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.router
      .navigateByUrl("/", { skipLocationChange: true })
      .then(() => this.router.navigateByUrl(currentUrl));
  }

  openCreateProfile(): void {
    this.newProfileName.set("");
    (
      document.getElementById("create_profile_modal") as HTMLDialogElement
    ).showModal();
  }

  createProfile(): void {
    const name = this.newProfileName().trim();
    if (!name) return;
    this.profile.createProfile(name);
    this.calculator.reloadFromStorage();
    (
      document.getElementById("create_profile_modal") as HTMLDialogElement
    ).close();
    this.reloadCurrentRoute();
  }

  switchProfile(id: number): void {
    this.profile.switchProfile(id);
    this.calculator.reloadFromStorage();
    this.reloadCurrentRoute();
  }

  openRenameProfile(id: number, currentName: string): void {
    this.renameProfileId.set(id);
    this.renameProfileName.set(currentName);
    (
      document.getElementById("rename_profile_modal") as HTMLDialogElement
    ).showModal();
  }

  confirmRename(): void {
    const id = this.renameProfileId();
    const name = this.renameProfileName().trim();
    if (id === null || !name) return;
    this.profile.renameProfile(id, name);
    (
      document.getElementById("rename_profile_modal") as HTMLDialogElement
    ).close();
  }

  openDeleteProfile(id: number): void {
    this.deleteProfileTarget.set(id);
    (
      document.getElementById("delete_profile_modal") as HTMLDialogElement
    ).showModal();
  }

  confirmDeleteProfile(): void {
    const id = this.deleteProfileTarget();
    if (id === null) return;
    const wasActive = id === this.profile.activeProfileId();
    this.profile.deleteProfile(id);
    this.calculator.reloadFromStorage();
    (
      document.getElementById("delete_profile_modal") as HTMLDialogElement
    ).close();
    if (wasActive) {
      this.reloadCurrentRoute();
    }
  }

  // --- Export / Import / Delete data ---

  exportToFile(): void {
    try {
      const inflowKey = this.profile.activeInflowKey();
      const outflowKey = this.profile.activeOutflowKey();

      const data: SaveFile = {
        version: "1.0",
        pdc_inflows: localStorage.getItem(inflowKey),
        pdc_outflows: localStorage.getItem(outflowKey),
        pdc_theme: localStorage.getItem("pdc_theme"),
      };

      if (!data.pdc_inflows && !data.pdc_outflows && !data.pdc_theme) {
        throw Error(
          "There was no data in localstorage for the theme, inflows, or outflows.",
        );
      }

      const profileName = (
        this.profile.activeProfile()?.name ?? "default"
      ).replace(/\s+/g, "-");
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pdc-save-${profileName}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.exportSuccess.set("Successfully exported to file.");
    } catch (error) {
      this.exportFailure.set("Failed to export data to file.");
      console.error(error);
    } finally {
      this.timeoutId = setTimeout(() => {
        this.exportSuccess.set(null);
        this.exportFailure.set(null);
      }, 3000);
    }
  }

  importFromFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const validKeys: Set<string> = new Set<keyof SaveFile>([
      "version",
      "pdc_inflows",
      "pdc_outflows",
      "pdc_theme",
    ]);

    const inflowKey = this.profile.activeInflowKey();
    const outflowKey = this.profile.activeOutflowKey();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);

        if (
          typeof parsed !== "object" ||
          parsed === null ||
          typeof parsed.version !== "string"
        ) {
          throw new Error("Invalid save file format: missing version.");
          // in the future we could have a list of compatibl/incompatible versions
        }

        const unknownKeys = Object.keys(parsed).filter(
          (k) => !validKeys.has(k),
        );

        const data = parsed as SaveFile;

        if (data.pdc_inflows) {
          localStorage.setItem(inflowKey, data.pdc_inflows);
          this.calculator.inflowData.set(JSON.parse(data.pdc_inflows));
        }
        if (data.pdc_outflows) {
          localStorage.setItem(outflowKey, data.pdc_outflows);
          this.calculator.expenseData.set(JSON.parse(data.pdc_outflows));
        }
        if (data.pdc_theme) {
          localStorage.setItem("pdc_theme", data.pdc_theme);
          this.theme.loadStoredTheme();
        }

        if (unknownKeys.length > 0) {
          this.importWarning.set(
            "Imported with warnings — unrecognized keys: " +
              unknownKeys.join(", "),
          );
        } else {
          this.importSuccess.set("Successfully imported data from file.");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        this.importFailure.set("Failed to import file: " + message);
        console.error(error);
      } finally {
        input.value = "";
        this.timeoutId = setTimeout(() => {
          this.importSuccess.set(null);
          this.importFailure.set(null);
          this.importWarning.set(null);
        }, 3000);
      }
    };
    reader.onerror = () => {
      this.importFailure.set("Failed to read file.");
      input.value = "";
      this.timeoutId = setTimeout(() => {
        this.importSuccess.set(null);
        this.importFailure.set(null);
        this.importWarning.set(null);
      }, 3000);
    };
    reader.readAsText(file);
  }

  deleteData(): void {
    const inflowKey = this.profile.activeInflowKey();
    const outflowKey = this.profile.activeOutflowKey();

    localStorage.removeItem(inflowKey);
    localStorage.removeItem(outflowKey);
    localStorage.removeItem("pdc_theme");
    this.calculator.inflowData.set(null);
    this.calculator.expenseData.set(null);
    this.theme.resetTheme();
    (document.getElementById("delete_modal") as HTMLDialogElement).close();
  }
}
