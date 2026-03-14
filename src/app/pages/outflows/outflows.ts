import { Component, signal, computed } from "@angular/core";
import { ExpenseData } from "./interfaces";
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
  selector: "app-outflows",
  imports: [CurrencyPipe, NgClass, FormField],
  templateUrl: "./outflows.html",
  styleUrl: "./outflows.css",
})
export class Outflows {
  isSaving = signal(false);
  saveErrorMessage = signal<string | null>(null);
  saveSuccessMessage = signal<string | null>(null);
  expenseModel = signal<ExpenseData>({
    expenses: [{ name: "", amount: "", cadence: "", dayOfMonth: 1 }],
  });

  cadenceOptions = [
    { label: "Weekly", value: "weekly" },
    { label: "Bi-Weekly", value: "biweekly" },
    { label: "Monthly", value: "monthly" },
  ];

  expenseForm = form(this.expenseModel, (schemaPath) => {
    required(schemaPath.expenses, { message: "expenses are required" });
    applyEach(schemaPath.expenses, (itemPath) => {
      required(itemPath.amount, {
        message: "Expense amount is required",
      });
      required(itemPath.dayOfMonth, {
        message: "Expense day of month is required",
      });
      min(itemPath.dayOfMonth, 1, {
        message: "Day of month must be between 1 and 31",
      });
      max(itemPath.dayOfMonth, 31, {
        message: "Day of month must be between 1 and 31",
      });
      required(itemPath.cadence, {
        message: "Expense cadence is required",
      });
    });
  });

  addExpenseItem() {
    this.expenseModel.update((model) => ({
      ...model,
      expenses: [
        ...model.expenses,
        { name: "", amount: "", cadence: "", dayOfMonth: 1 },
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
      sum += this.parseMoney(expense.amount().value());
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
      if (this.expenseForm.expenses().valid()) {
        const expenseData = this.expenseForm.expenses().value();
        console.log("Saving expense data:", expenseData);
        // throw new Error("Simulated save error"); // Simulate an error for testing
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
