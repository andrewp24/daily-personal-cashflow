export interface Paycheck {
  name: string;
  amount: string;
  cadence: "weekly" | "biweekly" | "monthly" | "";
  dayOfMonth: number;
}

export interface InflowData {
  cashOnHand: string;
  paychecks: Paycheck[];
}
