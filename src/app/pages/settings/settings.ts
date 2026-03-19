import { Component, OnDestroy, signal } from "@angular/core";
import { SaveFile } from "./interfaces";

declare const APP_VERSION: string;

@Component({
  selector: "app-settings",
  imports: [],
  templateUrl: "./settings.html",
  styleUrl: "./settings.css",
})
export class Settings implements OnDestroy {
  appVersion = APP_VERSION;
  exportSuccess = signal<string | null>(null);
  exportFailure = signal<string | null>(null);
  importSuccess = signal<string | null>(null);
  importFailure = signal<string | null>(null);
  importWarning = signal<string | null>(null);
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

  exportOutflowsInflows(): string {
    try {
      const data = {
        inflow_data: localStorage.getItem("pdc_inflows"),
        outflow_data: localStorage.getItem("pdc_outflows"),
      };
      const encoded = btoa(JSON.stringify(data))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      navigator.clipboard.writeText(encoded);
      this.exportSuccess.set("Successfully copied to clipboard.");
      return "success";
    } catch (error) {
      this.exportFailure.set("Failed to copy data to clipboard.");
      console.error(error);
      return "failed";
    } finally {
      this.timeoutId = setTimeout(() => {
        this.exportSuccess.set(null);
        this.exportFailure.set(null);
      }, 3000);
    }
  }

  exportToFile(): void {
    try {
      const data: SaveFile = {
        version: "1.0",
        pdc_inflows: localStorage.getItem("pdc_inflows"),
        pdc_outflows: localStorage.getItem("pdc_outflows"),
        pdc_theme: localStorage.getItem("pdc_theme"),
      };

      if (!data.pdc_inflows && !data.pdc_outflows && !data.pdc_theme) {
        throw Error(
          "There was no data in localstorage for the theme, inflows, or outflows.",
        );
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pdc-save.json";
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

        if (data.pdc_inflows)
          localStorage.setItem("pdc_inflows", data.pdc_inflows);
        if (data.pdc_outflows)
          localStorage.setItem("pdc_outflows", data.pdc_outflows);
        if (data.pdc_theme) localStorage.setItem("pdc_theme", data.pdc_theme);

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

  async importOutflowsInflows(): Promise<string> {
    try {
      const encoded = await navigator.clipboard.readText();
      console.log(encoded);
      const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
      const data = JSON.parse(atob(padded));
      console.log(data);
      if (data.inflow_data)
        localStorage.setItem("pdc_inflows", data.inflow_data);
      if (data.outflow_data)
        localStorage.setItem("pdc_outflows", data.outflow_data);
      this.importSuccess.set("Successfully import data from clipboard.");
      return "success";
    } catch (error) {
      this.importFailure.set("Failed to import data from clipboard.");
      console.error(error);
      return "failed";
    } finally {
      this.timeoutId = setTimeout(() => {
        this.importSuccess.set(null);
        this.importFailure.set(null);
      }, 3000);
    }
  }
}
