import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

// GET /users
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany()
  res.status(200).json({ users })
})

// GET /users:id
router.get('/:id', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(req.params?.id) },
    })
    res.status(200).json({ user })
})

// POST /users
router.post('/', async (req, res) => {
    const { name, email } = req.body
    const user = await prisma.user.create({
      data: { name, email },
    })
    res.status(200).json({ user })
})

// PUT /users/:id
router.put('/:id', async (req, res) => {
  const { name, email } = req.body
  const user = await prisma.user.update({
    where: { id: parseInt(req.params?.id) },
    data: { name, email },
  })
  res.status(200).json({ user })
})

// DELETE /users/:id
router.delete('/:id', async (req, res) => {
  const user = await prisma.user.delete({
    where: { id: parseInt(req.params?.id) },
  })
  res.status(200).json({ user })
})

export default router
