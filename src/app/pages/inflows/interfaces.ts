export interface Income {
  name: string;
  amount: string;
  cadence: "weekly" | "biweekly" | "monthly" | "";
  dayOfMonth: number;
}

export interface InflowData {
  cashOnHand: string;
  income: Income[];
}
