import { useAuth } from '../composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { verify } = useAuth()
  const user = await verify()

  if (!user && !(from.path === '/login')) return navigateTo('/login', { replace: true })
})
