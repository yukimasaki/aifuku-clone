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
  // const pageRange = 2 // 何ページ隣までページ番号ラベルを表示するか

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

export const createMetaLink = (page: number, pageCount: number, pageRange: number) => {
  const firstPage = 1
  const lastPage = pageCount
  const duplicatedValues = []

  if (pageCount <= 4) {
    // 4ページ以下の場合: [1] ～ [1, 2, 3, 4]
    Array.from({ length: pageCount }, (_, index) => {
      const currentPage = index + 1
      duplicatedValues.push({ label: currentPage, value: currentPage })
    })
  } else if (page === firstPage) {
    // 最初のページ(なおかつ5ページ以上)の場合: [1, 2, 3, ..., 5]
    Array.from({ length: 3 }, (_, index) => {
      const currentPage = index + 1
      duplicatedValues.push({ label: currentPage, value: currentPage })
    })
    duplicatedValues.push({ label: 'Prev', value: '...' }, { label: lastPage, value: lastPage })
  } else if (page === lastPage) {
    // 最後のページ(なおかつ5ページ以上)の場合: [1, ..., 3, 4, 5]
    duplicatedValues.push({ label: firstPage, value: firstPage }, { label: 'Next', value: '...' })
    Array.from({ length: 3 }, (_, index) => {
      const currentPage = index + page - pageRange
      duplicatedValues.push({ label: currentPage, value: currentPage })
    })
  } else {
    // それ以外のページの場合
    // `page`の左右ごとに、(最初|最後)のページ ～ 現在のページまでが連続的であるか否かを判定し結果を配列に格納する
    const isContinuous: boolean[] = ((page: number, pageCount: number, pageRange: number) => {
      const result: boolean[] = []

      // 最大2回ループ処理を実行する (1回目は左側、2回目は右側)
      Array.from({ length: 2 }, (_, index) => {
        if (index === 0) {
          // ループ1回目は左側の連続性を調べる
          result.push(page - pageRange - 1 <= 1)
        } else {
          // ループ2回目は右側の連続性を調べる
          result.push(pageCount - page <= pageRange + 1)
        }
      })
      return result
    })(page, pageCount, pageRange)

    // isContinuous(length: 2)でループ処理を実行し、左右のページ番号ラベルを配列(duplicatedValues)に格納する
    isContinuous.forEach((isContinuous, index) => {
      switch (index) {
        // ループ1回目は左側のページ番号ラベルを格納する
        case 0:
          const leftPageLabels = []
          switch (isContinuous) {
            // 連続的である
            case true:
              Array.from({ length: page }, (_, index) => {
                const currentPage = index + 1
                leftPageLabels.push({ label: currentPage, value: currentPage })
              })
              break
            // 非連続的である
            default:
              leftPageLabels.push({ label: firstPage, value: firstPage })
              leftPageLabels.push({ label: 'Prev', value: '...' })
              Array.from({  length: 3 }, (_, index) => {
                const currentPage = index + page - pageRange
                leftPageLabels.push({ label: currentPage, value: currentPage })
              })
              break
          }
          leftPageLabels.forEach(v => duplicatedValues.push(v))
          break

        // ループ2回目は右側のページ番号ラベルを格納する
        default:
          const rightPageLabels = []
          switch (isContinuous) {
            // 連続的である
            case true:
              Array.from({ length: pageCount - page + 1 }, (_, index) => {
                const currentPage = index + page
                rightPageLabels.push({ label: currentPage, value: currentPage })
              })
              break
            // 非連続的である
            default:
              Array.from({  length: 3 }, (_, index) => {
                const currentPage = index + page
                rightPageLabels.push({ label: currentPage, value: currentPage })
              })
              rightPageLabels.push({ label: 'Next', value: '...' })
              rightPageLabels.push({ label: pageCount, value: pageCount })
              break
          }
          rightPageLabels.forEach(v => duplicatedValues.push(v))
          break
        }
      })
  }

  const uniqueValues = duplicatedValues.filter((element, index, self) =>
    self.findIndex(e => e.label === element.label) === index
  )
  const pageLabels = uniqueValues.map(element => element.value.toString())
  return pageLabels
}
