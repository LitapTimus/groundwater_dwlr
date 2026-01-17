import React from 'react';
import { ALERTS } from '../data/dummyData';
import {
    Bell, AlertTriangle, Info, CheckCircle, FileText, Download, Filter
} from 'lucide-react';
import styles from './Reports.module.css';

// Extended mock notifications for better visual
const ALL_NOTIFICATIONS = [
    ...ALERTS,
    { id: 4, type: 'success', message: 'System maintenance completed successfully.', date: '2025-04-10' },
    { id: 5, type: 'info', message: 'New data available for Southern Basin region.', date: '2025-04-08' },
    { id: 6, type: 'warning', message: 'Station S002 sensor reporting intermittent signal.', date: '2025-04-05' },
    { id: 7, type: 'critical', message: 'Unauthorized access attempt detected on Station S005.', date: '2025-04-01' },
];

const REPORTS_FILES = [
    { id: 1, name: 'Q1 2025 Groundwater Assessment', date: 'April 15, 2025', size: '2.4 MB' },
    { id: 2, name: 'Recharge Potential Analysis - Zone A', date: 'March 28, 2025', size: '4.1 MB' },
    { id: 3, name: 'Critical Zones Mitigation Plan', date: 'March 10, 2025', size: '1.2 MB' },
    { id: 4, name: 'Annual Water Resource Audit 2024', date: 'Jan 15, 2025', size: '8.5 MB' },
];

const getIcon = (type) => {
    switch (type) {
        case 'critical': return <AlertTriangle size={20} />;
        case 'warning': return <AlertTriangle size={20} />;
        case 'success': return <CheckCircle size={20} />;
        default: return <Info size={20} />;
    }
};

const handleDownload = (file) => {
    // Simulate report content generation
    const content = `
REPORT: ${file.name}
DATE: ${file.date}
SIZE: ${file.size}
--------------------------------------------------
This is a generated report file for ${file.name}.
It contains detailed analysis and metrics regarding groundwater levels.

[In a real application, this would be a comprehensive PDF or Excel file.]
    `;

    // Create blob and force download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

const Reports = () => {
    return (
        <div className={styles.reportsPage}>
            <header className={styles.header}>
                <h1 className={styles.title}>System Reports & Notifications</h1>
                <p className={styles.subtitle}>Comprehensive log of system alerts, events, and downloadable audits.</p>
            </header>

            <div className={styles.grid}>

                {/* Notifications Column */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Bell size={24} color="var(--primary)" />
                            <h2 className={styles.cardTitle}>Notifications Log</h2>
                        </div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className={styles.notificationList}>
                        {ALL_NOTIFICATIONS.map(note => (
                            <div key={note.id} className={styles.notificationItem}>
                                <div className={`${styles.iconWrapper} ${styles[note.type]}`}>
                                    {getIcon(note.type)}
                                </div>
                                <div className={styles.content}>
                                    <p className={styles.message}>{note.message}</p>
                                    <div className={styles.meta}>
                                        <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>{note.type}</span>
                                        <span>•</span>
                                        <span>{note.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Downloads Column */}
                <section className={styles.card} style={{ height: 'fit-content' }}>
                    <div className={styles.cardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FileText size={24} color="var(--primary)" />
                            <h2 className={styles.cardTitle}>Generated Reports</h2>
                        </div>
                    </div>

                    <div className={styles.reportList}>
                        {REPORTS_FILES.map(file => (
                            <div key={file.id} className={styles.reportItem}>
                                <div className={styles.reportInfo}>
                                    <div className={styles.fileIcon}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <span className={styles.reportName}>{file.name}</span>
                                        <span className={styles.reportDate}>{file.date} • {file.size}</span>
                                    </div>
                                </div>
                                <button
                                    className={styles.downloadBtn}
                                    title="Download Report"
                                    onClick={() => handleDownload(file)}
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-app)', borderRadius: '12px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Custom Report Generator</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Select parameters to generate a new comprehensive analysis.</p>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => {
                                alert("Generating custom report... This will be available in the list shortly.");
                                // In a real app, this would trigger an API call
                            }}
                        >
                            Generate New Report
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Reports;
