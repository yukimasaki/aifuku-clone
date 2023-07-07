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
  links: any
}

/**
 * ページネーションされたデータを取得する
 */
export async function paginate<Items>({
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

  const pageCount = Math.ceil(count / perPage)

  const links = {
    first: `?page=1&?perPage=${perPage}`,
    prev: page === 1 ? '' : `?page=${page - 1}&?perPage=${perPage}`,
    next: page === pageCount ? '' : `?page=${page + 1}&?perPage=${perPage}`,
    last: `?page=${pageCount}&?perPage=${perPage}`,
  }

  return {
    items,
    count,
    pageCount,
    links,
  }
}
