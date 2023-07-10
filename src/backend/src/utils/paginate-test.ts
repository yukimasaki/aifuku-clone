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
  meta: any
}

type LinkDefinition = {
  prevLabel: boolean
  dotLeft: boolean
  dotRight: boolean
  NextLabel: boolean
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

  const pageCount = Math.ceil(count / perPage)
  const firstPage = 1
  const neighbor = 2

  console.log(req)
  const baseUrl = req.baseUrl

  const links = {
    first: `${baseUrl}/?page=1&?perPage=${perPage}`,
    prev: page === firstPage ? '' : `${baseUrl}/?page=${page - 1}&?perPage=${perPage}`,
    next: page === pageCount ? '' : `${baseUrl}/?page=${page + 1}&?perPage=${perPage}`,
    last: `${baseUrl}/?page=${pageCount}&?perPage=${perPage}`,
  }

  // ページネーション用リンクの配列定義(オブジェクト)を条件分岐に従って生成する
  const options = createLinkDefinition(page, pageCount, neighbor, firstPage)
  const metaLinks = createLinkArray(page, perPage, pageCount, neighbor, options, links, baseUrl)

  return {
    items,
    count,
    pageCount,
    links,
    meta: { links: metaLinks },
  }
}

const createLinkDefinition = (page: number, pageCount: number, neighbor: number, firstPage: number) => {
  if (page === firstPage) {
    return {
      prevLabel: false,
      dotLeft: false,
      dotRight: true,
      NextLabel: true,
    }
  } else if (page === pageCount) {
    return {
      prevLabel: true,
      dotLeft: false,
      dotRight: false,
      NextLabel: false,
    }
  } else if ((page - neighbor) <= neighbor) {
    return {
      prevLabel: true,
      dotLeft: false,
      dotRight: true,
      NextLabel: true,
    }
  } else if ((pageCount - page - 1) <= neighbor) {
    return {
      prevLabel: true,
      dotLeft: true,
      dotRight: false,
      NextLabel: true,
    }
  } else {
    return {
      prevLabel: true,
      dotLeft: true,
      dotRight: true,
      NextLabel: true,
    }
  }
}

const createLinkArray = (
  page: number,
  perPage: number,
  pageCount: number,
  neighbor: number,
  options: LinkDefinition,
  links: any,
  baseUrl: string
) => {
  const { prevLabel, dotLeft, dotRight, NextLabel } = options
  const linkArray = []

  // 戻るボタンは必要に応じて表示
  if (prevLabel) {
    linkArray.push({
      url: links.prev,
      label: 'Prev',
      active: false,
    })
  }

  // 最初のページは必ず表示
  linkArray.push({
    url: links.first,
    label: '1',
    active: page === 1,
  })

  // 左側のドットは必要に応じて表示
  if (dotLeft) {
    linkArray.push({
      url: '',
      label: '...',
      active: false,
    })
  }

  // 途中のページ
  Array.from({ length: 1 + neighbor * 2 }, (_, index) => {
    const pageNumber = index + (page - neighbor)
    linkArray.push({
      url: `${baseUrl}?page=${pageNumber}&?perPage=${perPage}`,
      label: pageNumber,
      active: page === pageNumber,
    })
  })

  // 右側のドットは必要に応じて表示
  if (dotRight) {
    linkArray.push({
      url: '',
      label: '...',
      active: false,
    })
  }

  // 最後のページは必ず表示
  linkArray.push({
    url: links.last,
    label: pageCount,
    active: page === pageCount,
  })

  // 進むボタンは必要に応じて表示
  if (NextLabel) {
    linkArray.push({
      url: links.next,
      label: 'Next',
      active: false,
    })
  }

  return linkArray
}
