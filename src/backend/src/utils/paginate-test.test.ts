import { createMetaLink } from './paginate-test'
import { describe, it, expect } from '@jest/globals'

describe('createMetaLink', () => {
  it('1/1ページ', () => {
    const page = 1
    const pageCount = 1
    const pageLabels = createMetaLink(page, pageCount)
    expect(pageLabels).toEqual([1])
  })

  it('1/2ページ', () => {
    const page = 1
    const pageCount = 2
    const pageLabels = createMetaLink(page, pageCount)
    expect(pageLabels).toEqual([1, 2])
  })

  it('1/3ページ', () => {
    const page = 1
    const pageCount = 3
    const pageLabels = createMetaLink(page, pageCount)
    expect(pageLabels).toEqual([1, 2, 3])
  })

  it('1/4ページ', () => {
    const page = 1
    const pageCount = 4
    const pageLabels = createMetaLink(page, pageCount)
    expect(pageLabels).toEqual([1, 2, 3, 4])
  })

  it('1/5ページ', () => {
    const page = 1
    const pageCount = 5
    const pageLabels = createMetaLink(page, pageCount)
    expect(pageLabels).toEqual([1, 2, 3, '...', 5])
  })
})
