import { authenticatedProcedure } from '@/helpers/server/trpc'
import redis from '@typebot.io/lib/redis'
import { z } from 'zod'
// import { createId } from '@paralleldrive/cuid2'
// import { EventType } from '@typebot.io/schemas/features/events/constants'
// import { trackEvents } from '@typebot.io/telemetry/trackEvents'

export const updateGlobalVariables = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/updateGlobalVariables',
      protect: true,
      summary: 'Create a typebot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      oldVersion: z.object({
        key: z.string(),
        value: z.string(),
      }),
      newVersion: z.object({
        key: z.string(),
        value: z.string(),
      }),
    })
  )
  .mutation(async ({ input: { oldVersion, newVersion } }) => {
    const getGlobalVariables = await redis?.get('GLOBAL_VARIABLES')

    const variables = getGlobalVariables ? JSON.parse(getGlobalVariables) : {}

    await redis?.set(
      'GLOBAL_VARIABLES',
      JSON.stringify({
        ...removeKey(variables, oldVersion.key),
        [newVersion.key]: newVersion.value,
      })
    )
    return 'success'
  })

const removeKey = <T extends object, K extends keyof T | string>(
  obj: T,
  key: K
): Omit<T, K> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: _, ...rest } = obj
  console.log('resttttttt', rest, obj)
  return rest
}
