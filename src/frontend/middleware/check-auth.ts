import { useAuth } from '../composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { verify } = useAuth()
  const result = await verify()
})
