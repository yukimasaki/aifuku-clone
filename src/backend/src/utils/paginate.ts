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

type PageContinuty = {
  left: boolean
  right: boolean
}

type PagePosition = 'start' | 'end' | 'middle'

type PageInfo = {
  page: number
  pageCount: number
  pageRange: number
  perPage: number
  baseUrl: string
}

type PageLabel = {
  id: number
  label: string
  url: string
  active: boolean
}

type DuplicatedLabel = {
  description: string
  value: string
  url: string
  active: boolean
}

/**
 * ページネーションされたデータを取得する
 */
export const paginate = async <Items>(req: Request, {
  page,
  perPage,
  countFn,
  queryFn,
}: PaginateInputs<Items>): Promise<PaginateOutputs<Items>> => {
  const [items, count] = await Promise.all([
    queryFn({
      skip: perPage * (page - 1),
      take: perPage,
    }),
    countFn(),
  ])

  const baseUrl = req.baseUrl
  const pageCount = Math.ceil(count / perPage)
  const pageRange = 2
  const firstPage = 1

  const links = {
    first: `${baseUrl}/?page=1&perPage=${perPage}`,
    prev: page === firstPage ? '' : `${baseUrl}/?page=${page - 1}&perPage=${perPage}`,
    next: page === pageCount ? '' : `${baseUrl}/?page=${page + 1}&perPage=${perPage}`,
    last: `${baseUrl}/?page=${pageCount}&perPage=${perPage}`,
  }

  return {
    items,
    count,
    pageCount,
    links,
    // meta: { links: metaLinks },
  }
}


// ページネーション用のページ番号ラベルの配列を返す
export const createPageLabels = (
  pageInfo: PageInfo,
  ): PageLabel[] => {
    // 最初または最後のページ～現在のページが連続的であるか否かを判定
    const checkPageContinuty = (
      pageInfo: PageInfo
    ): PageContinuty => {
      const { page, pageCount, pageRange } = pageInfo
      return {
        left: page - pageRange - 1 <= 1,
        right: pageCount - page <= pageRange + 1
      }
    }

    // 現在のページの位置(最初、最後、途中)を判定
    const checkPagePosition = (
      pageInfo: PageInfo
    ) : PagePosition => {
      const { page, pageCount } = pageInfo
      if (page === 1) {
        return 'start'
      } else if (page === pageCount) {
        return 'end'
      } else {
        return 'middle'
      }
    }

    // ドットラベルのオブジェクトを返すだけの関数
    const createDotLabel = (
      description: 'leftDot' | 'rightDot'
    ): DuplicatedLabel => {
      return {
        description,
        value: '...',
        url: '',
        active: false,
      }
    }

    // 戻る・進むボタンラベルのオブジェクトを返すだけの関数
    const createNavigateBtn = (
      direction: 'Prev' | 'Next',
      pageInfo: PageInfo,
    ): DuplicatedLabel => {
      return {
        description: direction,
        value: direction,
        url: `${baseUrl}/?page=${direction === 'Prev' ? page - 1 : page + 1 }&perPage=${perPage}`,
        active: false,
      }
    }

    // メイン処理
    const { page, pageCount, pageRange, perPage, baseUrl } = pageInfo

    const { left, right } = checkPageContinuty(pageInfo)
    const pagePosition = checkPagePosition(pageInfo)

    // 以下、7つの分岐がある
    if (left && right && pagePosition === 'start') {
      // const continuousAllAndPageStart = (() => {})()
    } else if (left && right && pagePosition === 'middle') {
      // const continuousAllAndPageMiddle = (() => {})()
    } else if (left && right && pagePosition === 'end') {
      // const continuousAllAndPageEnd = (() => {})()
    } else if (left && !right && pagePosition === 'start') {
      // const continuousLeftAndPageStart = (() => {})()
    } else if (left && !right && pagePosition === 'middle') {
      // const continuousLeftAndPageMiddle = (() => {})()
    } else if (!left && right && pagePosition === 'middle') {
      // const continuousRightAndPageMiddle = (() => {})()
    } else if (!left && right && pagePosition === 'end') {
      // const continuousRightAndPageEnd = (() => {})()
    } else if (!left && !right && pagePosition === 'middle') {
      // const noContinuousAndPageMiddle = (() => {})()
    } else {
      console.log(`想定外の分岐`)
    }
}
