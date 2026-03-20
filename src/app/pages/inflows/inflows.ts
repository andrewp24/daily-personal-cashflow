import { Component, signal, computed, inject } from "@angular/core";
import { InflowData } from "./interfaces";
import {
  applyEach,
  form,
  FormField,
  pattern,
  required,
} from "@angular/forms/signals";
import { CurrencyPipe, NgClass } from "@angular/common";
import { CalculatorService } from "../../services/calculator";

@Component({
  selector: "app-inflows",
  imports: [FormField, CurrencyPipe, NgClass],
  templateUrl: "./inflows.html",
  styleUrl: "./inflows.css",
})
export class Inflows {
  private calculator = inject(CalculatorService);
  isSaving = signal(false);
  saveErrorMessage = signal<string | null>(null);
  saveSuccessMessage = signal<string | null>(null);
  private todayString = new Date().toISOString().split("T")[0];
  private defaultInflow: InflowData = {
    cashOnHand: "",
    asOfDate: this.todayString,
    income: [
      {
        name: "",
        amount: "",
        cadence: "",
        dayOfMonth: 1,
        oneTimeDate: "",
        daysOfMonth: "",
      },
    ],
  };
  inflowModel = signal<InflowData>({
    ...this.defaultInflow,
    ...this.calculator.inflowData(),
  });

  cadenceOptions = [
    { label: "Weekly", value: "weekly" },
    { label: "Bi-Weekly", value: "biweekly" },
    { label: "Monthly", value: "monthly" },
    { label: "One Time", value: "once" },
    { label: "Fixed Days", value: "fixed-days" },
  ];

  inflowForm = form(this.inflowModel, (schemaPath) => {
    required(schemaPath.cashOnHand, { message: "Cash on hand is required" });
    required(schemaPath.asOfDate, { message: "As-of date is required" });
    applyEach(schemaPath.income, (itemPath) => {
      required(itemPath.amount, {
        message: "Income amount is required",
      });
      required(itemPath.cadence, {
        message: "Income cadence is required",
      });
      pattern(
        itemPath.daysOfMonth,
        /^([1-9]|[12]\d|3[01])(,\s?([1-9]|[12]\d|3[01]))*$/,
        {
          message: "Enter days 1–31 separated by commas (e.g. 7, 22)",
        },
      );
    });
  });

  addIncomeItem() {
    this.inflowModel.update((model) => ({
      ...model,
      income: [
        ...model.income,
        {
          name: "",
          amount: "",
          cadence: "",
          dayOfMonth: 1,
          oneTimeDate: "",
          daysOfMonth: "",
        },
      ],
    }));
  }

  removeIncomeItem(index: number) {
    this.inflowModel.update((model) => ({
      ...model,
      income: model.income.filter((_, i) => i !== index),
    }));
  }

  onCashOnHandBlur() {
    const currentValue = this.inflowModel().cashOnHand;
    const normalized = this.normalizeMoneyInput(currentValue);
    if (normalized === null) return;
    this.inflowModel.update((model) => ({ ...model, cashOnHand: normalized }));
  }

  onIncomeAmountBlur(index: number) {
    const currentValue = this.inflowModel().income[index].amount;
    const normalized = this.normalizeMoneyInput(currentValue);
    if (normalized === null) return;
    this.inflowModel.update((model) => ({
      ...model,
      income: model.income.map((p, i) =>
        i === index ? { ...p, amount: normalized } : p,
      ),
    }));
  }

  cashOnHandAmount = computed(() =>
    this.calculator.parseMoney(this.inflowForm.cashOnHand().value()),
  );

  totalIncomeAmount = computed(() => {
    let sum = 0;
    for (const income of this.inflowForm.income) {
      sum += this.calculator.parseMoney(income.amount().value());
    }
    return sum;
  });

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
        this.inflowForm.asOfDate().valid() &&
        this.inflowForm.income().valid()
      ) {
        this.calculator.setInflowData(this.inflowModel());
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
