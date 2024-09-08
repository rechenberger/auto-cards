'use client'

import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { DpsReportEntry } from '@/game/dpsReport'
import { capitalCase } from 'change-case'
import { first } from 'lodash-es'

export function DpsReportChart({
  data,
  valueLabel,
}: {
  data: DpsReportEntry[]
  valueLabel?: string
}) {
  const betterData = data.map((item) => ({
    ...item,
    source: capitalCase(item.source),
    fill:
      item.sourceSideIdx === 0
        ? item.target === 'enemy'
          ? 'hsla(217, 91%, 60%, 1)'
          : 'hsla(217, 91%, 60%, 0.5)'
        : item.target === 'enemy'
          ? 'hsla(0, 84%, 60%, 1)'
          : 'hsla(0, 84%, 60%, 0.5)',
    valueN: item.negative ? -item.value : item.value,
  }))
  const chartConfig = {
    value: {
      label: valueLabel ?? 'Value',
      color: 'hsl(var(--chart-1))',
    },
    label: {
      color: 'hsl(var(--background))',
    },
    blue: {
      color: 'hsl(var(--chart-1))',
    },
    red: {
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig
  return (
    <>
      <ChartContainer config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={betterData}
          layout="vertical"
          margin={{
            right: 32,
          }}
        >
          {/* <CartesianGrid horizontal={false} /> */}
          <YAxis
            dataKey="source"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            width={140}
          />
          <XAxis dataKey="value" type="number" hide />
          <ChartTooltip
            cursor={false}
            content={(props) => {
              let payload = first(props.payload)
              const entry: DpsReportEntry = payload?.payload
              if (payload) {
                payload = { ...payload }
                if (payload.value && entry?.negative) {
                  payload.value = -payload.value
                }
              }
              let label: string | undefined
              if (entry) {
                label = entry.source
                // label += entry.sourceSideIdx === 0 ? ' from blue' : ' from red'
                label += entry.target === 'self' ? ' on self' : ' against enemy'
                // if (entry.negative) {
                //   label += ' (negative)'
                // }
              }
              return (
                <ChartTooltipContent
                  {...(props as any)}
                  payload={payload ? [payload] : []}
                  indicator="line"
                  label={label}
                />
              )
            }}
          />
          <Bar
            dataKey="value"
            layout="vertical"
            // fill="var(--color-red)"
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
              dataKey="valueN"
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
