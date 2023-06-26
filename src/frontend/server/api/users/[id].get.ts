import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  if (event.context.params !== undefined) {
    const id = parseInt(event.context.params.id)
    if (!Number.isInteger(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID should be an integer.'
      })
    }
    const user = await prisma.user.findUnique({
      where: { id },
    })
    return JSON.stringify({ user })
  }
})
