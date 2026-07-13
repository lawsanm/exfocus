"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { SubjectDistributionItem } from "@/infrastructure/repositories/analytics-repository";

const chartConfig = {
  hours: { label: "Hours" },
} satisfies ChartConfig;

export function SubjectDistributionChart({ data }: { data: SubjectDistributionItem[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center text-sm">
            Complete a focus session to see time distribution by subject.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    subject: d.subjectName,
    hours: Math.round((d.minutes / 60) * 10) / 10,
    color: d.subjectColor,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 12 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              dataKey="subject"
              type="category"
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="hours" radius={4}>
              {chartData.map((entry) => (
                <Cell key={entry.subject} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
