import { createBlock } from '@typebot.io/forge'
import { DigitalchatLogo } from './logo'
import { auth } from './auth'
import { getAccounts } from './actions/getAccounts'

export const digitalchatBlock = createBlock({
  id: 'digitalchat',
  name: 'DigitalChat',
  tags: [],
  LightLogo: DigitalchatLogo,
  auth,
  actions: [getAccounts],
})
