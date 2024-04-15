import { z } from 'zod'

export const typedParse = <Schema extends z.Schema>(
  schema: Schema,
  data: z.input<Schema>,
) => {
  return schema.parse(data)
}

// Example:
// const schema = z.object({
//   type: z.enum(['person', 'office']),
//   createdAt: z.date().default(() => new Date()),
// })

// const data = typedParse(schema, {
//   type: 'person', // ✅ autocomplete
//   // createdAt ✅ not required because of default
// })
