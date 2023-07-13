import { createPageLabels } from './paginate'
import { describe, it, expect } from '@jest/globals'

describe('createPageLabels: 分岐1', () => {
  it('1/1ページ', () => {
    const pageInfo = {
      page: 1,
      pageCount: 1,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": true,
        "id": 1,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
    ])
  })
})

describe('createPageLabels: 分岐2', () => {
  it('1/2ページ', () => {
    const pageInfo = {
      page: 1,
      pageCount: 2,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": true,
        "id": 1,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": false,
        "id": 2,
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": false,
        "id": 3,
        "label": "Next",
        "url": "/api/users/?page=2&perPage=5",
      },
    ])
  })

  it('1/3ページ', () => {
    const pageInfo = {
      page: 1,
      pageCount: 3,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": true,
        "id": 1,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": false,
        "id": 2,
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": false,
        "id": 3,
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": false,
        "id": 4,
        "label": "Next",
        "url": "/api/users/?page=2&perPage=5",
      },
    ])
  })

  it('1/4ページ', () => {
    const pageInfo = {
      page: 1,
      pageCount: 4,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": true,
        "id": 1,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": false,
        "id": 2,
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": false,
        "id": 3,
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": false,
        "id": 4,
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": false,
        "id": 5,
        "label": "Next",
        "url": "/api/users/?page=2&perPage=5",
      },
    ])
  })
})

describe('createPageLabels: 分岐3', () => {
  it('2/5ページ', () => {
    const pageInfo = {
      page: 2,
      pageCount: 5,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": false,
        "id": 1,
        "label": "Prev",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": false,
        "id": 2,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": true,
        "id": 3,
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": false,
        "id": 4,
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": false,
        "id": 5,
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": false,
        "id": 6,
        "label": "5",
        "url": "/api/users/?page=5&perPage=5",
      },
      {
        "active": false,
        "id": 7,
        "label": "Next",
        "url": "/api/users/?page=3&perPage=5",
      },
    ])
  })
})

describe('createPageLabels: 分岐4', () => {
  it('4/4ページ', () => {
    const pageInfo = {
      page: 4,
      pageCount: 4,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": false,
        "id": 1,
        "label": "Prev",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": false,
        "id": 2,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": false,
        "id": 3,
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": false,
        "id": 4,
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": true,
        "id": 5,
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
    ])
  })
})

describe('createPageLabels: 分岐5', () => {
  it('1/5ページ', () => {
    const pageInfo = {
      page: 1,
      pageCount: 5,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": true,
        "id": 1,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": false,
        "id": 2,
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": false,
        "id": 3,
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": false,
        "id": 4,
        "label": "...",
        "url": "",
      },
      {
        "active": false,
        "id": 5,
        "label": "5",
        "url": "/api/users/?page=5&perPage=5",
      },
      {
        "active": false,
        "id": 6,
        "label": "Next",
        "url": "/api/users/?page=2&perPage=5",
      },
    ])
  })
})

describe('createPageLabels: 分岐6', () => {
  it('2/6ページ', () => {
    const pageInfo = {
      page: 2,
      pageCount: 6,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": false,
        "id": 1,
        "label": "Prev",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": false,
        "id": 2,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": true,
        "id": 3,
        "label": "2",
        "url": "/api/users/?page=2&perPage=5",
      },
      {
        "active": false,
        "id": 4,
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": false,
        "id": 5,
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": false,
        "id": 6,
        "label": "...",
        "url": "",
      },
      {
        "active": false,
        "id": 7,
        "label": "6",
        "url": "/api/users/?page=6&perPage=5",
      },
      {
        "active": false,
        "id": 8,
        "label": "Next",
        "url": "/api/users/?page=3&perPage=5",
      },
    ])
  })
})

describe('createPageLabels: 分岐7', () => {
  it('5/6ページ', () => {
    const pageInfo = {
      page: 5,
      pageCount: 6,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": false,
        "id": 1,
        "label": "Prev",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": false,
        "id": 2,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": false,
        "id": 3,
        "label": "...",
        "url": "",
      },
      {
        "active": false,
        "id": 4,
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": false,
        "id": 5,
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": true,
        "id": 6,
        "label": "5",
        "url": "/api/users/?page=5&perPage=5",
      },
      {
        "active": false,
        "id": 7,
        "label": "6",
        "url": "/api/users/?page=6&perPage=5",
      },
      {
        "active": false,
        "id": 8,
        "label": "Next",
        "url": "/api/users/?page=6&perPage=5",
      },
    ])
  })
})

describe('createPageLabels: 分岐8', () => {
  it('5/5ページ', () => {
    const pageInfo = {
      page: 5,
      pageCount: 5,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": false,
        "id": 1,
        "label": "Prev",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": false,
        "id": 2,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": false,
        "id": 3,
        "label": "...",
        "url": "",
      },
      {
        "active": false,
        "id": 4,
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": false,
        "id": 5,
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": true,
        "id": 6,
        "label": "5",
        "url": "/api/users/?page=5&perPage=5",
      },
    ])
  })
})

describe('createPageLabels: 分岐9', () => {
  it('5/9ページ', () => {
    const pageInfo = {
      page: 5,
      pageCount: 9,
      pageRange: 2,
      perPage: 5,
      baseUrl: '/api/users',
    }

    const pageLabels = createPageLabels(pageInfo)
    expect(pageLabels).toEqual([
      {
        "active": false,
        "id": 1,
        "label": "Prev",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": false,
        "id": 2,
        "label": "1",
        "url": "/api/users/?page=1&perPage=5",
      },
      {
        "active": false,
        "id": 3,
        "label": "...",
        "url": "",
      },
      {
        "active": false,
        "id": 4,
        "label": "3",
        "url": "/api/users/?page=3&perPage=5",
      },
      {
        "active": false,
        "id": 5,
        "label": "4",
        "url": "/api/users/?page=4&perPage=5",
      },
      {
        "active": true,
        "id": 6,
        "label": "5",
        "url": "/api/users/?page=5&perPage=5",
      },
      {
        "active": false,
        "id": 7,
        "label": "6",
        "url": "/api/users/?page=6&perPage=5",
      },
      {
        "active": false,
        "id": 8,
        "label": "7",
        "url": "/api/users/?page=7&perPage=5",
      },
      {
        "active": false,
        "id": 9,
        "label": "...",
        "url": "",
      },
      {
        "active": false,
        "id": 10,
        "label": "9",
        "url": "/api/users/?page=9&perPage=5",
      },
      {
        "active": false,
        "id": 11,
        "label": "Next",
        "url": "/api/users/?page=6&perPage=5",
      },
    ])
  })
})
