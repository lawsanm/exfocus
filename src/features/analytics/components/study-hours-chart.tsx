"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DailyMinutes } from "@/infrastructure/repositories/analytics-repository";

const chartConfig = {
  hours: { label: "Study hours", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export function StudyHoursChart({ data }: { data: DailyMinutes[] }) {
  const chartData = data.map((d) => ({
    date: d.date,
    hours: Math.round((d.minutes / 60) * 10) / 10,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study hours (last 30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={chartData.slice(-30)}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="hours"
              type="monotone"
              fill="var(--color-hours)"
              fillOpacity={0.2}
              stroke="var(--color-hours)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
