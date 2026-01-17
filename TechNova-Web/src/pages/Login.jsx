import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Microscope, ArrowRight } from 'lucide-react';
import styles from './Login.module.css';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    const handleLogin = () => {
        if (selectedRole) {
            onLogin(selectedRole);
            navigate(selectedRole === 'researcher' ? '/' : '/farmer');
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Welcome to JalNivikaran</h1>
                    <p>Select your role to access the platform</p>
                </div>

                <div className={styles.roleSelection}>
                    <button
                        className={`${styles.roleCard} ${selectedRole === 'researcher' ? styles.active : ''}`}
                        onClick={() => setSelectedRole('researcher')}
                    >
                        <div className={styles.iconWrapper}>
                            <Microscope size={32} />
                        </div>
                        <h3>Researcher / Policy Maker</h3>
                        <p>Access advanced analytics, station data, and simulations.</p>
                    </button>

                    <button
                        className={`${styles.roleCard} ${selectedRole === 'farmer' ? styles.active : ''}`}
                        onClick={() => setSelectedRole('farmer')}
                    >
                        <div className={styles.iconWrapper}>
                            <Sprout size={32} />
                        </div>
                        <h3>Farmer</h3>
                        <p>View local water availability, crop advisories, and rainfall alerts.</p>
                    </button>
                </div>

                <button
                    className={styles.loginBtn}
                    disabled={!selectedRole}
                    onClick={handleLogin}
                >
                    <span>Continue to Dashboard</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Login;
