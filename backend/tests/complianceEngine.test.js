import { test, describe } from 'node:test'
import assert from 'node:assert'
import { ComplianceEngine } from '../src/service/complianceEngine.js'
import { PLATFORMS } from '../src/config/constants.js'

describe('ComplianceEngine Unit Tests', () => {
  test('flags Google Search headlines exceeding 30 characters', () => {
    const badVariant = {
      headlines: [
        { text: 'This headline is way too long and clearly exceeds thirty characters' },
        { text: 'Valid Headline' },
        { text: 'Another Valid One' }
      ],
      descriptions: [
        { text: 'Valid description 1 under ninety characters length.' },
        { text: 'Valid description 2 under ninety characters length.' }
      ]
    }

    const audit = ComplianceEngine.auditVariant(PLATFORMS.GOOGLE_SEARCH_RSA, badVariant)
    assert.strictEqual(audit.is_compliant, false)
    const lengthIssue = audit.violations.find(v => v.rule === 'GOOGLE_HEADLINE_MAX_LENGTH')
    assert.ok(lengthIssue, 'Should detect headline max length breach')
  })

  test('flags prohibited exclamation mark in Google Search headline', () => {
    const variantWithExclamation = {
      headlines: [
        { text: 'Slash Cloud Bills Now!' },
        { text: 'Valid Headline' },
        { text: 'Another Valid One' }
      ],
      descriptions: [
        { text: 'Valid description 1' },
        { text: 'Valid description 2' }
      ]
    }

    const audit = ComplianceEngine.auditVariant(PLATFORMS.GOOGLE_SEARCH_RSA, variantWithExclamation)
    assert.strictEqual(audit.is_compliant, false)
    const exIssue = audit.violations.find(v => v.rule === 'GOOGLE_NO_EXCLAMATION_IN_HEADLINE')
    assert.ok(exIssue, 'Should flag exclamation mark in search headline')
  })

  test('flags prohibited clickbait phrasing', () => {
    const clickbaitVariant = {
      headlines: [
        { text: 'Click Here For Deals' },
        { text: 'Secret Trick Revealed' },
        { text: 'Valid Headline' }
      ],
      descriptions: [
        { text: 'Valid description 1' },
        { text: 'Valid description 2' }
      ]
    }

    const audit = ComplianceEngine.auditVariant(PLATFORMS.GOOGLE_SEARCH_RSA, clickbaitVariant)
    const clickbaitIssue = audit.violations.find(v => v.rule === 'POLICY_PROHIBITED_CLICKBAIT')
    assert.ok(clickbaitIssue, 'Should flag clickbait phrase')
  })

  test('flags shouty all-caps words', () => {
    const allCapsVariant = {
      headlines: [
        { text: 'BUY NOW Save Big' },
        { text: 'Valid Headline' },
        { text: 'Another Valid One' }
      ],
      descriptions: [
        { text: 'Valid description 1' },
        { text: 'Valid description 2' }
      ]
    }

    const audit = ComplianceEngine.auditVariant(PLATFORMS.GOOGLE_SEARCH_RSA, allCapsVariant)
    const capsIssue = audit.violations.find(v => v.rule === 'POLICY_EXCESSIVE_CAPITALIZATION')
    assert.ok(capsIssue, 'Should flag shouty all caps word')
  })

  test('autoFixCopy sanitizes and corrects policy violations', () => {
    const messyVariant = {
      headlines: [
        { text: 'Click here for the BEST EVER FinOps solution in the world right now!!' },
        { text: 'Slash Cloud Bills Now!' },
        { text: 'BUY NOW and Save Big' }
      ],
      descriptions: [
        { text: 'This description is excessively long and contains unnecessary repetition of punctuation???? It just keeps going on and on past the limit.' },
        { text: 'Standard valid description under 90 characters.' }
      ]
    }

    const sanitized = ComplianceEngine.autoFixCopy(PLATFORMS.GOOGLE_SEARCH_RSA, messyVariant)
    assert.ok(sanitized)

    // Check headlines
    sanitized.headlines.forEach(h => {
      const text = typeof h === 'string' ? h : h.text
      assert.ok(text.length <= 30, `Sanitized headline should be <= 30 chars, got: "${text}" (${text.length})`)
      assert.ok(!text.includes('!'), `Sanitized headline should have no exclamation mark: "${text}"`)
      assert.ok(!text.includes('click here'), 'Should replace clickbait')
    })

    // Check descriptions
    sanitized.descriptions.forEach(d => {
      const text = typeof d === 'string' ? d : d.text
      assert.ok(text.length <= 90, `Sanitized description should be <= 90 chars, got: "${text}" (${text.length})`)
      assert.ok(!text.includes('????'), 'Should collapse repeated punctuation')
    })
  })
})

