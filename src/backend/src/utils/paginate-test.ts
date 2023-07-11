import { Request } from 'express'

/**
 * Prismaでページネーションを実装する（Client extensionsも使ってみる）
 * https://zenn.dev/gibjapan/articles/815c0a6783d5ff
 */
type PaginateInputs<Items> = {
  page: number
  perPage: number
  queryFn: (args: { skip: number; take: number }) => Promise<Items>
  countFn: () => Promise<number>
}

type PaginateOutputs<Items> = {
  items: Items
  count: number
  pageCount: number
  links: any,
  // meta: any
}

// type LinkDefinition = {
//   prevLabel: boolean
//   leftDotLabel: boolean
//   rightDotLabel: boolean
//   nextLabel: boolean
// }

/**
 * ページネーションされたデータを取得する
 */
export async function paginate<Items>(req: Request, {
  page,
  perPage,
  countFn,
  queryFn,
}: PaginateInputs<Items>): Promise<PaginateOutputs<Items>> {
  const [items, count] = await Promise.all([
    queryFn({
      skip: perPage * (page - 1),
      take: perPage,
    }),
    countFn(),
  ])

  const baseUrl = req.baseUrl
  const pageCount = Math.ceil(count / perPage)

  const firstPage = 1

  const links = {
    first: `${baseUrl}/?page=1&?perPage=${perPage}`,
    prev: page === firstPage ? '' : `${baseUrl}/?page=${page - 1}&?perPage=${perPage}`,
    next: page === pageCount ? '' : `${baseUrl}/?page=${page + 1}&?perPage=${perPage}`,
    last: `${baseUrl}/?page=${pageCount}&?perPage=${perPage}`,
  }

  return {
    items,
    count,
    pageCount,
    links,
    // meta: { links: metaLinks },
  }
}

export const createMetaLink = (page: number, pageCount: number) => {
  const firstPage = 1
  const lastPage = pageCount
  const pageLabels = []

  switch (page) {
    case firstPage:
      if (pageCount <= 4) {
        // [1, 2, 3, 4]
        Array.from({ length: pageCount }, (_,index) => {
          pageLabels.push(index + 1)
        })
      } else {
        // [1, 2, 3, ..., 5]
        Array.from({ length: 3 }, (_,index) => {
          pageLabels.push(index + 1)
        })
        pageLabels.push('...')
        pageLabels.push(lastPage)
      }
      break

    case lastPage:
      break

    default:
      break
  }

  console.log(pageLabels)
  return pageLabels
}
