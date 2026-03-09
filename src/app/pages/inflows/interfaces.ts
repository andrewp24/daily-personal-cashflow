export interface InflowData {
  cashOnHand: string;
  paycheckAmount: string;
  paycheckCadence: "weekly" | "biweekly" | "monthly" | "";
  paycheckDayOfMonth: number;
}
