import { useAuth } from '../composables/useAuth'

export default defineNuxtRouteMiddleware(async () => {
  const { verify } = useAuth()
  const uid = await verify()

  if (uid) {
    return navigateTo('/')
  }
})