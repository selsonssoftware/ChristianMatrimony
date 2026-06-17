import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Animated, StatusBar, Platform, Linking,
} from 'react-native';
import {

  SafeAreaView,

} from 'react-native-safe-area-context';

const FAQS = [
    { q: 'How do I verify my profile?', a: 'Go to Profile › Account Verification and upload a valid government ID. Verification takes 24–48 hours.' },
    { q: 'Can I change my membership plan?', a: 'Yes. Visit Membership › Subscription and tap "Upgrade Now" to switch between Silver, Gold, and Platinum.' },
    { q: 'How are matches suggested?', a: 'Our algorithm considers partner preferences, community, education, and location to suggest the most compatible profiles.' },
    { q: 'Is my data kept private?', a: 'Absolutely. Your personal details are never shared without consent. See our Privacy Policy for full details.' },
    { q: 'How do I delete my account?', a: 'Reach out to our support team at support@corematch.in and we\'ll process deletion within 7 working days.' },
];

function FaqItem({ q, a, isLast }) {
    const [open, setOpen] = useState(false);
    const heightAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        const toHeight = open ? 0 : 1;
        const toRotate = open ? 0 : 1;
        Animated.parallel([
            Animated.spring(heightAnim, { toValue: toHeight, friction: 8, useNativeDriver: false }),
            Animated.timing(rotateAnim, { toValue: toRotate, duration: 200, useNativeDriver: true }),
        ]).start();
        setOpen(!open);
    };

    const maxHeight = heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] });
    const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

    return (
        <View style={[styles.faqItem, isLast && { borderBottomWidth: 0 }]}>
            <TouchableOpacity onPress={toggle} style={styles.faqQ} activeOpacity={0.7}>
                <Text style={styles.faqQText}>{q}</Text>
                <Animated.Text style={[styles.faqIcon, { transform: [{ rotate }] }]}>+</Animated.Text>
            </TouchableOpacity>
            <Animated.View style={{ maxHeight, overflow: 'hidden' }}>
                <Text style={styles.faqAText}>{a}</Text>
            </Animated.View>
        </View>
    );
}

export default function HelpSupportScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        ]).start();
    }, []);

    const contacts = [
        { icon: '✉', label: 'Email Support', sub: 'support@corematch.in', action: () => Linking.openURL('mailto:support@corematch.in') },
        { icon: '💬', label: 'Live Chat', sub: 'Available 9 AM – 9 PM', action: () => { } },
        { icon: '📞', label: 'Call Us', sub: '+91 80 1234 5678', action: () => Linking.openURL('tel:+918012345678') },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top','bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#060A14" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Help & Support</Text>

                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Hero banner */}
                    <View style={styles.heroBanner}>
                        <Text style={styles.heroEmoji}>🤝</Text>
                        <Text style={styles.heroTitle}>How can we help?</Text>
                        <Text style={styles.heroSub}>Browse FAQs or reach out to our team anytime.</Text>
                    </View>

                    {/* Contact options */}
                    <Text style={styles.sectionLabel}>Contact Us</Text>
                    <View style={styles.card}>
                        {contacts.map(({ icon, label, sub, action }, idx) => (
                            <View key={label}>
                                <TouchableOpacity style={styles.contactRow} onPress={action} activeOpacity={0.7}>
                                    <View style={styles.contactIcon}><Text style={styles.contactIconText}>{icon}</Text></View>
                                    <View style={styles.contactText}>
                                        <Text style={styles.contactLabel}>{label}</Text>
                                        <Text style={styles.contactSub}>{sub}</Text>
                                    </View>
                                    <Text style={styles.contactArrow}>›</Text>
                                </TouchableOpacity>
                                {idx < contacts.length - 1 && <View style={styles.divider} />}
                            </View>
                        ))}
                    </View>

                    {/* FAQs */}
                    <Text style={styles.sectionLabel}>FAQs</Text>
                    <View style={styles.card}>
                        {FAQS.map((item, idx) => (
                            <FaqItem key={item.q} {...item} isLast={idx === FAQS.length - 1} />
                        ))}
                    </View>

                    <Text style={styles.footnote}>CoreMatch v2.4.1  •  support@corematch.in</Text>

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

    heroBanner: {
        backgroundColor: '#fff', borderRadius: 20, padding: 24,
        alignItems: 'center', marginBottom: 24,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
    },
    heroEmoji: { fontSize: 36, marginBottom: 10 },
    heroTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
    heroSub: { fontSize: 13, color: '#AAA', marginTop: 6, textAlign: 'center', lineHeight: 19 },

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

    contactRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    contactIcon: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#F7F4EE', justifyContent: 'center', alignItems: 'center',
        marginRight: 14,
    },
    contactIconText: { fontSize: 18 },
    contactText: { flex: 1 },
    contactLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
    contactSub: { fontSize: 12, color: '#AAA', marginTop: 2 },
    contactArrow: { fontSize: 22, color: '#CCC' },
    divider: { height: 1, backgroundColor: '#F0EEE9', marginLeft: 72 },

    faqItem: { borderBottomWidth: 1, borderBottomColor: '#F0EEE9' },
    faqQ: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16,
    },
    faqQText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1A1A2E', paddingRight: 12 },
    faqIcon: { fontSize: 22, color: '#C9960C', fontWeight: '300' },
    faqAText: { fontSize: 13, color: '#667', lineHeight: 20, paddingHorizontal: 16, paddingBottom: 16 },

    footnote: { fontSize: 11, color: '#CCC', textAlign: 'center', marginTop: 6 },
});