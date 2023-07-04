import express from 'express'
import cors from 'cors'

import testRouter from './routes/test'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const port = 3000

app.use('/api/test', testRouter)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`)
})
