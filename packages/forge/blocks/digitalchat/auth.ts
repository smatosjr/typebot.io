import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'DigitalChat account',
  schema: option.object({
    apiKey: option.string.layout({
      label: 'API key',
      isRequired: true,
      inputType: 'password',
      helperText: 'Você pode pegar seu token em meu perfil no DigitalChat',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition
