export type EventItem = {
  id: string
  name: string
  type: string
  description?: string | null
  startsAt: string
  endsAt?: string | null
  location?: string | null
  estimatedCapacity?: number
  budget?: number | null
  status?: string | null
  validTransitions?: string[] | null
}

export type EventModule = {
  code: string
  name: string
  category: string
  icon?: string | null
  enabled: boolean
  featured: boolean
  order: number
  audience?: string | null
  configuration?: string | null
}

export type ModuleCatalogItem = { code: string; name: string; description?: string | null; category: string; icon?: string | null; available: boolean }
export type EventTemplate = { code: string; name: string; modules: string[] }
export type UserProfile = { id: string; name: string; email: string; phone?: string | null; photoUrl?: string | null; status?: string | null; roles?: string[] | null; preferences?: { email: boolean; push: boolean; inApp: boolean } }
