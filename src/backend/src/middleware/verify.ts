import { IncomingMessage, ServerResponse } from "http"
import { useFirebase } from "src/utils/firebase"

export const verify = async (req: IncomingMessage, seq: ServerResponse) => {
  const { checkIdToken } = useFirebase()
  await checkIdToken()
}
