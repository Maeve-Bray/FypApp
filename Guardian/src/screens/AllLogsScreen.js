import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ActivityItem from '../components/ActivityItem';

const AllLogsScreen = ({ logs = [], onBack = () => {}, onAddNote = () => {} }) => {
    return (
        <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>All Logs</Text>
        </View>

        {logs.length === 0 ? (
            <View style={styles.empty}>
            <Text style={styles.emptyText}>No logs available.</Text>
            </View>
        ) : (
            <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
                <ActivityItem
                log={item}
                index={index}
                totalItems={logs.length}
                onAddNote={onAddNote}
                />
            )}
            contentContainerStyle={styles.list}
            />
        )}
        </View>
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
        marginBottom: 12,
    },
    backButton: {
        padding: 8,
    },
    backText: {
        color: '#6366F1',
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },

    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#64748b',
        fontSize: 16,
    },
    });

    export default AllLogsScreen;
