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
            products: data.data.products || 124,
            customers: data.data.customers || 892,
            revenue: data.data.revenue || 45200,
            active: data.data.active || 34
          });
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
          <p style={{ margin: 0 }}>Overview of your inventory and metrics.</p>
        </div>
        <button className="btn btn-primary">Download Report</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accents-6)' }}>Total Products</span>
            <Package size={16} color="var(--accents-5)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-1px' }}>
            {stats.products}
          </div>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accents-6)' }}>Active Customers</span>
            <Users size={16} color="var(--accents-5)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-1px' }}>
            {stats.customers}
          </div>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accents-6)' }}>Total Revenue</span>
            <DollarSign size={16} color="var(--accents-5)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-1px' }}>
            ${stats.revenue.toLocaleString()}
          </div>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accents-6)' }}>Active Orders</span>
            <Activity size={16} color="var(--accents-5)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-1px' }}>
            {stats.active}
          </div>
        </div>
      </div>
      
      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '16px', margin: 0 }}>Recent Activity</h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: item !== 3 ? '1px solid var(--accents-2)' : 'none' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accents-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>New order received</div>
                  <div style={{ fontSize: '12px', color: 'var(--accents-5)' }}>Order #100{item} from John Doe</div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accents-5)' }}>
                  {item * 2} hours ago
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
