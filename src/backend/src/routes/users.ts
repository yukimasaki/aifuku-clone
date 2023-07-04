import express from 'express'
const router = express.Router()

router.post('/', (req, res) => {
  res.json({ users: [{ id: 1, email: 'user1@example.com' }] })
})

export default router
