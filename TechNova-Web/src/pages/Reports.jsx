
import React, { useState, useEffect } from 'react';
import { ALERTS } from '../data/dummyData';
import {
    Bell, AlertTriangle, Info, CheckCircle, FileText, Download, Filter
} from 'lucide-react';
import styles from './Reports.module.css';
import API from '../services/api';

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

const Reports = () => {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState('');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const res = await API.get('/api/stations'); // Make sure this endpoint exists or mock list
                // If /api/stations doesn't exist, we might need to fallback. 
                // But previously we implemented /api/stations in data_loader/app.py? 
                // Let's check. Yes, /api/map/stations exists. /api/stations might not.
                // Let's use /api/map/stations which returns list of stations.
                
                // Correction: Use /api/map/stations as it is proven to work
                 const resMap = await API.get('/api/map/stations');
                 setStations(resMap.data);
                 if (resMap.data.length > 0) setSelectedStation(resMap.data[0].id);
                 
            } catch (error) {
                console.error("Failed to fetch stations", error);
                alert("Debug Error: " + error.message);
                
                // Fallback using raw fetch
                try {
                     const rawRes = await fetch("http://localhost:8001/api/map/stations");
                     const rawData = await rawRes.json();
                     setStations(rawData);
                     if (rawData.length > 0) setSelectedStation(rawData[0].id);
                } catch (e2) {
                    alert("Fallback Fetch Failed: " + e2.message);
                }
            }
        };
        fetchStations();
    }, []);

    const handleDownloadMock = (file) => {
        alert("Downloading mock report: " + file.name);
    };

    const handleGenerateReport = async () => {
        if (!selectedStation) return;
        setGenerating(true);
        try {
            const response = await API.get(`/api/reports/generate?station_id=${selectedStation}`, {
                responseType: 'blob',
            });
            
            // Create Blob URL
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Station_Report_${selectedStation}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
        } catch (error) {
            console.error("Failed to generate report", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

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
                                    onClick={() => handleDownloadMock(file)}
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-app)', borderRadius: '12px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Custom Report Generator</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Select parameters to generate a new comprehensive analysis.
                        </p>
                        
                        <div style={{marginBottom: '1rem'}}>
                            {stations.length === 0 ? (
                                <div style={{padding: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: '8px'}}>
                                    Loading stations...
                                </div>
                            ) : (
                                <select 
                                    value={selectedStation} 
                                    onChange={(e) => setSelectedStation(e.target.value)}
                                    style={{
                                        width: '100%', 
                                        padding: '0.75rem', 
                                        borderRadius: '8px', 
                                        border: '1px solid #ddd',
                                        fontSize: '0.9rem',
                                        backgroundColor: '#ffffff',
                                        color: '#333333',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="" disabled>Select Station to Analyze</option>
                                    {stations.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ 
                                width: '100%', 
                                padding: '0.75rem', 
                                backgroundColor: 'var(--primary)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                opacity: generating ? 0.7 : 1
                            }}
                            onClick={handleGenerateReport}
                            disabled={generating || !selectedStation}
                        >
                            {generating ? (
                                <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem'}}>
                                    Generating... 
                                </span>
                            ) : (
                                <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem'}}>
                                    <FileText size={18}/> Generate PDF Report
                                </span>
                            )}
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Reports;
