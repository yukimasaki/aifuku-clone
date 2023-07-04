import { useAuth } from '../composables/useAuth'

export default defineNuxtRouteMiddleware(async () => {
  const { verify } = useAuth()
  const user = await verify()

  if (user) return navigateTo('/', { replace: true })
})
