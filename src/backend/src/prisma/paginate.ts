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

export type PaginateOutputs<Items> = {
  items: Items
  count: number
  pageCount: number
  links: {
    id: number,
    label: string,
    url: string,
    active: boolean,
  }[]
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

type CreationConditions = {
  length: number
  loopStart: number
}

/**
 * ページネーションされたデータを取得する
 */
export const paginate = async <Items>({
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

  const baseUrl = '/profiles';
  const pageCount = Math.ceil(count / perPage);
  const pageRange = 2;

  const pageInfo: PageInfo = {
    page, pageCount, pageRange, perPage, baseUrl
  }

  const pageLabels: PageLabel[] = createPageLabels(pageInfo);

  return {
    items,
    count,
    pageCount,
    links: pageLabels,
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
        right: pageCount - page <= pageRange + 1,
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
      const { page, baseUrl } = pageInfo
      return {
        description: direction,
        value: direction,
        url: `${baseUrl}/page/${direction === 'Prev' ? page - 1 : page + 1 }`,
        active: false,
      }
    }

    // ページ番号ラベルのオブジェクトを返すだけの関数
    const createPageNumberLabel = (
      conditions: CreationConditions,
      pageInfo: PageInfo,
    ): DuplicatedLabel[] => {
      const { length, loopStart } = conditions;
      const { page, baseUrl } = pageInfo;
      return Array.from({ length }, (_, index) => {
        const currentPage = index + loopStart;
        return {
          description: currentPage.toString(),
          value: currentPage.toString(),
          url: `${baseUrl}/page/${currentPage}`,
          active: page === currentPage,
        }
      })
    }

    // メイン処理
    const { page, pageCount, pageRange } = pageInfo;
    const { left, right } = checkPageContinuty(pageInfo);
    const pagePosition = checkPagePosition(pageInfo);

    // 以下、7つの分岐があり、ページの連続性・ページ位置に応じて配列を生成する
    const duplicatedLabels: DuplicatedLabel[] = [];

    if (pageCount === 1) {
      duplicatedLabels.push(...createPageNumberLabel({ length: 1, loopStart: 1 }, pageInfo));
    } else if (left && right && pagePosition === 'start') {
      duplicatedLabels.push(...createPageNumberLabel({ length: pageCount, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(createNavigateBtn('Next', pageInfo));
    } else if (left && right && pagePosition === 'middle') {
      duplicatedLabels.push(createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...createPageNumberLabel({ length: pageCount, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(createNavigateBtn('Next', pageInfo));
    } else if (left && right && pagePosition === 'end') {
      duplicatedLabels.push(createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...createPageNumberLabel({ length: pageCount, loopStart: 1 }, pageInfo));
    } else if (left && !right && pagePosition === 'start') {
      duplicatedLabels.push(...createPageNumberLabel({ length: page + pageRange, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(createDotLabel('rightDot'));
      duplicatedLabels.push(...createPageNumberLabel({ length: 1, loopStart: pageCount }, pageInfo));
      duplicatedLabels.push(createNavigateBtn('Next', pageInfo));
    } else if (left && !right && pagePosition === 'middle') {
      duplicatedLabels.push(createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...createPageNumberLabel({ length: page + pageRange, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(createDotLabel('rightDot'));
      duplicatedLabels.push(...createPageNumberLabel({ length: 1, loopStart: pageCount }, pageInfo));
      duplicatedLabels.push(createNavigateBtn('Next', pageInfo));
    } else if (!left && right && pagePosition === 'middle') {
      duplicatedLabels.push(createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...createPageNumberLabel({ length: 1, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(createDotLabel('leftDot'));
      duplicatedLabels.push(...createPageNumberLabel({ length: 3, loopStart: page- pageRange }, pageInfo));
      duplicatedLabels.push(...createPageNumberLabel({ length: 1, loopStart: pageCount }, pageInfo));
      duplicatedLabels.push(createNavigateBtn('Next', pageInfo));
    } else if (!left && right && pagePosition === 'end') {
      duplicatedLabels.push(createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...createPageNumberLabel({ length: 1, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(createDotLabel('leftDot'));
      duplicatedLabels.push(...createPageNumberLabel({ length: 3, loopStart: page - pageRange }, pageInfo));
    } else if (!left && !right && pagePosition === 'middle') {
      duplicatedLabels.push(createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...createPageNumberLabel({ length: 1, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(createDotLabel('leftDot'));
      duplicatedLabels.push(...createPageNumberLabel({ length: 5, loopStart: page - pageRange }, pageInfo));
      duplicatedLabels.push(createDotLabel('rightDot'));
      duplicatedLabels.push(...createPageNumberLabel({ length: 1, loopStart: pageCount }, pageInfo));
      duplicatedLabels.push(createNavigateBtn('Next', pageInfo));
    } else {
      console.log(`想定外の分岐`);
    }

    // 重複した要素を排除する
    const uniqueValues = duplicatedLabels.filter((element, index, self) =>
      self.findIndex(e => e.description === element.description) === index
    );
    const pageLabels: PageLabel[] = uniqueValues.map(element => {
      return {
        id: (uniqueValues.indexOf(element) + 1),
        label: element.value.toString(),
        url: element.url?.toString(),
        active: element.active,
      }
    });
    return pageLabels;
}
