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
  leftDotLabel: boolean
  rightDotLabel: boolean
  nextLabel: boolean
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

  const baseUrl = req.baseUrl

  const links = {
    first: `${baseUrl}/?page=1&?perPage=${perPage}`,
    prev: page === firstPage ? '' : `${baseUrl}/?page=${page - 1}&?perPage=${perPage}`,
    next: page === pageCount ? '' : `${baseUrl}/?page=${page + 1}&?perPage=${perPage}`,
    last: `${baseUrl}/?page=${pageCount}&?perPage=${perPage}`,
  }

  // ページネーション用リンクの配列定義(オブジェクト)を条件分岐に従って生成する
  const options = createLinkDefinition(page, pageCount, neighbor)
  const metaLinks = createLinkArray(page, perPage, pageCount, neighbor, options, links, baseUrl)

  return {
    items,
    count,
    pageCount,
    links,
    meta: { links: metaLinks },
  }
}

const createLinkDefinition = (page: number, pageCount: number, neighbor: number) => {
  const firstPage = 1
  const lastPage = pageCount

  if (page === firstPage) {
    if (lastPage > neighbor * 2 + 3) {
      console.log(`section1-1`)
      return {
        prevLabel: false,
        leftDotLabel: false,
        rightDotLabel: true,
        nextLabel: true,
      }
    } else {
      console.log(`section1-2`)
      return {
        prevLabel: false,
        leftDotLabel: false,
        rightDotLabel: false,
        nextLabel: true,
      }
    }
  } else if (page === lastPage) {
    if (lastPage > neighbor * 2) {
      console.log(`section2-1`)
      return {
        prevLabel: true,
        leftDotLabel: true,
        rightDotLabel: false,
        nextLabel: false,
      }
    } else {
      console.log(`section2-2`)
      return {
        prevLabel: true,
        leftDotLabel: false,
        rightDotLabel: false,
        nextLabel: false,
      }
    }
  } else if (lastPage <= neighbor * 2 + 3) {
    console.log(`section3`)
    return {
      prevLabel: true,
      leftDotLabel: false,
      rightDotLabel: false,
      nextLabel: true,
    }
  } else if (
    page - firstPage > neighbor &&
    lastPage - page - 1 > neighbor
    ) {
    console.log(`section4`)
    return {
      prevLabel: true,
      leftDotLabel: true,
      rightDotLabel: true,
      nextLabel: true,
    }
  } else if (
    page - firstPage > neighbor &&
    lastPage - page < neighbor + 1
    ) {
    console.log(`section5`)
    return {
      prevLabel: true,
      leftDotLabel: true,
      rightDotLabel: false,
      nextLabel: true,
    }
  } else {
    console.log(`section6`)
    return {
      prevLabel: true,
      leftDotLabel: false,
      rightDotLabel: true,
      nextLabel: true,
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
  const { prevLabel, leftDotLabel, rightDotLabel, nextLabel } = options
  const linkArray = []
  let id = 1

  // 戻るボタンは必要に応じて表示
  if (prevLabel) {
    linkArray.push({
      id,
      url: links.prev,
      label: 'Prev',
      active: false,
    })
    id++
  }

  // 最初のページは必ず表示
  linkArray.push({
    id,
    url: links.first,
    label: '1',
    active: page === 1,
  })
  id++

  // 左側のドットは必要に応じて表示
  if (leftDotLabel) {
    linkArray.push({
      id,
      url: '',
      label: '...',
      active: false,
    })
    id++
  }

  if (leftDotLabel && rightDotLabel) {
    console.log(`// 左右にドットが表示される場合`)
    // 左右にドットが表示される場合 (ループ=5)
    Array.from({ length: 1 + neighbor * 2 }, (_, index) => {
      const pageNumber = index + page - neighbor
      linkArray.push({
        id,
        url: `${baseUrl}?page=${pageNumber}&?perPage=${perPage}`,
        label: pageNumber,
        active: page === pageNumber,
      })
      id++
    })
  } else if (rightDotLabel) {
    console.log(`// 右側にドットが表示される場合`)
    // 右側にドットが表示される場合 (ループ=5)
    Array.from({ length: 1 + neighbor * 2 }, (_, index) => {
      const pageNumber = index + 2
      linkArray.push({
        id,
        url: `${baseUrl}?page=${pageNumber}&?perPage=${perPage}`,
        label: pageNumber,
        active: page === pageNumber,
      })
      id++
    })
  } else if (leftDotLabel) {
    console.log(`// 左側にドットが表示される場合`)
    // 左側にドットが表示される場合 (ループ=5)
    Array.from({ length: 1 + neighbor * 2 }, (_, index) => {
      const pageNumber = index + page - neighbor
      linkArray.push({
        id,
        url: `${baseUrl}?page=${pageNumber}&?perPage=${perPage}`,
        label: pageNumber,
        active: page === pageNumber,
      })
      id++
    })
  } else {
    console.log(`// ドットが表示されない場合`)
    // ドットが表示されない場合 (ループ=1~5)
    Array.from({ length: pageCount - 2 }, (_, index) => {
      const pageNumber = index + page + 1
      linkArray.push({
        id,
        url: `${baseUrl}?page=${pageNumber}&?perPage=${perPage}`,
        label: pageNumber,
        active: page === pageNumber,
      })
      id++
    })
  }

  // 右側のドットは必要に応じて表示
  if (rightDotLabel) {
    linkArray.push({
      id,
      url: '',
      label: '...',
      active: false,
    })
    id++
  }

  // 最後のページは必ず表示
  linkArray.push({
    id,
    url: links.last,
    label: pageCount,
    active: page === pageCount,
  })
  id++

  // 進むボタンは必要に応じて表示
  if (nextLabel) {
    linkArray.push({
      id,
      url: links.next,
      label: 'Next',
      active: false,
    })
  }

  return linkArray
}
