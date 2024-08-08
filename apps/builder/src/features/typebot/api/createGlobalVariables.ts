import { authenticatedProcedure } from '@/helpers/server/trpc'
import redis from '@typebot.io/lib/redis'
import { z } from 'zod'
// import { createId } from '@paralleldrive/cuid2'
// import { EventType } from '@typebot.io/schemas/features/events/constants'
// import { trackEvents } from '@typebot.io/telemetry/trackEvents'

export const createGlobalVariables = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/createGlobalVariables',
      protect: true,
      summary: 'Create a typebot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  )
  .mutation(async ({ input: { key, value } }) => {
    const getGlobalVariables = await redis?.get('GLOBAL_VARIABLES')

    const variables =
      typeof getGlobalVariables == 'string'
        ? JSON.parse(getGlobalVariables)
        : {}

    await redis?.set(
      'GLOBAL_VARIABLES',
      JSON.stringify({
        ...variables,
        [key]: value,
      })
    )

    await redis?.get('GLOBAL_VARIABLES')

    return 'success'
  })
