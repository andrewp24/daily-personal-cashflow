import { Component, signal, computed } from "@angular/core";
import { InflowData } from "./interfaces";
import {
  form,
  FormField,
  max,
  min,
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
  /*

  TODO: this is what i should try to do for i guess most parts of the form since they are going to be customizable
const orderModel = signal({
  customerName: '',
  items: [{product: '', quantity: 0, price: 0}],
});
const orderForm = form(orderModel);
// Access array items by index
orderForm.items[0].product; // FieldTree<string>
orderForm.items[0].quantity; // FieldTree<number>








  */
  inflowModel = signal<InflowData>({
    cashOnHand: "",
    paycheckAmount: "",
    paycheckCadence: "",
    paycheckDayOfMonth: 1,
  });

  cadenceOptions = [
    { label: "Weekly", value: "weekly" },
    { label: "Bi-Weekly", value: "biweekly" },
    { label: "Monthly", value: "monthly" },
  ];

  inflowForm = form(this.inflowModel, (schemaPath) => {
    required(schemaPath.cashOnHand, { message: "Cash on hand is required" });
    required(schemaPath.paycheckAmount, {
      message: "Paycheck amount is required",
    });
    required(schemaPath.paycheckDayOfMonth, {
      message: "Paycheck day of month is required",
    });
    min(schemaPath.paycheckDayOfMonth, 1, {
      message: "Day of month must be between 1 and 31",
    });
    max(schemaPath.paycheckDayOfMonth, 31, {
      message: "Day of month must be between 1 and 31",
    });
    required(schemaPath.paycheckCadence, {
      message: "Paycheck cadence is required",
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
    this.parseMoney(this.inflowForm.paycheckAmount().value()),
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
