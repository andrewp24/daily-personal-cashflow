import { Component, computed, inject } from "@angular/core";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";
import { Calculator } from "../../services/calculator";
import { CurrencyPipe } from "@angular/common";

@Component({
  selector: "app-how-its-looking",
  imports: [BaseChartDirective, CurrencyPipe],
  templateUrl: "./how-its-looking.html",
  styleUrl: "./how-its-looking.css",
})
export class HowItsLooking {
  private calculator = inject(Calculator);

  hasData = computed(() => this.calculator.dailyCashflow().length > 0);

  startingBalance = computed(() => {
    const data = this.calculator.dailyCashflow();
    return data.length > 0 ? data[0].balance : 0;
  });

  endingBalance = computed(() => {
    const data = this.calculator.dailyCashflow();
    return data.length > 0 ? data[data.length - 1].balance : 0;
  });

  lowestBalance = computed(() => {
    const data = this.calculator.dailyCashflow();
    if (data.length === 0) return 0;
    return Math.min(...data.map((d) => d.balance));
  });

  chartConfig = computed<ChartConfiguration<"bar">>(() => {
    const cashflow = this.calculator.dailyCashflow();
    const todayIdx = this.calculator.todayIndex();

    const labels = cashflow.map((d) => d.label);
    const balances = cashflow.map((d) => d.balance);
    const colors = cashflow.map((d, i) => {
      if (d.balance < 0) return "#ef4444";
      if (i === todayIdx) return "#f59e0b";
      return "#3b82f6";
    });
    const borderColors = cashflow.map((_, i) =>
      i === todayIdx ? "#f59e0b" : "transparent",
    );
    const borderWidths = cashflow.map((_, i) => (i === todayIdx ? 3 : 0));

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: balances,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: borderWidths,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed?.y ?? 0;
                return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 90,
              autoSkip: true,
              maxTicksLimit: 30,
            },
          },
          y: {
            ticks: {
              callback: (value) => `$${Number(value).toLocaleString()}`,
            },
          },
        },
      },
    };
  });
}
