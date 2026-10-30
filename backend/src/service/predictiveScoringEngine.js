import { PLATFORMS } from '../config/constants.js'

export class PredictiveScoringEngine {
  /**
   * Analyzes an ad variant and computes comprehensive performance & engagement telemetry.
   */
  static analyzeVariant (platform, variantData, campaignContext = {}) {
    const headlines = (variantData.headlines || []).map(h => typeof h === 'string' ? h : h.text || '')
    const descriptions = (variantData.descriptions || []).map(d => typeof d === 'string' ? d : d.text || '')

    const allText = [...headlines, ...descriptions, variantData.body || '', variantData.intro_text || ''].join(' ')

    const adStrength = this._calculateAdStrength(platform, headlines, descriptions)
    const readability = this._calculateReadability(allText)
    const predictedCtr = this._calculatePredictedCtr(platform, adStrength.score, allText, campaignContext)
    const keywordMetrics = this._calculateKeywordMetrics(allText)

    return {
      adStrength: {
        score: adStrength.score,
        rating: adStrength.rating,
        checklist: adStrength.checklist
      },
      predictedCtr: {
        estimatedPercentage: predictedCtr.rate,
        benchmarkComparison: predictedCtr.comparison,
        confidenceInterval: predictedCtr.interval,
        drivers: predictedCtr.drivers
      },
      readability: {
        gradeLevel: readability.gradeLevel,
        readingEase: readability.readingEase,
        interpretation: readability.interpretation,
        wordCount: readability.wordCount
      },
      keywordMetrics: {
        actionVerbDensity: keywordMetrics.density,
        detectedVerbs: keywordMetrics.verbs,
        metricQuantifiers: keywordMetrics.quantifiers
      }
    }
  }

  // --- Ad Strength Calculation ---

  static _calculateAdStrength (platform, headlines, descriptions) {
    let score = 50
    const checklist = []

    if (platform === PLATFORMS.GOOGLE_SEARCH_RSA) {
      // 1. Headline count check (up to 15)
      const hCount = headlines.length
      if (hCount >= 10) {
        score += 20
        checklist.push({ rule: 'Headlines Count (10+)', status: 'pass', weight: 20 })
      } else if (hCount >= 5) {
        score += 10
        checklist.push({ rule: 'Headlines Count (5-9)', status: 'partial', weight: 10 })
      } else {
        checklist.push({ rule: 'Headlines Count (<5)', status: 'fail', weight: 0 })
      }

      // 2. Description count check (up to 4)
      const dCount = descriptions.length
      if (dCount >= 3) {
        score += 15
        checklist.push({ rule: 'Descriptions Count (3+)', status: 'pass', weight: 15 })
      } else {
        score += 5
        checklist.push({ rule: 'Descriptions Count (<3)', status: 'partial', weight: 5 })
      }

      // 3. Headline diversity (Check length variance and distinct phrasing)
      const uniqueWords = new Set(headlines.join(' ').toLowerCase().split(/\s+/))
      if (uniqueWords.size >= 25) {
        score += 10
        checklist.push({ rule: 'Headline Vocabulary Diversity', status: 'pass', weight: 10 })
      } else {
        checklist.push({ rule: 'Headline Vocabulary Diversity', status: 'partial', weight: 5 })
      }

      // 4. CTA inclusion in headlines
      const ctaPattern = /(demo|trial|audit|start|get|roi|book|schedule|explore|save)/i
      const hasCta = headlines.some(h => ctaPattern.test(h))
      if (hasCta) {
        score += 5
        checklist.push({ rule: 'Clear CTA in Headline', status: 'pass', weight: 5 })
      } else {
        checklist.push({ rule: 'Clear CTA in Headline', status: 'fail', weight: 0 })
      }
    } else {
      // For LinkedIn & Meta
      score = 75
      if (headlines.length > 0) score += 10
      if (descriptions.length > 0) score += 10
      checklist.push({ rule: 'Core Asset Completion', status: 'pass', weight: 20 })
    }

    score = Math.min(100, Math.max(25, score))

    let rating = 'Average'
    if (score >= 90) rating = 'Excellent'
    else if (score >= 75) rating = 'Good'
    else if (score < 60) rating = 'Poor'

    return { score, rating, checklist }
  }

  // --- Predicted CTR Calculation ---

  static _calculatePredictedCtr (platform, adScore, text, context) {
    let baseRate = 3.2 // Average B2B Google Search benchmark
    let benchmarkComparison = '+18% above industry average'
    const drivers = []

    if (platform === PLATFORMS.LINKEDIN_SPONSORED_FEED) {
      baseRate = 0.65 // LinkedIn Sponsored Content benchmark
    } else if (platform === PLATFORMS.LINKEDIN_INMAIL) {
      baseRate = 4.8 // InMail reply benchmark
    } else if (platform === PLATFORMS.META_B2B) {
      baseRate = 1.1 // Meta B2B benchmark
    }

    // Impact of Ad Strength
    const scoreFactor = (adScore - 70) / 100
    baseRate += scoreFactor * (baseRate * 0.3)

    // Impact of numeric proof/quantifiers (e.g. 38%, $1.2M, 14 days)
    const numbersMatch = text.match(/\b\d+(%|\+x|\s*days|\s*hours|\s*mins|\s*k|\$)/gi)
    if (numbersMatch && numbersMatch.length > 0) {
      const lift = platform === PLATFORMS.GOOGLE_SEARCH_RSA ? 0.65 : 0.15
      baseRate += lift
      drivers.push(`Quantified proof metrics detected (${numbersMatch.slice(0, 3).join(', ')}): +${lift.toFixed(2)}% CTR lift`)
    }

    // Impact of high-converting B2B triggers
    if (/enterprise|compliance|security|automate|roi|guaranteed|soc2|real-time/i.test(text)) {
      const lift = platform === PLATFORMS.GOOGLE_SEARCH_RSA ? 0.45 : 0.1
      baseRate += lift
      drivers.push(`High-intent B2B value triggers detected: +${lift.toFixed(2)}% CTR lift`)
    }

    const finalRate = Math.max(0.2, Number(baseRate.toFixed(2)))
    const lower = Number((finalRate * 0.85).toFixed(2))
    const upper = Number((finalRate * 1.18).toFixed(2))

    if (finalRate >= 4.0 && platform === PLATFORMS.GOOGLE_SEARCH_RSA) {
      benchmarkComparison = '+32% above B2B benchmark (High Intent)'
    } else if (finalRate >= 0.8 && platform === PLATFORMS.LINKEDIN_SPONSORED_FEED) {
      benchmarkComparison = '+24% above LinkedIn average'
    }

    return {
      rate: finalRate,
      interval: `${lower}% - ${upper}%`,
      comparison: benchmarkComparison,
      drivers
    }
  }

  // --- Readability Analysis (Flesch-Kincaid) ---

  static _calculateReadability (text) {
    if (!text || text.trim().length === 0) {
      return { gradeLevel: 8.0, readingEase: 65.0, interpretation: 'Optimal for B2B executives', wordCount: 0 }
    }

    const words = text.match(/\b[a-zA-Z0-9'-]+\b/g) || []
    const wordCount = words.length
    if (wordCount === 0) {
      return { gradeLevel: 8.0, readingEase: 65.0, interpretation: 'Optimal for B2B executives', wordCount: 0 }
    }

    const sentences = (text.match(/[.!?]+(?=\s|$)/g) || []).length || 1

    let totalSyllables = 0
    words.forEach(w => {
      totalSyllables += this._countSyllables(w)
    })

    // Flesch-Kincaid Grade Level formula
    const wordsPerSentence = wordCount / sentences
    const syllablesPerWord = totalSyllables / wordCount
    let grade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59
    grade = Math.max(1, Math.min(16, Number(grade.toFixed(1))))

    // Flesch Reading Ease
    let ease = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord
    ease = Math.max(0, Math.min(100, Number(ease.toFixed(1))))

    let interpretation = 'Optimal for executive scanning'
    if (grade > 12) interpretation = 'Complex technical phrasing — recommend simplifying'
    else if (grade < 6) interpretation = 'Very casual — consider strengthening authoritative tone'

    return {
      gradeLevel: grade,
      readingEase: ease,
      interpretation,
      wordCount
    }
  }

  static _countSyllables (word) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '')
    if (clean.length <= 3) return 1
    const match = clean.match(/[aeiouy]{1,2}/g)
    return match ? match.length : 1
  }

  // --- Action Verb & Quantifier Extraction ---

  static _calculateKeywordMetrics (text) {
    const actionVerbs = [
      'automate', 'eliminate', 'accelerate', 'reduce', 'scale', 'secure',
      'prevent', 'optimize', 'boost', 'protect', 'reclaim', 'streamline'
    ]

    const detected = []
    actionVerbs.forEach(v => {
      const re = new RegExp(`\\b${v}\\w*\\b`, 'i')
      if (re.test(text)) detected.push(v)
    })

    const quantifiers = text.match(/\b\d+(%|\+x|\s*days|\s*hours|\s*k|\$)/gi) || []

    const words = text.match(/\b[a-zA-Z]+\b/g) || []
    const totalWords = words.length || 1
    const verbDensity = Number(((detected.length / totalWords) * 100).toFixed(1))

    return {
      density: verbDensity,
      verbs: detected,
      quantifiers: Array.from(new Set(quantifiers))
    }
  }
}

