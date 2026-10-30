export class MetricsService {
  constructor () {
    this.totalRequests = 0
    this.requestsByRoute = new Map()
    this.totalGenerations = 0
    this.generationsByPlatform = new Map()
    this.totalComplianceAudits = 0
    this.violationsDetected = 0
    this.violationsByRule = new Map()
    this.startTime = Date.now()
  }

  recordRequest (method, path, status, durationMs) {
    this.totalRequests++
    const key = `${method} ${path} ${status}`
    this.requestsByRoute.set(key, (this.requestsByRoute.get(key) || 0) + 1)
  }

  recordGeneration (platform, angle) {
    this.totalGenerations++
    const key = `${platform}:${angle}`
    this.generationsByPlatform.set(key, (this.generationsByPlatform.get(key) || 0) + 1)
  }

  recordComplianceAudit (platform, violationCount, violations = []) {
    this.totalComplianceAudits++
    this.violationsDetected += violationCount
    violations.forEach(v => {
      const rule = v.rule || 'UNKNOWN'
      this.violationsByRule.set(rule, (this.violationsByRule.get(rule) || 0) + 1)
    })
  }

  getPrometheusMetrics () {
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000)
    const lines = [
      '# HELP adcraft_uptime_seconds Total application uptime in seconds',
      '# TYPE adcraft_uptime_seconds gauge',
      `adcraft_uptime_seconds ${uptimeSec}`,
      '',
      '# HELP adcraft_http_requests_total Total number of HTTP requests received',
      '# TYPE adcraft_http_requests_total counter',
      `adcraft_http_requests_total ${this.totalRequests}`,
      '',
      '# HELP adcraft_ad_generations_total Total ad copy generations performed',
      '# TYPE adcraft_ad_generations_total counter',
      `adcraft_ad_generations_total ${this.totalGenerations}`,
      '',
      '# HELP adcraft_compliance_audits_total Total ad policy compliance audits executed',
      '# TYPE adcraft_compliance_audits_total counter',
      `adcraft_compliance_audits_total ${this.totalComplianceAudits}`,
      '',
      '# HELP adcraft_compliance_violations_total Total policy violations detected',
      '# TYPE adcraft_compliance_violations_total counter',
      `adcraft_compliance_violations_total ${this.violationsDetected}`
    ]

    for (const [key, count] of this.generationsByPlatform.entries()) {
      const [platform, angle] = key.split(':')
      lines.push(`adcraft_generations_by_type{platform="${platform}",angle="${angle}"} ${count}`)
    }

    for (const [rule, count] of this.violationsByRule.entries()) {
      lines.push(`adcraft_violations_by_rule{rule="${rule}"} ${count}`)
    }

    return lines.join('\n') + '\n'
  }
}

export const globalMetrics = new MetricsService()

