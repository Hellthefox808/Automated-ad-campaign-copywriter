import React, { useState } from 'react'

export function AdMockupViewer ({
  campaign,
  variants = [],
  selectedPlatform,
  setSelectedPlatform,
  selectedAngle,
  setSelectedAngle,
  onCopyText
}) {
  const [deviceMode, setDeviceMode] = useState('desktop') // 'desktop' | 'mobile'
  const [isIntroExpanded, setIsIntroExpanded] = useState(false)
  const [activeCopiedField, setActiveCopiedField] = useState(null)

  const platforms = [
    { id: 'google_search_rsa', label: 'Google Search (RSA)', icon: '🔍' },
    { id: 'linkedin_sponsored_feed', label: 'LinkedIn Sponsored Feed', icon: '💼' },
    { id: 'linkedin_inmail', label: 'LinkedIn InMail Message', icon: '✉️' },
    { id: 'google_display', label: 'Google Display / P-Max', icon: '🖼️' },
    { id: 'meta_b2b', label: 'Meta B2B Ad', icon: '📱' }
  ]

  const angles = [
    { id: 'pain_point', label: 'Pain-Point & Risk', badge: 'Risk Mitigation' },
    { id: 'outcome_roi', label: 'Outcome & ROI', badge: 'Quantified Value' },
    { id: 'authority_social_proof', label: 'Social Proof & Gartner', badge: 'Market Leader' }
  ]

  // Find matching variant or fall back to first
  const currentVariant = variants.find(
    v => v.platform === selectedPlatform && v.angle === selectedAngle
  ) || variants[0] || null

  const handleCopy = (text, fieldName) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setActiveCopiedField(fieldName)
    if (onCopyText) onCopyText(fieldName)
    setTimeout(() => setActiveCopiedField(null), 2000)
  }

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      {/* Header Controls */}
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
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            Multi-Channel Ad Creative Studio & Live Mockups
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Pixel-accurate preview across Google Search, LinkedIn Feed, and Direct InMail
          </p>
        </div>

        {/* Device Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#111827', padding: '4px', borderRadius: '8px', border: '1px solid #1f2937' }}>
          <button
            onClick={() => setDeviceMode('desktop')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: deviceMode === 'desktop' ? '#1e293b' : 'transparent',
              color: deviceMode === 'desktop' ? '#38bdf8' : '#64748b'
            }}
          >
            🖥️ Desktop
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: deviceMode === 'mobile' ? '#1e293b' : 'transparent',
              color: deviceMode === 'mobile' ? '#38bdf8' : '#64748b'
            }}
          >
            📱 Mobile
          </button>
        </div>
      </div>

      {/* Platform & Angle Switchers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {/* Platform Selector Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {platforms.map(p => {
            const isSelected = selectedPlatform === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.15)' : '#182234',
                  color: isSelected ? '#38bdf8' : '#94a3b8'
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            )
          })}
        </div>

        {/* Copy Angle Selector Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Copy Angle:
          </span>
          {angles.map(a => {
            const isSelected = selectedAngle === a.id
            return (
              <button
                key={a.id}
                onClick={() => setSelectedAngle(a.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#a5b4fc' : '#94a3b8'
                }}
              >
                <span>{a.label}</span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {a.badge}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Preview Container */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          background: deviceMode === 'mobile' ? '#0b101b' : 'transparent',
          padding: deviceMode === 'mobile' ? '30px 10px' : '0',
          borderRadius: '16px',
          border: deviceMode === 'mobile' ? '1px dashed #22324d' : 'none'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: deviceMode === 'mobile' ? '410px' : '100%',
            transition: 'max-width 0.3s ease'
          }}
        >
          {/* MOCKUP 1: Google Search RSA */}
          {selectedPlatform === 'google_search_rsa' && (
            <div
              style={{
                background: '#ffffff',
                color: '#1f1f1f',
                padding: '20px',
                borderRadius: deviceMode === 'mobile' ? '24px' : '12px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                fontFamily: 'arial, sans-serif'
              }}
            >
              {/* SERP Header: Sponsored tag & URL breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#202124'
                  }}
                >
                  Sponsored
                </span>
                <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>·</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#1a73e8',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}
                  >
                    ✦
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#202124' }}>
                    {campaign ? new URL(campaign.target_url).hostname : 'cloudpulse.io'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#5f6368' }}>
                    › Enterprise › FinOps
                  </span>
                </div>
              </div>

              {/* SERP Headline (Blue clickable title) */}
              <div style={{ marginBottom: '8px' }}>
                <h3
                  style={{
                    fontSize: deviceMode === 'mobile' ? '1.1rem' : '1.25rem',
                    fontWeight: 400,
                    color: '#1a0dab',
                    lineHeight: 1.3,
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {currentVariant && currentVariant.headlines && currentVariant.headlines[0]
                    ? `${currentVariant.headlines[0].text} | ${currentVariant.headlines[1] ? currentVariant.headlines[1].text : 'Autonomous FinOps'} | ${currentVariant.headlines[2] ? currentVariant.headlines[2].text : 'Book Demo'}`
                    : 'Stop Cloud Waste Now | Autonomous K8s FinOps | Slash Bills 38%'}
                </h3>
              </div>

              {/* SERP Descriptions */}
              <div style={{ fontSize: '0.88rem', color: '#4d5156', lineHeight: 1.5, marginBottom: '14px' }}>
                {currentVariant && currentVariant.descriptions && currentVariant.descriptions[0]
                  ? currentVariant.descriptions[0].text
                  : 'Reclaim idle cluster capacity and right-size AWS and GCP pods automatically in 14 days.'}{' '}
                {currentVariant && currentVariant.descriptions && currentVariant.descriptions[1]
                  ? currentVariant.descriptions[1].text
                  : 'Join 500+ engineering teams slashing cloud waste without sacrificing performance.'}
              </div>

              {/* SERP Sitelinks */}
              {currentVariant && currentVariant.extensions && currentVariant.extensions.sitelinks && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: deviceMode === 'mobile' ? '1fr' : '1fr 1fr',
                    gap: '12px',
                    borderTop: '1px solid #dadce0',
                    paddingTop: '12px',
                    marginTop: '8px'
                  }}
                >
                  {currentVariant.extensions.sitelinks.map((s, sIdx) => (
                    <div key={sIdx} style={{ fontSize: '0.82rem' }}>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        style={{ color: '#1a0dab', fontWeight: 500, textDecoration: 'none', display: 'block', marginBottom: '2px' }}
                      >
                        {s.title}
                      </a>
                      <span style={{ color: '#70757a', fontSize: '0.78rem' }}>
                        {s.desc1} {s.desc2}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MOCKUP 2: LinkedIn Sponsored Feed Post */}
          {selectedPlatform === 'linkedin_sponsored_feed' && (
            <div
              style={{
                background: '#1d2226',
                color: '#ffffff',
                borderRadius: deviceMode === 'mobile' ? '24px' : '10px',
                border: '1px solid #2f353a',
                overflow: 'hidden',
                fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto'
              }}
            >
              {/* LinkedIn Post Header */}
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '4px',
                    background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 800
                  }}
                >
                  ✦
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                      {campaign ? campaign.product_name : 'CloudPulse AI'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• 1st</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#8e969d' }}>
                    52,800 followers
                  </p>
                  <p style={{ fontSize: '0.68rem', color: '#8e969d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Promoted · 🌐
                  </p>
                </div>
              </div>

              {/* LinkedIn Introductory Text */}
              <div style={{ padding: '0 16px 12px 16px', fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {(() => {
                  const rawIntro = currentVariant?.intro_text ||
                    'Is your engineering team spending more time untangling cloud bills than shipping features? Unallocated Kubernetes pods and idle compute silently bleed 30%+ of IT budgets.\n\n• Real-time pod-level cost attribution\n• Autonomous idle capacity reclamation\n• SOC2 Type II audited'
                  if (deviceMode === 'mobile' && !isIntroExpanded && rawIntro.length > 140) {
                    return (
                      <>
                        {rawIntro.slice(0, 140)}...{' '}
                        <button
                          onClick={() => setIsIntroExpanded(true)}
                          style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          ...see more
                        </button>
                      </>
                    )
                  }
                  return rawIntro
                })()}
              </div>

              {/* Image banner with dark modern gradient */}
              <div
                style={{
                  height: deviceMode === 'mobile' ? '180px' : '230px',
                  background: 'linear-gradient(135deg, #091322 0%, #152238 50%, #0c1a2e 100%)',
                  borderTop: '1px solid #2f353a',
                  borderBottom: '1px solid #2f353a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '14px',
                    background: 'rgba(6, 182, 212, 0.2)',
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    color: '#38bdf8',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.68rem',
                    fontWeight: 700
                  }}
                >
                  AUTONOMOUS FINOPS
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px', maxWidth: '85%' }}>
                  {currentVariant?.headline || 'Stop K8s Cost Overruns: Cut Cloud Bills 38%'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Reclaim Idle Cluster Capacity in 14 Days
                </p>
              </div>

              {/* LinkedIn Post Bottom Call To Action Bar */}
              <div
                style={{
                  padding: '12px 16px',
                  background: '#1b2024',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <p style={{ fontSize: '0.72rem', color: '#8e969d', textTransform: 'lowercase' }}>
                    {campaign ? new URL(campaign.target_url).hostname : 'cloudpulse.io'}
                  </p>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                    {currentVariant?.headline || 'Autonomous Kubernetes Cloud Optimization'}
                  </p>
                </div>
                <button
                  style={{
                    background: '#0a66c2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '6px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {currentVariant?.cta_button || campaign?.primary_cta || 'Request Demo'}
                </button>
              </div>
            </div>
          )}

          {/* MOCKUP 3: LinkedIn InMail Conversation */}
          {selectedPlatform === 'linkedin_inmail' && (
            <div
              style={{
                background: '#1d2226',
                color: '#ffffff',
                borderRadius: deviceMode === 'mobile' ? '24px' : '10px',
                border: '1px solid #2f353a',
                padding: '20px',
                fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto'
              }}
            >
              {/* InMail Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #2f353a', paddingBottom: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem'
                  }}
                >
                  👤
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>
                    Alex Vance
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    VP of Solutions Architecture @ {campaign ? campaign.product_name : 'CloudPulse AI'}
                  </p>
                  <span className="badge badge-cyan" style={{ fontSize: '0.62rem', marginTop: '2px' }}>
                    Sponsored InMail Message
                  </span>
                </div>
              </div>

              {/* Subject Line */}
              <div style={{ background: '#111827', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #1f2937' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  SUBJECT:
                </span>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                  {currentVariant?.subject || 'Quick question regarding {{companyName}}\'s cloud efficiency'}
                </p>
              </div>

              {/* InMail Body */}
              <div style={{ fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '20px' }}>
                {currentVariant?.body ||
                  'Hi {{firstName}},\n\nI noticed your leadership in scaling {{companyName}}\'s infrastructure stack. As teams expand their Kubernetes footprints, unallocated compute waste frequently accounts for 30%+ of monthly cloud invoices.\n\nWe dynamically rightsize workloads in real time, helping peer engineering teams reduce spend by 38% in 14 days.\n\nWould you be open to a 10-minute executive briefing next week?'}
              </div>

              {/* Quick Reply Pills */}
              <div>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>
                  INTERACTIVE QUICK REPLIES:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentVariant?.quick_replies || [
                    'Send the 5-min executive brief',
                    'Open to a quick demo next week',
                    'Not right now, follow up later'
                  ]).map((qr, idx) => (
                    <button
                      key={idx}
                      style={{
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        color: '#38bdf8',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MOCKUP 4: Google Display / P-Max */}
          {selectedPlatform === 'google_display' && (
            <div
              style={{
                background: '#ffffff',
                color: '#1f1f1f',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                fontFamily: 'arial, sans-serif'
              }}
            >
              <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>
                Google Display Responsive Asset
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a73e8', marginBottom: '6px' }}>
                {currentVariant?.short_headline || 'Cut Cloud Waste by 38%'}
              </h2>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#202124', marginBottom: '12px' }}>
                {currentVariant?.long_headline || 'Autonomous FinOps for Kubernetes: Reclaim Idle Capacity in 14 Days'}
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#5f6368', lineHeight: 1.5, marginBottom: '16px' }}>
                {currentVariant?.description || 'Enterprise-grade cost intelligence. Trusted by 500+ DevOps teams.'}
              </p>
              <button
                style={{
                  background: '#1a73e8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {campaign?.primary_cta || 'Learn More'}
              </button>
            </div>
          )}

          {/* MOCKUP 5: Meta B2B Ad */}
          {selectedPlatform === 'meta_b2b' && (
            <div
              style={{
                background: '#242526',
                color: '#e4e6eb',
                borderRadius: '12px',
                border: '1px solid #3a3b3c',
                overflow: 'hidden',
                fontFamily: 'system-ui, sans-serif'
              }}
            >
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                  ✦
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e4e6eb' }}>
                    {campaign ? campaign.product_name : 'CloudPulse AI'}
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: '#b0b3b8' }}>Sponsored · 🌐</p>
                </div>
              </div>
              <div style={{ padding: '0 16px 12px 16px', fontSize: '0.88rem', lineHeight: 1.4 }}>
                {currentVariant?.primary_text || 'Tired of ballooning AWS and GCP bills? Reclaim up to 38% of your cloud spend with autonomous Kubernetes right-sizing.'}
              </div>
              <div style={{ height: '180px', background: 'linear-gradient(135deg, #182234 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                  {currentVariant?.headline || 'Cut Cloud Waste by 38% in 14 Days'}
                </h3>
              </div>
              <div style={{ padding: '12px 16px', background: '#3a3b3c', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#b0b3b8', textTransform: 'uppercase' }}>
                    {campaign ? new URL(campaign.target_url).hostname : 'cloudpulse.io'}
                  </span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e4e6eb' }}>
                    {currentVariant?.description || 'Autonomous FinOps for DevOps'}
                  </p>
                </div>
                <button style={{ background: '#4e4f50', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600 }}>
                  {campaign?.primary_cta || 'Learn More'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copywriter Fast Clipboard Action Bar */}
      {currentVariant && (
        <div
          style={{
            marginTop: '20px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              ⚡ <strong>One-Click Clipboard:</strong>
            </span>
            <button
              className="btn-secondary"
              onClick={() => {
                const text = currentVariant.headlines?.map(h => typeof h === 'string' ? h : h.text).join('\n')
                handleCopy(text, 'headlines')
              }}
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              {activeCopiedField === 'headlines' ? '✓ Copied Headlines' : 'Copy All Headlines'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                const text = currentVariant.descriptions?.map(d => typeof d === 'string' ? d : d.text).join('\n')
                handleCopy(text, 'descriptions')
              }}
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              {activeCopiedField === 'descriptions' ? '✓ Copied Descriptions' : 'Copy Descriptions'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Ad Strength: <strong style={{ color: '#10b981' }}>{currentVariant.ad_strength_score || 88}/100</strong>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Est. CTR: <strong style={{ color: '#06b6d4' }}>{currentVariant.predicted_ctr || 4.5}%</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
