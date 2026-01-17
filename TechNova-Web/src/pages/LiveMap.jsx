import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Search, Filter, SlidersHorizontal, ArrowUpRight, ArrowDownRight, Minus, X, Droplets, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { STATIONS } from '../data/dummyData'; // REMOVED
import API from '../services/api';
import styles from './LiveMap.module.css';

// Component to handle map centering when a station is selected
const MapUpdater = ({ center }) => {
    const map = useMap();
    map.setView(center, 13);
    return null;
};

const generateRechargeData = () => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 12; i++) {
        data.push({
            name: months[i],
            value: Number((Math.random() * 5 + 1).toFixed(1)),
        });
    }
    return data;
};

const StationDetails = ({ station, onClose }) => {
    const data = generateRechargeData();

    return (
        <div className={styles.detailsPanel}>
            <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
            </button>

            <div className={styles.detailsHeader}>
                <h3 className={styles.detailsTitle}>{station.name}</h3>
                <span className={styles.detailsId}>{station.id}</span>
                <span className={`${styles.statusBadge} ${styles[station.status.toLowerCase()]}`}>
                    {station.status}
                </span>
            </div>

            <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Current Level</span>
                    <div className={styles.detailValue}>
                        <Droplets size={18} className={styles.detailIcon} />
                        {station.level}m
                    </div>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Last Updated</span>
                    <div className={styles.detailValue}>
                        <Calendar size={18} className={styles.detailIcon} />
                        2h ago
                    </div>
                </div>
            </div>

            <div className={styles.chartContainer}>
                <h4>Recharge Patterns (Last 12 Months)</h4>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRecharge" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4CA965" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4CA965" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D8" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={2} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#2C3E50', fontWeight: 600 }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#4CA965" fillOpacity={1} fill="url(#colorRecharge)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.metaInfo}>
                <p><strong>Basin:</strong> Yamuna Lower</p>
                <p><strong>Aquifer Type:</strong> Alluvium</p>
                <p><strong>Specific Yield:</strong> 0.12</p>
            </div>
        </div>
    );
};

const LiveMap = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const res = await API.get('/api/map/stations');
                // The API returns the station list directly with 'id', 'name', 'lat', 'lng', 'level', 'status'
                // We might need to map 'trend' if it's missing in API but expected by UI
                // The current API doesn't return 'trend', so we'll mock it or add it to backend.
                // For now, let's mock trend client-side to avoid errors.
                const mappedStations = res.data.map(s => ({
                    ...s,
                    trend: Math.random() > 0.5 ? 'Decline' : 'Improving' // Mock trend
                }));
                setStations(mappedStations);
            } catch (error) {
                console.error("Failed to fetch stations", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, []);

    const filteredStations = filter === 'All'
        ? stations
        : stations.filter(s => s.status === filter);

    return (
        <div className={styles.pageContainer}>

            {/* Sidebar - Station Explorer */}
            <aside className={styles.stationListPanel}>
                <div className={styles.panelHeader}>
                    <div className={styles.titleRow}>
                        <h2>Station Explorer</h2>
                        <SlidersHorizontal size={20} color="var(--text-muted)" />
                    </div>

                    <div className={styles.searchBar}>
                        <Search size={16} className={styles.searchIcon} />
                        <input type="text" placeholder="Search basin, region..." className={styles.searchInput} />
                    </div>
                </div>

                <div className={styles.filters}>
                    {['All', 'Critical', 'Semi-Critical', 'Safe'].map(f => (
                        <button
                            key={f}
                            className={`${styles.filterChip} ${filter === f ? styles.active : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className={styles.listContent}>
                    {filteredStations.map(station => (
                        <div
                            key={station.id}
                            className={`${styles.stationCard} ${selectedStation?.id === station.id ? styles.selected : ''}`}
                            onClick={() => setSelectedStation(station)}
                        >
                            <div className={styles.cardHeader}>
                                <span className={styles.stationName}>{station.name}</span>
                                <span className={styles.stationId}>{station.id}</span>
                            </div>

                            <div className={styles.cardMetrics}>
                                <div>
                                    <div className={styles.levelValue}>
                                        {station.level}<span className={styles.levelUnit}>m</span>
                                    </div>
                                    <div className={`${styles.trend} ${station.trend.includes('Decline') ? styles.down :
                                        station.trend.includes('Improving') ? styles.up : styles.stable
                                        }`}>
                                        {station.trend.includes('Decline') ? <ArrowDownRight size={14} /> :
                                            station.trend.includes('Improving') ? <ArrowUpRight size={14} /> : <Minus size={14} />}
                                        {station.trend}
                                    </div>
                                </div>

                                {/* Visual Sparkline Bars */}
                                <div className={styles.sparkBars}>
                                    {[40, 60, 45, 70, 50, 80].map((h, i) => (
                                        <div
                                            key={i}
                                            className={styles.bar}
                                            style={{
                                                height: `${h}%`,
                                                width: '4px',
                                                backgroundColor: i === 5 ? (station.status === 'Critical' ? 'var(--accent-critical)' : 'var(--secondary)') : undefined
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Map Area */}
            <div className={styles.mapContainer}>
                {/* Map Controls Removed */}

                <MapContainer center={[28.57, 77.33]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    {/* Darker/Lighter map style could be chosen. Using Voyager for clean look */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; CARTO'
                    />

                    {filteredStations.map((station) => (
                        <CircleMarker
                            key={station.id}
                            center={[station.lat, station.lng]}
                            radius={selectedStation?.id === station.id ? 12 : 8}
                            pathOptions={{
                                color: '#fff',
                                weight: 2,
                                fillColor: station.status === 'Critical' ? '#E53935' : station.status === 'Safe' ? '#4CA965' : '#FFA000',
                                fillOpacity: 0.9
                            }}
                            eventHandlers={{
                                click: () => setSelectedStation(station),
                            }}
                        >
                            <Popup>
                                <strong>{station.name}</strong><br />
                                Level: {station.level} m bgl
                            </Popup>
                        </CircleMarker>
                    ))}

                    {selectedStation && <MapUpdater center={[selectedStation.lat, selectedStation.lng]} />}
                </MapContainer>

                {selectedStation && (
                    <StationDetails
                        station={selectedStation}
                        onClose={() => setSelectedStation(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default LiveMap;
