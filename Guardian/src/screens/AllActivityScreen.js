import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import ActivityItem from '../components/ActivityItem';

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
const SCREEN_WIDTH = Dimensions.get('window').width;

// Helpers to aggregate logs
const aggregateByDay = (logs, days = 14) => {
    const now = new Date();
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        const label = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const start = new Date(day); start.setHours(0, 0, 0, 0);
        const end = new Date(day); end.setHours(23, 59, 59, 999);
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
        weekEnd.setDate(now.getDate() - i * 7);
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

// Thin the labels so the chart doesn't get crowded
const thinLabels = (series, maxLabels = 7) => {
    if (series.length <= maxLabels) return series.map(s => s.label);
    const step = Math.ceil(series.length / maxLabels);
    return series.map((s, i) => (i % step === 0 ? s.label : ''));
};

const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,   // indigo-500
    labelColor: () => '#94a3b8',                                  // slate-400
    barPercentage: 0.55,
    decimalPlaces: 0,
    propsForBackgroundLines: {
        strokeDasharray: '',           // solid grid lines
        stroke: '#e2e8f0',            // slate-200
        strokeWidth: 1,
    },
    propsForLabels: {
        fontSize: 11,
        fontFamily: undefined,
    },
    fillShadowGradientFrom: '#6366F1',
    fillShadowGradientTo: '#818cf8',
    fillShadowGradientFromOpacity: 1,
    fillShadowGradientToOpacity: 0.7,
    fillShadowGradientFromOffset: 0,
    fillShadowGradientToOffset: 1,
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

    const chartData = useMemo(() => ({
        labels: thinLabels(series),
        datasets: [{ data: series.map(s => s.count) }],
    }), [series]);

    const totalCount = useMemo(
        () => series.reduce((sum, s) => sum + s.count, 0),
        [series]
    );

    const maxCount = useMemo(
        () => Math.max(...series.map(s => s.count), 0),
        [series]
    );

    // Chart width: scroll if many bars, otherwise fill screen
    const BAR_WIDTH = 40;
    const chartWidth = Math.max(SCREEN_WIDTH - 40, series.length * BAR_WIDTH + 60);

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Activity</Text>
                <View style={{ width: 48 }} />
            </View>

            {/* Period tabs */}
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

            {/* Summary pills */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryPill}>
                    <Text style={styles.summaryValue}>{totalCount}</Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.summaryPill}>
                    <Text style={styles.summaryValue}>{maxCount}</Text>
                    <Text style={styles.summaryLabel}>Peak</Text>
                </View>
                <View style={styles.summaryPill}>
                    <Text style={styles.summaryValue}>
                        {series.length > 0 ? (totalCount / series.length).toFixed(1) : '0'}
                    </Text>
                    <Text style={styles.summaryLabel}>Avg</Text>
                </View>
            </View>

            {/* Chart.js-style bar chart */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>{period} Activity</Text>

                {series.length === 0 || maxCount === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No activity recorded yet</Text>
                    </View>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 16 }}
                    >
                        <BarChart
                            data={chartData}
                            width={chartWidth}
                            height={220}
                            chartConfig={chartConfig}
                            style={styles.chart}
                            showBarTops={false}
                            showValuesOnTopOfBars
                            withInnerLines
                            fromZero
                            flatColor={false}
                            segments={4}
                        />
                    </ScrollView>
                )}

                {/* X-axis period label */}
                <Text style={styles.axisLabel}>{period} periods →</Text>
            </View>

            {/* Recent Activity */}
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
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    backButton: { padding: 8 },
    backText: { color: '#6366F1', fontWeight: '600', fontSize: 15 },
    title: { fontSize: 20, fontWeight: '700', color: '#1e293b' },

    periodTabs: {
        flexDirection: 'row',
        paddingHorizontal: 0,
        marginBottom: 16,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    tabActive: {
        backgroundColor: '#6366F1',
        borderColor: '#6366F1',
    },
    tabText: { color: '#64748b', fontWeight: '500', fontSize: 13 },
    tabTextActive: { color: '#fff', fontWeight: '600', fontSize: 13 },

    summaryRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    summaryPill: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#6366F1',
    },
    summaryLabel: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 2,
        fontWeight: '500',
    },

    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingTop: 16,
        paddingBottom: 8,
        paddingLeft: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    chart: {
        borderRadius: 8,
    },
    axisLabel: {
        fontSize: 11,
        color: '#cbd5e1',
        textAlign: 'right',
        paddingRight: 16,
        paddingBottom: 4,
        marginTop: -4,
    },
    emptyState: {
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
    },

    recentWrap: { marginTop: 4 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        color: '#1e293b',
    },
});

export default AllActivityScreen;