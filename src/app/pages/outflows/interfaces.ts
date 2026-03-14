export interface Expenses {
  name: string;
  amount: string;
  cadence: "weekly" | "biweekly" | "monthly" | "";
  dayOfMonth: number;
}

export interface ExpenseData {
  expenses: Expenses[];
}
