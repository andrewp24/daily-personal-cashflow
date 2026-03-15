import { Component, computed, inject } from "@angular/core";
import { BaseChartDirective } from "ng2-charts";
import { Chart, ChartConfiguration } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Calculator } from "../../services/calculator";
import { CurrencyPipe } from "@angular/common";

Chart.register(annotationPlugin);

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

  tableEvents = computed(() => {
    const cashflow = this.calculator.dailyCashflow();
    return cashflow.flatMap((day) =>
      day.events.map((e) => ({
        date: day.label,
        name: e.name,
        amount: e.amount,
      })),
    );
  });

  chartConfig = computed<ChartConfiguration<"bar">>(() => {
    const cashflow = this.calculator.dailyCashflow();
    const todayIdx = this.calculator.todayIndex();

    const labels = cashflow.map((d) => d.label);
    const balances = cashflow.map((d) => d.balance);
    const DANGER_THRESHOLD = 500;
    const colors = cashflow.map((d, i) => {
      if (d.balance < 0) return "#ef4444";
      if (d.balance <= DANGER_THRESHOLD) return "#f87171";
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
          annotation: {
            annotations: {
              dangerLine: {
                type: "line",
                yMin: DANGER_THRESHOLD,
                yMax: DANGER_THRESHOLD,
                borderColor: "rgba(239, 68, 68, 0.4)",
                borderWidth: 2,
                borderDash: [6, 4],
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed?.y ?? 0;
                return `Balance: $${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              },
              afterBody: (items) => {
                const idx = items[0]?.dataIndex;
                if (idx == null) return [];
                const events = cashflow[idx]?.events ?? [];
                if (events.length === 0) return [];
                return events.map((e) => {
                  const sign = e.amount >= 0 ? "+" : "-";
                  const abs = Math.abs(e.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  return `  ${sign} ${e.name}: $${abs}`;
                });
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
