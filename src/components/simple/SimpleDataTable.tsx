import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { flatMap, keys, uniq } from 'lodash-es'

export type SimpleDataTableProps = {
  data: any[]
  formatKey?: (key: string) => string
  classNameHeaderAndCell?: string
}

export const SimpleDataTable = (props: SimpleDataTableProps) => {
  const { data, formatKey, classNameHeaderAndCell } = props

  const allKeys = uniq(flatMap(data, (item) => keys(item)))

  return (
    <>
      <Table>
        <TableHeader>
          {allKeys.map((key) => (
            <TableHead key={key} className={cn(classNameHeaderAndCell)}>
              {formatKey?.(key) ?? key}
            </TableHead>
          ))}
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {allKeys.map((key) => (
                <TableCell key={key} className={cn(classNameHeaderAndCell)}>
                  {item[key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export const SimpleDataTableCard = ({
  title,
  description,
  ...props
}: SimpleDataTableProps & { title?: string; description?: string }) => {
  const hasHeader = title || description
  return (
    <>
      <Card>
        {hasHeader && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <SimpleDataTable
          {...props}
          classNameHeaderAndCell={cn(
            'first:pl-6 last:pr-6',
            props.classNameHeaderAndCell,
          )}
        />
      </Card>
    </>
  )
}
