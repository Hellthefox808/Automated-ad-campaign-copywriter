import { PLATFORMS, ANGLES, SENIORITY_LEVELS, INDUSTRIES, COMPANY_SIZES, TONES } from '../config/constants.js'
import { ComplianceEngine } from './complianceEngine.js'
import { PredictiveScoringEngine } from './predictiveScoringEngine.js'

export class AdGenerationEngine {
  /**
   * Generates ad copies across all angles or a specific angle for a given campaign and platform.
   */
  static generateAdCampaign (campaign, platform = PLATFORMS.GOOGLE_SEARCH_RSA, angle = null) {
    const selectedAngles = angle ? [angle] : [ANGLES.PAIN_POINT, ANGLES.OUTCOME_ROI, ANGLES.AUTHORITY_SOCIAL_PROOF]
    const results = []

    for (const ang of selectedAngles) {
      let rawVariant

      if (platform === PLATFORMS.GOOGLE_SEARCH_RSA) {
        rawVariant = this._generateGoogleSearchRSA(campaign, ang)
      } else if (platform === PLATFORMS.GOOGLE_DISPLAY) {
        rawVariant = this._generateGoogleDisplay(campaign, ang)
      } else if (platform === PLATFORMS.LINKEDIN_SPONSORED_FEED) {
        rawVariant = this._generateLinkedInFeed(campaign, ang)
      } else if (platform === PLATFORMS.LINKEDIN_INMAIL) {
        rawVariant = this._generateLinkedInInMail(campaign, ang)
      } else if (platform === PLATFORMS.META_B2B) {
        rawVariant = this._generateMetaB2B(campaign, ang)
      } else {
        rawVariant = this._generateGoogleSearchRSA(campaign, ang)
      }

      // Automatically sanitize and auto-fix copy against strict network rules
      const sanitized = ComplianceEngine.autoFixCopy(platform, rawVariant)

      // Run compliance check on the sanitized variant
      const compliance = ComplianceEngine.auditVariant(platform, sanitized)

      // Run predictive scoring & engagement telemetry
      const telemetry = PredictiveScoringEngine.analyzeVariant(platform, sanitized, campaign)

      results.push({
        platform,
        angle: ang,
        campaign_id: campaign.id,
        ...sanitized,
        compliance,
        telemetry,
        ad_strength_score: telemetry.adStrength.score,
        predicted_ctr: telemetry.predictedCtr.estimatedPercentage,
        readability_grade: telemetry.readability.gradeLevel
      })
    }

    return angle ? results[0] : results
  }

  // --- Platform Generators ---

  static _generateGoogleSearchRSA (campaign, angle) {
    const product = campaign.product_name || 'Enterprise Platform'
    const shortProd = this._trimString(product, 18)
    const cta = campaign.primary_cta || 'Request Demo'
    const industry = campaign.industry || 'Tech'

    // Headlines: 15 distinct headlines strictly <= 30 chars
    const headlines = []

    if (angle === ANGLES.PAIN_POINT) {
      headlines.push({ text: this._trimString(`Stop Cloud Waste Now`, 30), pin: 1, category: 'Hook' })
      headlines.push({ text: this._trimString(`Slash Cloud Bills by 38%`, 30), pin: 1, category: 'Hook' })
      headlines.push({ text: this._trimString(`Cut Idle K8s Spend Fast`, 30), pin: 1, category: 'Hook' })
      headlines.push({ text: this._trimString(`${shortProd} FinOps`, 30), pin: 2, category: 'Product' })
      headlines.push({ text: this._trimString(`Autonomous Cloud Control`, 30), pin: 2, category: 'Product' })
      headlines.push({ text: this._trimString(`Stop Cost Overruns Today`, 30), pin: 2, category: 'Benefit' })
      headlines.push({ text: this._trimString(`Zero Manual Tagging Needed`, 30), pin: null, category: 'Feature' })
      headlines.push({ text: this._trimString(`Detect Idle Pods in 14 Days`, 30), pin: null, category: 'Feature' })
      headlines.push({ text: this._trimString(`Built for Engineering VPs`, 30), pin: null, category: 'Persona' })
      headlines.push({ text: this._trimString(`Eliminate AWS Budget Leaks`, 30), pin: null, category: 'Benefit' })
      headlines.push({ text: this._trimString(`Trusted by 500+ DevOps`, 30), pin: 3, category: 'Social Proof' })
      headlines.push({ text: this._trimString(`SOC2 & ISO 27001 Certified`, 30), pin: 3, category: 'Social Proof' })
      headlines.push({ text: this._trimString(`${cta} Today`, 30), pin: 3, category: 'CTA' })
      headlines.push({ text: this._trimString(`Calculate Your Cloud ROI`, 30), pin: 3, category: 'CTA' })
      headlines.push({ text: this._trimString(`Start 14-Day Free POC`, 30), pin: 3, category: 'CTA' })
    } else if (angle === ANGLES.OUTCOME_ROI) {
      headlines.push({ text: this._trimString(`3.4x ROI on Cloud Spend`, 30), pin: 1, category: 'Hook' })
      headlines.push({ text: this._trimString(`Cut AWS & GCP Bills 38%`, 30), pin: 1, category: 'Hook' })
      headlines.push({ text: this._trimString(`Fast Automated FinOps`, 30), pin: 1, category: 'Hook' })
      headlines.push({ text: this._trimString(`${shortProd} Engine`, 30), pin: 2, category: 'Product' })
      headlines.push({ text: this._trimString(`Sub-10ms Resource Sizing`, 30), pin: 2, category: 'Feature' })
      headlines.push({ text: this._trimString(`Instant Cloud Cost Savings`, 30), pin: 2, category: 'Benefit' })
      headlines.push({ text: this._trimString(`Automated K8s Right-Sizing`, 30), pin: null, category: 'Feature' })
      headlines.push({ text: this._trimString(`Results in First 48 Hours`, 30), pin: null, category: 'Proof' })
      headlines.push({ text: this._trimString(`C-Suite Ready Dashboards`, 30), pin: null, category: 'Persona' })
      headlines.push({ text: this._trimString(`Scale Revenue Not Cloud Bills`, 30), pin: null, category: 'Benefit' })
      headlines.push({ text: this._trimString(`Average $180k Annual Save`, 30), pin: 3, category: 'Social Proof' })
      headlines.push({ text: this._trimString(`Ranked #1 on G2 for FinOps`, 30), pin: 3, category: 'Social Proof' })
      headlines.push({ text: this._trimString(`${cta} in 15 Mins`, 30), pin: 3, category: 'CTA' })
      headlines.push({ text: this._trimString(`See Instant Cloud Savings`, 30), pin: 3, category: 'CTA' })
      headlines.push({ text: this._trimString(`Free Enterprise Trial`, 30), pin: 3, category: 'CTA' })
    } else {
      // AUTHORITY_SOCIAL_PROOF
      headlines.push({ text: this._trimString(`Enterprise Grade FinOps`, 30), pin: 1, category: 'Hook' })
      headlines.push({ text: this._trimString(`Trusted by Fortune 500`, 30), pin: 1, category: 'Hook' })
      headlines.push({ text: this._trimString(`Leader in K8s Cost Control`, 30), pin: 1, category: 'Hook' })
      headlines.push({ text: this._trimString(`${shortProd} Platform`, 30), pin: 2, category: 'Product' })
      headlines.push({ text: this._trimString(`Gartner Recognized FinOps`, 30), pin: 2, category: 'Proof' })
      headlines.push({ text: this._trimString(`Architected for Multi-Cloud`, 30), pin: 2, category: 'Benefit' })
      headlines.push({ text: this._trimString(`99.99% Enterprise SLA`, 30), pin: null, category: 'Feature' })
      headlines.push({ text: this._trimString(`Full VPC & On-Prem Support`, 30), pin: null, category: 'Feature' })
      headlines.push({ text: this._trimString(`Zero Production Latency`, 30), pin: null, category: 'Feature' })
      headlines.push({ text: this._trimString(`Audited by Top Sec Firms`, 30), pin: null, category: 'Proof' })
      headlines.push({ text: this._trimString(`Over 10M Pods Managed`, 30), pin: 3, category: 'Social Proof' })
      headlines.push({ text: this._trimString(`SOC2 Type II Certified`, 30), pin: 3, category: 'Social Proof' })
      headlines.push({ text: this._trimString(`${cta} With Architects`, 30), pin: 3, category: 'CTA' })
      headlines.push({ text: this._trimString(`Get Enterprise Benchmark`, 30), pin: 3, category: 'CTA' })
      headlines.push({ text: this._trimString(`Schedule Architect Call`, 30), pin: 3, category: 'CTA' })
    }

    // Descriptions: 4 distinct descriptions strictly <= 90 chars
    const descriptions = [
      {
        text: this._trimString(`Reclaim idle cluster capacity and right-size AWS and GCP pods automatically in 14 days.`, 90),
        category: 'Value & Speed'
      },
      {
        text: this._trimString(`Join 500+ engineering teams slashing cloud waste without sacrificing service reliability.`, 90),
        category: 'Social Proof'
      },
      {
        text: this._trimString(`Autonomous real-time FinOps platform built for modern Kubernetes. Zero latency overhead.`, 90),
        category: 'Feature & Tech'
      },
      {
        text: this._trimString(`Book your personalized 15-minute architectural walkthrough. See your potential savings.`, 90),
        category: 'Direct CTA'
      }
    ]

    // Extensions & Metadata
    const extensions = {
      displayPaths: {
        path1: 'Enterprise',
        path2: 'FinOps'
      },
      sitelinks: [
        {
          title: this._trimString('Interactive ROI Calculator', 25),
          desc1: this._trimString('Model your annual cloud savings.', 35),
          desc2: this._trimString('Takes 2 minutes with no signup.', 35),
          url: `${campaign.target_url}/calculator`
        },
        {
          title: this._trimString('Customer Case Studies', 25),
          desc1: this._trimString('How fintech leaders cut 42% cost.', 35),
          desc2: this._trimString('Read verified engineering audits.', 35),
          url: `${campaign.target_url}/case-studies`
        },
        {
          title: this._trimString('Security & Compliance', 25),
          desc1: this._trimString('SOC2 Type II and ISO 27001.', 35),
          desc2: this._trimString('Private VPC deployment guides.', 35),
          url: `${campaign.target_url}/security`
        },
        {
          title: this._trimString('Schedule 1:1 Demo', 25),
          desc1: this._trimString('Live walkthrough with architects.', 35),
          desc2: this._trimString('Direct answers for your stack.', 35),
          url: `${campaign.target_url}/demo`
        }
      ],
      callouts: [
        this._trimString('14-Day Free Evaluation', 25),
        this._trimString('No Code Changes Needed', 25),
        this._trimString('AWS & GCP Partner', 25),
        this._trimString('24/7 Dedicated Support', 25)
      ]
    }

    return {
      headlines,
      descriptions,
      extensions,
      character_counts: {
        headlines: headlines.map(h => h.text.length),
        descriptions: descriptions.map(d => d.text.length)
      }
    }
  }

  static _generateGoogleDisplay (campaign, angle) {
    const product = campaign.product_name || 'Enterprise AI'
    const shortProd = this._trimString(product, 20)

    const shortHeadline = this._trimString(`Cut Cloud Waste by 38%`, 30)
    const longHeadline = this._trimString(`Autonomous FinOps for Kubernetes: Reclaim Idle Capacity and Save 38% in 14 Days`, 90)
    const description = this._trimString(`Enterprise-grade cost intelligence. Trusted by 500+ DevOps teams. No code changes needed.`, 90)
    const businessName = this._trimString(shortProd, 25)

    return {
      short_headline: shortHeadline,
      long_headline: longHeadline,
      description,
      business_name: businessName,
      headlines: [{ text: shortHeadline }, { text: longHeadline }],
      descriptions: [{ text: description }],
      character_counts: {
        short_headline: shortHeadline.length,
        long_headline: longHeadline.length,
        description: description.length,
        business_name: businessName.length
      }
    }
  }

  static _generateLinkedInFeed (campaign, angle) {
    const product = campaign.product_name || 'Enterprise Platform'
    const cta = campaign.primary_cta || 'Request Demo'

    let introText = ''
    let headline = ''

    if (angle === ANGLES.PAIN_POINT) {
      introText = `Is your engineering team spending more time untangling cloud bills than shipping features? Unallocated Kubernetes pods and idle cloud compute silently bleed 30%+ of IT budgets every quarter.\n\nHere is how leading enterprise engineering teams are turning that around:\n• Real-time pod-level cost attribution without manual tagging\n• Autonomous idle capacity reclamation saving 38% on average\n• SOC2 Type II audited architecture with zero latency impact\n\nEliminate budget surprises before your next board review.`
      headline = this._trimString(`Stop K8s Cost Overruns: Cut Cloud Bills 38% Without Downtime`, 70)
    } else if (angle === ANGLES.OUTCOME_ROI) {
      introText = `What if you could recover $180,000+ in annual cloud waste within 14 days of deployment? With autonomous Kubernetes resource right-sizing, engineering teams achieve an average 3.4x ROI in the first quarter.\n\nKey enterprise benchmarks:\n• 38% verified reduction in AWS & GCP compute spend\n• Sub-10ms telemetry overhead across 10,000+ production nodes\n• Automated reconciliation and NetSuite/ERP integration\n\nCalculate your exact team ROI in less than 2 minutes.`
      headline = this._trimString(`Achieve 3.4x FinOps ROI: Automated Kubernetes Cloud Optimization`, 70)
    } else {
      introText = `Recognized by Gartner and trusted by over 500 high-growth tech companies: ${product} sets the new standard for autonomous enterprise FinOps.\n\nWhy Fortune 500 engineering leaders choose us:\n• Complete private VPC residency and on-premise Kubernetes support\n• 99.99% enterprise SLA guarantee with 24/7 dedicated solutions architects\n• Enterprise-grade RBAC and compliance audit trails built in\n\nExplore how tier-one engineering teams master cloud efficiency.`
      headline = this._trimString(`The Enterprise Standard in FinOps: Trusted by 500+ Tech Leaders`, 70)
    }

    return {
      intro_text: introText,
      headline,
      cta_button: cta,
      headlines: [{ text: headline }],
      descriptions: [{ text: introText }],
      character_counts: {
        intro_text: introText.length,
        headline: headline.length
      }
    }
  }

  static _generateLinkedInInMail (campaign, angle) {
    const product = campaign.product_name || 'Enterprise Platform'
    const subject = this._trimString(`Quick question regarding {{companyName}}'s cloud efficiency`, 60)

    const body = `Hi {{firstName}},\n\nI noticed your leadership in scaling {{companyName}}'s engineering and infrastructure stack. As teams expand their Kubernetes footprints, unallocated compute waste and idle cluster capacity frequently account for 30% to 40% of monthly cloud invoices.\n\nWe engineered ${product} specifically to solve this without burdening developers. Our autonomous FinOps engine dynamically rightsizes workloads in real time, helping peer engineering teams reduce AWS and GCP spend by 38% within 14 days of activation.\n\nWould you be open to a 10-minute executive conversation next Tuesday to see how {{companyName}} compares against our benchmark data?\n\nBest regards,\nSolutions Architecture Team`

    const quickReplies = [
      'Send the 5-min executive brief',
      'Open to a quick demo next week',
      'Not right now, follow up next quarter'
    ]

    return {
      subject,
      body,
      quick_replies: quickReplies,
      headlines: [{ text: subject }],
      descriptions: [{ text: body }],
      character_counts: {
        subject: subject.length,
        body: body.length
      }
    }
  }

  static _generateMetaB2B (campaign, angle) {
    const primaryText = `Tired of ballooning AWS and GCP bills? Reclaim up to 38% of your cloud spend with autonomous Kubernetes right-sizing in 14 days.`
    const headline = this._trimString(`Cut Cloud Waste by 38% in 14 Days`, 40)
    const description = this._trimString(`Autonomous FinOps for DevOps`, 30)

    return {
      primary_text: primaryText,
      headline,
      description,
      headlines: [{ text: headline }],
      descriptions: [{ text: primaryText }],
      character_counts: {
        primary_text: primaryText.length,
        headline: headline.length,
        description: description.length
      }
    }
  }

  static _trimString (str, maxLen) {
    if (!str || typeof str !== 'string') return ''
    if (str.length <= maxLen) return str
    let trimmed = str.slice(0, maxLen).trim()
    const lastSpace = trimmed.lastIndexOf(' ')
    if (lastSpace > maxLen * 0.7) {
      trimmed = trimmed.slice(0, lastSpace).trim()
    }
    return trimmed.replace(/[,;:\-\s]+$/, '')
  }
}

