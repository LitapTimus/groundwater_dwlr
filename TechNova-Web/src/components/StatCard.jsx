import React from 'react';
import styles from './StatCard.module.css';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({ title, value, unit, trend, subtext, icon: Icon, type = 'default' }) => {
    // Logic to determine trend color and icon
    const isPositive = trend > 0;
    const isNeutral = trend === 0;

    // Custom logic based on 'type' if needed for different visually distinct cards (e.g. Critical vs Normal)
    // But strictly following the image: White card, icon top left, big number.

    return (
        <div className={styles.card} data-type={type}>
            <div className={styles.topRow}>
                <div className={styles.iconWrapper}>
                    {Icon && <Icon size={20} strokeWidth={2} />}
                </div>
                <span className={styles.title}>{title}</span>
            </div>

            <div className={styles.mainValue}>
                <span className={styles.value}>{value}</span>
                {unit && <span className={styles.unit}>{unit}</span>}
            </div>

            <div className={styles.footer}>
                {/* If we have a specific 'trend' number, show percentage logic. Else show subtext. */}
                {trend !== undefined ? (
                    <div className={styles.trendBadge} data-trend={isPositive ? 'up' : isNeutral ? 'flat' : 'down'}>
                        {isPositive ? <ArrowUpRight size={14} /> : isNeutral ? <Minus size={14} /> : <ArrowDownRight size={14} />}
                        <span>{Math.abs(trend)}% vs last month</span>
                    </div>
                ) : (
                    <span className={styles.subtext}>{subtext}</span>
                )}
            </div>
        </div>
    );
};

export default StatCard;
