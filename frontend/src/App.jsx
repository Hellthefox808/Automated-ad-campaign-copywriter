import React, { useState, useEffect } from 'react'
import { NavigationHeader } from './components/NavigationHeader'
import { ParticleTopologyCanvas } from './components/ParticleTopologyCanvas'
import { CampaignSelector } from './components/CampaignSelector'
import { AdMockupViewer } from './components/AdMockupViewer'
import { ComplianceAuditor } from './components/ComplianceAuditor'
import { PredictiveAnalyticsView } from './components/PredictiveAnalyticsView'
import { ExportCenterView } from './components/ExportCenterView'
import { AuditTrailView } from './components/AuditTrailView'

export function App () {
  const [activeTab, setActiveTab] = useState('studio') // 'studio' | 'previewers' | 'compliance' | 'analytics' | 'export' | 'audit'
  const [currentRole, setCurrentRole] = useState('copywriter') // 'copywriter' | 'campaign_manager' | 'admin'

  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [variants, setVariants] = useState([])
  const [selectedPlatform, setSelectedPlatform] = useState('google_search_rsa')
  const [selectedAngle, setSelectedAngle] = useState('pain_point')

  const [isGenerating, setIsGenerating] = useState(false)
  const [isAutoFixing, setIsAutoFixing] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns', {
        headers: { 'x-demo-role': currentRole }
      })
      if (res.ok) {
        const body = await res.json()
        setCampaigns(body.data || [])
        if (body.data && body.data.length > 0 && !selectedCampaign) {
          handleSelectCampaign(body.data[0])
        }
      }
    } catch (err) {
      console.error('Failed to fetch campaigns', err)
    }
  }

  const handleSelectCampaign = async (camp) => {
    setSelectedCampaign(camp)
    try {
      const res = await fetch(`/api/campaigns/${camp.id}/variants`, {
        headers: { 'x-demo-role': currentRole }
      })
      if (res.ok) {
        const body = await res.json()
        if (body.data && body.data.length > 0) {
          setVariants(body.data)
        } else {
          // If no stored variants yet, auto-generate them
          generateVariantsForCampaign(camp, selectedPlatform)
        }
      }
    } catch (err) {
      console.error('Failed to fetch variants', err)
    }
  }

  const generateVariantsForCampaign = async (camp = selectedCampaign, platform = selectedPlatform) => {
    if (!camp) return
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/campaigns/${camp.id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentRole
        },
        body: JSON.stringify({ platform })
      })

      if (res.ok) {
        const body = await res.json()
        setVariants(body.data.variants || [])
        showToast(`⚡ Generated 3 ad variants for ${camp.title}`)
      } else {
        showToast('Generation failed: please verify permissions')
      }
    } catch (err) {
      console.error('Generation error', err)
      showToast('Error connecting to ad generation engine')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateCampaign = async (formData) => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentRole
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const body = await res.json()
        setCampaigns([body.data, ...campaigns])
        handleSelectCampaign(body.data)
        showToast('✓ Campaign profile created successfully')
      } else {
        const err = await res.json()
        showToast(`Error: ${err.error}`)
      }
    } catch (err) {
      console.error('Failed to create campaign', err)
      showToast('Network error creating campaign')
    }
  }

  const handleAutoFix = async () => {
    const currentVariant = variants.find(
      v => v.platform === selectedPlatform && v.angle === selectedAngle
    ) || variants[0]

    if (!currentVariant) return

    setIsAutoFixing(true)
    try {
      const res = await fetch('/api/compliance/autofix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentRole
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          variant: currentVariant
        })
      })

      if (res.ok) {
        const body = await res.json()
        const updated = {
          ...currentVariant,
          ...body.data.sanitized,
          compliance: body.data.compliance,
          telemetry: body.data.telemetry
        }

        setVariants(variants.map(v => (v.id === currentVariant.id ? updated : v)))
        showToast('✓ 1-Click Auto-Fix applied: Copy sanitized against ad network policies')
      }
    } catch (err) {
      console.error('Auto fix error', err)
      showToast('Failed to auto-fix copy')
    } finally {
      setIsAutoFixing(false)
    }
  }

  const currentVariant = variants.find(
    v => v.platform === selectedPlatform && v.angle === selectedAngle
  ) || variants[0] || null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <NavigationHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        isGenerating={isGenerating}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        {/* Dynamic 4D Topology Visualizer Bar */}
        <section style={{ marginBottom: '24px' }}>
          <ParticleTopologyCanvas
            isGenerating={isGenerating}
            activeDemographic={selectedCampaign ? selectedCampaign.seniority : 'c_level'}
          />
        </section>

        {/* View Switcher based on active tab */}
        {activeTab === 'studio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top row: Campaign Selector */}
            <CampaignSelector
              campaigns={campaigns}
              selectedCampaign={selectedCampaign}
              onSelectCampaign={handleSelectCampaign}
              onCreateCampaign={handleCreateCampaign}
              currentRole={currentRole}
            />

            {/* Middle Action Bar: Generate Ad Copies */}
            {selectedCampaign && (
              <div
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                    Active Target: <span style={{ color: '#06b6d4' }}>{selectedCampaign.title}</span>
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Industry: {selectedCampaign.industry.replace('_', ' ').toUpperCase()} | Seniority: {selectedCampaign.seniority.replace('_', ' ').toUpperCase()} | Tone: {selectedCampaign.tone}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-primary"
                    onClick={() => generateVariantsForCampaign(selectedCampaign, selectedPlatform)}
                    disabled={isGenerating}
                  >
                    <span>{isGenerating ? 'Synthesizing Prompts...' : '⚡ Generate 3 Copy Angles'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Row: Ad Mockup Viewer */}
            <AdMockupViewer
              campaign={selectedCampaign}
              variants={variants}
              selectedPlatform={selectedPlatform}
              setSelectedPlatform={setSelectedPlatform}
              selectedAngle={selectedAngle}
              setSelectedAngle={setSelectedAngle}
              onCopyText={(field) => showToast(`✓ Copied ${field} to clipboard`)}
            />
          </div>
        )}

        {activeTab === 'previewers' && (
          <AdMockupViewer
            campaign={selectedCampaign}
            variants={variants}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            selectedAngle={selectedAngle}
            setSelectedAngle={setSelectedAngle}
            onCopyText={(field) => showToast(`✓ Copied ${field} to clipboard`)}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceAuditor
            variant={currentVariant}
            platform={selectedPlatform}
            onAutoFix={handleAutoFix}
            isAutoFixing={isAutoFixing}
          />
        )}

        {activeTab === 'analytics' && (
          <PredictiveAnalyticsView
            variant={currentVariant}
            campaign={selectedCampaign}
          />
        )}

        {activeTab === 'export' && (
          <ExportCenterView
            campaign={selectedCampaign}
            variants={variants}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView
            currentRole={currentRole}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid #06b6d4',
            color: '#f8fafc',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(6, 182, 212, 0.4)',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 999,
            animation: 'pulseGlow 2s infinite'
          }}
        >
          <span>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '16px 24px',
          background: '#090d16',
          fontSize: '0.74rem',
          color: '#64748b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          AdCopyCraft AI — Enterprise B2B Marketing Automation Suite
        </div>
        <div>
          Engineered with React 18, Vite, Node.js (WAL SQLite) & Prometheus Observability
        </div>
      </footer>
    </div>
  )
}

