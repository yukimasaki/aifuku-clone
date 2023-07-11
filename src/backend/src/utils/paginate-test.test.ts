import { createMetaLink } from './paginate-test'
import { describe, it, expect } from '@jest/globals'

describe('createMetaLink', () => {
  it('1/1ページ', () => {
    const page = 1
    const pageCount = 1
    const pageRange = 2

    const pageLabels = createMetaLink(page, pageCount, pageRange)
    expect(pageLabels).toEqual(['1'])
  })

  it('1/2ページ', () => {
    const page = 1
    const pageCount = 2
    const pageRange = 2

    const pageLabels = createMetaLink(page, pageCount, pageRange)
    expect(pageLabels).toEqual(['1', '2'])
  })

  it('1/3ページ', () => {
    const page = 1
    const pageCount = 3
    const pageRange = 2

    const pageLabels = createMetaLink(page, pageCount, pageRange)
    expect(pageLabels).toEqual(['1', '2', '3'])
  })

  it('1/4ページ', () => {
    const page = 1
    const pageCount = 4
    const pageRange = 2

    const pageLabels = createMetaLink(page, pageCount, pageRange)
    expect(pageLabels).toEqual(['1', '2', '3', '4'])
  })

  it('1/5ページ', () => {
    const page = 1
    const pageCount = 5
    const pageRange = 2

    const pageLabels = createMetaLink(page, pageCount, pageRange)
    expect(pageLabels).toEqual(['1', '2', '3', '...', '5'])
  })

  it('1/1ページ', () => {
    const page = 1
    const pageCount = 1
    const pageRange = 2

    const pageLabels = createMetaLink(page, pageCount, pageRange)
    expect(pageLabels).toEqual(['1'])
  })

  it('2/2ページ', () => {
    const page = 2
    const pageCount = 2
    const pageRange = 2

    const pageLabels = createMetaLink(page, pageCount, pageRange)
    expect(pageLabels).toEqual(['1', '2'])
  })

  it('3/3ページ', () => {
    const page = 3
    const pageCount = 3
    const pageRange = 2

    const pageLabels = createMetaLink(page, pageCount, pageRange)
    expect(pageLabels).toEqual(['1', '2', '3'])
  })

  it('4/4ページ', () => {
    const page = 4
    const pageCount = 4
    const pageRange = 2

    const pageLabels = createMetaLink(page, pageCount, pageRange)
    expect(pageLabels).toEqual(['1', '2', '3', '4'])
  })

  it('5/5ページ', () => {
      const page = 5
      const pageCount = 5
      const pageRange = 2

      const pageLabels = createMetaLink(page, pageCount, pageRange)
      expect(pageLabels).toEqual(['1', '...', '3', '4', '5'])
    })

    it('2/3ページ', () => {
      const page = 2
      const pageCount = 3
      const pageRange = 2

      const pageLabels = createMetaLink(page, pageCount, pageRange)
      expect(pageLabels).toEqual(['1', '2', '3'])
    })

    it('2/4ページ', () => {
      const page = 2
      const pageCount = 4
      const pageRange = 2

      const pageLabels = createMetaLink(page, pageCount, pageRange)
      expect(pageLabels).toEqual(['1', '2', '3', '4'])
    })

    it('2/5ページ', () => {
      const page = 2
      const pageCount = 5
      const pageRange = 2

      const pageLabels = createMetaLink(page, pageCount, pageRange)
      expect(pageLabels).toEqual(['1', '2', '3', '4', '5'])
    })

    it('2/6ページ', () => {
      const page = 2
      const pageCount = 6
      const pageRange = 2

      const pageLabels = createMetaLink(page, pageCount, pageRange)
      expect(pageLabels).toEqual(['1', '2', '3', '4', '...', '6'])
    })

    it('3/6ページ', () => {
      const page = 3
      const pageCount = 6
      const pageRange = 2

      const pageLabels = createMetaLink(page, pageCount, pageRange)
      expect(pageLabels).toEqual(['1', '2', '3', '4', '5', '6'])
    })

    it('5/9ページ', () => {
      const page = 5
      const pageCount = 9
      const pageRange = 2

      const pageLabels = createMetaLink(page, pageCount, pageRange)
      expect(pageLabels).toEqual(['1', '...', '3', '4', '5', '6', '7', '...', '9'])
    })

})
