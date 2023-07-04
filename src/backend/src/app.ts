import express from 'express'
import cors from 'cors'

import userRouter from './routes/users'
import loginRouter from './routes/login'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const port = 3000

app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`)
})
