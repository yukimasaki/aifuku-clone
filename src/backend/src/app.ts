import express from 'express'
import cors from 'cors'

import userRouter from './routes/users'
import loginRouter from './routes/login'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/users', userRouter)
app.use('/login', loginRouter)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`)
})
