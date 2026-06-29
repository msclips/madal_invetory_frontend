import React, { useEffect, useState } from 'react';
import { Search, ShieldAlert, Eye, X, Activity } from 'lucide-react';
import { getAuditDatatable } from '../../services/audit/auditService';

const Audit = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);
  const limit = 10;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAudits(page);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, searchQuery]);

  const fetchAudits = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await getAuditDatatable(currentPage, limit, searchQuery);
      if (response.data.status) {
        setAudits(response.data.data.data);
        setTotal(response.data.data.total);
      } else {
        setError(response.data.message || 'Failed to fetch audits');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const getEntityId = (audit: any) => {
    if (audit.new_values && audit.new_values.id) return audit.new_values.id;
    if (audit.old_values && audit.old_values.id) return audit.old_values.id;
    return 'N/A';
  };

  const getFieldChanges = (audit: any) => {
    const changes: any[] = [];
    let oldVals = audit.old_values || {};
    let newVals = audit.new_values || {};

    if (typeof oldVals === 'string') {
      try { oldVals = JSON.parse(oldVals); } catch(e) { oldVals = {}; }
    }
    if (typeof newVals === 'string') {
      try { newVals = JSON.parse(newVals); } catch(e) { newVals = {}; }
    }
    
    const allKeys = Array.from(new Set([...Object.keys(oldVals), ...Object.keys(newVals)]));
    
    allKeys.forEach(key => {
      const oldV = oldVals[key];
      const newV = newVals[key];
      
      let originalState = 'NULL / UNSET';
      let updatedState = 'NULL / UNSET';

      if (audit.action === 'Create') {
        updatedState = newV !== undefined && newV !== null ? String(newV) : 'NULL / UNSET';
      } else if (audit.action === 'Delete') {
        originalState = oldV !== undefined && oldV !== null ? String(oldV) : 'NULL / UNSET';
        updatedState = 'DELETED';
      } else {
        originalState = oldV !== undefined && oldV !== null ? String(oldV) : 'NULL / UNSET';
        updatedState = newV !== undefined && newV !== null ? String(newV) : 'NULL / UNSET';
      }

      changes.push({
        field: key,
        original: originalState,
        updated: updatedState,
        isChanged: JSON.stringify(oldV) !== JSON.stringify(newV)
      });
    });
    
    return changes;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={24} /> System Audit Logs
          </h1>
          <p style={{ margin: 0, color: 'var(--accents-6)' }}>View all system operations and modifications</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accents-5)' }} />
            <input 
              type="text" 
              placeholder="Search by module, action, or user..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }} 
            />
          </div>
        </div>

        {error && (
          <div style={{ padding: '16px 24px', color: 'var(--error-color)', background: '#fee' }}>
            {error}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px' }}>Timestamp</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px' }}>Performed By</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px' }}>Module / Entity</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px' }}>Operation</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px' }}>IP Address</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textAlign: 'right' }}>Changes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--accents-5)' }}>Loading audits...</td>
                </tr>
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--accents-5)' }}>No audits found</td>
                </tr>
              ) : (
                audits.map(audit => (
                  <tr key={audit.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>
                      {audit.date ? audit.date : new Date(audit.createdAt).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ color: '#2563eb', fontSize: '14px', fontWeight: 500 }}>{audit.username}</div>
                      <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>Super Admin</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>{audit.module}</div>
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>ID: #{getEntityId(audit)}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                        background: audit.action === 'Create' || audit.action === 'Login' ? '#22c55e' : audit.action === 'Update' ? '#3b82f6' : '#ef4444',
                        color: '#fff', textTransform: 'uppercase'
                      }}>
                        {audit.action}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{audit.ip_address || 'N/A'}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedAudit(audit)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                      >
                        <Eye size={14} /> View Changes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && total > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--accents-5)' }}>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn"
                style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)' }}
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="btn"
                style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedAudit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', width: '800px', maxWidth: '90%', borderRadius: '8px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600, fontSize: '18px' }}>
                <Activity size={20} color="#3b82f6" />
                Audit Trail Details: {selectedAudit.module} #{getEntityId(selectedAudit)}
              </div>
              <button onClick={() => setSelectedAudit(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              {/* Meta details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px dashed #cbd5e1' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Performed By</div>
                  <div style={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}>{selectedAudit.username}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Operation Type</div>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: selectedAudit.action === 'Create' || selectedAudit.action === 'Login' ? '#22c55e' : selectedAudit.action === 'Update' ? '#3b82f6' : '#ef4444', color: '#fff', textTransform: 'uppercase' }}>
                    {selectedAudit.action}
                  </span>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Timestamp</div>
                  <div style={{ color: '#0f172a', fontSize: '14px' }}>{selectedAudit.date ? selectedAudit.date : new Date(selectedAudit.createdAt).toISOString().replace('T', ' ').substring(0, 19)}</div>
                </div>

                <div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>IP Address</div>
                  <div style={{ color: '#0f172a', fontSize: '14px' }}>{selectedAudit.ip_address || 'N/A'}</div>
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                  <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>User Agent</div>
                  <div style={{ color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={selectedAudit.user_agent}>
                    {selectedAudit.user_agent || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Field level changes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>
                <Activity size={16} /> Field-Level Modification Log
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#e2e8f0' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155', fontSize: '12px' }}>FIELD</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#dc2626', fontSize: '12px' }}>ORIGINAL STATE</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a', fontSize: '12px' }}>UPDATED STATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFieldChanges(selectedAudit).length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No changes recorded in JSON</td>
                      </tr>
                    ) : (
                      getFieldChanges(selectedAudit).map((change, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                          <td style={{ padding: '12px 16px', color: '#334155', fontSize: '14px', fontWeight: 500 }}>{change.field}</td>
                          <td style={{ padding: '12px 16px', color: change.original === 'NULL / UNSET' ? '#94a3b8' : '#64748b', fontSize: '14px' }}>{change.original}</td>
                          <td style={{ padding: '12px 16px', color: change.updated === 'NULL / UNSET' ? '#94a3b8' : '#16a34a', fontSize: '14px' }}>{change.updated}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedAudit(null)} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
