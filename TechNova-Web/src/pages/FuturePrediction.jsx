import React, { useState, useEffect } from 'react';
import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, ReferenceLine
} from 'recharts';
import styles from './FuturePrediction.module.css';
import API from '../services/api';

const FuturePrediction = () => {
    // State
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState('');
    
    // Scenario Params
    const [demandChange, setDemandChange] = useState(0); // -10 to +10 %
    const [supplyChange, setSupplyChange] = useState(0); // -10 to +10 %
    const [years, setYears] = useState(5);
    
    // Data
    const [historicalData, setHistoricalData] = useState([]);
    const [forecastData, setForecastData] = useState([]);
    const [combinedData, setCombinedData] = useState([]);
    
    const [loading, setLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        API.get('/api/analytics/stations')
            .then(res => {
                setStations(res.data);
                if (res.data.length > 0) setSelectedStation(res.data[0].id);
            })
            .catch(err => console.error("Failed to load stations", err));
    }, []);

    // Fetch Data on Change
    useEffect(() => {
        if (!selectedStation) return;
        setLoading(true);

        const fetchData = async () => {
            try {
                // 1. History (Annual Trend for now)
                const histRes = await API.get('/api/analytics/trend/water-level', { 
                    params: { station_id: selectedStation } 
                });
                
                // 2. Forecast
                const forecastRes = await API.get('/api/predict/forecast', {
                    params: {
                        station_id: selectedStation,
                        years: years,
                        demand_change_pct: demandChange,
                        supply_change_pct: supplyChange
                    }
                });

                const hist = histRes.data.map(d => ({
                    ...d,
                    type: 'History',
                    name: d.Year
                }));

                const pred = forecastRes.data.map(d => ({
                    ...d,
                    type: 'Forecast',
                    name: `${d.Year} ${d.Month}`
                }));

                // Combine: Note historical is annual (Year), forecast is quarterly (Year + Month)
                // We'll just concat them. The X-axis can handle strings or numbers if we format 'name'.
                
                setHistoricalData(hist);
                setForecastData(pred);
                setCombinedData([...hist, ...pred]);

            } catch (error) {
                console.error("Prediction failed", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce slightly if sliders change rapidly? 
        // For now, raw effect is fine as requests are fast execution-wise (model is light)
        const timeout = setTimeout(fetchData, 300);
        return () => clearTimeout(timeout);
        
    }, [selectedStation, demandChange, supplyChange, years]);

    return (
        <div className={styles.predictionPage}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>🔮 Future Water Projection</h1>
                    <p className={styles.subtitle}>AI-Powered Forecasting & Scenario Analysis</p>
                </div>
                
                <div className={styles.controls}>
                   <select 
                        className={styles.stationSelect}
                        value={selectedStation} 
                        onChange={(e) => setSelectedStation(e.target.value)}
                    >
                        {stations.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.code})
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <div className={styles.mainContent}>
                {/* Sidebar Controls */}
                <aside className={styles.sidebar}>
                    <div className={styles.scenarioCard}>
                        <h3>🎛️ Scenario Parameters</h3>
                        
                        <div className={styles.sliderGroup}>
                            <div className={styles.sliderLabel}>
                                <span>Demand Growth</span>
                                <span className={styles.sliderValue}>{demandChange > 0 ? '+' : ''}{demandChange}%</span>
                            </div>
                            <input 
                                type="range" min="-10" max="10" step="0.5"
                                value={demandChange}
                                className={styles.slider}
                                onChange={(e) => setDemandChange(parseFloat(e.target.value))}
                            />
                            <small style={{color:'#888'}}>Annual change in water extraction</small>
                        </div>

                        <div className={styles.sliderGroup}>
                            <div className={styles.sliderLabel}>
                                <span>Supply Change</span>
                                <span className={styles.sliderValue}>{supplyChange > 0 ? '+' : ''}{supplyChange}%</span>
                            </div>
                            <input 
                                type="range" min="-10" max="10" step="0.5"
                                value={supplyChange}
                                className={styles.slider}
                                onChange={(e) => setSupplyChange(parseFloat(e.target.value))}
                            />
                            <small style={{color:'#888'}}>Annual change in rainfall/recharge</small>
                        </div>

                         <div className={styles.sliderGroup}>
                            <div className={styles.sliderLabel}>
                                <span>Forecast Horizon</span>
                                <span className={styles.sliderValue}>{years} Years</span>
                            </div>
                            <input 
                                type="range" min="1" max="10" step="1"
                                value={years}
                                className={styles.slider}
                                onChange={(e) => setYears(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className={styles.scenarioCard}>
                        <h3>📊 Insights</h3>
                        <p style={{fontSize: '0.9rem', color: '#555'}}>
                            Using an <strong>Autoregressive AI Model</strong>, we simulate future groundwater levels by iterating quarterly predictions.
                        </p>
                    </div>
                </aside>

                {/* Main Chart */}
                <div className={styles.chartContainer}>
                    <div className={styles.chartTitle}>
                        <h2>Groundwater Level Projection (mbgl)</h2>
                        <div className={styles.legend}>
                            <span className={styles.legendItem}>
                                <span className={styles.dot} style={{background: '#0088FE'}}></span> Historical
                            </span>
                            <span className={styles.legendItem}>
                                <span className={styles.dot} style={{background: '#FF6B6B'}}></span> Forecast
                            </span>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={combinedData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            {/* Inverted Y-Axis for Depth */}
                            <YAxis 
                                reversed={true} 
                                label={{ value: 'Depth (mbgl)', angle: -90, position: 'insideLeft' }} 
                                domain={['auto', 'auto']}
                            />
                            <Tooltip />
                            
                            {/* History Line */}
                            <Line 
                                type="monotone" 
                                dataKey="Water_Level" 
                                stroke="#0088FE" 
                                strokeWidth={3}
                                dot={{r:4}}
                                connectNulls={true}
                                name="Historical Level"
                                data={combinedData.filter(d => d.type === 'History')}
                            />
                            
                             {/* Forecast Line */}
                             {/* We need to render a second line for Forecast. 
                                 Recharts separates lines by dataKey usually, or we can use two Line components 
                                 filtering the main data source if we share the X-Axis map. 
                             */}
                             <Line 
                                type="monotone" 
                                dataKey="Water_Level" 
                                stroke="#FF6B6B" 
                                strokeWidth={3} 
                                strokeDasharray="5 5"
                                dot={false}
                                name="Predicted Level"
                                data={combinedData.filter(d => d.type === 'Forecast')}
                            />
                            
                            {/* Reference line for current year? */}
                            <ReferenceLine x={new Date().getFullYear()} stroke="green" label="Now" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default FuturePrediction;
