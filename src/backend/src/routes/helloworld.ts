import express from 'express'

const router = express.Router()
router.get('/', (req, res) => {
  res
    .status(200)
    .send({ message: 'HELLO WORLD!!' })
})

router.get('/test', (req, res) => {
  res
    .status(200)
    .send({ message: 'test!!' })
})

export default router