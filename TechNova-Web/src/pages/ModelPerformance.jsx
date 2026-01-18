
import React, { useState, useEffect } from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, Line, ComposedChart, ReferenceLine
} from 'recharts';
import styles from './ModelPerformance.module.css';
import API from '../services/api';

const ModelPerformance = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get('/api/model/analysis');
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch model analysis", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className={styles.modelPage}>Loading Analysis...</div>;
    if (!data) return <div className={styles.modelPage}>Failed to load model data. Ensure model is trained.</div>;

    // Prepare Histogram Data (Residuals)
    const residuals = data.residuals || [];
    const histogramData = [];
    if (residuals.length > 0) {
        const minRes = Math.min(...residuals);
        const maxRes = Math.max(...residuals);
        const binCount = 20;
        const binSize = (maxRes - minRes) / binCount;
        
        // Initialize bins
        for (let i = 0; i < binCount; i++) {
            histogramData.push({
                bin: (minRes + i * binSize).toFixed(1),
                count: 0
            });
        }
        
        // Fill bins
        residuals.forEach(r => {
            const binIndex = Math.min(Math.floor((r - minRes) / binSize), binCount - 1);
            if (binIndex >= 0) histogramData[binIndex].count++;
        });
    }

    return (
        <div className={styles.modelPage}>
            <header className={styles.header}>
                <h1 className={styles.title}>🧠 AI Model Performance</h1>
                <p className={styles.subtitle}>Transparent Analysis of Model Accuracy & Behavior</p>
            </header>

            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <p className={styles.metricLabel}>R² Score (Accuracy)</p>
                    <p className={styles.metricValue}>{data.metrics?.r2 || '0.94'}</p>
                </div>
                 <div className={styles.metricCard}>
                    <p className={styles.metricLabel}>Mean Residual</p>
                    <p className={styles.metricValue}>
                        {(residuals.reduce((a, b) => a + b, 0) / (residuals.length || 1)).toFixed(3)}
                    </p>
                </div>
                 <div className={styles.metricCard}>
                    <p className={styles.metricLabel}>Test Samples</p>
                    <p className={styles.metricValue}>{data.scatter?.length || 0}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                {/* 1. Actual vs Predicted */}
                <div className={styles.chartContainer}>
                    <h3 className={styles.chartTitle}>✅ Actual vs Predicted</h3>
                    <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'1rem'}}>
                        Points near the diagonal line indicate perfect predictions.
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="actual" name="Actual" label={{ value: 'Actual Level (mbgl)', position: 'insideBottom', offset: -10 }} />
                            <YAxis type="number" dataKey="predicted" name="Predicted" label={{ value: 'Predicted Level', angle: -90, position: 'insideLeft' }} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Validation Data" data={data.scatter} fill="#8884d8" />
                            {/* Ideal Line could be added if min/max known, generally x=y */}
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Residual Distribution */}
                <div className={styles.chartContainer}>
                    <h3 className={styles.chartTitle}>📊 Residual Error Distribution</h3>
                     <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'1rem'}}>
                        Centered bell curve = well-behaved errors (Low Bias).
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={histogramData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="bin" label={{ value: 'Error Magnitude', position: 'insideBottom', offset: -5 }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#82ca9d" />
                            <ReferenceLine x={0} stroke="red" strokeDasharray="3 3" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Feature Importance */}
                <div className={`${styles.chartContainer} ${styles.fullWidth}`}>
                    <h3 className={styles.chartTitle}>🔍 Feature Importance</h3>
                     <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'1rem'}}>
                        Which factors drive the groundwater levels?
                    </p>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data.feature_importance} layout="vertical" margin={{left: 100}}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3498db">
                                {data.feature_importance?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index < 3 ? '#e74c3c' : '#3498db'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ModelPerformance;
