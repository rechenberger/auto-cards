'use client'

import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartData = [
  { source: 'January', value: 186 },
  { source: 'February', value: 305 },
  { source: 'March', value: 237 },
  { source: 'April', value: 73 },
  { source: 'May', value: 209 },
  { source: 'June', value: 214 },
]

const chartConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--chart-1))',
  },
  label: {
    color: 'hsl(var(--background))',
  },
} satisfies ChartConfig

export function DpsReportChart({
  data = chartData,
}: {
  data: { source: string; value: number }[]
}) {
  return (
    <>
      <ChartContainer config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{
            right: 16,
          }}
        >
          {/* <CartesianGrid horizontal={false} /> */}
          <YAxis
            dataKey="source"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            // tickFormatter={(value) => value.slice(0, 3)}
          />
          <XAxis dataKey="value" type="number" hide />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Bar
            dataKey="value"
            layout="vertical"
            fill="var(--color-value)"
            radius={4}
          >
            {/* <LabelList
              dataKey="source"
              position="insideLeft"
              offset={8}
              className="fill-[--color-label]"
              fontSize={12}
            /> */}
            <LabelList
              dataKey="value"
              position="right"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </>
  )
}
