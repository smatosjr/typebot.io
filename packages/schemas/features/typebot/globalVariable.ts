import { z } from '../../zod'

export const listGlobalVariableValue = z.object({})

const baseVariableSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const globalVariableSchema = baseVariableSchema.extend({
  value: z.string().or(listGlobalVariableValue).nullish(),
})

/**
 * Variable when retrieved from the database
 */
export const globalVariableWithValueSchema = baseVariableSchema.extend({
  value: z.string().or(listGlobalVariableValue),
})

/**
 * Variable when computed or retrieved from a block
 */
const GlobalVariableWithUnknowValueSchema = baseVariableSchema.extend({
  value: z.string(),
})

export type GlobalVariable = z.infer<typeof globalVariableSchema>
export type GlobalVariableWithValue = z.infer<
  typeof globalVariableWithValueSchema
>
export type GlobalVariableWithUnknowValue = z.infer<
  typeof GlobalVariableWithUnknowValueSchema
>
