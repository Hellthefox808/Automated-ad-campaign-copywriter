import React, { useState } from 'react'

export function CampaignSelector ({
  campaigns = [],
  selectedCampaign,
  onSelectCampaign,
  onCreateCampaign,
  currentRole
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    product_name: '',
    value_prop: '',
    target_url: 'https://example.com/demo',
    industry: 'cloud_infra',
    company_size: 'enterprise',
    seniority: 'c_level',
    tone: 'analytical',
    primary_cta: 'Book a Demo'
  })

  const industries = [
    { id: 'cloud_infra', label: 'Cloud Infrastructure & FinOps' },
    { id: 'cybersecurity', label: 'Cybersecurity & InfoSec' },
    { id: 'ai_mlops', label: 'Enterprise AI & Vector DB' },
    { id: 'fintech', label: 'FinTech & B2B Billing' },
    { id: 'supply_chain', label: 'Supply Chain & Logistics' },
    { id: 'enterprise_saas', label: 'Enterprise SaaS' }
  ]

  const seniorities = [
    { id: 'c_level', label: 'C-Suite (CEO, CTO, CIO, CFO)' },
    { id: 'vp_head', label: 'VP / Head of Department' },
    { id: 'director', label: 'Director of Engineering/IT' },
    { id: 'manager', label: 'Engineering / Growth Manager' },
    { id: 'practitioner', label: 'Senior Architect / Lead Engineer' }
  ]

  const companySizes = [
    { id: 'early_stage', label: 'Early-Stage (10-50 emp)' },
    { id: 'mid_market', label: 'Mid-Market (51-500 emp)' },
    { id: 'scaleup', label: 'Scale-Up (501-2000 emp)' },
    { id: 'enterprise', label: 'Enterprise Fortune 500 (2000+ emp)' }
  ]

  const tones = [
    { id: 'analytical', label: 'Analytical & Data-Driven' },
    { id: 'urgent_pain', label: 'Urgent & Problem-Agitating' },
    { id: 'consultative', label: 'Consultative & Strategic' },
    { id: 'technical_peer', label: 'Technical Peer-to-Peer' },
    { id: 'visionary', label: 'Visionary & Category Leader' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.product_name || !formData.value_prop) return
    onCreateCampaign(formData)
    setShowCreateModal(false)
    setFormData({
      title: '',
      product_name: '',
      value_prop: '',
      target_url: 'https://example.com/demo',
      industry: 'cloud_infra',
      company_size: 'enterprise',
      seniority: 'c_level',
      tone: 'analytical',
      primary_cta: 'Book a Demo'
    })
  }

  const canCreate = currentRole === 'campaign_manager' || currentRole === 'admin'

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            B2B Target Campaigns & Demographics
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Select an active campaign profile or create an audience configuration
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          disabled={!canCreate}
          title={!canCreate ? 'Requires Campaign Manager or Admin role' : 'Configure new campaign target'}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          <span>＋ New Campaign Profile</span>
        </button>
      </div>

      {/* Campaign Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {campaigns.map(c => {
          const isSelected = selectedCampaign && selectedCampaign.id === c.id
          return (
            <div
              key={c.id}
              onClick={() => onSelectCampaign(c)}
              className="glass-card"
              style={{
                padding: '14px',
                cursor: 'pointer',
                borderColor: isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)',
                background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'rgba(24, 34, 52, 0.7)',
                boxShadow: isSelected ? '0 0 16px rgba(6, 182, 212, 0.25)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>
                  {c.industry.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {c.seniority.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>
                {c.title}
              </h3>

              <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {c.value_prop}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  CTA: <strong style={{ color: '#cbd5e1' }}>{c.primary_cta}</strong>
                </span>
                <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 600 }}>
                  {isSelected ? '✓ Selected' : 'Select →'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Campaign Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '620px',
              width: '100%',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Create New B2B Campaign Profile
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CloudPulse — Enterprise FinOps & K8s Optimization"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#f8fafc',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CloudPulse Autonomous FinOps"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Target Landing Page URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Industry Vertical
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  >
                    {industries.map(i => (
                      <option key={i.id} value={i.id}>{i.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Target Seniority Level
                  </label>
                  <select
                    value={formData.seniority}
                    onChange={(e) => setFormData({ ...formData, seniority: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  >
                    {seniorities.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Company Size Tier
                  </label>
                  <select
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  >
                    {companySizes.map(cs => (
                      <option key={cs.id} value={cs.id}>{cs.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Tone of Voice
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  >
                    {tones.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Value Proposition & Key Metrics
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Real-time Kubernetes cost allocation, waste reclamation, and AWS right-sizing saving engineering teams 38% on cloud bills within 14 days."
                  value={formData.value_prop}
                  onChange={(e) => setFormData({ ...formData, value_prop: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Campaign Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

