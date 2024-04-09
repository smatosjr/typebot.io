import { createAction, option } from '@typebot.io/forge'

import { auth } from '../auth'
import got from 'got'
import { ResonseProfileAccounts, ResonseAgents, ResonseTeams } from '../type'

export const getAcoounts = createAction({
  name: 'Atribuir para',
  auth,
  options: option.object({
    accountId: option.string.layout({
      fetcher: 'fetchAccounts',
      label: 'Nome da conta',
      placeholder: 'Selecione uma conta',
    }),
    teamId: option.string.layout({
      fetcher: 'fetchTeams',
      label: 'Nome do time',
      placeholder: 'Selecione uma conta',
      helperText: 'or',
    }),
    agentId: option.string.layout({
      fetcher: 'fetchAgents',
      label: 'Nome do agente',
      placeholder: 'Selecione um agente',
    }),
  }),
  fetchers: [
    {
      id: 'fetchAccounts',
      fetch: async ({ credentials }) => {
        const response = await got
          .get(`https://painel.digitalchat.com.br/api/v1/profile`, {
            headers: {
              api_access_token: credentials.apiKey,
            },
          })
          .json<ResonseProfileAccounts>()

        return response.accounts.map((item) => ({
          value: String(item.id),
          label: item.name,
        }))
      },

      dependencies: [],
    },
    {
      id: 'fetchTeams',
      fetch: async ({ credentials, options: { accountId } }) => {
        const response = await got
          .get(
            `https://painel.digitalchat.com.br/api/v1/accounts/${accountId}/teams`,
            {
              headers: {
                api_access_token: credentials.apiKey,
              },
            }
          )
          .json<ResonseTeams>()

        return response.map((item) => ({
          value: String(item.id),
          label: item.name,
        }))
      },
      dependencies: ['accountId'],
    },
    {
      id: 'fetchAgents',
      fetch: async ({ credentials, options: { accountId } }) => {
        const response = await got
          .get(
            `https://painel.digitalchat.com.br/api/v1/accounts/${accountId}/agents`,
            {
              headers: {
                api_access_token: credentials.apiKey,
              },
            }
          )
          .json<ResonseAgents>()

        return response.map((item) => ({
          value: String(item.id),
          label: item.available_name,
        }))
      },
      dependencies: ['accountId'],
    },
  ],
})
