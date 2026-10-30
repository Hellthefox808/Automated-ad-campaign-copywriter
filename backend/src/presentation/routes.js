import express from 'express'
import { AuthService } from '../service/authService.js'
import { AdGenerationEngine } from '../service/adGenerationEngine.js'
import { ComplianceEngine } from '../service/complianceEngine.js'
import { PredictiveScoringEngine } from '../service/predictiveScoringEngine.js'
import { ExportEngine } from '../service/exportEngine.js'
import { globalMetrics } from '../service/metricsService.js'
import { ROLES, PLATFORMS, ANGLES } from '../config/constants.js'

export function createRouter (repository) {
  const router = express.Router()

  // --- Observability & Health ---
  router.get('/health/live', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() })
  })

  router.get('/health/ready', (req, res) => {
    try {
      repository.db.prepare('SELECT 1').get()
      res.json({
        status: 'READY',
        database: 'connected',
        sqlite_wal: true,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      res.status(503).json({ status: 'UNAVAILABLE', error: err.message })
    }
  })

  router.get('/metrics', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4')
    res.send(globalMetrics.getPrometheusMetrics())
  })

  // --- Auth & Persona Routes ---
  router.post('/auth/login', (req, res) => {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }

    const user = repository.getUserByUsername(username)
    if (!user || !AuthService.verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const token = AuthService.generateToken(user)
    repository.recordAuditLog(user.username, 'USER_LOGIN', 'users', user.id, { ip: req.ip })

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  })

  router.get('/auth/me', AuthService.authenticate, (req, res) => {
    res.json({ user: req.user })
  })

  // --- Campaign Management ---
  router.get('/campaigns', AuthService.authenticate, (req, res) => {
    const campaigns = repository.listCampaigns()
    res.json({ data: campaigns })
  })

  router.get('/campaigns/:id', AuthService.authenticate, (req, res) => {
    const campaign = repository.getCampaignById(req.params.id)
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }
    const variants = repository.listVariantsByCampaign(campaign.id)
    res.json({ data: { ...campaign, variants } })
  })

  router.post(
    '/campaigns',
    AuthService.authenticate,
    AuthService.requireRole([ROLES.CAMPAIGN_MANAGER, ROLES.ADMIN]),
    (req, res) => {
      const { title, product_name, value_prop, target_url, industry, company_size, seniority, tone, primary_cta } = req.body || {}

      if (!title || !product_name || !value_prop || !industry || !seniority) {
        return res.status(400).json({
          error: 'Missing required campaign attributes: title, product_name, value_prop, industry, seniority'
        })
      }

      const campaign = repository.createCampaign({
        title,
        product_name,
        value_prop,
        target_url,
        industry,
        company_size: company_size || 'enterprise',
        seniority,
        tone: tone || 'consultative',
        primary_cta: primary_cta || 'Request Demo'
      })

      repository.recordAuditLog(req.user.username, 'CREATE_CAMPAIGN', 'campaigns', campaign.id, { title })
      res.status(201).json({ data: campaign })
    }
  )

  router.put(
    '/campaigns/:id',
    AuthService.authenticate,
    AuthService.requireRole([ROLES.CAMPAIGN_MANAGER, ROLES.ADMIN]),
    (req, res) => {
      const updated = repository.updateCampaign(req.params.id, req.body)
      if (!updated) {
        return res.status(404).json({ error: 'Campaign not found' })
      }
      repository.recordAuditLog(req.user.username, 'UPDATE_CAMPAIGN', 'campaigns', updated.id, req.body)
      res.json({ data: updated })
    }
  )

  router.delete(
    '/campaigns/:id',
    AuthService.authenticate,
    AuthService.requireRole([ROLES.ADMIN]),
    (req, res) => {
      const deleted = repository.deleteCampaign(req.params.id)
      if (!deleted) {
        return res.status(404).json({ error: 'Campaign not found' })
      }
      repository.recordAuditLog(req.user.username, 'DELETE_CAMPAIGN', 'campaigns', req.params.id)
      res.json({ message: 'Campaign deleted successfully' })
    }
  )

  // --- Ad Copy Generation ---
  router.post('/campaigns/:id/generate', AuthService.authenticate, (req, res) => {
    const campaign = repository.getCampaignById(req.params.id)
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    const platform = req.body.platform || PLATFORMS.GOOGLE_SEARCH_RSA
    const angle = req.body.angle || null

    const generated = AdGenerationEngine.generateAdCampaign(campaign, platform, angle)
    const variants = Array.isArray(generated) ? generated : [generated]

    const savedVariants = []
    for (const v of variants) {
      const created = repository.createVariant({
        campaign_id: campaign.id,
        platform: v.platform,
        angle: v.angle,
        headlines: v.headlines,
        descriptions: v.descriptions,
        extensions: v.extensions || null,
        character_counts: v.character_counts,
        ad_strength_score: v.ad_strength_score,
        predicted_ctr: v.predicted_ctr,
        readability_grade: v.readability_grade,
        status: 'generated'
      })

      // Record compliance audit
      if (v.compliance) {
        repository.recordComplianceAudit({
          campaign_id: campaign.id,
          variant_id: created.id,
          platform: v.platform,
          is_compliant: v.compliance.is_compliant,
          violation_count: v.compliance.violations.length,
          violations: v.compliance.violations,
          sanitized: v
        })
        globalMetrics.recordComplianceAudit(v.platform, v.compliance.violations.length, v.compliance.violations)
      }

      globalMetrics.recordGeneration(v.platform, v.angle)
      savedVariants.push({ ...created, compliance: v.compliance, telemetry: v.telemetry })
    }

    repository.recordAuditLog(req.user.username, 'GENERATE_AD_VARIANTS', 'campaigns', campaign.id, {
      platform,
      angle,
      variantsCount: savedVariants.length
    })

    res.json({
      data: {
        campaign_id: campaign.id,
        platform,
        variants: savedVariants
      }
    })
  })

  router.get('/campaigns/:id/variants', AuthService.authenticate, (req, res) => {
    const campaign = repository.getCampaignById(req.params.id)
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    const variants = repository.listVariantsByCampaign(campaign.id)
    res.json({ data: variants })
  })

  // --- Policy Compliance & Auto-Fix Sanitization ---
  router.post('/compliance/audit', AuthService.authenticate, (req, res) => {
    const { platform, variant } = req.body || {}
    if (!platform || !variant) {
      return res.status(400).json({ error: 'Platform and variant data required' })
    }

    const audit = ComplianceEngine.auditVariant(platform, variant)
    const telemetry = PredictiveScoringEngine.analyzeVariant(platform, variant)

    globalMetrics.recordComplianceAudit(platform, audit.violations.length, audit.violations)

    res.json({
      data: {
        compliance: audit,
        telemetry
      }
    })
  })

  router.post('/compliance/autofix', AuthService.authenticate, (req, res) => {
    const { platform, variant } = req.body || {}
    if (!platform || !variant) {
      return res.status(400).json({ error: 'Platform and variant data required' })
    }

    const sanitized = ComplianceEngine.autoFixCopy(platform, variant)
    const audit = ComplianceEngine.auditVariant(platform, sanitized)
    const telemetry = PredictiveScoringEngine.analyzeVariant(platform, sanitized)

    res.json({
      data: {
        sanitized,
        compliance: audit,
        telemetry
      }
    })
  })

  router.get('/compliance/logs', AuthService.authenticate, (req, res) => {
    const logs = repository.getRecentComplianceLogs(30)
    res.json({ data: logs })
  })

  // --- Campaign Exports ---
  router.get('/campaigns/:id/export', AuthService.authenticate, (req, res) => {
    const campaign = repository.getCampaignById(req.params.id)
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    let variants = repository.listVariantsByCampaign(campaign.id)
    if (variants.length === 0) {
      // Auto-generate variants if none stored yet
      const gen = AdGenerationEngine.generateAdCampaign(campaign, PLATFORMS.GOOGLE_SEARCH_RSA)
      variants = Array.isArray(gen) ? gen : [gen]
    }

    const format = req.query.format || 'json'

    if (format === 'csv_google') {
      const csv = ExportEngine.exportGoogleAdsEditorCSV(campaign, variants)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="google-ads-${campaign.id}.csv"`)
      return res.send(csv)
    }

    if (format === 'csv_linkedin') {
      const csv = ExportEngine.exportLinkedInCampaignCSV(campaign, variants)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="linkedin-ads-${campaign.id}.csv"`)
      return res.send(csv)
    }

    if (format === 'markdown') {
      const md = ExportEngine.exportCampaignBriefMarkdown(campaign, variants)
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="campaign-brief-${campaign.id}.md"`)
      return res.send(md)
    }

    // Default to JSON
    const jsonOutput = ExportEngine.exportCampaignJSON(campaign, variants)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.send(jsonOutput)
  })

  // --- Audit Logs ---
  router.get(
    '/audit-logs',
    AuthService.authenticate,
    AuthService.requireRole([ROLES.ADMIN]),
    (req, res) => {
      const logs = repository.getRecentAuditLogs(50)
      res.json({ data: logs })
    }
  )

  return router
}

