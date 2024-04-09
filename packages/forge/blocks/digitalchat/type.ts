export type ResonseProfileAccounts = {
  available_name: string
  name: string
  accounts: [
    {
      id: string
      name: string
    }
  ]
}

export type ResonseTeams = {
  id: string
  name: string
}[]

export type ResonseAgents = {
  available_name: string
  id: string
}[]
