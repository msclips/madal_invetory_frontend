import React, { useEffect, useState } from 'react';
import { Package, Users, DollarSign, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../services/dashboard/dashboardService';
import { getItem, deleteDB } from '../utils/db';

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
        <h2 style={{ fontSize: '18px', margin: 0 }}>Stock Report (Closing Stock)</h2>
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
    </div>
  );
};

export default Dashboard;
