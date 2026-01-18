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
    // State for Real Data
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [location, setLocation] = React.useState({ lat: 30.90, lon: 75.85 }); // Default Ludhiana
    const [locating, setLocating] = React.useState(false);

    // State for Crop Planner
    const [planner, setPlanner] = React.useState({
        season: 'Rabi',
        acres: 5,
        soil_type: 'Alluvial'
    });
    const [planResult, setPlanResult] = React.useState(null);
    const [planning, setPlanning] = React.useState(false);

    const fetchStats = async (lat, lon) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8001/api/farmer/stats?lat=${lat}&lon=${lon}`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch farmer stats", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    React.useEffect(() => {
        fetchStats(location.lat, location.lon);
    }, []);

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLoc = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                setLocation(newLoc);
                fetchStats(newLoc.lat, newLoc.lon); // Refresh data
                setLocating(false);
            },
            () => {
                alert("Unable to retrieve your location");
                setLocating(false);
            }
        );
    };

    const handleGeneratePlan = async () => {
        setPlanning(true);
        try {
            const payload = { ...planner, lat: location.lat, lon: location.lon };
            const res = await fetch('http://localhost:8001/api/farmer/crop-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setPlanResult(data);
        } catch (error) {
            alert("Failed to generate plan");
        } finally {
            setPlanning(false);
        }
    };

    if (loading && !stats) return <div className="p-8 text-center">Loading farm data...</div>;

    // Use fetched data or fallbacks
    const weather = stats?.weather || { temp: '--', condition: '...', wind: 0, humidity: 0 };
    const score = stats?.sustainability_score || 0;
    const advisory = stats?.advisory || { message: "No advisory available.", level: "Unknown" };
    const stationInfo = stats?.location_match || { found: false, nearest_station: "Unknown" };

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
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {stationInfo.found ? stationInfo.nearest_station : "Punjab, Ludhiana"}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                             {locating ? "Locating..." : stationInfo.distance_km ? `${stationInfo.distance_km}km away` : "Default Region"}
                        </span>
                    </div>
                    
                    <button
                        onClick={handleLocateMe}
                        className={styles.toolBtn}
                        title="Use My Location"
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.6rem',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <MapPin size={18} />
                    </button>
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
                                <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 0.9, letterSpacing: '-0.04em' }}>{weather.temp}°</div>
                                <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.5rem' }}>{weather.condition}</div>
                            </div>
                            <Sun size={80} className="spin-slow" style={{ color: '#F59E0B', filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.4))' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem', zIndex: 1 }}>
                            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', backdropFilter: 'blur(5px)' }}>
                                <Wind size={20} color="var(--text-light)" />
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Wind</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{weather.wind} <span style={{ fontSize: '0.8rem' }}>km/h</span></div>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', backdropFilter: 'blur(5px)' }}>
                                <Droplets size={20} color="var(--text-light)" />
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Humidity</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{weather.humidity}<span style={{ fontSize: '0.8rem' }}>%</span></div>
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
                                {advisory.message}
                            </p>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: 'white', padding: '0.4rem 1rem', borderRadius: '99px', letterSpacing: '0.05em', border: '1px solid rgba(16,185,129,0.2)' }}>
                                STATUS: {advisory.level}
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
                                <span style={{ fontSize: '5.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1, textShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>{score}</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)', padding: '0.4rem 1.2rem', borderRadius: '99px', marginTop: '1rem', boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)' }}>GOOD</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', zIndex: 1 }}>
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Current Depth</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats?.groundwater_depth}m</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Replenish Rate</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-success)' }}>+{stats?.replenish_rate}%</div>
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
                </div>

                 {/* Bottom Row: Smart Crop Planner */}
                <div className={styles.card} style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'white', borderRadius: '32px', boxShadow: 'var(--shadow-lg)', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                    
                    {/* Input Fom */}
                    <div>
                        <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem'}}>
                            <div style={{padding:'0.8rem', background:'#ECFCCB', borderRadius:'12px', color:'#4D7C0F'}}>
                                <Sprout size={24} />
                            </div>
                            <div>
                                <h3 style={{fontSize:'1.5rem', fontWeight:800, color:'var(--text-main)'}}>Smart Crop Planner</h3>
                                <p style={{color:'var(--text-muted)'}}>AI-driven recommendations for your land.</p>
                            </div>
                        </div>

                        <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
                            <div>
                                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:600, color:'var(--text-main)'}}>Season</label>
                                <select 
                                    value={planner.season} 
                                    onChange={(e) => setPlanner({...planner, season: e.target.value})}
                                    className="form-select"
                                    style={{width:'100%', padding:'0.75rem', borderRadius:'12px', border:'1px solid #ddd'}}
                                >
                                    <option value="Rabi">Rabi (Winter)</option>
                                    <option value="Kharif">Kharif (Monsoon)</option>
                                </select>
                            </div>
                             <div>
                                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:600, color:'var(--text-main)'}}>Land Area (Acres)</label>
                                <input 
                                    type="number" 
                                    value={planner.acres} 
                                    onChange={(e) => setPlanner({...planner, acres: Number(e.target.value)})}
                                    className="form-input"
                                    style={{width:'100%', padding:'0.75rem', borderRadius:'12px', border:'1px solid #ddd'}}
                                />
                            </div>
                             <div>
                                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:600, color:'var(--text-main)'}}>Soil Type</label>
                                <select 
                                    value={planner.soil_type} 
                                    onChange={(e) => setPlanner({...planner, soil_type: e.target.value})}
                                    className="form-select"
                                    style={{width:'100%', padding:'0.75rem', borderRadius:'12px', border:'1px solid #ddd'}}
                                >
                                    <option value="Alluvial">Alluvial</option>
                                    <option value="Black">Black Soil</option>
                                    <option value="Red">Red Soil</option>
                                </select>
                            </div>

                            <button
                                onClick={handleGeneratePlan}
                                disabled={planning}
                                style={{
                                    background: 'var(--primary)',
                                    color:'white',
                                    padding:'1rem',
                                    borderRadius:'12px',
                                    fontWeight:700,
                                    border:'none',
                                    cursor:'pointer',
                                    marginTop:'0.5rem',
                                    display:'flex',
                                    justifyContent:'center',
                                    alignItems:'center',
                                    gap:'0.5rem'
                                }}
                            >
                                {planning ? 'Calculating...' : <><Activity size={18} /> Generate Plan</>}
                            </button>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div style={{background:'var(--bg-app)', borderRadius:'24px', padding:'2rem', display:'flex', flexDirection:'column'}}>
                        <h4 style={{fontSize:'1.1rem', fontWeight:700, marginBottom:'1.5rem', color:'var(--text-main)'}}>Recommended Crop Analysis</h4>
                        
                        {planResult ? (
                            <div style={{overflowX:'auto'}}>
                                <table style={{width:'100%', borderCollapse:'collapse'}}>
                                    <thead>
                                        <tr style={{borderBottom:'2px solid rgba(0,0,0,0.05)'}}>
                                            <th style={{textAlign:'left', padding:'1rem', fontSize:'0.85rem', color:'var(--text-muted)'}}>CROP TYPE</th>
                                            <th style={{textAlign:'left', padding:'1rem', fontSize:'0.85rem', color:'var(--text-muted)'}}>WATER REQ</th>
                                            <th style={{textAlign:'left', padding:'1rem', fontSize:'0.85rem', color:'var(--text-muted)'}}>TOTAL DEMAND</th>
                                            <th style={{textAlign:'left', padding:'1rem', fontSize:'0.85rem', color:'var(--text-muted)'}}>EST. YIELD</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {planResult.map((item, idx) => (
                                            <tr key={idx} style={{borderBottom:'1px solid rgba(0,0,0,0.05)'}}>
                                                <td style={{padding:'1rem', fontWeight:700, color:'var(--text-main)'}}>{item.crop}</td>
                                                <td style={{padding:'1rem', color:'var(--text-main)'}}>{item.water_req_mm} mm</td>
                                                <td style={{padding:'1rem', color:'#0EA5E9', fontWeight:600}}>{(item.total_water_liters / 1000).toFixed(1)}k Liters</td>
                                                <td style={{padding:'1rem', color:'#10B981', fontWeight:600}}>{item.estimated_yield}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', gap:'1rem', minHeight:'200px'}}>
                                <Sprout size={48} style={{opacity:0.2}} />
                                <p>Select parameters and click "Generate Plan" to see recommendations.</p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default FarmerDashboard;
