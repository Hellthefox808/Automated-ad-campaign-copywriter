import { test, describe, before, after } from 'node:test'
import assert from 'node:assert'
import { startServer, stopServer } from '../src/server.js'

describe('HTTP API Endpoints Integration Tests', () => {
  let server = null
  let baseUrl = ''
  let authToken = null
  let testCampaignId = null

  before(async () => {
    server = await startServer(0)
    const port = server.address().port
    baseUrl = `http://127.0.0.1:${port}`
  })

  after(async () => {
    await stopServer()
  })

  test('GET /api/health/live returns 200 UP', async () => {
    const res = await fetch(`${baseUrl}/api/health/live`)
    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.strictEqual(body.status, 'UP')
  })

  test('GET /api/health/ready returns 200 with SQLite WAL verification', async () => {
    const res = await fetch(`${baseUrl}/api/health/ready`)
    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.strictEqual(body.status, 'READY')
    assert.strictEqual(body.sqlite_wal, true)
  })

  test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'copywriter_sarah',
        password: 'password123'
      })
    })

    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.ok(body.token)
    assert.strictEqual(body.user.username, 'copywriter_sarah')
    authToken = body.token
  })

  test('GET /api/auth/me returns authenticated user details', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.strictEqual(body.user.username, 'copywriter_sarah')
  })

  test('GET /api/campaigns lists seeded campaigns', async () => {
    const res = await fetch(`${baseUrl}/api/campaigns`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.ok(Array.isArray(body.data))
    assert.ok(body.data.length >= 5)
    testCampaignId = body.data[0].id
  })

  test('POST /api/campaigns/:id/generate creates ad variants', async () => {
    const res = await fetch(`${baseUrl}/api/campaigns/${testCampaignId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        platform: 'google_search_rsa'
      })
    })

    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.ok(body.data)
    assert.strictEqual(body.data.campaign_id, testCampaignId)
    assert.ok(Array.isArray(body.data.variants))
    assert.strictEqual(body.data.variants.length, 3) // 3 angles
  })

  test('POST /api/compliance/audit checks custom ad copy', async () => {
    const res = await fetch(`${baseUrl}/api/compliance/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        platform: 'google_search_rsa',
        variant: {
          headlines: [
            { text: 'Valid Headline One' },
            { text: 'Click Here For Miracle Deals!' }
          ],
          descriptions: [
            { text: 'A completely standard and compliant description.' }
          ]
        }
      })
    })

    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.ok(body.data.compliance)
    assert.strictEqual(body.data.compliance.is_compliant, false)
    assert.ok(body.data.compliance.violations.length > 0)
  })

  test('POST /api/compliance/autofix sanitizes copy violations', async () => {
    const res = await fetch(`${baseUrl}/api/compliance/autofix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        platform: 'google_search_rsa',
        variant: {
          headlines: [
            { text: 'Click Here for The BEST FinOps!' }
          ],
          descriptions: [
            { text: 'Too long description that goes way beyond normal boundaries and keeps repeating punctuation???!!' }
          ]
        }
      })
    })

    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.ok(body.data.sanitized)
    const cleanHeadline = body.data.sanitized.headlines[0].text
    assert.ok(!cleanHeadline.includes('!'), 'Should strip exclamation')
    assert.ok(!cleanHeadline.includes('Click Here'), 'Should replace clickbait')
  })

  test('GET /api/campaigns/:id/export supports Google Ads CSV export', async () => {
    const res = await fetch(`${baseUrl}/api/campaigns/${testCampaignId}/export?format=csv_google`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    assert.strictEqual(res.status, 200)
    const text = await res.text()
    assert.ok(text.includes('Headline 1'))
    assert.ok(text.includes('Description 1'))
  })

  test('GET /api/campaigns/:id/export supports Markdown brief export', async () => {
    const res = await fetch(`${baseUrl}/api/campaigns/${testCampaignId}/export?format=markdown`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    assert.strictEqual(res.status, 200)
    const text = await res.text()
    assert.ok(text.includes('# Campaign Creative Brief:'))
  })

  test('GET /api/metrics exposes Prometheus metrics', async () => {
    const res = await fetch(`${baseUrl}/api/metrics`)
    assert.strictEqual(res.status, 200)
    const text = await res.text()
    assert.ok(text.includes('adcraft_http_requests_total'))
  })
})
