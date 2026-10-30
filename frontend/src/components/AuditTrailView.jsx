import React, { useState, useEffect } from 'react'

export function AuditTrailView ({ currentRole }) {
  const [auditLogs, setAuditLogs] = useState([])
  const [complianceLogs, setComplianceLogs] = useState([])
  const [filterType, setFilterType] = useState('compliance') // 'compliance' | 'system'
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      // Fetch compliance logs
      const compRes = await fetch('/api/compliance/logs', {
        headers: { 'x-demo-role': currentRole }
      })
      if (compRes.ok) {
        const body = await compRes.json()
        setComplianceLogs(body.data || [])
      }

      // Fetch audit logs (admin only or falls back safely)
      const auditRes = await fetch('/api/audit-logs', {
        headers: { 'x-demo-role': currentRole }
      })
      if (auditRes.ok) {
        const body = await auditRes.json()
        setAuditLogs(body.data || [])
      }
    } catch (err) {
      console.error('Error fetching logs', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            Enterprise Audit Trail & Compliance Logbook
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Immutable audit record of all campaign creations, ad generation pipelines, and network policy audits
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterType('compliance')}
            className="btn-secondary"
            style={{
              fontSize: '0.76rem',
              padding: '5px 12px',
              borderColor: filterType === 'compliance' ? '#06b6d4' : '#334155',
              color: filterType === 'compliance' ? '#38bdf8' : '#94a3b8'
            }}
          >
            Policy Audits ({complianceLogs.length})
          </button>
          <button
            onClick={() => setFilterType('system')}
            className="btn-secondary"
            style={{
              fontSize: '0.76rem',
              padding: '5px 12px',
              borderColor: filterType === 'system' ? '#06b6d4' : '#334155',
              color: filterType === 'system' ? '#38bdf8' : '#94a3b8'
            }}
          >
            System Operations ({auditLogs.length})
          </button>
          <button
            onClick={fetchLogs}
            className="btn-secondary"
            style={{ fontSize: '0.76rem', padding: '5px 10px' }}
            title="Refresh logs"
          >
            🔄
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
          Loading audit records...
        </div>
      ) : filterType === 'compliance' ? (
        /* Compliance Logs Table */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>Platform</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Violations</th>
                <th style={{ padding: '10px 12px' }}>Remediation</th>
              </tr>
            </thead>
            <tbody>
              {complianceLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    No policy audits recorded yet.
                  </td>
                </tr>
              ) : (
                complianceLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f1f5f9' }}>
                      {log.platform.replace('_', ' ').toUpperCase()}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={log.is_compliant ? 'badge badge-emerald' : 'badge badge-rose'}>
                        {log.is_compliant ? 'Compliant' : 'Violation'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                      {log.violation_count > 0 ? `${log.violation_count} issues flagged` : 'Zero errors'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#38bdf8' }}>
                      {log.sanitized ? 'Auto-Sanitized ✓' : 'Direct Pass'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* System Audit Logs Table */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>Actor</th>
                <th style={{ padding: '10px 12px' }}>Action</th>
                <th style={{ padding: '10px 12px' }}>Entity Type</th>
                <th style={{ padding: '10px 12px' }}>Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    {currentRole !== 'admin'
                      ? 'System audit trail requires Administrator role. Switch role in header to inspect.'
                      : 'No system audit logs found.'}
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#38bdf8' }}>
                      {log.actor_username}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#f1f5f9' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                      {log.entity_type}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace' }}>
                      {log.entity_id || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
