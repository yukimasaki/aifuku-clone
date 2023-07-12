import { createPageLabels } from './paginate'
import { describe, it, expect } from '@jest/globals'

describe('createPageLabels', () => {
  const pageRange = 2
  const baseUrl = '/api/users'
  const perPage = 5

  it('5/5ページ', () => {
    const page = 5
    const pageCount = 5

    const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
    expect(pageLabels).toEqual([
      {
        "active": "false",
        "id": "1",
        "label": "Prev",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": "false",
        "id": "2",
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": "false",
        "id": "3",
        "label": "...",
        "url": "",
      },
      {
        "active": "false",
        "id": "4",
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": "false",
        "id": "5",
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": "true",
        "id": "6",
        "label": "5",
        "url": "/api/users/?page=5&perPage=5",
      },
    ])
  })

  it('2/5ページ', () => {
    const page = 2
    const pageCount = 5

    const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
    expect(pageLabels).toEqual([
      {
        "active": "false",
        "id": "1",
        "label": "Prev",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": "false",
        "id": "2",
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": "true",
        "id": "3",
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": "false",
        "id": "4",
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": "false",
        "id": "5",
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": "false",
        "id": "6",
        "label": "5",
        "url": "/api/users/?page=5&perPage=5",
      },
      {
        "active": "false",
        "id": "7",
        "label": "Next",
        "url": "/api/users/?page=3&perPage=5",
      },
    ])
  })

  it('2/6ページ', () => {
    const page = 2
    const pageCount = 6

    const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
    expect(pageLabels).toEqual([
      {
        "active": "false",
        "id": "1",
        "label": "Prev",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": "false",
        "id": "2",
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": "true",
        "id": "3",
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": "false",
        "id": "4",
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": "false",
        "id": "5",
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": "false",
        "id": "6",
        "label": "...",
        "url": "",
      },
      {
        "active": "false",
        "id": "7",
        "label": "6",
        "url": "/api/users/?page=6&perPage=5",
      },
      {
        "active": "false",
        "id": "8",
        "label": "Next",
        "url": "/api/users/?page=3&perPage=5",
      },
    ])
  })

  it('3/6ページ', () => {
    const page = 3
    const pageCount = 6

    const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
    expect(pageLabels).toEqual([
      {
        "active": "false",
        "id": "1",
        "label": "Prev",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": "false",
        "id": "2",
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": "false",
        "id": "3",
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": "true",
        "id": "4",
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": "false",
        "id": "5",
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": "false",
        "id": "6",
        "label": "5",
        "url": "/api/users/?page=5&perPage=5",
      },
      {
        "active": "false",
        "id": "7",
        "label": "6",
        "url": "/api/users/?page=6&perPage=5",
      },
      {
        "active": "false",
        "id": "8",
        "label": "Next",
        "url": "/api/users/?page=4&perPage=5",
      },
    ])
  })

  it('5/9ページ', () => {
    const page = 5
    const pageCount = 9

    const pageLabels = createPageLabels(page, pageCount, pageRange, baseUrl, perPage)
    expect(pageLabels).toEqual([
      {
        "active": "false",
        "id": "1",
        "label": "Prev",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": "false",
        "id": "2",
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": "false",
        "id": "3",
        "label": "...",
        "url": "",
      },
      {
        "active": "false",
        "id": "4",
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": "false",
        "id": "5",
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": "true",
        "id": "6",
        "label": "5",
        "url": "/api/users/?page=5&perPage=5",
      },
      {
        "active": "false",
        "id": "7",
        "label": "6",
        "url": "/api/users/?page=6&perPage=5",
      },
      {
        "active": "false",
        "id": "8",
        "label": "7",
        "url": "/api/users/?page=7&perPage=5",
      },
      {
        "active": "false",
        "id": "9",
        "label": "...",
        "url": "",
      },
      {
        "active": "false",
        "id": "10",
        "label": "9",
        "url": "/api/users/?page=9&perPage=5",
      },
      {
        "active": "false",
        "id": "11",
        "label": "Next",
        "url": "/api/users/?page=6&perPage=5",
      },
    ])
  })

})
