import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, Activity, AlertTriangle, Settings, FileText, LogOut, ChevronUp } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = ({ onLogout }) => {
  const [showLogout, setShowLogout] = useState(false);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Activity className={styles.icon} />
        <h2>JalNivikaran</h2>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <Map size={20} />
          <span>Live Map</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <BarChart3 size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/simulation" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <Activity size={20} />
          <span>Future Prediction</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <FileText size={20} />
          <span>Reports</span>
        </NavLink>
      </nav>

      <div className={styles.bottom}>
        {showLogout && (
          <div className={styles.logoutPopup}>
            <button className={styles.logoutBtn} onClick={onLogout}>
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        )}
        <div className={styles.user} onClick={() => setShowLogout(!showLogout)}>
          <div className={styles.avatar}>A</div>
          <div className={styles.info}>
            <p className={styles.name}>Admin User</p>
            <p className={styles.role}>Policy Maker</p>
          </div>
          <ChevronUp size={16} color="var(--text-muted)" style={{ marginLeft: 'auto', transform: showLogout ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
