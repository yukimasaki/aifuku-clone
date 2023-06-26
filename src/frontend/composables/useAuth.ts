export const useAuth = () => {
  const verify = async () => {
    const url = '/verify'

    // todo: useFetchに置き換える
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    // if (!response.ok) {
    //   const result = await response.json()
    //   const { error } = result
    //   throw createError({
    //     statusCode: error.code,
    //     statusMessage: error.message,
    //   })
    // }

    // return response.ok
  }
}
