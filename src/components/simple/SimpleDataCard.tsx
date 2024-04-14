import { cn } from '@/lib/utils'
import { every, isEmpty } from 'lodash-es'
import { Fragment } from 'react'

export type SimpleDataCardProps = {
  data: any
  depth?: number
  className?: string
  classNameCell?: string
  formatKey?: (key: string) => string
  ignoreEmpty?: boolean
}

export const SimpleDataCard = (props: SimpleDataCardProps) => {
  const {
    data,
    depth = 0,
    className,
    classNameCell,
    formatKey = (key) => key,
    ignoreEmpty,
  } = props
  if (depth === 0) {
    if (Array.isArray(data)) {
      if (ignoreEmpty && isEmptyValue(data)) return null
      return (
        <>
          <div className="flex flex-col gap-4">
            {data.map((item, i) => (
              <Fragment key={i}>
                <SimpleDataCard {...props} data={item} depth={0} />
              </Fragment>
            ))}
          </div>
        </>
      )
    }

    if (ignoreEmpty && isEmptyValue(data)) return null

    return (
      <div
        className={cn(
          'rounded-lg border text-card-foreground shadow-sm',
          'font-mono rounded-md bg-border/50 text-xs',
          className,
        )}
      >
        <SimpleDataCard {...props} data={data} depth={depth - 1} />
      </div>
    )
  }

  const classNameCellDefault = cn('border p-2', classNameCell)
  const classNameCellNullish = cn(classNameCellDefault, 'opacity-50')

  if (data === null) {
    return <div className={classNameCellNullish}>null</div>
  }

  if (data === undefined) {
    return <div className={classNameCellNullish}>undefined</div>
  }

  if (typeof data === 'boolean') {
    return <div className={classNameCellDefault}>{data ? 'true' : 'false'}</div>
  }

  if (typeof data === 'string' || typeof data === 'number') {
    return <div className={classNameCellDefault}>{data}</div>
  }

  // is Date
  if (data instanceof Date) {
    return <div className={classNameCellDefault}>{data.toISOString()}</div>
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data)
    if (entries.length === 0) {
      return (
        <div className={classNameCellNullish}>
          {Array.isArray(data) ? '[]' : '{}'}
        </div>
      )
    }
    return (
      <>
        <div className="grid grid-cols-[auto_1fr]">
          {entries.map(([key, value], i) => {
            if (ignoreEmpty && isEmptyValue(value)) return null
            return (
              <Fragment key={i}>
                <div className={cn(classNameCellNullish, 'font-bold')}>
                  {formatKey(key)}
                </div>
                <SimpleDataCard {...props} data={value} depth={depth - 1} />
              </Fragment>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <>
      <div className={classNameCellDefault}>{data.toString()}</div>
    </>
  )
}

const isEmptyValue = (value: unknown) => {
  // if (value === 0) return false
  if (value === false) return false
  if (!value) return true
  if (typeof value === 'object') {
    if (isEmpty(value)) return true
    if (every(value, isEmptyValue)) return true
  }
  return false
}
