import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from 'react-native';
import ActivityItem from '../components/ActivityItem';

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

// Helpers to aggregate logs
const aggregateByDay = (logs, days = 14) => {
    const now = new Date();
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
            const day = new Date(now);
            day.setDate(now.getDate() - i);

            const label = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const start = new Date(day);
            start.setHours(0,0,0,0);
            const end = new Date(day);
            end.setHours(23,59,59,999);
            
            const count = logs.filter(l => {
                const t = new Date(l.timestamp);
                return t >= start && t <= end;
            }).length;
        result.push({ label, count });
    }
    return result;
};

const aggregateByWeek = (logs, weeks = 12) => {
    const now = new Date();
    const result = [];
    for (let i = weeks - 1; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - i*7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);
        const label = `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        const count = logs.filter(l => {
        const t = new Date(l.timestamp);
        return t >= weekStart && t <= weekEnd;
        }).length;
        result.push({ label, count });
    }
    return result;
};

const aggregateByMonth = (logs, months = 12) => {
    const now = new Date();
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString(undefined, { month: 'short' });
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        const count = logs.filter(l => {
        const t = new Date(l.timestamp);
        return t >= start && t <= end;
        }).length;
        result.push({ label, count });
    }
    return result;
};

const aggregateByYear = (logs, years = 5) => {
    const now = new Date();
    const result = [];
    for (let i = years - 1; i >= 0; i--) {
        const y = now.getFullYear() - i;
        const label = `${y}`;
        const start = new Date(y, 0, 1);
        const end = new Date(y, 11, 31, 23, 59, 59, 999);
        const count = logs.filter(l => {
        const t = new Date(l.timestamp);
        return t >= start && t <= end;
        }).length;
        result.push({ label, count });
    }
    return result;
};

const SimpleBar = ({ item, max }) => {
    const pct = max === 0 ? 0 : Math.round((item.count / max) * 100);
    return (
        <View style={styles.barRow}>
        <Text style={styles.barLabel}>{item.label}</Text>
        <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.barCount}>{item.count}</Text>
        </View>
    );
};

const AllActivityScreen = ({ logs = [], onBack = () => {} }) => {
    const [period, setPeriod] = useState('Daily');

const series = useMemo(() => {
    switch (period) {
        case 'Daily': return aggregateByDay(logs, 14);
        case 'Weekly': return aggregateByWeek(logs, 12);
        case 'Monthly': return aggregateByMonth(logs, 12);
        case 'Yearly': return aggregateByYear(logs, 5);
        default: return [];
    }
}, [logs, period]);

const max = useMemo(() => Math.max(...series.map(s => s.count), 0), [series]);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Activity — {period}</Text>
            <View style={{ width: 48 }} />
        </View>

        <View style={styles.periodTabs}>
            {PERIODS.map(p => (
            <TouchableOpacity
                key={p}
                style={[styles.tab, p === period && styles.tabActive]}
                onPress={() => setPeriod(p)}
            >
                <Text style={[styles.tabText, p === period && styles.tabTextActive]}>{p}</Text>
            </TouchableOpacity>
            ))}
        </View>

            <View style={styles.chartWrap}>
            {series.map((item, idx) => (
                <SimpleBar key={`${period}-${idx}-${item.label}`} item={item} max={max} />
            ))}
            </View>

            <View style={styles.recentWrap}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {logs.slice(0, 20).map((log, index) => (
                <ActivityItem
                key={log.id}
                log={log}
                index={index}
                totalItems={Math.min(logs.length, 20)}
                onAddNote={() => {}}
                />
            ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 60 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    backButton: {
        padding: 8
    },
    backText: {
        color: '#6366F1',
        fontWeight: '600'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold', 
        color: '#1e293b'
    },
    periodTabs: { 
        flexDirection: 'row', 
        paddingHorizontal: 12, 
        marginBottom: 8 
    },
    tab: { 
        paddingVertical: 8, 
        paddingHorizontal: 12, 
        marginRight: 8, 
        borderRadius: 8, 
        backgroundColor: '#fff' 
    },
    tabActive: { 
        backgroundColor: '#6366F1' 
    },
    tabText: { 
        color: '#1e293b' 
    },
    tabTextActive: { 
        color: '#fff', 
        fontWeight: '600' 
    },
    content: { 
        paddingHorizontal: 20 
    },
    chartWrap: { 
        marginBottom: 20 
    },
    barRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    barLabel: { 
        width: 80, 
        color: '#475569' 
    },
    barTrack: { 
        flex: 1, 
        height: 12, 
        backgroundColor: '#e2e8f0', 
        borderRadius: 6, 
        marginHorizontal: 8 
    },
    barFill: { 
        height: 12, 
        backgroundColor: '#6366F1', 
        borderRadius: 6 
    },
    barCount: { 
        width: 36, 
        textAlign: 'right', 
        color: '#0f172a' 
    },
    recentWrap: { 
        marginTop: 10 
    },
    sectionTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginBottom: 8, 
        color: '#1e293b' 
    },
});

export default AllActivityScreen;