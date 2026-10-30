import React from 'react'

export function NavigationHeader ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  isGenerating
}) {
  const roles = [
    { id: 'copywriter', label: 'Copywriter (Author)', badge: 'Draft & Tune' },
    { id: 'campaign_manager', label: 'Campaign Manager', badge: 'Approve & Export' },
    { id: 'admin', label: 'Administrator', badge: 'Full Access' }
  ]

  const tabs = [
    { id: 'studio', label: 'Ad Campaign Studio', icon: '⚡' },
    { id: 'previewers', label: 'Multi-Channel Mockups', icon: '👁️' },
    { id: 'compliance', label: 'Policy & Auto-Sanitizer', icon: '🛡️' },
    { id: 'analytics', label: 'Predictive Telemetry', icon: '📈' },
    { id: 'export', label: 'Omnichannel Export', icon: '📥' },
    { id: 'audit', label: 'Audit Trail', icon: '📜' }
  ]

  return (
    <header
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
              fontSize: '1.2rem',
              fontWeight: 800
            }}
          >
            ✦
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                AdCopyCraft<span style={{ color: '#06b6d4' }}>.AI</span>
              </h1>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                v1.2 ENTERPRISE
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              B2B Ad Copywriter & Demographic Targeting Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#111827', padding: '4px', borderRadius: '10px', border: '1px solid #1f2937' }}>
          {tabs.map(t => {
            const isActive = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.2) 100%)' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  boxShadow: isActive ? 'inset 0 0 0 1px rgba(6, 182, 212, 0.35)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
        </nav>

        {/* RBAC Persona Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
              ACTIVE PERSONA (RBAC)
            </span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              style={{
                background: '#182234',
                color: '#38bdf8',
                border: '1px solid #25334c',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.label} ({r.badge})
                </option>
              ))}
            </select>
          </div>

          {/* System status pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981'
              }}
            />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399' }}>
              ONLINE (WAL)
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

