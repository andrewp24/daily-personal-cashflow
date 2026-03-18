import { Component, OnDestroy, signal } from "@angular/core";

@Component({
  selector: "app-settings",
  imports: [],
  templateUrl: "./settings.html",
  styleUrl: "./settings.css",
})
export class Settings implements OnDestroy {
  exportSuccess = signal<string | null>(null);
  exportFailure = signal<string | null>(null);
  importSuccess = signal<string | null>(null);
  importFailure = signal<string | null>(null);
  private timeoutId: number | undefined;

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
