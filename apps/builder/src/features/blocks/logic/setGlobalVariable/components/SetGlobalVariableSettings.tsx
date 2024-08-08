import { FormLabel, Input, Stack, Text } from '@chakra-ui/react'
import { SetGlobalVariableBlock } from '@typebot.io/schemas'
import { GlobalVariableSearchInput } from '@/components/inputs/GlobalVariableSearchInput'

import { useState } from 'react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'

type Props = {
  options?: SetGlobalVariableBlock['options']
  onOptionsChange: (options: SetGlobalVariableBlock['options']) => void
}

export const SetGlobalVariableSettings = ({
  onOptionsChange,
  options,
}: Props) => {
  const { updateGlobalVariable, globalStateVariables } = useTypebot()
  const stateGlobal = globalStateVariables ?? {}

  const [inputValue, setInputValue] = useState(
    stateGlobal[options?.variableId ?? ''] || options?.expressionToEvaluate
  )
  // console.log('SetGlobalVariableSettings', options)

  const updateVariableId = (variable: {
    name: string | undefined
    value: string | undefined
  }) => {
    // console.log('SetGlobalVariableSettings 1', variable)
    setInputValue(variable.value ?? '')

    onOptionsChange({
      expressionToEvaluate: variable.value,
      type: 'Text',
      variableId: variable.name,
    })
  }

  const onchangeInputValue = (value: string) => {
    setInputValue(value)
    setTimeout(() => {
      const oldVersion = {
        key: options?.variableId ?? '',
        value: options?.expressionToEvaluate ?? '',
      }
      const newVersion = { key: options?.variableId ?? '' ?? '', value: value }
      updateGlobalVariable(oldVersion, newVersion)

      onOptionsChange({
        expressionToEvaluate: value,
        type: 'Text',
        variableId: options?.variableId,
      })
    }, 3000)
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="variable-search">
          Buscar ou criar uma variável global:
        </FormLabel>
        <GlobalVariableSearchInput
          onSelectVariable={updateVariableId}
          initialVariableId={options?.variableId}
          id="variable-search"
        />
      </Stack>

      <Stack spacing="4">
        <Stack>
          <Text mb="0" fontWeight="medium">
            Value:
          </Text>
          <Input
            placeholder="Inserir valor"
            value={inputValue}
            onChange={(e) => onchangeInputValue(e.target.value)}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
