import { useCallback, useEffect, useState } from 'react'
import { getGuestToken, loadGuestExperience } from '../services/guest'
import type { GuestExperience } from '../types/guest'

export function useGuestExperience() {
  const [token, setToken] = useState<string | null>(null)
  const [experience, setExperience] = useState<GuestExperience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const savedToken = await getGuestToken()
      if (!savedToken) throw new Error('Abre el enlace de tu invitación para continuar.')
      setToken(savedToken)
      setExperience(await loadGuestExperience(savedToken))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos cargar tu evento.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void reload() }, [reload])
  return { token, experience, loading, error, reload }
}
