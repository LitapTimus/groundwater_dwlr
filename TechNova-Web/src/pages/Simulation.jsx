import React, { useState, useRef } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    ComposedChart, Line
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Simulation.module.css';

const FUTURE_DATA = [
    { month: 'May', actual: 12.5, predicted: 12.5, lower: 12.0, upper: 13.0 },
    { month: 'Jun', actual: null, predicted: 12.8, lower: 12.2, upper: 13.4 },
    { month: 'Jul', actual: null, predicted: 13.2, lower: 12.5, upper: 13.9 },
    { month: 'Aug', actual: null, predicted: 13.8, lower: 13.0, upper: 14.6 },
    { month: 'Sep', actual: null, predicted: 14.1, lower: 13.3, upper: 14.9 },
    { month: 'Oct', actual: null, predicted: 14.0, lower: 13.2, upper: 14.8 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'white', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color, fontSize: '0.9rem' }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Simulation = () => {
    const [scenario, setScenario] = useState('normal');
    const [policy, setPolicy] = useState('none');
    const [isLoading, setIsLoading] = useState(false);
    const [simulationData, setSimulationData] = useState([]);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const runSimulation = async () => {
        if (!file) {
            toast.error('Please upload a CSV file first');
            return;
        }

        setIsLoading(true);
        try {
            // Calculate changes based on scenario and policy
            let availabilityChange = 0;
            let demandChange = 0;

            // Set base changes based on scenario
            if (scenario === 'drought') availabilityChange = -0.3;
            else if (scenario === 'excess') availabilityChange = 0.3;

            // Apply policy adjustments
            if (policy === 'rainwater') availabilityChange += 0.15;
            if (policy === 'crop_rotation') demandChange -= 0.1;
            if (policy === 'industry_cap') demandChange -= 0.05;

            // Call the API
            const formData = new FormData();
            formData.append('file', file);
            formData.append('availabilityChange', availabilityChange);
            formData.append('demandChange', demandChange);

            const result = await axios.post('http://localhost:8000/simulate', formData);
            setSimulationData(result.data);
            toast.success('Simulation completed successfully!');
        } catch (error) {
            console.error('Error running simulation:', error);
            toast.error('Failed to run simulation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Use simulation data if available, otherwise use empty array
    const chartData = simulationData || [];

    return (
        <div className={styles.simulation}>
            <header className={styles.header}>
                <h1 className={styles.title}>Future Prediction & Simulation</h1>
                <p className={styles.subtitle}>AI-driven forecasting and scenario planning for groundwater resources.</p>
            </header>

            {/* Section 1: Water Level Prediction */}
            <div className={styles.chartCard} style={{ marginBottom: '2rem' }}>
                <h3>Predicted Water Levels (Next 6 Months)</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Based on current extraction rates and seasonal weather forecasts.
                </p>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={FUTURE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D8" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="upper" stroke="none" fill="#FEEADF" fillOpacity={0.5} name="Confidence Interval" />
                            <Line type="monotone" dataKey="actual" stroke="#D95D0F" strokeWidth={3} dot={{ r: 4 }} name="Actual Level" />
                            <Line type="monotone" dataKey="predicted" stroke="#D95D0F" strokeDasharray="5 5" strokeWidth={3} name="Predicted Level" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <label>Upload CSV File:</label>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".csv"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.uploadButton}
                    >
                        {file ? file.name : 'Choose File'}
                    </button>
                </div>

                <div className={styles.controlGroup}>
                    <label>Climate Scenario:</label>
                    <select 
                        value={scenario} 
                        onChange={(e) => setScenario(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="normal">Normal Conditions</option>
                        <option value="drought">Drought Conditions</option>
                        <option value="excess">Excess Rainfall</option>
                    </select>
                </div>

                <div className={styles.controlGroup}>
                    <label>Policy Intervention:</label>
                    <select 
                        value={policy} 
                        onChange={(e) => setPolicy(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="none">No Policy</option>
                        <option value="rainwater">Rainwater Harvesting</option>
                        <option value="crop_rotation">Crop Rotation</option>
                        <option value="industry_cap">Industrial Water Cap</option>
                    </select>
                </div>

                <button 
                    className={styles.simulateButton}
                    onClick={runSimulation}
                    disabled={isLoading || !file}
                >
                    {isLoading ? 'Running Simulation...' : 'Run Simulation'}
                </button>
            </div>

            <div className={styles.chartContainer}>
                <h2>Water Demand Forecast</h2>
                {chartData.length > 0 ? (
                    <div className={styles.chart}>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="actual" 
                                    name="Actual" 
                                    fill="#8884d8" 
                                    stroke="#8884d8"
                                    fillOpacity={0.3}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="predicted" 
                                    name="Predicted" 
                                    stroke="#ff7300" 
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="upper_bound" 
                                    name="Upper Bound" 
                                    stroke="#ff7300" 
                                    fill="#ff7300" 
                                    fillOpacity={0.1}
                                    strokeDasharray="5 5"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="lower_bound" 
                                    name="Lower Bound" 
                                    stroke="#ff7300" 
                                    fill="#fff" 
                                    fillOpacity={0.1}
                                    strokeDasharray="5 5"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className={styles.placeholder}>
                        {isLoading ? (
                            <p>Running simulation, please wait...</p>
                        ) : (
                            <p>Upload a CSV file and run the simulation to see results</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Simulation;
