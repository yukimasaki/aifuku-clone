/**
 * Prismaでページネーションを実装する（Client extensionsも使ってみる）
 * https://zenn.dev/gibjapan/articles/815c0a6783d5ff
 */
import { Injectable } from '@nestjs/common';
import {
  PaginateInputs,
  PaginateOutputs,
  PageContinuty,
  PagePosition,
  PageInfo,
  PageLabel,
  DuplicatedLabel,
  CreationConditions,
} from './paginator.entity';

@Injectable()
export class PaginatorService {
  // ページネーションされたデータを取得する
  async paginator<Items> ({
    paginateOptions,
    countFn,
    queryFn,
  }: PaginateInputs<Items>): Promise<PaginateOutputs<Items>> {
    const { page, perPage, baseUrl } = paginateOptions;

    const [items, count] = await Promise.all([
      queryFn({
        skip: perPage * (page - 1),
        take: perPage,
      }),
      countFn(),
    ])

    const pageCount = Math.ceil(count / perPage);
    const pageRange = 2;

    const pageInfo: PageInfo = {
      page, pageCount, pageRange, perPage, baseUrl
    }

    const pageLabels: PageLabel[] = this.createPageLabels(pageInfo);

    return {
      items,
      count,
      pageCount,
      links: pageLabels,
    }
  }

  // ページネーション用のページ番号ラベルの配列を返す
  private createPageLabels (
    pageInfo: PageInfo,
  ): PageLabel[] {
    // メイン処理
    const { page, pageCount, pageRange } = pageInfo;
    const { left, right } = this.checkPageContinuty(pageInfo);
    const pagePosition = this.checkPagePosition(pageInfo);

    // 以下、7つの分岐があり、ページの連続性・ページ位置に応じて配列を生成する
    const duplicatedLabels: DuplicatedLabel[] = [];

    if (pageCount <= 1) {
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 1, loopStart: 1 }, pageInfo));
    } else if (left && right && pagePosition === 'start') {
      duplicatedLabels.push(...this.createPageNumberLabel({ length: pageCount, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(this.createNavigateBtn('Next', pageInfo));
    } else if (left && right && pagePosition === 'middle') {
      duplicatedLabels.push(this.createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: pageCount, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(this.createNavigateBtn('Next', pageInfo));
    } else if (left && right && pagePosition === 'end') {
      duplicatedLabels.push(this.createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: pageCount, loopStart: 1 }, pageInfo));
    } else if (left && !right && pagePosition === 'start') {
      duplicatedLabels.push(...this.createPageNumberLabel({ length: page + pageRange, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(this.createDotLabel('rightDot'));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 1, loopStart: pageCount }, pageInfo));
      duplicatedLabels.push(this.createNavigateBtn('Next', pageInfo));
    } else if (left && !right && pagePosition === 'middle') {
      duplicatedLabels.push(this.createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: page + pageRange, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(this.createDotLabel('rightDot'));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 1, loopStart: pageCount }, pageInfo));
      duplicatedLabels.push(this.createNavigateBtn('Next', pageInfo));
    } else if (!left && right && pagePosition === 'middle') {
      duplicatedLabels.push(this.createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 1, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(this.createDotLabel('leftDot'));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 3, loopStart: page- pageRange }, pageInfo));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 1, loopStart: pageCount }, pageInfo));
      duplicatedLabels.push(this.createNavigateBtn('Next', pageInfo));
    } else if (!left && right && pagePosition === 'end') {
      duplicatedLabels.push(this.createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 1, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(this.createDotLabel('leftDot'));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 3, loopStart: page - pageRange }, pageInfo));
    } else if (!left && !right && pagePosition === 'middle') {
      duplicatedLabels.push(this.createNavigateBtn('Prev', pageInfo));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 1, loopStart: 1 }, pageInfo));
      duplicatedLabels.push(this.createDotLabel('leftDot'));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 5, loopStart: page - pageRange }, pageInfo));
      duplicatedLabels.push(this.createDotLabel('rightDot'));
      duplicatedLabels.push(...this.createPageNumberLabel({ length: 1, loopStart: pageCount }, pageInfo));
      duplicatedLabels.push(this.createNavigateBtn('Next', pageInfo));
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

  // 最初または最後のページ～現在のページが連続的であるか否かを判定
  private checkPageContinuty (
    pageInfo: PageInfo
  ): PageContinuty {
    const { page, pageCount, pageRange } = pageInfo
    return {
      left: page - pageRange - 1 <= 1,
      right: pageCount - page <= pageRange + 1,
    }
  }

  // 現在のページの位置(最初、最後、途中)を判定
  private checkPagePosition (
    pageInfo: PageInfo
  ) : PagePosition {
    const { page, pageCount } = pageInfo
    if (page === 1) {
      return 'start';
    } else if (page === pageCount) {
      return 'end';
    } else {
      return 'middle';
    }
  }

  // ドットラベルのオブジェクトを返すだけの関数
  private createDotLabel (
    description: 'leftDot' | 'rightDot'
  ): DuplicatedLabel {
    return {
      description,
      value: '...',
      url: '',
      active: false,
    }
  }

  // 戻る・進むボタンラベルのオブジェクトを返すだけの関数
  private createNavigateBtn (
    direction: 'Prev' | 'Next',
    pageInfo: PageInfo,
  ): DuplicatedLabel {
    const { page, baseUrl } = pageInfo;
    return {
      description: direction,
      value: direction,
      url: `${baseUrl}/page/${direction === 'Prev' ? page - 1 : page + 1 }`,
      active: false,
    }
  }

  // ページ番号ラベルのオブジェクトを返すだけの関数
  private createPageNumberLabel (
    conditions: CreationConditions,
    pageInfo: PageInfo,
  ): DuplicatedLabel[] {
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
    });
  }
}
