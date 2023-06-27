export const useAuth = () => {
  const verify = async () => {
    const url = '/api/verify'

    const { data } =  await useFetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log(data)
    return data
  }

  return {
    verify
  }
}
