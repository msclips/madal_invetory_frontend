import React, { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Box, LogOut, LayoutDashboard, Package, 
  Users, ShoppingCart, FileText, UserCheck, 
  Settings, Receipt, PackageMinus, ShieldAlert
} from 'lucide-react';
import { logoutUser } from '../services/auth/authService';
import { getItem, deleteDB } from '../utils/db';

const Layout = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Admin User');
  const [isSuperUser, setIsSuperUser] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const user = await getItem('user');
      if (user) {
        if (user.username) setUsername(user.username);
        if (Number(user.super_user) === 1) setIsSuperUser(true);
      }
    };
    
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      await deleteDB();
      navigate('/login');
    }
  };

  return (
    <div className="app-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Box size={24} />
          <span>Inventory</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          
          <NavLink to="/items" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Package size={18} />
            Items
          </NavLink>
          
          <NavLink to="/opening-stock" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Box size={18} />
            Opening Stock
          </NavLink>
          
          <NavLink to="/item-inwards" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Package size={18} />
            Item Inwards
          </NavLink>
          
          <NavLink to="/item-outwards" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <PackageMinus size={18} />
            Item Outwards
          </NavLink>
          
          {isSuperUser && (
            <NavLink to="/audit" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={18} />
              System Audit
            </NavLink>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="nav-header">
          <div className="container nav-container" style={{ padding: '0 48px' }}>
            <div className="nav-brand" style={{ visibility: 'hidden' }}>
              {/* Placeholder to keep alignment if needed, or remove completely */}
              Inventory
            </div>
            <div className="nav-links">
              <span style={{ fontSize: '14px', color: 'var(--accents-6)' }}>{username}</span>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0 12px', height: '32px' }}>
                <LogOut size={16} style={{ marginRight: '6px' }} />
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
