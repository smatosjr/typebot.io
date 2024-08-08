import { router } from '@/helpers/server/trpc'
import { listTypebots } from './listTypebots'
import { createTypebot } from './createTypebot'
import { updateTypebot } from './updateTypebot'
import { getTypebot } from './getTypebot'
import { getPublishedTypebot } from './getPublishedTypebot'
import { publishTypebot } from './publishTypebot'
import { unpublishTypebot } from './unpublishTypebot'
import { deleteTypebot } from './deleteTypebot'
import { importTypebot } from './importTypebot'
import { createGlobalVariables } from './createGlobalVariables'
import { deleteGlobalVariables } from './deleteGlobalVariables'
import { updateGlobalVariables } from './updateGlobalVariables'
import { getGlobalVariables } from './getGlobalVariables'

export const typebotRouter = router({
  createTypebot,
  updateTypebot,
  getTypebot,
  getPublishedTypebot,
  publishTypebot,
  unpublishTypebot,
  listTypebots,
  deleteTypebot,
  importTypebot,
  createGlobalVariables,
  deleteGlobalVariables,
  updateGlobalVariables,
  getGlobalVariables,
})
