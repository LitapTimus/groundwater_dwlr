import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, ComposedChart, Line,
    PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';
import styles from './Analytics.module.css';
import API from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const Analytics = () => {
    // State
    const [viewMode, setViewMode] = useState('national'); // 'national' | 'station'
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState('');
    
    // Data States
    const [waterLevelData, setWaterLevelData] = useState([]);
    const [demandSupplyData, setDemandSupplyData] = useState([]);
    const [stressIndexData, setStressIndexData] = useState([]);
    const [zoneDistData, setZoneDistData] = useState([]);
    const [seasonalData, setSeasonalData] = useState([]);
    const [scatterData, setScatterData] = useState([]);

    // Load Stations on Mount
    useEffect(() => {
        API.get('/api/analytics/stations')
            .then(res => {
                setStations(res.data);
                if (res.data.length > 0) setSelectedStation(res.data[0].id);
            })
            .catch(err => console.error("Failed to load stations", err));
    }, []);

    // Load Charts Data when filters change
    useEffect(() => {
        const stationQuery = viewMode === 'station' ? selectedStation : 'all';
        if (!stationQuery) return;

        const fetchData = async () => {
            try {
                // Parallel requests for speed
                const [p1, p2, p3, p4, p5, p6] = await Promise.all([
                    API.get('/api/analytics/trend/water-level', { params: { station_id: stationQuery } }),
                    API.get('/api/analytics/trend/demand-supply', { params: { station_id: stationQuery } }),
                    API.get('/api/analytics/trend/stress-index', { params: { station_id: stationQuery } }),
                    API.get('/api/analytics/zone/distribution', { params: { station_id: stationQuery } }),
                    API.get('/api/analytics/seasonal', { params: { station_id: stationQuery } }),
                    API.get('/api/analytics/scatter/stress-water', { params: { station_id: stationQuery } })
                ]);

                setWaterLevelData(p1.data);
                setDemandSupplyData(p2.data);
                setStressIndexData(p3.data);
                setZoneDistData(p4.data);
                setSeasonalData(p5.data);
                setScatterData(p6.data);

            } catch (error) {
                console.error("Error fetching analytics data", error);
            }
        };

        fetchData();
    }, [viewMode, selectedStation]);

    return (
        <div className={styles.analyticsPage}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Advanced Analytics</h1>
                    <p className={styles.subtitle}>
                        {viewMode === 'national' ? 'National Overview of Groundwater Resources' : 'Station-Specific Detailed Analysis'}
                    </p>
                </div>

                <div className={styles.controls}>
                    {/* View Toggle */}
                    <div className={styles.toggleContainer}>
                        <button 
                            className={`${styles.toggleBtn} ${viewMode === 'national' ? styles.active : ''}`}
                            onClick={() => setViewMode('national')}
                        >
                            National View
                        </button>
                        <button 
                            className={`${styles.toggleBtn} ${viewMode === 'station' ? styles.active : ''}`}
                            onClick={() => setViewMode('station')}
                        >
                            Station View
                        </button>
                    </div>

                    {/* Station Dropdown (Only in Station Mode) */}
                    {viewMode === 'station' && (
                        <select 
                            className={styles.stationSelect}
                            value={selectedStation} 
                            onChange={(e) => setSelectedStation(e.target.value)}
                        >
                            {stations.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.district})</option>
                            ))}
                        </select>
                    )}
                </div>
            </header>

            <div className={styles.grid}>
                
                {/* 1. Groundwater Trend */}
                <div className={styles.card}>
                    <h3>🌊 Groundwater Level Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={waterLevelData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="Year" />
                            <YAxis reversed={true} label={{ value: 'Depth (mbgl)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="Water_Level" stroke="#8884d8" fill="#8884d8" name="Water Level (mbgl)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Demand vs Supply */}
                <div className={styles.card}>
                    <h3>⚖️ Demand vs Availability</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={demandSupplyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="Year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="demand" fill="#ff7300" name="Demand" />
                            <Line type="monotone" dataKey="supply" stroke="#387908" strokeWidth={3} name="Availability" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Stress Index Trend */}
                <div className={styles.card}>
                    <h3>⚠️ Stress Index Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChartWrapper data={stressIndexData} dataKey="Stress_Index" color="#ff0000" name="Stress Index" />
                    </ResponsiveContainer>
                </div>

                {/* 4. Zone Distribution */}
                <div className={styles.card}>
                    <h3>🛡️ Zone Classification</h3>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         {/* If Station View, show Text; If National, show Pie */}
                         {viewMode === 'station' ? (
                             <div style={{ textAlign: 'center' }}>
                                 <h4>Current Zone</h4>
                                 <h1 style={{ color: getZoneColor(zoneDistData[0]?.name) }}>
                                     {zoneDistData[0]?.name || 'N/A'}
                                 </h1>
                             </div>
                         ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={zoneDistData} 
                                        cx="50%" cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={80} 
                                        fill="#8884d8" 
                                        paddingAngle={5} 
                                        dataKey="value"
                                        label
                                    >
                                        {zoneDistData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getZoneColor(entry.name)} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                         )}
                    </div>
                </div>

                {/* 5. Seasonal Pattern */}
                <div className={styles.card}>
                    <h3>🍂 Seasonal Water Pattern</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChartWrapper reversedY={true} data={seasonalData} xKey="Month" dataKey="Water_Level" color="#82ca9d" name="Avg Depth (mbgl)" />
                    </ResponsiveContainer>
                </div>

                {/* 6. Stress vs Water Level Scatter */}
                <div className={styles.card}>
                    <h3>📉 Stress vs Water Level</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="stress_index" name="Stress Index" unit="" />
                            <YAxis type="number" dataKey="water_level" name="Depth" unit="mbgl" reversed={true} label={{ value: 'Depth (mbgl)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Stations" data={scatterData} fill="#8884d8" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
};

// Helper Components & Functions
const getZoneColor = (zone) => {
    switch(zone) {
        case 'Safe': return '#00C49F';
        case 'Semi-Critical': return '#FFBB28';
        case 'Critical': return '#FF8042';
        case 'Over-Exploited': return '#FF0000';
        default: return '#888';
    }
};

const LineChartWrapper = ({ data, xKey="Year", dataKey, color, name, reversedY=false }) => (
    <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} />
        <YAxis reversed={reversedY} />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} connectNulls={true} name={name} />
    </ComposedChart>
);

export default Analytics;
