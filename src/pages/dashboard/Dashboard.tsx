import React, { useEffect, useState } from 'react';
import { Package, Users, DollarSign, Activity, Search, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../../services/dashboard/dashboardService';
import { getLedgerDatatable } from '../../services/ledger/ledgerService';
import { getItemAutocomplete } from '../../services/item/itemService';
import { Select } from '../../components/ui/Select';
import { getItem, deleteDB } from '../../utils/db';

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockReport, setStockReport] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    revenue: 0,
    active: 0
  });

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [ledgers, setLedgers] = useState<any[]>([]);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerItemId, setLedgerItemId] = useState('');
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const ledgerLimit = 10;

  useEffect(() => {
    const fetchDropdownItems = async () => {
      try {
        const res = await getItemAutocomplete();
        if (res.data.status) {
          setItemsList(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch items for dropdown", error);
      }
    };
    fetchDropdownItems();
  }, []);

  const fetchLedger = async () => {
    setLedgerLoading(true);
    try {
      const res = await getLedgerDatatable(ledgerPage, ledgerLimit, ledgerSearch, fromDate, toDate, ledgerItemId);
      if (res.data.status) {
        setLedgers(res.data.data.data);
        setLedgerTotal(res.data.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLedger();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [ledgerPage, ledgerSearch, fromDate, toDate, ledgerItemId]);

  const exportToCSV = async () => {
    try {
      const res = await getLedgerDatatable(1, 100000, ledgerSearch, fromDate, toDate, ledgerItemId);
      if (res.data.status) {
        const data = res.data.data.data;
        if (data.length === 0) {
          alert('No data to export');
          return;
        }

        let csvContent = "Date,Type,Item,Inward Qty,Outward Qty\n";
        data.forEach((row: any) => {
          csvContent += `${row.date},"${row.type}","${row.item_name || ''}",${row.inward_qty},${row.outward_qty}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Ledger_Report_${fromDate}_to_${toDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Failed to export', err);
      alert('Failed to export CSV');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await getDashboardData();
        const data = response.data;

        if (data.status) {
          setUsername(data.data.username);
          setStats({
            products: data.data.stockReport?.length || 0,
            customers: data.data.customers || 892,
            revenue: data.data.revenue || 45200,
            active: data.data.active || 34
          });
          setStockReport(data.data.stockReport || []);
        } else {
          setError(data.message || 'Failed to load dashboard data');
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          await deleteDB();
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Network error. Could not connect to the server.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: 'var(--error-color)', padding: '24px', background: '#fee', borderRadius: '8px' }}>{error}</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1>Welcome, {username}</h1>
        </div>
      </div>
    
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', margin: 0 }}>Stock</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', paddingBottom: '32px' }}>
        {stockReport.map(item => (
          <div key={item.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accents-6)' }}>{item.name}</span>
              <Package size={16} color="var(--accents-5)" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-1px', color: item.closing_stock > 0 ? 'var(--foreground-color)' : 'var(--error-color)' }}>
              {Number(item.closing_stock).toFixed(3)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--accents-5)', marginTop: '8px' }}>Item #{item.id}</div>
          </div>
        ))}
        {stockReport.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--accents-5)', padding: '48px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
            No stock data available.
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
        <h2 style={{ fontSize: '18px', margin: 0 }}>Ledger Report</h2>
        <button className="btn btn-secondary" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--background-color)', border: '1px solid var(--border-color)' }}>
          <Download size={16} /> Export to CSV
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--accents-5)', marginRight: '8px' }}>Select Item</label>
              <div style={{ width: '200px' }}>
                <Select 
                  value={ledgerItemId}
                  onChange={(value) => setLedgerItemId(value as string)}
                  options={[
                    { value: '', label: 'All Items' },
                    ...itemsList.map(item => ({ value: String(item.id), label: item.name }))
                  ]}
                  placeholder="All Items"
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--accents-5)', marginRight: '8px' }}>From Date</label>
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--accents-5)', marginRight: '8px' }}>To Date</label>
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--accents-1)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--accents-6)' }}>Date</th>
                <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--accents-6)' }}>Type</th>
                <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--accents-6)' }}>Item</th>
                <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--accents-6)' }}>Inward Qty</th>
                <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--accents-6)' }}>Outward Qty</th>
              </tr>
            </thead>
            <tbody>
              {ledgerLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--accents-5)' }}>Loading ledger data...</td>
                </tr>
              ) : ledgers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--accents-5)' }}>No ledger data found.</td>
                </tr>
              ) : (
                ledgers.map((row: any) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 500 }}>{row.date}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                        background: row.type === 'Opening Stock' ? '#eef2ff' : row.type === 'Receipt' ? '#ecfdf5' : '#fef2f2',
                        color: row.type === 'Opening Stock' ? '#4f46e5' : row.type === 'Receipt' ? '#10b981' : '#ef4444'
                      }}>
                        {row.type}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>{row.item_name}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--success-color)', fontWeight: 500 }}>{row.inward_qty > 0 ? row.inward_qty : '-'}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--error-color)', fontWeight: 500 }}>{row.outward_qty > 0 ? row.outward_qty : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!ledgerLoading && ledgerTotal > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--accents-5)' }}>
              Showing {(ledgerPage - 1) * ledgerLimit + 1} to {Math.min(ledgerPage * ledgerLimit, ledgerTotal)} of {ledgerTotal} results
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                disabled={ledgerPage === 1}
                className="btn"
                style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', color: ledgerPage === 1 ? 'var(--accents-3)' : 'var(--foreground-color)' }}
              >
                Previous
              </button>
              <button 
                onClick={() => setLedgerPage(p => p + 1)}
                disabled={ledgerPage >= Math.ceil(ledgerTotal / ledgerLimit)}
                className="btn"
                style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', color: ledgerPage >= Math.ceil(ledgerTotal / ledgerLimit) ? 'var(--accents-3)' : 'var(--foreground-color)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
