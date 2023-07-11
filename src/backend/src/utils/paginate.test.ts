import { createPageLabels } from './paginate'
import { describe, it, expect } from '@jest/globals'

describe('createPageLabels', () => {
  const pageRange = 2
  const baseUrl = '/api/users'
  const perPage = 5

  // it('1/1ページ', () => {
  //   const page = 1
  //   const pageCount = 1

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1'])
  // })

  // it('1/2ページ', () => {
  //   const page = 1
  //   const pageCount = 2

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2'])
  // })

  // it('1/3ページ', () => {
  //   const page = 1
  //   const pageCount = 3

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2', '3'])
  // })

  // it('1/4ページ', () => {
  //   const page = 1
  //   const pageCount = 4

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2', '3', '4'])
  // })

  it('1/5ページ', () => {
    const page = 1
    const pageCount = 5

    const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
    expect(pageLabels).toEqual([
      {
        "active": "true",
        "id": "1",
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": "false",
        "id": "2",
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": "false",
        "id": "3",
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": "false",
        "id": "4",
        "label": "...",
        "url": "",
      },
      {
        "active": "false",
        "id": "5",
        "label": "5",
        "url": "/api/users/?page=5&perPage=5",
      },
      {
        "active": "false",
        "id": "6",
        "label": "Next",
        "url": "/api/users/?page=2&perPage=5",
      },
    ])
  })

  // it('2/2ページ', () => {
  //   const page = 2
  //   const pageCount = 2

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2'])
  // })

  // it('3/3ページ', () => {
  //   const page = 3
  //   const pageCount = 3

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2', '3'])
  // })

  // it('4/4ページ', () => {
  //   const page = 4
  //   const pageCount = 4

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2', '3', '4'])
  // })

  // it('5/5ページ', () => {
  //   const page = 5
  //   const pageCount = 5

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '...', '3', '4', '5'])
  // })

  // it('2/3ページ', () => {
  //   const page = 2
  //   const pageCount = 3

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2', '3'])
  // })

  // it('2/4ページ', () => {
  //   const page = 2
  //   const pageCount = 4

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2', '3', '4'])
  // })

  // it('2/5ページ', () => {
  //   const page = 2
  //   const pageCount = 5

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2', '3', '4', '5'])
  // })

  // it('2/6ページ', () => {
  //   const page = 2
  //   const pageCount = 6

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2', '3', '4', '...', '6'])
  // })

  // it('3/6ページ', () => {
  //   const page = 3
  //   const pageCount = 6

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '2', '3', '4', '5', '6'])
  // })

  // it('5/9ページ', () => {
  //   const page = 5
  //   const pageCount = 9

  //   const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
  //   expect(pageLabels).toEqual(['1', '...', '3', '4', '5', '6', '7', '...', '9'])
  // })

})
