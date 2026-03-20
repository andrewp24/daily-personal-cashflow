import { Component, signal, computed, inject } from "@angular/core";
import { ExpenseData } from "./interfaces";
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
  selector: "app-outflows",
  imports: [CurrencyPipe, NgClass, FormField],
  templateUrl: "./outflows.html",
  styleUrl: "./outflows.css",
})
export class Outflows {
  private calculator = inject(CalculatorService);
  isSaving = signal(false);
  saveErrorMessage = signal<string | null>(null);
  saveSuccessMessage = signal<string | null>(null);
  expenseModel = signal<ExpenseData>(
    this.calculator.expenseData() ?? {
      expenses: [
        {
          name: "",
          amount: "",
          cadence: "",
          dayOfMonth: 1,
          oneTimeDate: "",
          daysOfMonth: "",
        },
      ],
    },
  );

  cadenceOptions = [
    { label: "Weekly", value: "weekly" },
    { label: "Bi-Weekly", value: "biweekly" },
    { label: "Monthly", value: "monthly" },
    { label: "One Time", value: "once" },
    { label: "Fixed Days", value: "fixed-days" },
  ];

  expenseForm = form(this.expenseModel, (schemaPath) => {
    required(schemaPath.expenses, { message: "expenses are required" });
    applyEach(schemaPath.expenses, (itemPath) => {
      required(itemPath.amount, {
        message: "Expense amount is required",
      });
      required(itemPath.cadence, {
        message: "Expense cadence is required",
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

  addExpenseItem() {
    this.expenseModel.update((model) => ({
      ...model,
      expenses: [
        ...model.expenses,
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

  removeExpenseItem(index: number) {
    this.expenseModel.update((model) => ({
      ...model,
      expenses: model.expenses.filter((_, i) => i !== index),
    }));
  }

  onExpenseAmountBlur(index: number) {
    const currentValue = this.expenseModel().expenses[index].amount;
    const normalized = this.normalizeMoneyInput(currentValue);
    if (normalized === null) return;
    this.expenseModel.update((model) => ({
      ...model,
      expenses: model.expenses.map((p, i) =>
        i === index ? { ...p, amount: normalized } : p,
      ),
    }));
  }

  totalExpenseAmount = computed(() => {
    let sum = 0;
    for (const expense of this.expenseForm.expenses) {
      sum += this.calculator.parseMoney(expense.amount().value());
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
      if (this.expenseForm.expenses().valid()) {
        this.calculator.setExpenseData(this.expenseModel());
      }
      this.saveSuccessMessage.set("Expenses saved successfully!");
    } catch (error) {
      this.saveErrorMessage.set(
        "An error occurred while saving. Please try again.",
      );
      console.error("Error saving expense data:", error);
    } finally {
      setTimeout(() => {
        this.saveErrorMessage.set(null);
        this.saveSuccessMessage.set(null);
        this.isSaving.set(false);
      }, 3000); // Clear error after 3 seconds
    }
  }
}
