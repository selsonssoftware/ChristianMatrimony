import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Switch, ScrollView,
    Animated, StatusBar, Platform, TouchableOpacity,
} from 'react-native';
import {

    SafeAreaView,

} from 'react-native-safe-area-context';


const NOTIF_GROUPS = [
    {
        group: 'Matches & Messages',
        items: [
            { id: 'new_match', label: 'New Match', sub: 'When someone matches with you' },
            { id: 'new_message', label: 'New Message', sub: 'Incoming chat messages' },
            { id: 'profile_like', label: 'Profile Liked', sub: 'Someone liked your profile' },
        ],
    },
    {
        group: 'Account & Updates',
        items: [
            { id: 'profile_view', label: 'Profile View Alert', sub: 'When someone views your profile' },
            { id: 'subscription', label: 'Subscription Alerts', sub: 'Renewal reminders & offers' },
            { id: 'announcements', label: 'App Announcements', sub: 'New features and updates' },
        ],
    },
];

function NotifRow({ item, value, onChange, isLast }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleChange = (val) => {
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
        onChange(val);
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View style={[styles.notifRow, isLast && { borderBottomWidth: 0 }]}>
                <View style={styles.notifText}>
                    <Text style={styles.notifLabel}>{item.label}</Text>
                    <Text style={styles.notifSub}>{item.sub}</Text>
                </View>
                <Switch
                    value={value}
                    onValueChange={handleChange}
                    trackColor={{ false: '#E5E5E5', true: 'rgba(201,150,12,0.4)' }}
                    thumbColor={value ? '#C9960C' : '#ccc'}
                    ios_backgroundColor="#E5E5E5"
                />
            </View>
        </Animated.View>
    );
}

export default function NotificationsScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const [prefs, setPrefs] = useState({
        new_match: true,
        new_message: true,
        profile_like: true,
        profile_view: false,
        subscription: true,
        announcements: false,
    });

    // Master toggle
    const allOn = Object.values(prefs).every(Boolean);
    const toggleAll = () => {
        const newVal = !allOn;
        setPrefs(Object.fromEntries(Object.keys(prefs).map((k) => [k, newVal])));
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#060A14" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Notifications</Text>

                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Master toggle card */}
                    <View style={styles.masterCard}>
                        <View>
                            <Text style={styles.masterLabel}>All Notifications</Text>
                            <Text style={styles.masterSub}>Turn everything on or off at once</Text>
                        </View>
                        <Switch
                            value={allOn}
                            onValueChange={toggleAll}
                            trackColor={{ false: '#E5E5E5', true: 'rgba(201,150,12,0.4)' }}
                            thumbColor={allOn ? '#C9960C' : '#ccc'}
                            ios_backgroundColor="#E5E5E5"
                        />
                    </View>

                    {NOTIF_GROUPS.map(({ group, items }) => (
                        <View key={group}>
                            <Text style={styles.sectionLabel}>{group}</Text>
                            <View style={styles.card}>
                                {items.map((item, idx) => (
                                    <NotifRow
                                        key={item.id}
                                        item={item}
                                        value={prefs[item.id]}
                                        onChange={(val) => setPrefs((p) => ({ ...p, [item.id]: val }))}
                                        isLast={idx === items.length - 1}
                                    />
                                ))}
                            </View>
                        </View>
                    ))}

                    <Text style={styles.footnote}>
                        Push notifications require permission from your device settings.
                    </Text>

                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F0EC' },

    header: {
        backgroundColor: '#060A14',
        paddingTop: Platform.OS === 'ios' ? 62 : 36,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backArrow: { color: '#fff', fontSize: 30, lineHeight: 32 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

    scroll: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 50 },

    masterCard: {
        backgroundColor: '#fff',
        borderRadius: 18, padding: 18,
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        borderWidth: 1.5, borderColor: 'rgba(201,150,12,0.3)',
        shadowColor: '#C9960C', shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
    },
    masterLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
    masterSub: { fontSize: 12, color: '#AAA', marginTop: 3 },

    sectionLabel: {
        fontSize: 11, fontWeight: '700', color: '#9AA',
        letterSpacing: 1.1, marginBottom: 10,
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: '#fff', borderRadius: 18,
        marginBottom: 20, overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },

    notifRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#F0EEE9',
    },
    notifText: { flex: 1, paddingRight: 12 },
    notifLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
    notifSub: { fontSize: 12, color: '#AAA', marginTop: 2 },

    footnote: { fontSize: 11, color: '#BBB', textAlign: 'center', marginTop: 6 },
});