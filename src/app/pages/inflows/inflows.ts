import { Component, signal, computed } from "@angular/core";
import { InflowData } from "./interfaces";
import {
  form,
  FormField,
  pattern,
  required,
  validate,
} from "@angular/forms/signals";
import { CurrencyPipe, NgClass } from "@angular/common";

const EDITING_AMOUNT_REGEX = /^\d*\.?\d{0,2}$/;

@Component({
  selector: "app-inflows",
  imports: [FormField, CurrencyPipe, NgClass],
  templateUrl: "./inflows.html",
  styleUrl: "./inflows.css",
})
export class Inflows {
  inflowModel = signal<InflowData>({
    cashOnHand: "",
    paycheckAmount1: "",
  });

  inflowForm = form(this.inflowModel, (schemaPath) => {
    required(schemaPath.cashOnHand, { message: "Cash on hand is required" });
    required(schemaPath.paycheckAmount1, {
      message: "Paycheck amount is required",
    });
  });

  onAmountBlur(field: keyof InflowData) {
    const currentValue = this.inflowModel()[field];
    const normalized = this.normalizeMoneyInput(currentValue?.toString() || "");

    // If invalid, leave the user's original text alone so they can fix it
    if (normalized === null) {
      return;
    }

    this.inflowModel.update((model) => ({
      ...model,
      [field]: normalized,
    }));
  }

  cashOnHandAmount = computed(() =>
    this.parseMoney(this.inflowForm.cashOnHand().value()),
  );
  paycheckAmount = computed(() =>
    this.parseMoney(this.inflowForm.paycheckAmount1().value()),
  );

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
}
