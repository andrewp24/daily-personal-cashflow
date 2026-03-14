import { Component, signal, computed } from "@angular/core";
import { InflowData, Paycheck } from "./interfaces";
import {
  applyEach,
  form,
  FormField,
  max,
  min,
  required,
} from "@angular/forms/signals";
import { CurrencyPipe, NgClass } from "@angular/common";

@Component({
  selector: "app-inflows",
  imports: [FormField, CurrencyPipe, NgClass],
  templateUrl: "./inflows.html",
  styleUrl: "./inflows.css",
})
export class Inflows {
  isSaving = signal(false);
  saveErrorMessage = signal<string | null>(null);
  saveSuccessMessage = signal<string | null>(null);
  inflowModel = signal<InflowData>({
    cashOnHand: "",
    paychecks: [{ name: "", amount: "", cadence: "", dayOfMonth: 1 }],
  });

  cadenceOptions = [
    { label: "Weekly", value: "weekly" },
    { label: "Bi-Weekly", value: "biweekly" },
    { label: "Monthly", value: "monthly" },
  ];

  inflowForm = form(this.inflowModel, (schemaPath) => {
    required(schemaPath.cashOnHand, { message: "Cash on hand is required" });
    applyEach(schemaPath.paychecks, (itemPath) => {
      required(itemPath.amount, {
        message: "Paycheck amount is required",
      });
      required(itemPath.dayOfMonth, {
        message: "Paycheck day of month is required",
      });
      min(itemPath.dayOfMonth, 1, {
        message: "Day of month must be between 1 and 31",
      });
      max(itemPath.dayOfMonth, 31, {
        message: "Day of month must be between 1 and 31",
      });
      required(itemPath.cadence, {
        message: "Paycheck cadence is required",
      });
    });
  });

  addPaycheck() {
    this.inflowModel.update((model) => ({
      ...model,
      paychecks: [
        ...model.paychecks,
        { name: "", amount: "", cadence: "", dayOfMonth: 1 },
      ],
    }));
  }

  removePaycheck(index: number) {
    this.inflowModel.update((model) => ({
      ...model,
      paychecks: model.paychecks.filter((_, i) => i !== index),
    }));
  }

  onCashOnHandBlur() {
    const currentValue = this.inflowModel().cashOnHand;
    const normalized = this.normalizeMoneyInput(currentValue);
    if (normalized === null) return;
    this.inflowModel.update((model) => ({ ...model, cashOnHand: normalized }));
  }

  onPaycheckAmountBlur(index: number) {
    const currentValue = this.inflowModel().paychecks[index].amount;
    const normalized = this.normalizeMoneyInput(currentValue);
    if (normalized === null) return;
    this.inflowModel.update((model) => ({
      ...model,
      paychecks: model.paychecks.map((p, i) =>
        i === index ? { ...p, amount: normalized } : p,
      ),
    }));
  }

  cashOnHandAmount = computed(() =>
    this.parseMoney(this.inflowForm.cashOnHand().value()),
  );

  totalPaycheckAmount = computed(() => {
    let sum = 0;
    for (const paycheck of this.inflowForm.paychecks) {
      sum += this.parseMoney(paycheck.amount().value());
    }
    return sum;
  });

  private parseMoney(value: string): number {
    if (!value || value === ".") return 0;
    const normalized = value.startsWith(".") ? `0${value}` : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  normalizeMoneyInput(value: string): string {
    if (!value || value === ".") return "";
    const normalized = value.startsWith(".") ? `0${value}` : value;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return "";
    return parsed.toFixed(2);
  }

  onSave() {
    try {
      this.isSaving.set(true);
      if (
        this.inflowForm.cashOnHand().valid() &&
        this.inflowForm.paychecks().valid()
      ) {
        const cashData = this.inflowForm.cashOnHand().value();
        const paychecksData = this.inflowForm.paychecks().value();
        console.log("Saving inflow data:", cashData);
        console.log("Saving paychecks data:", paychecksData);
        // throw new Error("Simulated save error"); // Simulate an error for testing
      }
      this.saveSuccessMessage.set("Inflows saved successfully!");
    } catch (error) {
      this.saveErrorMessage.set(
        "An error occurred while saving. Please try again.",
      );
      console.error("Error saving inflow data:", error);
    } finally {
      setTimeout(() => {
        this.saveErrorMessage.set(null);
        this.saveSuccessMessage.set(null);
        this.isSaving.set(false);
      }, 3000); // Clear error after 3 seconds
    }
  }
}
