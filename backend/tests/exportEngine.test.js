import { test, describe } from 'node:test'
import assert from 'node:assert'
import { ExportEngine } from '../src/service/exportEngine.js'

describe('ExportEngine Unit Tests', () => {
  const sampleCampaign = {
    id: 'cmp_export_test',
    title: 'CloudPulse Enterprise FinOps',
    product_name: 'CloudPulse',
    target_url: 'https://cloudpulse.io/demo',
    primary_cta: 'Request Demo',
    industry: 'cloud_infra',
    company_size: 'enterprise',
    seniority: 'c_level',
    value_prop: 'Save 38% on Kubernetes cloud spend.'
  }

  const sampleVariants = [
    {
      platform: 'google_search_rsa',
      angle: 'pain_point',
      ad_strength_score: 92,
      predicted_ctr: 4.8,
      readability_grade: 8.2,
      headlines: [
        { text: 'Stop Cloud Waste Now' },
        { text: 'Slash Cloud Bills by 38%' },
        { text: 'CloudPulse FinOps' }
      ],
      descriptions: [
        { text: 'Reclaim idle cluster capacity and right-size AWS and GCP pods automatically.' },
        { text: 'Join 500+ engineering teams slashing cloud waste without downtime.' }
      ],
      extensions: {
        displayPaths: { path1: 'Enterprise', path2: 'FinOps' }
      }
    }
  ]

  test('exports Google Ads Editor RFC 4180 CSV correctly', () => {
    const csv = ExportEngine.exportGoogleAdsEditorCSV(sampleCampaign, sampleVariants)

    assert.ok(csv.startsWith('"Campaign","Ad Group","Headline 1"'))
    assert.ok(csv.includes('"CloudPulse Enterprise FinOps"'))
    assert.ok(csv.includes('"Stop Cloud Waste Now"'))
    assert.ok(csv.includes('"Enabled"'))
  })

  test('exports LinkedIn Campaign CSV correctly', () => {
    const linkedinVariants = [
      {
        platform: 'linkedin_sponsored_feed',
        angle: 'outcome_roi',
        headline: 'Achieve 3.4x FinOps ROI: Automated K8s Optimization',
        intro_text: 'Are your cloud bills growing faster than revenue? See how leading teams cut spend 38%.',
        cta_button: 'Request Demo'
      }
    ]

    const csv = ExportEngine.exportLinkedInCampaignCSV(sampleCampaign, linkedinVariants)

    assert.ok(csv.startsWith('"Campaign Name","Creative Name"'))
    assert.ok(csv.includes('"Achieve 3.4x FinOps ROI: Automated K8s Optimization"'))
    assert.ok(csv.includes('"Request Demo"'))
  })

  test('exports Markdown campaign brief', () => {
    const md = ExportEngine.exportCampaignBriefMarkdown(sampleCampaign, sampleVariants)

    assert.ok(md.includes('# Campaign Creative Brief: CloudPulse Enterprise FinOps'))
    assert.ok(md.includes('### Variant 1: PAIN_POINT (google_search_rsa)'))
    assert.ok(md.includes('92/100'))
    assert.ok(md.includes('4.8%'))
  })

  test('exports structured JSON manifest', () => {
    const jsonStr = ExportEngine.exportCampaignJSON(sampleCampaign, sampleVariants)
    const parsed = JSON.parse(jsonStr)

    assert.strictEqual(parsed.schema_version, '1.0.0')
    assert.strictEqual(parsed.campaign.id, sampleCampaign.id)
    assert.strictEqual(parsed.variants_count, 1)
  })
})
