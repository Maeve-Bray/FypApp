import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, subtitle, color = '#6366F1' }) => (
  <LinearGradient
    colors={[color + '20', color + '10']}
    style={styles.statCard}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </LinearGradient>
);

const styles = StyleSheet.create({
  statCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
});

export default StatCard;