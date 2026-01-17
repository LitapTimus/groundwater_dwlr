import React, { useState, useMemo, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, ComposedChart, Line
} from 'recharts';
import styles from './Analytics.module.css';
import API from '../services/api';

// Mock data generators
const generateHistory = (days) => {
    const data = [];
    const today = new Date();
    let level = 12.5;

    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        level += (Math.random() - 0.45) * 0.2;
        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            level: Number(level.toFixed(2)),
        });
    }
    return data;
};

const RECHARGE_DATA = [
    { month: 'Jan', rainfall: 15, recharge: 1.2 },
    { month: 'Feb', rainfall: 22, recharge: 1.5 },
    { month: 'Mar', rainfall: 10, recharge: 0.8 },
    { month: 'Apr', rainfall: 5, recharge: 0.5 },
    { month: 'May', rainfall: 45, recharge: 2.1 },
    { month: 'Jun', rainfall: 120, recharge: 5.5 },
    { month: 'Jul', rainfall: 350, recharge: 12.4 },
    { month: 'Aug', rainfall: 310, recharge: 11.2 },
    { month: 'Sep', rainfall: 180, recharge: 6.8 },
];

const DEMAND_MOCK = [
    { year: '2021', supply: 480, demand: 460 },
    { year: '2022', supply: 475, demand: 485 },
    { year: '2023', supply: 460, demand: 510 },
    { year: '2024', supply: 455, demand: 535 },
    { year: '2025', supply: 440, demand: 560 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

const AnalyticsContent = () => {
    const [timeRange, setTimeRange] = useState(90); // Default 3 Months
    const [historyData, setHistoryData] = useState([]);

    // Fetch History Data
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await API.get('/api/trends/history');
                setHistoryData(res.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            }
        };
        fetchHistory();
    }, [timeRange]);

    // Filter recharge data for display sake (showing subset for shorter durations)
    const rechargeDisplay = useMemo(() => {
        if (timeRange === 30) return RECHARGE_DATA.slice(-2);
        if (timeRange === 90) return RECHARGE_DATA.slice(-4);
        return RECHARGE_DATA;
    }, [timeRange]);

    return (
        <div className={styles.analyticsPage}>
            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className={styles.title}>Advanced Analytics</h1>
                        <p className={styles.subtitle}>Historical analysis of groundwater trends and resource allocation.</p>
                    </div>

                    <div className={styles.timeFilters}>
                        <span className={styles.filterLabel}>Time Range:</span>
                        <button
                            className={`${styles.filterBtn} ${timeRange === 30 ? styles.active : ''}`}
                            onClick={() => setTimeRange(30)}
                        >
                            30 Days
                        </button>
                        <button
                            className={`${styles.filterBtn} ${timeRange === 90 ? styles.active : ''}`}
                            onClick={() => setTimeRange(90)}
                        >
                            3 Months
                        </button>
                        <button
                            className={`${styles.filterBtn} ${timeRange === 180 ? styles.active : ''}`}
                            onClick={() => setTimeRange(180)}
                        >
                            6 Months
                        </button>
                    </div>
                </div>
            </header>

            <div className={styles.grid}>

                {/* 1. Historical Water Level */}
                <div className={styles.card} style={{ gridColumn: 'span 2', height: '400px' }}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Historical Water Levels</h3>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        {historyData && historyData.length > 0 ? (
                            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6B8E9E" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6B8E9E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D8" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    minTickGap={30}
                                />
                                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="level" stroke="#6B8E9E" fillOpacity={1} fill="url(#colorLevel)" strokeWidth={2} name="Level (m)" />
                            </AreaChart>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
                                Loading or No Data Available...
                            </div>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* 2. Demand Supply Graph */}
                <div className={styles.card} style={{ height: '400px' }}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Demand vs Supply Trends</h3>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DEMAND_MOCK} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D8" />
                            <XAxis dataKey="year" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="supply" fill="#6B8E9E" radius={[4, 4, 0, 0]} name="Water Supply" barSize={30} />
                            <Bar dataKey="demand" fill="#D95D0F" radius={[4, 4, 0, 0]} name="Water Demand" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Recharge Trends */}
                <div className={styles.card} style={{ height: '400px' }}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Rainfall & Recharge Correlation</h3>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={rechargeDisplay} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid stroke="#E5E0D8" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" orientation="left" stroke="#6B8E9E" axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#D95D0F" axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="rainfall" fill="#6B8E9E" barSize={20} radius={[4, 4, 0, 0]} name="Rainfall (mm)" />
                            <Line yAxisId="right" type="monotone" dataKey="recharge" stroke="#D95D0F" strokeWidth={3} name="Recharge (m)" dot={{ r: 4, fill: '#D95D0F' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
};

const Analytics = () => {
    return (
        <ErrorBoundary>
            <AnalyticsContent />
        </ErrorBoundary>
    );
};

export default Analytics;
