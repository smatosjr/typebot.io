import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'
import { extendZodWithOpenApi } from 'zod-openapi'

extendZodWithOpenApi(z)

const baseOptions = z.object({
  type: z.literal('Text'),
  variableId: z.string().optional(),
  expressionToEvaluate: z.string().optional(),
})

export const setGlobalVariableBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.SET_GLOBAL_VARIABLE]),
    options: baseOptions.optional(),
  })
)

export type SetGlobalVariableBlock = z.infer<
  typeof setGlobalVariableBlockSchema
>
