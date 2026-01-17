import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from './MainLayout.module.css';

const MainLayout = ({ onLogout }) => {
    return (
        <div className={styles.layout}>
            <Sidebar onLogout={onLogout} />
            <main className={styles.main}>
                <div className={styles.container}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
