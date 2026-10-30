import { test, describe, before, after } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDatabase, initializeSchema } from '../src/data/database.js'
import { seedDatabase } from '../src/data/seedData.js'
import { Repository } from '../src/data/repository.js'
import { AuthService } from '../src/service/authService.js'
import { globalMetrics } from '../src/service/metricsService.js'
import { ROLES } from '../src/config/constants.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Repository & Database Integration Tests', () => {
  let db
  let repo
  const testDbPath = path.resolve(__dirname, 'test_ad_campaigns.sqlite')

  before(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath)
    }
    db = getDatabase(testDbPath)
    seedDatabase(db)
    repo = new Repository(db)
  })

  after(() => {
    try {
      db.close()
    } catch {}
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath)
      } catch {}
    }
  })

  test('seeds default users and campaigns into SQLite', () => {
    const campaigns = repo.listCampaigns()
    assert.ok(campaigns.length >= 5, `Expected >= 5 seed campaigns, got ${campaigns.length}`)

    const user = repo.getUserByUsername('copywriter_sarah')
    assert.ok(user)
    assert.strictEqual(user.role, ROLES.COPYWRITER)
    assert.ok(AuthService.verifyPassword('password123', user.password_hash))
  })

  test('performs complete campaign CRUD lifecycle', () => {
    // 1. Create
    const newCamp = repo.createCampaign({
      title: 'DevSecOps Automated Pipeline Gate',
      product_name: 'GateKeeper AI',
      value_prop: 'Block unverified dependencies in CI/CD before merge.',
      target_url: 'https://gatekeeper.dev/trial',
      industry: 'cybersecurity',
      company_size: 'scaleup',
      seniority: 'director',
      tone: 'technical_peer',
      primary_cta: 'Request Demo'
    })

    assert.ok(newCamp)
    assert.strictEqual(newCamp.title, 'DevSecOps Automated Pipeline Gate')

    // 2. Read
    const fetched = repo.getCampaignById(newCamp.id)
    assert.ok(fetched)
    assert.strictEqual(fetched.product_name, 'GateKeeper AI')

    // 3. Update
    const updated = repo.updateCampaign(newCamp.id, {
      title: 'GateKeeper AI Enterprise Security Gate',
      status: 'active'
    })
    assert.strictEqual(updated.title, 'GateKeeper AI Enterprise Security Gate')
    assert.strictEqual(updated.status, 'active')

    // 4. Delete
    const deleted = repo.deleteCampaign(newCamp.id)
    assert.strictEqual(deleted, true)
    assert.strictEqual(repo.getCampaignById(newCamp.id), null)
  })

  test('creates and retrieves ad variants linked to a campaign', () => {
    const campaigns = repo.listCampaigns()
    const camp = campaigns[0]

    const variant = repo.createVariant({
      campaign_id: camp.id,
      platform: 'google_search_rsa',
      angle: 'pain_point',
      headlines: [{ text: 'Cut AWS Bills Fast' }, { text: 'Automated K8s FinOps' }],
      descriptions: [{ text: 'Stop idle cluster waste in 14 days without performance overhead.' }],
      ad_strength_score: 88,
      predicted_ctr: 4.6,
      readability_grade: 8.1
    })

    assert.ok(variant)
    assert.strictEqual(variant.campaign_id, camp.id)
    assert.strictEqual(variant.headlines.length, 2)

    const list = repo.listVariantsByCampaign(camp.id)
    assert.ok(list.some(v => v.id === variant.id))
  })

  test('records compliance audits and retrieves logs', () => {
    const log = repo.recordComplianceAudit({
      campaign_id: 'cmp_test',
      platform: 'google_search_rsa',
      is_compliant: false,
      violation_count: 1,
      violations: [{ field: 'headline_1', issue: 'Too long', rule: 'LENGTH', severity: 'error' }]
    })

    assert.ok(log.id)
    const recent = repo.getRecentComplianceLogs(10)
    assert.ok(recent.length > 0)
    assert.strictEqual(recent[0].platform, 'google_search_rsa')
  })

  test('verifies JWT token generation and authentication', () => {
    const user = {
      id: 'usr_test_123',
      username: 'test_admin',
      email: 'admin@test.com',
      role: ROLES.ADMIN
    }

    const token = AuthService.generateToken(user)
    assert.ok(token && typeof token === 'string')

    const decoded = AuthService.verifyToken(token)
    assert.ok(decoded)
    assert.strictEqual(decoded.username, 'test_admin')
    assert.strictEqual(decoded.role, ROLES.ADMIN)
  })

  test('verifies Prometheus metrics exposition format', () => {
    globalMetrics.recordRequest('GET', '/api/campaigns', 200, 15)
    globalMetrics.recordGeneration('google_search_rsa', 'pain_point')

    const prom = globalMetrics.getPrometheusMetrics()
    assert.ok(prom.includes('adcraft_uptime_seconds'))
    assert.ok(prom.includes('adcraft_http_requests_total'))
    assert.ok(prom.includes('adcraft_ad_generations_total'))
  })
})

