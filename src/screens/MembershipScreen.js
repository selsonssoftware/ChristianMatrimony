import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Animated, StatusBar, Platform,
} from 'react-native';
import {

  SafeAreaView,

} from 'react-native-safe-area-context';

const PLANS = [
    {
        id: 'silver',
        name: 'Silver',
        price: '₹499',
        period: '/month',
        tag: '',
        features: ['50 Profile Views / day', 'Basic Filters', 'Email Support'],
        gradient: ['#8E9EAB', '#B0BEC5'],
        textColor: '#fff',
    },
    {
        id: 'gold',
        name: 'Gold Premium',
        price: '₹999',
        period: '/month',
        tag: 'MOST POPULAR',
        features: [
            'Unlimited Profile Views',
            'Verified Gold Badge ✦',
            'Priority Matches',
            'Ad-free Experience',
            'Dedicated Support',
        ],
        gradient: ['#9A6C00', '#C9960C', '#F0C040'],
        textColor: '#fff',
    },
    {
        id: 'platinum',
        name: 'Platinum',
        price: '₹1,799',
        period: '/month',
        tag: 'BEST VALUE',
        features: [
            'Everything in Gold',
            'Platinum Verified Badge ✦✦',
            'Profile Boost (weekly)',
            'Personal Matchmaker',
            'Video Call Unlocks',
        ],
        gradient: ['#1A1A2E', '#2E3E6E', '#4A5B8A'],
        textColor: '#fff',
    },
];

export default function MembershipScreen({ navigation }) {
    const [selected, setSelected] = useState('gold');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        ]).start();
    }, []);

    const scaleAnims = useRef(PLANS.map(() => new Animated.Value(1))).current;

    const handleSelect = (id, idx) => {
        setSelected(id);
        Animated.sequence([
            Animated.spring(scaleAnims[idx], { toValue: 0.96, useNativeDriver: true }),
            Animated.spring(scaleAnims[idx], { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top','bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#060A14" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Membership</Text>

                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    <Text style={styles.intro}>Choose a plan that works for you</Text>

                    {PLANS.map((plan, idx) => {
                        const isActive = selected === plan.id;
                        return (
                            <Animated.View key={plan.id} style={{ transform: [{ scale: scaleAnims[idx] }] }}>
                                <TouchableOpacity onPress={() => handleSelect(plan.id, idx)} activeOpacity={0.85}>
                                    <View style={[styles.planCard, isActive && styles.planCardActive]}>
                                        {plan.tag ? (
                                            <View style={styles.tagBadge}>
                                                <Text style={styles.tagText}>{plan.tag}</Text>
                                            </View>
                                        ) : null}

                                        <View
                                            style={[
                                                styles.gradientBand,
                                                {
                                                    backgroundColor:
                                                        plan.id === 'silver'
                                                            ? '#8E9EAB'
                                                            : plan.id === 'gold'
                                                                ? '#C9960C'
                                                                : '#2E3E6E',
                                                },
                                            ]}
                                        >
                                            <Text style={[styles.planName, { color: '#fff' }]}>
                                                {plan.name}
                                            </Text>

                                            <View style={styles.priceRow}>
                                                <Text style={[styles.planPrice, { color: '#fff' }]}>
                                                    {plan.price}
                                                </Text>

                                                <Text
                                                    style={[
                                                        styles.planPeriod,
                                                        { color: 'rgba(255,255,255,0.7)' },
                                                    ]}
                                                >
                                                    {plan.period}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.featureList}>
                                            {plan.features.map((f) => (
                                                <View key={f} style={styles.featureRow}>
                                                    <View style={[styles.dot, isActive && styles.dotActive]} />
                                                    <Text style={styles.featureText}>{f}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        {isActive && (
                                            <View style={styles.selectedBadge}>
                                                <Text style={styles.selectedBadgeText}>✓  Current Selection</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}

                    {/* CTA */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={[styles.upgradeBtn, { marginTop: 8 }]}
                    >
                        <Text style={styles.upgradeBtnText}>
                            Upgrade Now →
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.disclaimer}>Cancel anytime. Auto-renews monthly.</Text>

                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F0EC' },

    header: {
        paddingTop: Platform.OS === 'ios' ? 62 : 36,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        backgroundColor: '#060A14',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backArrow: { color: '#fff', fontSize: 30, lineHeight: 32 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

    scroll: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 50 },

    intro: { fontSize: 13, color: '#889', textAlign: 'center', marginBottom: 20, letterSpacing: 0.3 },

    planCard: {
        backgroundColor: '#fff',
        borderRadius: 20, marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 2, borderColor: 'transparent',
        shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
    },
    planCardActive: {
        borderColor: '#C9960C',
        shadowColor: '#C9960C', shadowOpacity: 0.25, shadowRadius: 16, elevation: 6,
    },

    tagBadge: {
        position: 'absolute', top: 12, right: 12, zIndex: 10,
        backgroundColor: '#C9960C', borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 3,
    },
    tagText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },

    gradientBand: { padding: 20 },
    planName: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6, gap: 4 },
    planPrice: { fontSize: 30, fontWeight: '800' },
    planPeriod: { fontSize: 13 },

    featureList: { padding: 18, gap: 10 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#DDD' },
    dotActive: { backgroundColor: '#C9960C' },
    featureText: { fontSize: 13, color: '#2C3E50' },

    selectedBadge: {
        marginHorizontal: 18, marginBottom: 14,
        backgroundColor: 'rgba(201,150,12,0.1)',
        borderWidth: 1, borderColor: 'rgba(201,150,12,0.3)',
        borderRadius: 12, padding: 10, alignItems: 'center',
    },
    selectedBadgeText: { color: '#C9960C', fontWeight: '700', fontSize: 12 },

    upgradeBtn: {
        backgroundColor: '#C9960C',
        borderRadius: 32,
        paddingVertical: 16,
        alignItems: 'center',
        elevation: 5,
    },
    upgradeBtnText: { color: '#1A1A2E', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },

    disclaimer: { textAlign: 'center', color: '#BBB', fontSize: 11, marginTop: 14 },
});