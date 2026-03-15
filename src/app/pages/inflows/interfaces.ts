export interface Income {
  name: string;
  amount: string;
  cadence: "weekly" | "biweekly" | "monthly" | "once" | "fixed-days" | "";
  dayOfMonth: number;
  oneTimeDate: string;
  daysOfMonth: string;
}

export interface InflowData {
  cashOnHand: string;
  asOfDate: string;
  income: Income[];
}
