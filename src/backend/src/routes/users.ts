import express from 'express'
import FirebaseAdmin from 'firebase-admin'
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
  const { email, password, tenant_id, display_name } = req.body
  await FirebaseAdmin.auth().createUser({ email, password })
  .then(async (userRecord) => {
    const uid = userRecord.uid
    const result = await prisma.user.create({
      data: { uid, email, tenant_id, display_name },
    })
    res.status(200).json({ message: 'ok', result: result })
  })
  .catch((error) => {
    res.status(400).json({ message: 'ng', result: error })
  })
})

// PUT /users/:id
router.put('/:id', async (req, res) => {
  const { uid, email, tenant_id, display_name } = req.body
  const user = await prisma.user.update({
    where: { id: parseInt(req.params?.id) },
    data: { uid, email, tenant_id, display_name },
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
