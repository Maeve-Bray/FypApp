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

// ─── Aggregation helpers ────────────────────────────────────────────────────

const aggregateByDay = (logs, days = 7) => {
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

const aggregateByWeek = (logs, weeks = 8) => {
    const now = new Date();
    const result = [];
    for (let i = 0; i < weeks; i++) {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - i * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);
        const label = i === 0
            ? 'This wk'
            : weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = i === 0
            ? 'This mo'
            : d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
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
    for (let i = 0; i < years; i++) {
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

const thinLabels = (series, maxLabels = 7) => {
    if (series.length <= maxLabels) return series.map(s => s.label);
    const step = Math.ceil(series.length / maxLabels);
    return series.map((s, i) => (i % step === 0 ? s.label : ''));
};

// Trend: compare most recent bucket to the one before it
const calcTrend = (series) => {
    if (series.length < 2) return null;
    const current = series[0].count;
    const previous = series[1].count;
    if (previous === 0) return current > 0 ? 100 : null;
    return Math.round(((current - previous) / previous) * 100);
};

// ─── Chart config ────────────────────────────────────────────────────────────

const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => '#94a3b8',
    barPercentage: 0.6,
    decimalPlaces: 0,
    propsForBackgroundLines: {
        strokeDasharray: '4 4',
        stroke: '#f1f5f9',
        strokeWidth: 1,
    },
    propsForLabels: {
        fontSize: 11,
        fontWeight: '600',
    },
    fillShadowGradientFrom: '#6366F1',
    fillShadowGradientTo: '#a5b4fc',
    fillShadowGradientFromOpacity: 1,
    fillShadowGradientToOpacity: 0.7,
    fillShadowGradientFromOffset: 0,
    fillShadowGradientToOffset: 1,
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ value, label, accent, trend }) => {
    const trendPositive = trend > 0;
    const trendNeutral = trend === null || trend === 0;
    return (
        <View style={[statStyles.card, { borderTopColor: accent }]}>
            <Text style={[statStyles.value, { color: accent }]}>{value}</Text>
            <Text style={statStyles.label}>{label}</Text>
            {!trendNeutral && (
                <View style={[statStyles.trendBadge, { backgroundColor: trendPositive ? '#dcfce7' : '#fee2e2' }]}>
                    <Text style={[statStyles.trendText, { color: trendPositive ? '#16a34a' : '#dc2626' }]}>
                        {trendPositive ? '▲' : '▼'} {Math.abs(trend)}%
                    </Text>
                </View>
            )}
        </View>
    );
};

const statStyles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
        borderTopWidth: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    value: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    label: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 2,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    trendBadge: {
        marginTop: 6,
        borderRadius: 20,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    trendText: {
        fontSize: 10,
        fontWeight: '700',
    },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

const AllActivityScreen = ({ logs = [], onBack = () => {} }) => {
    const [period, setPeriod] = useState('Daily');

    const series = useMemo(() => {
        switch (period) {
            case 'Daily':   return aggregateByDay(logs, 7);
            case 'Weekly':  return aggregateByWeek(logs, 8);
            case 'Monthly': return aggregateByMonth(logs, 12);
            case 'Yearly':  return aggregateByYear(logs, 5);
            default:        return [];
        }
    }, [logs, period]);

    const chartData = useMemo(() => ({
        labels: thinLabels(series),
        datasets: [{ data: series.map(s => s.count) }],
    }), [series]);

    const totalCount  = useMemo(() => series.reduce((sum, s) => sum + s.count, 0), [series]);
    const maxCount    = useMemo(() => Math.max(...series.map(s => s.count), 0), [series]);
    const avgCount    = series.length > 0 ? (totalCount / series.length).toFixed(1) : '0';
    const trend       = useMemo(() => calcTrend(series), [series]);

    const BAR_WIDTH = 52;
    const chartWidth = Math.max(SCREEN_WIDTH - 48, series.length * BAR_WIDTH + 60);

    const periodLabel = {
        Daily: 'past 7 days',
        Weekly: 'past 8 weeks',
        Monthly: 'past 12 months',
        Yearly: 'past 5 years',
    }[period];

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
        >
            {/* ── Hero header ── */}
            <View style={styles.heroSection}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.heroTitle}>Activity Dashboard</Text>
                <Text style={styles.heroSubtitle}>{logs.length} total events recorded</Text>
            </View>

            {/* ── Segmented period control ── */}
            <View style={styles.segmentWrapper}>
                <View style={styles.segmentControl}>
                    {PERIODS.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.segment, p === period && styles.segmentActive]}
                            onPress={() => setPeriod(p)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.segmentText, p === period && styles.segmentTextActive]}>
                                {p}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ── Stat cards ── */}
            <View style={styles.statsRow}>
                <StatCard value={totalCount} label="Total"    accent="#6366F1" trend={trend} />
                <StatCard value={maxCount}   label="Peak"     accent="#0ea5e9" trend={null} />
                <StatCard value={avgCount}   label="Average"  accent="#10b981" trend={null} />
            </View>

            {/* ── Chart card ── */}
            <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                    <View>
                        <Text style={styles.chartTitle}>{period} Breakdown</Text>
                        <Text style={styles.chartSubtitle}>{periodLabel}</Text>
                    </View>
                    {trend !== null && (
                        <View style={[styles.trendChip, { backgroundColor: trend >= 0 ? '#ede9fe' : '#fee2e2' }]}>
                            <Text style={[styles.trendChipText, { color: trend >= 0 ? '#6366F1' : '#dc2626' }]}>
                                {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs prev
                            </Text>
                        </View>
                    )}
                </View>

                {series.length === 0 || maxCount === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📊</Text>
                        <Text style={styles.emptyTitle}>No data yet</Text>
                        <Text style={styles.emptyText}>Activity will appear here once events are recorded.</Text>
                    </View>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 8 }}
                    >
                        <BarChart
                            data={chartData}
                            width={chartWidth}
                            height={260}
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

                <View style={styles.chartFooter}>
                    <View style={styles.legendDot} />
                    <Text style={styles.legendText}>Events · newest on left</Text>
                </View>
            </View>

            {/* ── Breakdown hint row ── */}
            <View style={styles.insightRow}>
                <View style={styles.insightCard}>
                    <Text style={styles.insightIcon}>🔥</Text>
                    <View style={styles.insightBody}>
                        <Text style={styles.insightValue}>{maxCount}</Text>
                        <Text style={styles.insightLabel}>busiest {period === 'Daily' ? 'day' : period === 'Weekly' ? 'week' : period === 'Monthly' ? 'month' : 'year'}</Text>
                    </View>
                </View>
                <View style={styles.insightCard}>
                    <Text style={styles.insightIcon}>📅</Text>
                    <View style={styles.insightBody}>
                        <Text style={styles.insightValue}>{series.filter(s => s.count > 0).length}</Text>
                        <Text style={styles.insightLabel}>active periods</Text>
                    </View>
                </View>
            </View>

            {/* ── Recent Activity ── */}
            <View style={styles.recentSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{Math.min(logs.length, 20)}</Text>
                    </View>
                </View>

                {logs.length === 0 ? (
                    <View style={styles.emptyActivity}>
                        <Text style={styles.emptyText}>No activity logged yet</Text>
                    </View>
                ) : (
                    <View style={styles.activityList}>
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
                )}
            </View>
        </ScrollView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2ff',
    },
    contentContainer: {
        paddingBottom: 48,
    },

    // Hero
    heroSection: {
        backgroundColor: '#6366F1',
        paddingTop: 60,
        paddingBottom: 28,
        paddingHorizontal: 24,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    backText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 4,
        fontWeight: '500',
    },

    // Segmented control
    segmentWrapper: {
        paddingHorizontal: 20,
        marginTop: -16,
        marginBottom: 16,
    },
    segmentControl: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 4,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
    },
    segment: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    segmentActive: {
        backgroundColor: '#6366F1',
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94a3b8',
    },
    segmentTextActive: {
        color: '#fff',
    },

    // Stat cards
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 16,
    },

    // Chart card
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 14,
        paddingTop: 18,
        paddingBottom: 12,
        paddingLeft: 10,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 14,
        marginBottom: 14,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    chartSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
        fontWeight: '500',
    },
    trendChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    trendChipText: {
        fontSize: 11,
        fontWeight: '700',
    },
    chart: {
        borderRadius: 8,
    },
    chartFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6366F1',
    },
    legendText: {
        fontSize: 11,
        color: '#cbd5e1',
        fontWeight: '500',
    },

    // Empty state
    emptyState: {
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyIcon: {
        fontSize: 36,
        marginBottom: 10,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 4,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 13,
        textAlign: 'center',
    },

    // Insight row
    insightRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    insightCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    insightIcon: {
        fontSize: 24,
    },
    insightBody: {
        flex: 1,
    },
    insightValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    insightLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },

    // Recent activity
    recentSection: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
    },
    countBadge: {
        backgroundColor: '#ede9fe',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6366F1',
    },
    activityList: {
        gap: 0,
    },
    emptyActivity: {
        alignItems: 'center',
        paddingVertical: 32,
    },
});

export default AllActivityScreen;
