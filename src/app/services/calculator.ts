import { Injectable, signal, computed } from "@angular/core";
import { InflowData } from "../pages/inflows/interfaces";
import { ExpenseData } from "../pages/outflows/interfaces";

export interface CashflowEvent {
  name: string;
  amount: number;
}

export interface DailyCashflow {
  date: Date;
  label: string;
  balance: number;
  events: CashflowEvent[];
}

const INFLOW_KEY = "pdc_inflows";
const OUTFLOW_KEY = "pdc_outflows";

@Injectable({
  providedIn: "root",
})
export class Calculator {
  inflowData = signal<InflowData | null>(this.loadFromStorage(INFLOW_KEY));
  expenseData = signal<ExpenseData | null>(this.loadFromStorage(OUTFLOW_KEY));

  setInflowData(data: InflowData) {
    this.inflowData.set(data);
    localStorage.setItem(INFLOW_KEY, JSON.stringify(data));
  }

  setExpenseData(data: ExpenseData) {
    this.expenseData.set(data);
    localStorage.setItem(OUTFLOW_KEY, JSON.stringify(data));
  }

  parseMoney(value: string): number {
    if (!value || value === ".") return 0;
    const normalized = value.startsWith(".") ? `0${value}` : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  dailyCashflow = computed<DailyCashflow[]>(() => {
    const inflows = this.inflowData();
    const expenses = this.expenseData();
    if (!inflows || !inflows.asOfDate) return [];

    // Start from the user-specified "as of" date, run 3 months forward
    const [year, month, day] = inflows.asOfDate.split("-").map(Number);
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 3,
      startDate.getDate() - 1,
    );

    const cashOnHand = this.parseMoney(inflows.cashOnHand);
    const result: DailyCashflow[] = [];
    let balance = cashOnHand;

    const current = new Date(startDate);
    let isFirstDay = true;

    while (current <= endDate) {
      const events: CashflowEvent[] = [];

      if (isFirstDay) {
        if (cashOnHand > 0) {
          events.push({ name: "Cash on hand", amount: cashOnHand });
        }
      } else {
        // Add income on matching days
        for (const income of inflows.income) {
          const amount = this.parseMoney(income.amount);
          if (amount <= 0 || !income.cadence) continue;

          if (
            this.occursOnDate(current, income.cadence, startDate, {
              dayOfMonth: income.dayOfMonth,
              oneTimeDate: income.oneTimeDate,
              daysOfMonth: income.daysOfMonth,
            })
          ) {
            balance += amount;
            events.push({ name: income.name, amount });
          }
        }

        // Subtract expenses on matching days
        if (expenses) {
          for (const expense of expenses.expenses) {
            const amount = this.parseMoney(expense.amount);
            if (amount <= 0 || !expense.cadence) continue;

            if (
              this.occursOnDate(current, expense.cadence, startDate, {
                dayOfMonth: expense.dayOfMonth,
                oneTimeDate: expense.oneTimeDate,
                daysOfMonth: expense.daysOfMonth,
              })
            ) {
              balance -= amount;
              events.push({ name: expense.name, amount: -amount });
            }
          }
        }
      }

      const label = current.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      result.push({
        date: new Date(current),
        label,
        balance: Math.round(balance * 100) / 100,
        events,
      });

      isFirstDay = false;
      current.setDate(current.getDate() + 1);
    }

    return result;
  });

  todayIndex = computed(() => {
    const cashflow = this.dailyCashflow();
    if (cashflow.length === 0) return -1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return cashflow.findIndex((entry) => {
      const d = new Date(entry.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  });

  private occursOnDate(
    date: Date,
    cadence: string,
    startDate: Date,
    opts: {
      dayOfMonth: number;
      oneTimeDate?: string;
      daysOfMonth?: string;
    },
  ): boolean {
    if (cadence === "once") {
      if (!opts.oneTimeDate) return false;
      const [y, m, d] = opts.oneTimeDate.split("-").map(Number);
      return (
        date.getFullYear() === y &&
        date.getMonth() === m - 1 &&
        date.getDate() === d
      );
    }

    if (cadence === "fixed-days") {
      if (!opts.daysOfMonth) return false;
      const days = opts.daysOfMonth
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      const lastDay = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
      ).getDate();
      return days.some(
        (day) => date.getDate() === Math.min(day, lastDay),
      );
    }

    const { dayOfMonth } = opts;

    if (cadence === "monthly") {
      const lastDay = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
      ).getDate();
      const clampedDay = Math.min(dayOfMonth, lastDay);
      return date.getDate() === clampedDay;
    }

    // For weekly/biweekly, calculate from the anchor date (dayOfMonth of start month)
    const anchorLastDay = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    ).getDate();
    const anchorDay = Math.min(dayOfMonth, anchorLastDay);
    const anchor = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      anchorDay,
    );

    const diffMs = date.getTime() - anchor.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (cadence === "weekly") {
      return diffDays >= 0 && diffDays % 7 === 0;
    }

    if (cadence === "biweekly") {
      return diffDays >= 0 && diffDays % 14 === 0;
    }

    return false;
  }

  private loadFromStorage<T>(key: string): T | null {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return null;
    }
  }
}
