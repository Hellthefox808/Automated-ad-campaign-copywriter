export const PLATFORMS = {
  GOOGLE_SEARCH_RSA: 'google_search_rsa',
  GOOGLE_DISPLAY: 'google_display',
  LINKEDIN_SPONSORED_FEED: 'linkedin_sponsored_feed',
  LINKEDIN_INMAIL: 'linkedin_inmail',
  META_B2B: 'meta_b2b'
}

export const PLATFORM_LIMITS = {
  [PLATFORMS.GOOGLE_SEARCH_RSA]: {
    name: 'Google Responsive Search Ads (RSA)',
    maxHeadlines: 15,
    minHeadlines: 3,
    headlineMaxChar: 30,
    maxDescriptions: 4,
    minDescriptions: 2,
    descriptionMaxChar: 90,
    pathMaxChar: 15,
    sitelinkTitleMaxChar: 25,
    sitelinkDescMaxChar: 35,
    calloutMaxChar: 25
  },
  [PLATFORMS.GOOGLE_DISPLAY]: {
    name: 'Google Display / Performance Max',
    shortHeadlineMaxChar: 30,
    longHeadlineMaxChar: 90,
    descriptionMaxChar: 90,
    businessNameMaxChar: 25
  },
  [PLATFORMS.LINKEDIN_SPONSORED_FEED]: {
    name: 'LinkedIn Sponsored Feed Content',
    introCutoffChar: 150,
    introMaxChar: 600,
    headlineMaxChar: 70,
    ctaOptions: [
      'Request Demo',
      'Download eBook',
      'Learn More',
      'Get Quote',
      'Register',
      'Contact Us'
    ]
  },
  [PLATFORMS.LINKEDIN_INMAIL]: {
    name: 'LinkedIn Sponsored InMail / Message Ads',
    subjectMaxChar: 60,
    bodyRecommendedChar: 500,
    bodyMaxChar: 1000,
    mergeTokens: ['{{firstName}}', '{{companyName}}', '{{jobTitle}}', '{{industry}}']
  },
  [PLATFORMS.META_B2B]: {
    name: 'Meta / Facebook B2B Ads',
    primaryTextCutoffChar: 125,
    primaryTextMaxChar: 400,
    headlineMaxChar: 40,
    descriptionMaxChar: 30
  }
}

export const ANGLES = {
  PAIN_POINT: 'pain_point',
  OUTCOME_ROI: 'outcome_roi',
  AUTHORITY_SOCIAL_PROOF: 'authority_social_proof'
}

export const ANGLE_DETAILS = {
  [ANGLES.PAIN_POINT]: {
    name: 'Pain-Point & Risk Aversion',
    badge: 'Risk Mitigation',
    description: 'Focuses on the high cost of inaction, compliance vulnerability, security debt, and downtime.'
  },
  [ANGLES.OUTCOME_ROI]: {
    name: 'Economic Value & ROI Acceleration',
    badge: 'Quantified Value',
    description: 'Highlights speed-to-market, cost reduction %, developer velocity, and proven bottom-line ROI.'
  },
  [ANGLES.AUTHORITY_SOCIAL_PROOF]: {
    name: 'Industry Benchmark & Authority',
    badge: 'Market Leader',
    description: 'Leverages enterprise customer validation, analyst recognition, SOC2/ISO badges, and peer consensus.'
  }
}

export const SENIORITY_LEVELS = {
  C_LEVEL: 'c_level',
  VP_HEAD: 'vp_head',
  DIRECTOR: 'director',
  MANAGER: 'manager',
  PRACTITIONER: 'practitioner'
}

export const INDUSTRIES = {
  ENTERPRISE_SAAS: 'enterprise_saas',
  CYBERSECURITY: 'cybersecurity',
  CLOUD_INFRA: 'cloud_infra',
  FINTECH: 'fintech',
  HEALTHTECH: 'healthtech',
  AI_MLOPS: 'ai_mlops',
  SUPPLY_CHAIN: 'supply_chain'
}

export const COMPANY_SIZES = {
  EARLY_STAGE: 'early_stage', // 10-50 emp
  MID_MARKET: 'mid_market', // 51-500 emp
  SCALEUP: 'scaleup', // 501-2000 emp
  ENTERPRISE: 'enterprise' // 2000+ emp
}

export const TONES = {
  CONSULTATIVE: 'consultative',
  URGENT_PAIN: 'urgent_pain',
  ANALYTICAL: 'analytical',
  VISIONARY: 'visionary',
  TECHNICAL_PEER: 'technical_peer'
}

export const ROLES = {
  COPYWRITER: 'copywriter',
  CAMPAIGN_MANAGER: 'campaign_manager',
  ADMIN: 'admin'
}

export const POLICY_RULES = {
  PROHIBITED_CLICKBAIT: [
    'click here',
    'you wont believe',
    'you won\'t believe',
    'secret trick',
    'miracle solution',
    'free money',
    'make millions',
    'shocking discovery',
    'risk free guarantee'
  ],
  UNVERIFIED_SUPERLATIVES: [
    '#1 in the world',
    'number one in the world',
    'undisputed best',
    '100% guaranteed success',
    'best product ever'
  ],
  MAX_ALLOWED_EXCLAMATION_SEARCH: 0,
  MAX_ALLOWED_EXCLAMATION_SOCIAL: 2
}

