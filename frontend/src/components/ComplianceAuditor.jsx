import React, { useState } from 'react'

export function ComplianceAuditor ({
  variant,
  platform,
  onAutoFix,
  isAutoFixing
}) {
  const [activeTab, setActiveTab] = useState('violations') // 'violations' | 'character_limits' | 'rules'

  if (!variant) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          No ad variant selected for compliance audit. Generate or select a variant first.
        </p>
      </div>
    )
  }

  const compliance = variant.compliance || { is_compliant: true, violations: [] }
  const violations = compliance.violations || []
  const hasErrors = violations.some(v => v.severity === 'error' || v.severity === 'critical')

  const headlines = variant.headlines || []
  const descriptions = variant.descriptions || []

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      {/* Header with Compliance Status Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '14px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Ad Policy Compliance & Editorial Auditor
            </h2>
            <span
              className={compliance.is_compliant ? 'badge badge-emerald' : 'badge badge-rose'}
              style={{ fontSize: '0.7rem' }}
            >
              {compliance.is_compliant ? '✓ 100% Policy Compliant' : `⚠ ${violations.length} Issues Detected`}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Audits against Google Ads Editorial Guidelines and LinkedIn Professional Community Standards
          </p>
        </div>

        {/* 1-Click Auto-Fix Action Button */}
        {violations.length > 0 && (
          <button
            className="btn-primary"
            onClick={onAutoFix}
            disabled={isAutoFixing}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            <span>{isAutoFixing ? 'Sanitizing Copy...' : '⚡ 1-Click Auto-Fix & Comply'}</span>
          </button>
        )}
      </div>

      {/* Audit Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('violations')}
          className="btn-secondary"
          style={{
            fontSize: '0.76rem',
            padding: '5px 12px',
            borderColor: activeTab === 'violations' ? '#06b6d4' : '#334155',
            color: activeTab === 'violations' ? '#38bdf8' : '#94a3b8'
          }}
        >
          Violations & Alerts ({violations.length})
        </button>
        <button
          onClick={() => setActiveTab('character_limits')}
          className="btn-secondary"
          style={{
            fontSize: '0.76rem',
            padding: '5px 12px',
            borderColor: activeTab === 'character_limits' ? '#06b6d4' : '#334155',
            color: activeTab === 'character_limits' ? '#38bdf8' : '#94a3b8'
          }}
        >
          Character Count Progress
        </button>
      </div>

      {/* TAB 1: Violations List */}
      {activeTab === 'violations' && (
        <div>
          {violations.length === 0 ? (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '20px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '1.5rem', color: '#10b981' }}>🛡️</span>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', marginBottom: '2px' }}>
                  Zero Ad Network Policy Breaches
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>
                  All headlines, descriptions, and extensions comply strictly with Google Search & LinkedIn character limits, punctuation caps, and trademark rules.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {violations.map((v, idx) => {
                const isError = v.severity === 'error' || v.severity === 'critical'
                return (
                  <div
                    key={idx}
                    style={{
                      background: isError ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                      border: isError ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      padding: '12px 16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className={isError ? 'badge badge-rose' : 'badge badge-amber'} style={{ fontSize: '0.65rem' }}>
                        {v.severity.toUpperCase()} · {v.rule}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        Field: {v.field}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                      {v.issue}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#94a3b8' }}>
                      <strong style={{ color: '#06b6d4' }}>Suggestion:</strong>
                      <span>{v.suggestion}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Character Count Meters */}
      {activeTab === 'character_limits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Headlines Meter */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '10px' }}>
              Headlines Character Limits (Max 30 Chars)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
              {headlines.map((h, idx) => {
                const text = typeof h === 'string' ? h : h.text
                const len = text.length
                const pct = Math.min(100, Math.round((len / 30) * 100))
                const isOver = len > 30

                return (
                  <div
                    key={idx}
                    style={{
                      background: '#182234',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>H{idx + 1}: {text.slice(0, 22)}...</span>
                      <span style={{ color: isOver ? '#ef4444' : len >= 26 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                        {len}/30 chars
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: isOver ? '#ef4444' : len >= 26 ? '#f59e0b' : '#10b981',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Descriptions Meter */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '10px' }}>
              Descriptions Character Limits (Max 90 Chars)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {descriptions.map((d, idx) => {
                const text = typeof d === 'string' ? d : d.text
                const len = text.length
                const pct = Math.min(100, Math.round((len / 90) * 100))
                const isOver = len > 90

                return (
                  <div
                    key={idx}
                    style={{
                      background: '#182234',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 500 }}>
                        D{idx + 1}: "{text.slice(0, 60)}..."
                      </span>
                      <span style={{ color: isOver ? '#ef4444' : len >= 80 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                        {len}/90 chars
                      </span>
                    </div>
                    <div style={{ height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: isOver ? '#ef4444' : len >= 80 ? '#f59e0b' : '#10b981',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
