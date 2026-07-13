"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { WeeklyProductivity } from "@/infrastructure/repositories/analytics-repository";

const chartConfig = {
  hours: { label: "Study hours", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

export function WeeklyProductivityChart({ data }: { data: WeeklyProductivity[] }) {
  const chartData = data.map((d) => ({
    week: new Date(d.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    hours: Math.round((d.minutes / 60) * 10) / 10,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
