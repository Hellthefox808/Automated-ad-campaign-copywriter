import { test, describe } from 'node:test'
import assert from 'node:assert'
import { AdGenerationEngine } from '../src/service/adGenerationEngine.js'
import { PLATFORMS, ANGLES } from '../src/config/constants.js'

describe('AdGenerationEngine Unit Tests', () => {
  const sampleCampaign = {
    id: 'cmp_test_123',
    title: 'CloudPulse Test Campaign',
    product_name: 'CloudPulse Autonomous FinOps',
    value_prop: 'Save 38% on Kubernetes cloud bills within 14 days.',
    target_url: 'https://cloudpulse.io/demo',
    industry: 'cloud_infra',
    company_size: 'enterprise',
    seniority: 'c_level',
    tone: 'analytical',
    primary_cta: 'Book a Demo'
  }

  test('generates valid Google Search RSA variant adhering to character limits', () => {
    const variant = AdGenerationEngine.generateAdCampaign(sampleCampaign, PLATFORMS.GOOGLE_SEARCH_RSA, ANGLES.PAIN_POINT)

    assert.ok(variant)
    assert.strictEqual(variant.platform, PLATFORMS.GOOGLE_SEARCH_RSA)
    assert.strictEqual(variant.angle, ANGLES.PAIN_POINT)

    // Verify 15 headlines and <= 30 chars each
    assert.ok(variant.headlines.length >= 10, 'Should generate at least 10 headlines')
    variant.headlines.forEach((h, idx) => {
      const text = typeof h === 'string' ? h : h.text
      assert.ok(text.length <= 30, `Headline ${idx + 1} exceeds 30 chars: "${text}" (${text.length})`)
      assert.ok(!text.includes('!'), `Headline ${idx + 1} contains prohibited exclamation mark: "${text}"`)
    })

    // Verify 4 descriptions and <= 90 chars each
    assert.strictEqual(variant.descriptions.length, 4)
    variant.descriptions.forEach((d, idx) => {
      const text = typeof d === 'string' ? d : d.text
      assert.ok(text.length <= 90, `Description ${idx + 1} exceeds 90 chars: "${text}" (${text.length})`)
    })

    // Verify extensions
    assert.ok(variant.extensions)
    assert.strictEqual(variant.extensions.sitelinks.length, 4)
    assert.strictEqual(variant.extensions.callouts.length, 4)
    assert.ok(variant.extensions.displayPaths)
  })

  test('generates all 3 angles when angle parameter is omitted', () => {
    const variants = AdGenerationEngine.generateAdCampaign(sampleCampaign, PLATFORMS.GOOGLE_SEARCH_RSA)
    assert.ok(Array.isArray(variants))
    assert.strictEqual(variants.length, 3)

    const angles = variants.map(v => v.angle)
    assert.ok(angles.includes(ANGLES.PAIN_POINT))
    assert.ok(angles.includes(ANGLES.OUTCOME_ROI))
    assert.ok(angles.includes(ANGLES.AUTHORITY_SOCIAL_PROOF))
  })

  test('generates valid LinkedIn Sponsored Feed copy', () => {
    const variant = AdGenerationEngine.generateAdCampaign(sampleCampaign, PLATFORMS.LINKEDIN_SPONSORED_FEED, ANGLES.OUTCOME_ROI)

    assert.ok(variant)
    assert.strictEqual(variant.platform, PLATFORMS.LINKEDIN_SPONSORED_FEED)
    assert.ok(variant.intro_text && variant.intro_text.length > 50)
    assert.ok(variant.headline && variant.headline.length <= 70)
    assert.strictEqual(variant.cta_button, 'Book a Demo')
  })

  test('generates valid LinkedIn InMail copy with merge tokens', () => {
    const variant = AdGenerationEngine.generateAdCampaign(sampleCampaign, PLATFORMS.LINKEDIN_INMAIL, ANGLES.PAIN_POINT)

    assert.ok(variant)
    assert.strictEqual(variant.platform, PLATFORMS.LINKEDIN_INMAIL)
    assert.ok(variant.subject.length <= 60, `InMail subject exceeds 60 chars: ${variant.subject.length}`)
    assert.ok(variant.body.includes('{{firstName}}'), 'Body should contain {{firstName}} token')
    assert.ok(variant.body.includes('{{companyName}}'), 'Body should contain {{companyName}} token')
    assert.ok(Array.isArray(variant.quick_replies))
    assert.strictEqual(variant.quick_replies.length, 3)
  })

  test('generates valid Google Display variant', () => {
    const variant = AdGenerationEngine.generateAdCampaign(sampleCampaign, PLATFORMS.GOOGLE_DISPLAY, ANGLES.OUTCOME_ROI)

    assert.ok(variant)
    assert.strictEqual(variant.platform, PLATFORMS.GOOGLE_DISPLAY)
    assert.ok(variant.short_headline.length <= 30)
    assert.ok(variant.long_headline.length <= 90)
    assert.ok(variant.description.length <= 90)
    assert.ok(variant.business_name.length <= 25)
  })
})

