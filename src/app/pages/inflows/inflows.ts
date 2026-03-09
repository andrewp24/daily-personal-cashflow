import { Component, signal } from "@angular/core";
import { InflowData } from "./interfaces";
import {
  form,
  FormField,
  pattern,
  required,
  validate,
} from "@angular/forms/signals";
import { CurrencyPipe, NgClass } from "@angular/common";

const EDITING_AMOUNT_REGEX = /^\d*\.?\d{0,2}$/;
@Component({
  selector: "app-inflows",
  imports: [FormField, CurrencyPipe, NgClass],
  templateUrl: "./inflows.html",
  styleUrl: "./inflows.css",
})
export class Inflows {
  constructor() {}

  inflowModel = signal<InflowData>({
    cashOnHand: "",
    paycheckAmount1: "",
  });
  inflowForm = form(this.inflowModel, (schemaPath) => {
    //required(schemaPath.cashOnHand, { message: "Cash on hand is required." });
    pattern(schemaPath.cashOnHand, /^(0|[1-9]\d*)(\.\d{1,2})?$/, {
      message:
        "Must not have more than 2 decimal places. and no commas or currency symbols. Also no leading zeros unless the value is zero or has decimal places.",
    });
    pattern(schemaPath.paycheckAmount1, /^(0|[1-9]\d*)(\.\d{1,2})?$/, {
      message:
        "Must not have more than 2 decimal places. and no commas or currency symbols. Also no leading zeros unless the value is zero or has decimal places.",
    });
  });

  totalAmount = parseFloat(
    this.inflowForm
      .cashOnHand()
      .value()
      .replace(/[^0-9.]/g, ""),
  );
}
