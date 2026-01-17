import React from 'react';
import { Sun, CloudRain, Wind, Droplets, Sprout, AlertTriangle, Calendar, ArrowUpRight, ArrowDownRight, MapPin, LogOut, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import styles from './Dashboard.module.css'; // Importing dashboard styles for reusable glass effects

const WATER_TREND = [
    { month: 'Jun', level: 12 },
    { month: 'Jul', level: 14 },
    { month: 'Aug', level: 18 },
    { month: 'Sep', level: 19 },
    { month: 'Oct', level: 17 },
    { month: 'Nov', level: 15 },
    { month: 'Dec', level: 14 },
];

const FarmerDashboard = ({ onLogout }) => {
    // Premium Web Dashboard for "Normal User" (Farmer/Citizen)
    // Enhanced with "JalNivikaran 2.0" Liquid Glass Aesthetics

    return (
        <div className="animate-in" style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', fontFamily: 'var(--font-family)', minHeight: '100vh' }}>

            {/* Ambient Background Glow */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '600px', background: 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.15) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }}></div>

            {/* Web Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem',
                gap: '2rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ background: 'var(--primary)', padding: '0.35rem', borderRadius: '8px', boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)' }}>
                            <Activity size={18} color="white" />
                        </div>
                        <h2 style={{ fontSize: '0.9rem', color: 'var(--primary)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Citizen Portal</h2>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, var(--text-main) 0%, #475569 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                        Smart Water Overview
                    </h1>
                </div>

                {/* Header Actions */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', padding: '0.5rem 0.5rem 0.5rem 1.5rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-glass)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Punjab, Ludhiana</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className={styles.toolBtn} // Reuse global button style
                        style={{
                            background: 'white',
                            color: 'var(--accent-critical)',
                            border: '1px solid currentColor',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '99px',
                            fontWeight: 700,
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>

                {/* Left Col: Weather & Live Status (Span 4) */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Weather Widget - Enhanced Glass */}
                    <div className={styles.card} style={{ position: 'relative', overflow: 'hidden', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>

                        {/* Animated Gradient Blob */}
                        <div style={{ position: 'absolute', top: -60, right: -60, width: '220px', height: '220px', background: 'radial-gradient(circle, #FDE68A 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.8, animation: 'float 6s ease-in-out infinite' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Local Weather</div>
                                <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 0.9, letterSpacing: '-0.04em' }}>32°</div>
                                <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.5rem' }}>Sunny & Clear</div>
                            </div>
                            <Sun size={80} className="spin-slow" style={{ color: '#F59E0B', filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.4))' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem', zIndex: 1 }}>
                            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', backdropFilter: 'blur(5px)' }}>
                                <Wind size={20} color="var(--text-light)" />
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Wind</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>12 <span style={{ fontSize: '0.8rem' }}>km/h</span></div>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', backdropFilter: 'blur(5px)' }}>
                                <Droplets size={20} color="var(--text-light)" />
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Humidity</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>45<span style={{ fontSize: '0.8rem' }}>%</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Irrigation Advisory - Glass & Color */}
                    <div className={styles.card} style={{
                        background: 'linear-gradient(135deg, rgba(236, 253, 245, 0.9) 0%, rgba(209, 250, 229, 0.7) 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        gap: '1.25rem',
                        alignItems: 'flex-start',
                        boxShadow: '0 8px 30px -5px rgba(16, 185, 129, 0.15)',
                        borderRadius: '24px', padding: '2rem'
                    }}>
                        <div style={{
                            padding: '1rem',
                            background: 'white',
                            borderRadius: '16px',
                            color: '#059669',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                        }}>
                            <Sprout size={32} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064E3B', marginBottom: '0.5rem' }}>Irrigation Advisory</h3>
                            <p style={{ fontSize: '0.95rem', color: '#065F46', lineHeight: 1.5, marginBottom: '1rem' }}>
                                Soil moisture is optimal. Skip irrigation today to save approximately <strong style={{ textDecoration: 'underline' }}>450 Liters</strong>.
                            </p>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: 'white', padding: '0.4rem 1rem', borderRadius: '99px', letterSpacing: '0.05em', border: '1px solid rgba(16,185,129,0.2)' }}>
                                NEXT CYCLE: TOMORROW PM
                            </span>
                        </div>
                    </div>
                </div>

                {/* Middle Col: Sustainability Score & Stats (Span 5) */}
                <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Main Score Card (Premium Liquid Glass) */}
                    <div className={styles.card} style={{ padding: '3rem', textAlign: 'center', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', background: 'white', borderRadius: '32px', boxShadow: 'var(--shadow-xl)' }}>

                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 100%)', zIndex: 0 }}></div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3rem', zIndex: 1 }}>Groundwater Sustainability Index</h3>

                        {/* 3D Glass Ring Effect */}
                        <div style={{ position: 'relative', width: '280px', height: '280px', margin: '0 0 3rem 0', zIndex: 1 }}>
                            {/* Outer Glow */}
                            <div style={{ position: 'absolute', inset: -20, background: 'conic-gradient(from 0deg, var(--primary), var(--secondary), var(--primary))', borderRadius: '50%', filter: 'blur(30px)', opacity: 0.2, animation: 'spin-slow 10s linear infinite' }}></div>

                            {/* SVG Ring */}
                            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%', filter: 'drop-shadow(0 0 15px rgba(56, 189, 248, 0.4))' }}>
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradientScore)" strokeWidth="6" strokeDasharray="283" strokeDashoffset="40" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0EA5E9" />
                                        <stop offset="100%" stopColor="#6366F1" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Center Content */}
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '5.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1, textShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>8.5</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)', padding: '0.4rem 1.2rem', borderRadius: '99px', marginTop: '1rem', boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)' }}>GOOD</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', zIndex: 1 }}>
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Current Depth</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>12.4m</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Replenish Rate</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-success)' }}>+2.1%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Alerts & forecast (Span 3) */}
                <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Alerts & Notices</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
                    </div>

                    <div className="card-base" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-critical)', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white', background: 'var(--accent-critical)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>CRITICAL</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2h ago</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>Low pump efficiency detected in Tubewell #2.</p>
                    </div>

                    <div className="card-base" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-warning)', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white', background: 'var(--accent-warning)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>WARNING</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Yesterday</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>Excessive pesticide run-off risk due to predicted rain.</p>
                    </div>

                    {/* Upcoming Calendar - Enhanced */}
                    <div className="card-base" style={{ flex: 1, padding: '1.5rem', background: 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}><Calendar size={20} color="var(--primary)" /></div>
                            <h4 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>Upcoming Board</h4>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)', textAlign: 'center', lineHeight: 1, background: 'white', padding: '0.5rem', borderRadius: '8px', minWidth: '50px' }}>18<br /><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>JAN</span></div>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Soil Health Audit</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>09:00 AM • Block B</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1, background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '8px', minWidth: '50px' }}>24<br /><span style={{ fontSize: '0.7rem' }}>JAN</span></div>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Kisan Sabha Meet</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>02:00 PM • Town Hall</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Large Graph (Span 12) */}
                <div className="card-base" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'white', borderRadius: '32px', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.6rem', background: 'var(--bg-app)', borderRadius: '10px' }}>
                                <TrendingUp size={24} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>Water Level Analysis</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>6-Month comparative analysis of aquifer recharge vs. extraction.</p>
                            </div>
                        </div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)' }}>
                            View Detailed Report <ArrowRight size={16} />
                        </button>
                    </div>

                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={WATER_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 600 }} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13 }} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '1rem' }}
                                    cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '4 4' }}
                                    itemStyle={{ color: 'var(--text-main)', fontWeight: 700 }}
                                />
                                <Area type="monotone" dataKey="level" stroke="#0EA5E9" strokeWidth={5} fillOpacity={1} fill="url(#colorLevel)" animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FarmerDashboard;
