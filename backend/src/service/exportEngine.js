export class ExportEngine {
  /**
   * Generates an RFC 4180 compliant CSV string for Google Ads Editor bulk imports.
   */
  static exportGoogleAdsEditorCSV (campaign, variants = []) {
    const headers = [
      'Campaign',
      'Ad Group',
      'Headline 1',
      'Headline 2',
      'Headline 3',
      'Headline 4',
      'Headline 5',
      'Headline 6',
      'Headline 7',
      'Headline 8',
      'Headline 9',
      'Headline 10',
      'Headline 11',
      'Headline 12',
      'Headline 13',
      'Headline 14',
      'Headline 15',
      'Description 1',
      'Description 2',
      'Description 3',
      'Description 4',
      'Path 1',
      'Path 2',
      'Final URL',
      'Ad Status'
    ]

    const rows = [headers.map(this._escapeCsvField).join(',')]

    variants.forEach((v, index) => {
      const headlines = (v.headlines || []).map(h => typeof h === 'string' ? h : h.text || '')
      const descriptions = (v.descriptions || []).map(d => typeof d === 'string' ? d : d.text || '')
      const paths = (v.extensions && v.extensions.displayPaths) || { path1: 'Enterprise', path2: 'Demo' }

      const row = [
        campaign.title || 'Enterprise B2B Campaign',
        `AdGroup - ${v.angle.toUpperCase()}`,
        ...Array.from({ length: 15 }, (_, i) => headlines[i] || ''),
        ...Array.from({ length: 4 }, (_, i) => descriptions[i] || ''),
        paths.path1 || '',
        paths.path2 || '',
        campaign.target_url || 'https://example.com/demo',
        'Enabled'
      ]

      rows.push(row.map(this._escapeCsvField).join(','))
    })

    return rows.join('\r\n')
  }

  /**
   * Generates a LinkedIn Campaign Manager bulk upload CSV.
   */
  static exportLinkedInCampaignCSV (campaign, variants = []) {
    const headers = [
      'Campaign Name',
      'Creative Name',
      'Ad Format',
      'Introductory Text',
      'Headline',
      'Destination URL',
      'Call To Action',
      'Status'
    ]

    const rows = [headers.map(this._escapeCsvField).join(',')]

    variants.forEach((v, index) => {
      const intro = v.intro_text || (v.descriptions && v.descriptions[0] && v.descriptions[0].text) || ''
      const headline = v.headline || (v.headlines && v.headlines[0] && v.headlines[0].text) || ''
      const cta = v.cta_button || campaign.primary_cta || 'Request Demo'

      const row = [
        campaign.title || 'LinkedIn B2B Campaign',
        `Creative - ${v.angle || 'Angle ' + (index + 1)}`,
        'Single Image Ad',
        intro,
        headline,
        campaign.target_url || 'https://example.com/demo',
        cta,
        'Active'
      ]

      rows.push(row.map(this._escapeCsvField).join(','))
    })

    return rows.join('\r\n')
  }

  /**
   * Exports a complete Campaign Creative Brief in Markdown format.
   */
  static exportCampaignBriefMarkdown (campaign, variants = []) {
    const lines = [
      `# Campaign Creative Brief: ${campaign.title}`,
      ``,
      `**Product**: ${campaign.product_name}`,
      `**Industry**: ${campaign.industry} | **Target Tier**: ${campaign.company_size} | **Seniority**: ${campaign.seniority}`,
      `**Target Landing Page**: ${campaign.target_url}`,
      `**Primary Call-To-Action**: ${campaign.primary_cta}`,
      `**Value Proposition**: ${campaign.value_prop}`,
      `**Date Generated**: ${new Date().toUTCString()}`,
      ``,
      `---`,
      ``,
      `## Ad Variants Matrix (${variants.length} Variants)`,
      ``
    ]

    variants.forEach((v, idx) => {
      lines.push(`### Variant ${idx + 1}: ${v.angle.toUpperCase()} (${v.platform})`)
      lines.push(`- **Ad Strength**: ${v.ad_strength_score || 85}/100`)
      lines.push(`- **Predicted CTR**: ${v.predicted_ctr || 4.2}%`)
      lines.push(`- **Flesch-Kincaid Reading Grade**: ${v.readability_grade || 8.0}`)
      lines.push(``)

      if (v.headlines && v.headlines.length > 0) {
        lines.push(`#### Headlines`)
        v.headlines.forEach((h, hIdx) => {
          const text = typeof h === 'string' ? h : h.text
          const pin = h.pin ? ` *(Pinned Pos ${h.pin})*` : ''
          lines.push(`${hIdx + 1}. \`${text}\` (${text.length} chars)${pin}`)
        })
        lines.push(``)
      }

      if (v.descriptions && v.descriptions.length > 0) {
        lines.push(`#### Descriptions`)
        v.descriptions.forEach((d, dIdx) => {
          const text = typeof d === 'string' ? d : d.text
          lines.push(`${dIdx + 1}. "${text}" (${text.length} chars)`)
        })
        lines.push(``)
      }

      if (v.intro_text) {
        lines.push(`#### LinkedIn Introductory Text`)
        lines.push(`\`\`\``)
        lines.push(v.intro_text)
        lines.push(`\`\`\``)
        lines.push(``)
      }

      if (v.subject && v.body) {
        lines.push(`#### InMail Subject & Body`)
        lines.push(`**Subject**: ${v.subject}`)
        lines.push(``)
        lines.push(`\`\`\``)
        lines.push(v.body)
        lines.push(`\`\`\``)
        lines.push(``)
      }

      lines.push(`---`)
      lines.push(``)
    })

    return lines.join('\n')
  }

  /**
   * Exports full campaign manifest in structured JSON.
   */
  static exportCampaignJSON (campaign, variants = []) {
    return JSON.stringify({
      schema_version: '1.0.0',
      exported_at: new Date().toISOString(),
      campaign,
      variants_count: variants.length,
      variants
    }, null, 2)
  }

  static _escapeCsvField (field) {
    if (field === null || field === undefined) return '""'
    const str = String(field)
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return `"${str}"`
  }
}

