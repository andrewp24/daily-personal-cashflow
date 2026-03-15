export interface Expenses {
  name: string;
  amount: string;
  cadence: "weekly" | "biweekly" | "monthly" | "once" | "fixed-days" | "";
  dayOfMonth: number;
  oneTimeDate: string;
  daysOfMonth: string;
}

export interface ExpenseData {
  expenses: Expenses[];
}
