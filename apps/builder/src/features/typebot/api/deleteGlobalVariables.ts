import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import redis from '@typebot.io/lib/redis'
import { z } from 'zod'
// import { createId } from '@paralleldrive/cuid2'
// import { EventType } from '@typebot.io/schemas/features/events/constants'
// import { trackEvents } from '@typebot.io/telemetry/trackEvents'

export const deleteGlobalVariables = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/deleteGlobalVariables',
      protect: true,
      summary: 'Create a typebot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      key: z.string(),
    })
  )
  .output(z.string().optional())
  .mutation(async ({ input: { key } }) => {
    try {
      const getGlobalVariables = await redis?.get('GLOBAL_VARIABLES')

      const variables = getGlobalVariables ? JSON.parse(getGlobalVariables) : {}

      const deletedKey = JSON.parse(variables)

      delete deletedKey[key]

      await redis?.del('GLOBAL_VARIABLES')
      await redis?.set('GLOBAL_VARIABLES', JSON.stringify(deletedKey))

      return 'success'
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse GlobalVariables',
        cause: err,
      })
    }
  })
