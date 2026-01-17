import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
// import { STATIONS, ALERTS } from '../data/dummyData'; // REMOVED
import API from '../services/api'; // Import API service
import {
    Droplets,
    Activity,
    AlertTriangle,
    Zap,
    Scale,
    TrendingUp,
    Map as MapIcon,
    FlaskConical,
    Bell
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    
    // State for Real Data
    const [stats, setStats] = useState({
        avg_level: 0,
        critical_count: 0,
        recharge_rate: 0,
        supply_gap: 0
    });
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Nearest Station State
    const [locationData, setLocationData] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const handleLocateMe = () => {
        setLocationLoading(true);
        setLocationError(null);
        
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const res = await API.get('/api/water-level/nearest', {
                    params: { lat: latitude, lon: longitude }
                });
                setLocationData(res.data);
            } catch (err) {
                console.error("Failed to fetch nearest station", err);
                setLocationError("Failed to fetch nearest station info");
            } finally {
                setLocationLoading(false);
            }
        }, (err) => {
            console.error("Geolocation error", err);
            setLocationError("Unable to retrieve your location");
            setLocationLoading(false);
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await API.get('/api/dashboard/stats');
                setStats(statsRes.data);

                const stationsRes = await API.get('/api/map/stations');
                setStations(stationsRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const criticalCount = stats.critical_count;
    const avgLevel = stats.avg_level;

    return (
        <div className={styles.dashboard}>

            {/* 1. Header Section - Greeting & Profile */}
            <header className={styles.header}>
                <div className={styles.welcome}>
                    <p className={styles.date}>Monday, Oct 24</p>
                    <h1 className={styles.pageTitle}>Research Overview</h1>
                </div>
                <div className={styles.actions} style={{ position: 'relative' }}>
                    <button className={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={20} />
                        <span className={styles.badge} />
                    </button>

                    {showNotifications && (
                        <div className={styles.notificationPopup}>
                            <div className={styles.notificationHeader}>
                                <h4>Notifications</h4>
                                <button className={styles.clearAll}>Clear All</button>
                            </div>
                            <div className={styles.notificationList}>
                                <div className={styles.notificationItem}>
                                    <AlertTriangle size={16} className={styles.notiIcon} style={{ color: 'var(--accent-critical)' }} />
                                    <div className={styles.notiContent}>
                                        <div className={styles.notiMessage}>Critical depletion detected in Zone B</div>
                                        <div className={styles.notiTime}>10 mins ago</div>
                                    </div>
                                </div>
                                <div className={styles.notificationItem}>
                                    <Droplets size={16} className={styles.notiIcon} />
                                    <div className={styles.notiContent}>
                                        <div className={styles.notiMessage}>New sensor data received from Gujarat Station</div>
                                        <div className={styles.notiTime}>1 hour ago</div>
                                    </div>
                                </div>
                                <div className={styles.notificationItem}>
                                    <Zap size={16} className={styles.notiIcon} />
                                    <div className={styles.notiContent}>
                                        <div className={styles.notiMessage}>Weekly Report generated automatically</div>
                                        <div className={styles.notiTime}>5 hours ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* 2. Critical Alert Banner */}
            <div className={styles.alertBanner}>
                <div className={styles.alertContent}>
                    <div className={styles.alertHeader}>
                        <AlertTriangle size={20} className={styles.alertIcon} />
                        <span className={styles.alertTitle}>CRITICAL ALERT</span>
                    </div>
                    <h2>Abnormal Decline Detected</h2>
                    <p>3 stations in the Northern Basin show a -1.2m deviation. Recharge potential is failing to meet current demand.</p>
                    <button className={styles.alertAction} onClick={() => navigate('/analytics')}>ANALYZE ANOMALIES →</button>
                </div>
                <div className={styles.alertDecoration} />
            </div>

            {/* 3. Key Metrics Grid */}
            <div className={styles.metricsGrid}>
                <StatCard
                    title="Avg Level"
                    value={avgLevel}
                    unit="m"
                    icon={Droplets}
                    trend={-5.2}
                    type="default"
                />
                <StatCard
                    title="Critical"
                    value={criticalCount}
                    icon={Activity}
                    subtext="+2 new today"
                    type="critical"
                />
                <StatCard
                    title="Recharge"
                    value={stats.recharge_rate}
                    unit="%"
                    icon={Zap}
                    type="safe"
                    subtext="Optimal zone"
                />
                <StatCard
                    title="Supply Gap"
                    value={stats.supply_gap}
                    unit="%"
                    icon={Scale}
                    type="warning"
                    subtext="Moderate Deficit"
                />
            </div>

            {/* 4. Research Tools & Map Split */}
            <div className={styles.splitSection}>
                <div className={styles.toolsColumn}>
                    <h3 className={styles.sectionTitle}>Research Tools</h3>
                    
                    {/* My Location Card */}
                    <div className={styles.toolList} style={{ marginBottom: '2rem' }}>
                         <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #E5E0D8' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, fontSize: '1rem', color: '#1A1A1A' }}>My Water Level</h4>
                                <button 
                                    onClick={handleLocateMe} 
                                    disabled={locationLoading}
                                    style={{ 
                                        background: '#3E5C76', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' 
                                    }}
                                >
                                    <MapIcon size={16} />
                                    {locationLoading ? 'Locating...' : 'Check Now'}
                                </button>
                            </div>
                            
                            {locationError && <p style={{ color: '#E53935', fontSize: '0.9rem', margin: 0 }}>{locationError}</p>}
                            
                            {locationData && !loading && (
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#666', fontSize: '0.9rem' }}>Station:</span>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>{locationData.station_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#666', fontSize: '0.9rem' }}>Distance:</span>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{locationData.distance_km} km</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F5F5F5', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                                        <span style={{ color: '#333', fontWeight: 500 }}>Water Level</span>
                                        <span style={{ 
                                            fontSize: '1.2rem', 
                                            fontWeight: 700, 
                                            color: locationData.status === 'Critical' ? '#E53935' : '#4CA965' 
                                        }}>
                                            {locationData.water_level} m
                                        </span>
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>

                    <div className={styles.toolList}>
                        <button className={styles.toolBtn} onClick={() => navigate('/analytics')}>
                            <TrendingUp size={20} />
                            <span>View Historical Trends</span>
                        </button>
                        <button className={styles.toolBtn} onClick={() => navigate('/map')}>
                            <MapIcon size={20} />
                            <span>Explore DWLR Stations</span>
                        </button>
                    </div>

                    <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Recent Anomalies</h3>
                    <div className={styles.anomList}>
                        {stations.slice(0, 2).map((s, i) => (
                            <div key={s.id} className={styles.anomItem}>
                                <div className={styles.anomIconLocation} />
                                <div className={styles.anomInfo}>
                                    <span className={styles.anomId}>{s.id}</span>
                                    <span className={styles.anomName}>{s.name}</span>
                                </div>
                                <div className={styles.anomValue}>
                                    <span className={i === 0 ? styles.valCritical : styles.valSafe}>
                                        {i === 0 ? '-0.85m' : '+0.12m'}
                                    </span>
                                    <span className={styles.timeAgo}>2h ago</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.mapColumn}>
                    <div className={styles.mapCard}>
                        <div className={styles.mapHeaderOverlay}>
                            <h3>Regional Map</h3>
                            <span className={styles.liveIndicator}>Live</span>
                        </div>
                        <MapContainer center={[8.3, 77.5]} zoom={9} style={{ height: '100%', width: '100%', borderRadius: '24px' }}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; OpenStreetMap &copy; CARTO'
                            />
                            {stations.map((station) => (
                                <CircleMarker
                                    key={station.id}
                                    center={[station.lat, station.lng]}
                                    radius={10}
                                    pathOptions={{
                                        color: '#fff',
                                        weight: 2,
                                        fillColor: station.status === 'Critical' ? '#E53935' : station.status === 'Safe' ? '#4CA965' : '#FFA000',
                                        fillOpacity: 1
                                    }}
                                >
                                    <Popup>
                                        <strong>{station.name}</strong><br />
                                        Level: {station.level} m bgl
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
