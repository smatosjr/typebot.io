import { Text } from '@chakra-ui/react'
import { SetGlobalVariableBlock } from '@typebot.io/schemas'

export const SetGlobalVariableContent = ({
  block,
}: {
  block: SetGlobalVariableBlock
}) => {
  const variableName = block.options?.variableId ?? ''

  return (
    <Text color={'gray.500'} noOfLines={4}>
      {variableName === '' ? (
        'Click to edit...'
      ) : (
        <Expression options={block.options} />
      )}
    </Text>
  )
}

const Expression = ({
  options,
}: {
  options: SetGlobalVariableBlock['options']
}): JSX.Element | null => {
  return (
    <Text as="span">
      {options?.variableId} = {options?.expressionToEvaluate}
    </Text>
  )
}
