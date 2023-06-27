import { useAuth } from '../composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { verify } = useAuth()
  const uid = await verify()

  if (!uid) {
    return navigateTo('/login', { replace: true })
  }
})
