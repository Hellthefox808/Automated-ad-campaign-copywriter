import React from 'react'

export function PredictiveAnalyticsView ({ variant, campaign }) {
  if (!variant || !variant.telemetry) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Select an ad variant to view predictive engagement and quality telemetry.
        </p>
      </div>
    )
  }

  const { adStrength, predictedCtr, readability, keywordMetrics } = variant.telemetry

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
          Predictive Performance & Engagement Telemetry
        </h2>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Algorithmic model measuring Ad Strength, expected Click-Through Rate (CTR), and executive readability
        </p>
      </div>

      {/* KPI 4-Card Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {/* Card 1: Ad Strength Score */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              AD STRENGTH SCORE
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
              {adStrength.rating}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
              {adStrength.score}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ 100</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
            Algorithmic Google Ads quality rating
          </p>
        </div>

        {/* Card 2: Predicted CTR */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              PREDICTED CTR %
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
              High Intent
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
              {predictedCtr.estimatedPercentage}%
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              ({predictedCtr.confidenceInterval})
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '6px', fontWeight: 600 }}>
            {predictedCtr.benchmarkComparison}
          </p>
        </div>

        {/* Card 3: Readability Grade */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              READABILITY GRADE
            </span>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
              Flesch-Kincaid
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc' }}>
              Grade {readability.gradeLevel}
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
            {readability.interpretation}
          </p>
        </div>

        {/* Card 4: Action Verb Density */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              ACTION VERB DENSITY
            </span>
            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
              {keywordMetrics.actionVerbDensity}%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
              {keywordMetrics.detectedVerbs.length}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Key Verbs</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
            High-converting commercial intent verbs
          </p>
        </div>
      </div>

      {/* Breakdown Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Ad Strength Checklist */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>
            Google Ad Strength Quality Factors
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {adStrength.checklist.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#111827',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #1f2937'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: item.status === 'pass' ? '#10b981' : '#f59e0b' }}>
                    {item.status === 'pass' ? '✓' : '•'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>{item.rule}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: item.status === 'pass' ? '#34d399' : '#fbbf24'
                  }}
                >
                  +{item.weight} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quantifiers & CTR Drivers */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>
            CTR Lift Drivers & Numerical Proof
          </h3>

          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
              Detected Proof Metrics & Quantifiers:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {keywordMetrics.metricQuantifiers.length > 0 ? (
                keywordMetrics.metricQuantifiers.map((q, qIdx) => (
                  <span key={qIdx} className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                    {q}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>None detected</span>
              )}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
              Conversion Drivers:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              {predictedCtr.drivers.map((d, dIdx) => (
                <div
                  key={dIdx}
                  style={{
                    fontSize: '0.76rem',
                    color: '#94a3b8',
                    background: '#111827',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    borderLeft: '3px solid #06b6d4'
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

