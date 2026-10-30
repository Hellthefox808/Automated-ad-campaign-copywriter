import { PLATFORMS, PLATFORM_LIMITS, POLICY_RULES } from '../config/constants.js'

export class ComplianceEngine {
  /**
   * Audits an ad variant against platform policies, character limits, and editorial guidelines.
   * Returns: { is_compliant: boolean, violations: Array<{ field, issue, rule, severity, suggestion }>, metrics: Object }
   */
  static auditVariant (platform, variantData) {
    const violations = []
    const limits = PLATFORM_LIMITS[platform]

    if (!limits) {
      violations.push({
        field: 'platform',
        issue: `Unknown ad platform: ${platform}`,
        rule: 'PLATFORM_EXISTENCE',
        severity: 'critical',
        suggestion: `Supported platforms: ${Object.values(PLATFORMS).join(', ')}`
      })
      return { is_compliant: false, violations, metrics: { totalViolations: violations.length } }
    }

    if (platform === PLATFORMS.GOOGLE_SEARCH_RSA) {
      this._auditGoogleSearchRSA(variantData, limits, violations)
    } else if (platform === PLATFORMS.GOOGLE_DISPLAY) {
      this._auditGoogleDisplay(variantData, limits, violations)
    } else if (platform === PLATFORMS.LINKEDIN_SPONSORED_FEED) {
      this._auditLinkedInFeed(variantData, limits, violations)
    } else if (platform === PLATFORMS.LINKEDIN_INMAIL) {
      this._auditLinkedInInMail(variantData, limits, violations)
    } else if (platform === PLATFORMS.META_B2B) {
      this._auditMetaB2B(variantData, limits, violations)
    }

    const hasCriticalOrError = violations.some(v => v.severity === 'critical' || v.severity === 'error')

    return {
      is_compliant: !hasCriticalOrError,
      violations,
      metrics: {
        totalViolations: violations.length,
        criticalCount: violations.filter(v => v.severity === 'critical').length,
        errorCount: violations.filter(v => v.severity === 'error').length,
        warningCount: violations.filter(v => v.severity === 'warning').length
      }
    }
  }

  // --- Platform Audits ---

  static _auditGoogleSearchRSA (data, limits, violations) {
    const headlines = data.headlines || []
    const descriptions = data.descriptions || []

    if (headlines.length < limits.minHeadlines) {
      violations.push({
        field: 'headlines',
        issue: `Minimum ${limits.minHeadlines} headlines required for RSA (found ${headlines.length})`,
        rule: 'GOOGLE_RSA_HEADLINE_COUNT',
        severity: 'error',
        suggestion: `Add at least ${limits.minHeadlines - headlines.length} more headlines`
      })
    }

    if (headlines.length > limits.maxHeadlines) {
      violations.push({
        field: 'headlines',
        issue: `Maximum ${limits.maxHeadlines} headlines allowed (found ${headlines.length})`,
        rule: 'GOOGLE_RSA_HEADLINE_OVERFLOW',
        severity: 'error',
        suggestion: `Remove ${headlines.length - limits.maxHeadlines} headlines`
      })
    }

    headlines.forEach((h, index) => {
      const text = typeof h === 'string' ? h : h.text || ''
      const len = text.length

      if (len > limits.headlineMaxChar) {
        violations.push({
          field: `headline_${index + 1}`,
          issue: `Headline exceeds ${limits.headlineMaxChar} chars (${len} chars): "${text}"`,
          rule: 'GOOGLE_HEADLINE_MAX_LENGTH',
          severity: 'error',
          suggestion: `Shorten to ${limits.headlineMaxChar} characters or fewer`
        })
      }

      // Check exclamation mark in Google Search headline
      if (text.includes('!')) {
        violations.push({
          field: `headline_${index + 1}`,
          issue: 'Exclamation marks are prohibited in Google Search ad headlines',
          rule: 'GOOGLE_NO_EXCLAMATION_IN_HEADLINE',
          severity: 'error',
          suggestion: 'Remove "!" from headline text'
        })
      }

      this._checkEditorialPolicies(text, `headline_${index + 1}`, violations, false)
    })

    if (descriptions.length < limits.minDescriptions) {
      violations.push({
        field: 'descriptions',
        issue: `Minimum ${limits.minDescriptions} descriptions required (found ${descriptions.length})`,
        rule: 'GOOGLE_RSA_DESC_COUNT',
        severity: 'error',
        suggestion: `Add at least ${limits.minDescriptions - descriptions.length} more descriptions`
      })
    }

    descriptions.forEach((d, index) => {
      const text = typeof d === 'string' ? d : d.text || ''
      const len = text.length

      if (len > limits.descriptionMaxChar) {
        violations.push({
          field: `description_${index + 1}`,
          issue: `Description exceeds ${limits.descriptionMaxChar} chars (${len} chars): "${text}"`,
          rule: 'GOOGLE_DESC_MAX_LENGTH',
          severity: 'error',
          suggestion: `Shorten to ${limits.descriptionMaxChar} characters or fewer`
        })
      }

      this._checkEditorialPolicies(text, `description_${index + 1}`, violations, true)
    })
  }

  static _auditGoogleDisplay (data, limits, violations) {
    const shortHeadline = data.short_headline || (data.headlines && data.headlines[0]) || ''
    const longHeadline = data.long_headline || (data.headlines && data.headlines[1]) || ''
    const description = data.description || (data.descriptions && data.descriptions[0]) || ''
    const businessName = data.business_name || 'Enterprise'

    if (shortHeadline.length > limits.shortHeadlineMaxChar) {
      violations.push({
        field: 'short_headline',
        issue: `Short headline exceeds ${limits.shortHeadlineMaxChar} chars (${shortHeadline.length})`,
        rule: 'GOOGLE_DISPLAY_SHORT_HEADLINE_MAX',
        severity: 'error',
        suggestion: `Trim to ${limits.shortHeadlineMaxChar} characters`
      })
    }

    if (longHeadline.length > limits.longHeadlineMaxChar) {
      violations.push({
        field: 'long_headline',
        issue: `Long headline exceeds ${limits.longHeadlineMaxChar} chars (${longHeadline.length})`,
        rule: 'GOOGLE_DISPLAY_LONG_HEADLINE_MAX',
        severity: 'error',
        suggestion: `Trim to ${limits.longHeadlineMaxChar} characters`
      })
    }

    if (description.length > limits.descriptionMaxChar) {
      violations.push({
        field: 'description',
        issue: `Description exceeds ${limits.descriptionMaxChar} chars (${description.length})`,
        rule: 'GOOGLE_DISPLAY_DESC_MAX',
        severity: 'error',
        suggestion: `Trim to ${limits.descriptionMaxChar} characters`
      })
    }

    if (businessName.length > limits.businessNameMaxChar) {
      violations.push({
        field: 'business_name',
        issue: `Business name exceeds ${limits.businessNameMaxChar} chars (${businessName.length})`,
        rule: 'GOOGLE_DISPLAY_BUSINESS_NAME_MAX',
        severity: 'warning',
        suggestion: `Trim to ${limits.businessNameMaxChar} characters`
      })
    }
  }

  static _auditLinkedInFeed (data, limits, violations) {
    const introText = data.intro_text || (data.descriptions && data.descriptions[0]) || ''
    const headline = data.headline || (data.headlines && data.headlines[0]) || ''

    if (introText.length > limits.introCutoffChar && introText.length <= limits.introMaxChar) {
      violations.push({
        field: 'intro_text',
        issue: `Intro text is ${introText.length} chars; LinkedIn mobile feed truncates after ${limits.introCutoffChar} chars ("...see more")`,
        rule: 'LINKEDIN_FEED_TRUNCATION_WARNING',
        severity: 'warning',
        suggestion: 'Place the primary value hook in the first 140 characters before truncation'
      })
    }

    if (introText.length > limits.introMaxChar) {
      violations.push({
        field: 'intro_text',
        issue: `Intro text exceeds maximum ${limits.introMaxChar} chars (${introText.length} chars)`,
        rule: 'LINKEDIN_FEED_INTRO_OVERFLOW',
        severity: 'error',
        suggestion: `Shorten intro text below ${limits.introMaxChar} chars`
      })
    }

    if (headline.length > limits.headlineMaxChar) {
      violations.push({
        field: 'headline',
        issue: `LinkedIn feed headline exceeds recommended ${limits.headlineMaxChar} chars (${headline.length} chars)`,
        rule: 'LINKEDIN_HEADLINE_TRUNCATION',
        severity: 'warning',
        suggestion: `Keep under ${limits.headlineMaxChar} chars for full visibility on mobile devices`
      })
    }

    this._checkEditorialPolicies(introText, 'intro_text', violations, true)
  }

  static _auditLinkedInInMail (data, limits, violations) {
    const subject = data.subject || (data.headlines && data.headlines[0]) || ''
    const body = data.body || (data.descriptions && data.descriptions[0]) || ''

    if (subject.length > limits.subjectMaxChar) {
      violations.push({
        field: 'subject',
        issue: `InMail subject line exceeds ${limits.subjectMaxChar} chars (${subject.length} chars)`,
        rule: 'LINKEDIN_INMAIL_SUBJECT_MAX',
        severity: 'error',
        suggestion: `Shorten subject line below ${limits.subjectMaxChar} chars to prevent mobile cutoff`
      })
    }

    if (body.length > limits.bodyRecommendedChar && body.length <= limits.bodyMaxChar) {
      violations.push({
        field: 'body',
        issue: `InMail body length (${body.length} chars) exceeds the optimal 500-char benchmark for reply rates`,
        rule: 'LINKEDIN_INMAIL_LENGTH_OPTIMAL',
        severity: 'warning',
        suggestion: 'Shorter InMail copies (<500 characters) generate up to 46% higher response rates'
      })
    }

    if (body.length > limits.bodyMaxChar) {
      violations.push({
        field: 'body',
        issue: `InMail body exceeds maximum allowed ${limits.bodyMaxChar} characters (${body.length} chars)`,
        rule: 'LINKEDIN_INMAIL_BODY_MAX',
        severity: 'error',
        suggestion: `Trim body copy under ${limits.bodyMaxChar} chars`
      })
    }

    this._checkEditorialPolicies(body, 'body', violations, true)
  }

  static _auditMetaB2B (data, limits, violations) {
    const primaryText = data.primary_text || (data.descriptions && data.descriptions[0]) || ''
    const headline = data.headline || (data.headlines && data.headlines[0]) || ''

    if (primaryText.length > limits.primaryTextCutoffChar) {
      violations.push({
        field: 'primary_text',
        issue: `Primary text exceeds mobile fold limit of ${limits.primaryTextCutoffChar} characters (${primaryText.length} chars)`,
        rule: 'META_PRIMARY_TEXT_CUTOFF',
        severity: 'warning',
        suggestion: `Frontload primary value driver before character 125`
      })
    }

    if (headline.length > limits.headlineMaxChar) {
      violations.push({
        field: 'headline',
        issue: `Headline exceeds Meta card limit of ${limits.headlineMaxChar} chars (${headline.length} chars)`,
        rule: 'META_HEADLINE_MAX',
        severity: 'error',
        suggestion: `Trim headline below ${limits.headlineMaxChar} chars`
      })
    }
  }

  // --- Shared Policy Checks ---

  static _checkEditorialPolicies (text, fieldName, violations, allowExclamation = false) {
    if (!text || typeof text !== 'string') return

    // 1. Prohibited Clickbait Check
    const lower = text.toLowerCase()
    for (const phrase of POLICY_RULES.PROHIBITED_CLICKBAIT) {
      if (lower.includes(phrase)) {
        violations.push({
          field: fieldName,
          issue: `Contains flagged clickbait phrasing: "${phrase}"`,
          rule: 'POLICY_PROHIBITED_CLICKBAIT',
          severity: 'error',
          suggestion: `Replace "${phrase}" with consultative B2B value language (e.g. "Discover how", "Explore architecture")`
        })
      }
    }

    // 2. Unverified Superlatives Check
    for (const sup of POLICY_RULES.UNVERIFIED_SUPERLATIVES) {
      if (lower.includes(sup)) {
        violations.push({
          field: fieldName,
          issue: `Contains unverified superlative: "${sup}"`,
          rule: 'POLICY_UNVERIFIED_SUPERLATIVE',
          severity: 'warning',
          suggestion: `Ad networks require third-party accreditation citations (e.g. "Gartner Leader") for superlative claims`
        })
      }
    }

    // 3. Repeated Punctuation Abuse Check
    if (/([!?.,]){2,}/.test(text)) {
      violations.push({
        field: fieldName,
        issue: 'Contains repeated or gimmicky punctuation (e.g. "!!", "??", "..")',
        rule: 'POLICY_REPEATED_PUNCTUATION',
        severity: 'error',
        suggestion: 'Use standard single-character terminal punctuation'
      })
    }

    // 4. Excessive Capitalization Check (ALL-CAPS words >= 3 chars that aren't common B2B acronyms)
    const allowedAcronyms = new Set([
      'AWS', 'GCP', 'API', 'REST', 'SOC2', 'ISO', 'B2B', 'SaaS', 'ROI', 'ERP',
      'K8S', 'SIEM', 'IAM', 'RBAC', 'OWASP', 'BOLA', 'DLP', 'CI/CD', 'SQL', 'LLM',
      'AI', 'ML', 'CRM', 'POC', 'SLA', 'VPC', 'SOC', 'CTA', 'ICP', 'CTR'
    ])

    const words = text.split(/\s+/)
    for (const word of words) {
      const clean = word.replace(/[^a-zA-Z0-9]/g, '')
      if (clean.length >= 3 && clean === clean.toUpperCase() && !allowedAcronyms.has(clean)) {
        violations.push({
          field: fieldName,
          issue: `Contains prohibited shouty all-caps word: "${clean}"`,
          rule: 'POLICY_EXCESSIVE_CAPITALIZATION',
          severity: 'error',
          suggestion: `Convert "${clean}" to Title Case ("${clean.charAt(0) + clean.slice(1).toLowerCase()}")`
        })
      }
    }
  }

  // --- Auto-Fix & Sanitizer ---

  /**
   * Sanitizes copy by trimming length to nearest word boundary, fixing shouty all-caps,
   * removing illegal punctuation, and swapping clickbait terms.
   */
  static autoFixCopy (platform, variantData) {
    const limits = PLATFORM_LIMITS[platform] || {}
    const sanitized = JSON.parse(JSON.stringify(variantData))

    if (sanitized.headlines && Array.isArray(sanitized.headlines)) {
      const maxLen = limits.headlineMaxChar || 30
      sanitized.headlines = sanitized.headlines.map(h => {
        const text = typeof h === 'string' ? h : h.text || ''
        let fixed = this._sanitizeString(text, maxLen, platform === PLATFORMS.GOOGLE_SEARCH_RSA)
        return typeof h === 'string' ? fixed : { ...h, text: fixed, charCount: fixed.length }
      })
    }

    if (sanitized.descriptions && Array.isArray(sanitized.descriptions)) {
      const maxLen = limits.descriptionMaxChar || 90
      sanitized.descriptions = sanitized.descriptions.map(d => {
        const text = typeof d === 'string' ? d : d.text || ''
        let fixed = this._sanitizeString(text, maxLen, false)
        return typeof d === 'string' ? fixed : { ...d, text: fixed, charCount: fixed.length }
      })
    }

    if (sanitized.short_headline) {
      sanitized.short_headline = this._sanitizeString(sanitized.short_headline, limits.shortHeadlineMaxChar || 30, true)
    }
    if (sanitized.long_headline) {
      sanitized.long_headline = this._sanitizeString(sanitized.long_headline, limits.longHeadlineMaxChar || 90, false)
    }
    if (sanitized.intro_text) {
      sanitized.intro_text = this._sanitizeString(sanitized.intro_text, limits.introMaxChar || 600, false)
    }
    if (sanitized.subject) {
      sanitized.subject = this._sanitizeString(sanitized.subject, limits.subjectMaxChar || 60, false)
    }
    if (sanitized.body) {
      sanitized.body = this._sanitizeString(sanitized.body, limits.bodyMaxChar || 1000, false)
    }

    return sanitized
  }

  static _sanitizeString (str, maxLen, stripExclamation = false) {
    if (!str || typeof str !== 'string') return ''

    let result = str

    // 1. Strip exclamation if required (e.g. Google Search headlines)
    if (stripExclamation) {
      result = result.replace(/!+/g, '')
    }

    // 2. Remove repeated punctuation
    result = result.replace(/([!?.,]){2,}/g, '$1')

    // 3. Replace clickbait terms with consultative B2B phrases
    result = result
      .replace(/\bclick here\b/gi, 'Learn More')
      .replace(/\bsecret trick\b/gi, 'proven methodology')
      .replace(/\bmiracle solution\b/gi, 'validated architecture')
      .replace(/\bfree money\b/gi, 'measurable cost reduction')
      .replace(/\byou won't believe\b/gi, 'discover how')
      .replace(/\byou wont believe\b/gi, 'discover how')

    // 4. Fix all-caps words (leave standard acronyms alone)
    const allowedAcronyms = new Set([
      'AWS', 'GCP', 'API', 'REST', 'SOC2', 'ISO', 'B2B', 'SaaS', 'ROI', 'ERP',
      'K8S', 'SIEM', 'IAM', 'RBAC', 'OWASP', 'BOLA', 'DLP', 'CI/CD', 'SQL', 'LLM',
      'AI', 'ML', 'CRM', 'POC', 'SLA', 'VPC', 'SOC', 'CTA', 'ICP', 'CTR'
    ])

    result = result.split(/\s+/).map(w => {
      const clean = w.replace(/[^a-zA-Z0-9]/g, '')
      if (clean.length >= 3 && clean === clean.toUpperCase() && !allowedAcronyms.has(clean)) {
        return w.charAt(0) + w.slice(1).toLowerCase()
      }
      return w
    }).join(' ')

    // 5. Trim to maxLen along word boundaries if possible
    if (result.length > maxLen) {
      let trimmed = result.slice(0, maxLen).trim()
      const lastSpace = trimmed.lastIndexOf(' ')
      if (lastSpace > maxLen * 0.7) {
        trimmed = trimmed.slice(0, lastSpace).trim()
      }
      // Clean trailing punctuation
      result = trimmed.replace(/[,;:\-\s]+$/, '')
    }

    return result.trim()
  }
}
