import { SetGlobalVariableBlock } from './schema'

export const valueTypes = [] as const

export const hiddenTypes = ['Today', 'User ID'] as const

export const sessionOnlySetVariableOptions = ['Transcript'] as const

export const defaultSetVariableOptions = {
  type: 'Text',
} as SetGlobalVariableBlock['options']
