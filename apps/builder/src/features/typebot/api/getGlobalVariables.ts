import { authenticatedProcedure } from '@/helpers/server/trpc'
import redis from '@typebot.io/lib/redis'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
// import { createId } from '@paralleldrive/cuid2'
// import { EventType } from '@typebot.io/schemas/features/events/constants'
// import { trackEvents } from '@typebot.io/telemetry/trackEvents'

export const getGlobalVariables = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/getGlobalVariables',
      protect: true,
      summary: 'Get a globals variables',
      tags: ['GlobalVariables'],
    },
  })
  .input(
    z.object({
      variables: z.string().optional(),
    })
  )
  .query(async () => {
    try {
      let global_variables = await redis?.get('GLOBAL_VARIABLES')
      global_variables = global_variables ? JSON.parse(global_variables) : {}
      return global_variables
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse GlobalVariables',
        cause: err,
      })
    }
  })
