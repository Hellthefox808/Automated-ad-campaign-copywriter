import { test, describe } from 'node:test'
import assert from 'node:assert'
import { PredictiveScoringEngine } from '../src/service/predictiveScoringEngine.js'
import { PLATFORMS } from '../src/config/constants.js'

describe('PredictiveScoringEngine Unit Tests', () => {
  const highQualityVariant = {
    headlines: [
      { text: 'Cut Cloud Bills by 38%' },
      { text: 'Autonomous FinOps Engine' },
      { text: 'Save on AWS and GCP Spend' },
      { text: 'Stop K8s Budget Overruns' },
      { text: 'Zero Latency Overhead' },
      { text: 'Book a 15-Min Live Demo' },
      { text: 'Trusted by 500+ DevOps' },
      { text: 'SOC2 Type II Certified' },
      { text: 'Start 14-Day Free POC' },
      { text: 'Calculate Your Cloud ROI' }
    ],
    descriptions: [
      { text: 'Reclaim idle cluster capacity and right-size AWS and GCP pods automatically in 14 days.' },
      { text: 'Join 500+ engineering teams slashing cloud waste without sacrificing service reliability.' },
      { text: 'Autonomous real-time FinOps platform built for modern Kubernetes. Zero latency overhead.' },
      { text: 'Book your personalized 15-minute architectural walkthrough. See your potential savings.' }
    ]
  }

  test('calculates Ad Strength score and rating', () => {
    const analysis = PredictiveScoringEngine.analyzeVariant(PLATFORMS.GOOGLE_SEARCH_RSA, highQualityVariant)

    assert.ok(analysis.adStrength)
    assert.ok(analysis.adStrength.score >= 80, `Expected score >= 80, got ${analysis.adStrength.score}`)
    assert.ok(['Good', 'Excellent'].includes(analysis.adStrength.rating))
    assert.ok(Array.isArray(analysis.adStrength.checklist))
  })

  test('calculates predicted CTR with quantifier lifts', () => {
    const analysis = PredictiveScoringEngine.analyzeVariant(PLATFORMS.GOOGLE_SEARCH_RSA, highQualityVariant)

    assert.ok(analysis.predictedCtr)
    assert.ok(analysis.predictedCtr.estimatedPercentage > 3.0)
    assert.ok(analysis.predictedCtr.confidenceInterval.includes('%'))
    assert.ok(analysis.predictedCtr.drivers.length > 0)
  })

  test('calculates Flesch-Kincaid readability metrics', () => {
    const text = 'Reclaim idle cluster capacity and right-size AWS and GCP pods automatically in 14 days.'
    const readability = PredictiveScoringEngine._calculateReadability(text)

    assert.ok(readability)
    assert.ok(readability.gradeLevel >= 5 && readability.gradeLevel <= 14)
    assert.ok(readability.readingEase >= 0 && readability.readingEase <= 100)
    assert.ok(readability.wordCount > 5)
  })

  test('extracts action verbs and quantifiers', () => {
    const text = 'Automate, optimize and eliminate cloud waste by 38% within 14 days.'
    const metrics = PredictiveScoringEngine._calculateKeywordMetrics(text)

    assert.ok(metrics.verbs.includes('automate'))
    assert.ok(metrics.verbs.includes('optimize'))
    assert.ok(metrics.verbs.includes('eliminate'))
    assert.ok(metrics.quantifiers.includes('38%'))
  })
})
