import { Request, Response, NextFunction } from 'express'
import { useFirebase } from "src/utils/firebase"

export const verify = async (req: Request, res: Response, next: NextFunction) => {
  const { checkIdToken } = useFirebase()
  const user = await checkIdToken(req)

  if (!user.error) {
    return next()
  }

  res.send({
    statusCode: user.error.code,
    statusMessage: 'Unauthorized',
    message: user.error.message,
  })
}
