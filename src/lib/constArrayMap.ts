export type ConstArrayMapper<
  OutputItem,
  Key extends keyof InputArray[number],
  InputArray extends readonly Record<Key, OutputItem>[],
  OutputArray extends OutputItem[] = [],
> = InputArray['length'] extends OutputArray['length']
  ? OutputArray
  : ConstArrayMapper<
      OutputItem,
      Key,
      InputArray,
      [...OutputArray, InputArray[OutputArray['length']][Key]]
    >

export const constArrayMap = <
  OutputItem,
  InputArray extends readonly Record<Key, OutputItem>[],
  Key extends keyof InputArray[number],
>(
  arr: InputArray,
  key: Key,
) => {
  const result = arr.map((item) => item[key]) as ConstArrayMapper<
    OutputItem,
    Key,
    InputArray
  >
  return result
}

// EXAMPLE:

// const myArray = [
//   {
//     name: 'Alice',
//     age: 25,
//   },
//   {
//     name: 'Bob',
//     age: 30,
//   },
// ] as const

// const naiveNames = myArray.map((item) => item.name)
// // //    ^ type: ("Alice" | "Bob")[]
// const schema1 = z.enum(naiveNames) // ❌

// const actualNames = constArrayMap(myArray, 'name')
// // //    ^ type: ['Alice', 'Bob']
// const schema2 = z.enum(actualNames) // ✅
