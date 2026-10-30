import React, { useState } from 'react'

export function ExportCenterView ({ campaign, variants = [] }) {
  const [selectedFormat, setSelectedFormat] = useState('csv_google')
  const [copied, setCopied] = useState(false)

  if (!campaign) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8' }}>Please select a campaign first.</p>
      </div>
    )
  }

  const exportOptions = [
    {
      id: 'csv_google',
      label: 'Google Ads Editor CSV',
      icon: '📊',
      ext: '.csv',
      desc: 'RFC 4180 standard bulk spreadsheet ready for Google Ads Editor import (Headlines 1-15, Descriptions 1-4, Final URL, Paths).'
    },
    {
      id: 'csv_linkedin',
      label: 'LinkedIn Campaign Manager CSV',
      icon: '💼',
      ext: '.csv',
      desc: 'Bulk creative upload format for LinkedIn Campaign Manager with introductory copy, headline, CTA, and destination URL.'
    },
    {
      id: 'markdown',
      label: 'Campaign Creative Brief (Markdown)',
      icon: '📝',
      ext: '.md',
      desc: 'Formatted B2B campaign brief complete with executive summary, all angle variants, and compliance scores for stakeholder review.'
    },
    {
      id: 'json',
      label: 'Structured Campaign Manifest (JSON)',
      icon: '⚙️',
      ext: '.json',
      desc: 'Complete schema-validated machine-readable manifest including telemetry, character counts, and policy audit logs.'
    }
  ]

  const downloadUrl = `/api/campaigns/${campaign.id}/export?format=${selectedFormat}`

  const handleCopyClipboard = async () => {
    try {
      const res = await fetch(downloadUrl)
      const text = await res.text()
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
          Omnichannel Campaign Export & Integration Center
        </h2>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Export production-ready bulk ad campaigns directly into Google Ads Editor and LinkedIn Campaign Manager
        </p>
      </div>

      {/* Export Format Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {exportOptions.map(opt => {
          const isSelected = selectedFormat === opt.id
          return (
            <div
              key={opt.id}
              onClick={() => setSelectedFormat(opt.id)}
              className="glass-card"
              style={{
                padding: '16px',
                cursor: 'pointer',
                borderColor: isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)',
                background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'rgba(24, 34, 52, 0.7)',
                boxShadow: isSelected ? '0 0 16px rgba(6, 182, 212, 0.25)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>{opt.icon}</span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                  {opt.label}
                </h3>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '12px' }}>
                {opt.desc}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  {opt.ext}
                </span>
                <span style={{ fontSize: '0.72rem', color: isSelected ? '#06b6d4' : '#64748b', fontWeight: 600 }}>
                  {isSelected ? '✓ Selected' : 'Choose format →'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Export Action Bar */}
      <div
        style={{
          background: '#111827',
          padding: '18px 20px',
          borderRadius: '12px',
          border: '1px solid #1f2937',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
            Ready to export for: <span style={{ color: '#06b6d4' }}>{campaign.title}</span>
          </h4>
          <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            Includes {variants.length > 0 ? variants.length : 3} ad variants formatted for {selectedFormat.replace('_', ' ').toUpperCase()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={handleCopyClipboard}
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            <span>{copied ? '✓ Copied to Clipboard!' : '📋 Copy to Clipboard'}</span>
          </button>

          <a
            href={downloadUrl}
            download
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '8px 16px', textDecoration: 'none' }}
          >
            <span>📥 Download File</span>
          </a>
        </div>
      </div>
    </div>
  )
}

