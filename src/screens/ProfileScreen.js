import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Animated,
    StatusBar,
    Platform,
    Dimensions,
} from 'react-native';
import {
    SafeAreaView,
} from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

// ─── Design Tokens ───────────────────────────────────────────
const GOLD = '#C9A84C';
const GOLD_LIGHT = '#F5E6C0';
const GOLD_MUTED = '#8A6320';
const GOLD_BORDER = 'rgba(180,150,90,0.28)';
const IVORY = '#F9F6F1';
const IVORY_CARD = '#FFF8EE';
const DARK_CARD = '#1C1209';
const BROWN_TEXT = '#2C1A00';
const BROWN_MUTED = '#7A5C2A';
const BROWN_META = '#9A7848';
const WHITE = '#FFFFFF';
const SCRIM_DARK = 'rgba(10,6,2,0.82)';
const SCRIM_MID = 'rgba(10,6,2,0.30)';
const TAG_BG = 'rgba(255,255,255,0.12)';
const TAG_BORDER = 'rgba(201,168,76,0.45)';
const GHOST_BG = 'rgba(255,255,255,0.12)';
const GHOST_BORDER = 'rgba(255,255,255,0.30)';

// ─── Explore Items ────────────────────────────────────────────
const EXPLORE_ITEMS = [
    { label: 'Search', icon: '🔍' },
    { label: 'Matches', icon: '💝' },
    { label: 'Messages', icon: '✉️' },
    { label: 'Shortlist', icon: '⭐' },
    { label: 'Likes Me', icon: '👤' },
];

// ─── Grooms Data ──────────────────────────────────────────────
const GROOMS_DATA = [
    {
        id: '1',
        name: 'Samuel George',
        age: 29,
        location: 'Bangalore',
        denomination: 'Syro-Malabar',
        profession: 'Architect',
        match: '95%',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400',
    },
    {
        id: '2',
        name: 'Ishan Thomas',
        age: 31,
        location: 'Kochi',
        denomination: 'Catholic',
        profession: 'Consultant',
        match: '89%',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400',
    },
];

// ─── Elite Perks ─────────────────────────────────────────────
const ELITE_PERKS = [
    'Priority visibility to premium families',
    'Verified badge & background check',
    '1-on-1 matchmaking counselor',
];

// ════════════════════════════════════════════════════════════════
export default function ProfileScreen() {
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.96)).current;
    const [profile, setProfile] = useState(null);
    const [liked, setLiked] = useState(false);
    const [showMenu, setShowMenu] = useState(false);


    // ── Load profile from storage ──────────────────────────────
    const loadProfile = async () => {
        try {
            const stored = await AsyncStorage.getItem('profileData');
            if (stored) setProfile(JSON.parse(stored));
        } catch (e) {
            console.warn('ProfileScreen – loadProfile error:', e);
        }
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 7, useNativeDriver: true }),
        ]).start();
        loadProfile();
    }, []);

    // ── Render ─────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={IVORY} />

            {/* ── Top Bar ─────────────────────────────────────── */}
            <View style={styles.topbar}>
                <Text style={styles.topbarLogo}>
                    Sacred<Text style={styles.topbarLogoAccent}>Bond</Text>
                </Text>
                <View style={styles.topbarIcons}>
                   
                    <TouchableOpacity
                        style={styles.iconBtn}
                        activeOpacity={0.7}
                        onPress={() => setShowMenu(true)}
                    >
                        <Text style={styles.iconEmoji}>☰</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Hero Card ───────────────────────────────── */}
                <Animated.View
                    style={[
                        styles.heroWrap,
                        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <Image
                        source={{ uri: profile?.profile_image || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600' }}
                        style={styles.heroImage}
                    />

                    {/* Scrim gradient */}
                    <View style={styles.heroScrim} />

                    {/* Verified badge */}
                    <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
                    </View>

                    {/* Glass info panel */}
                    <View style={styles.glassPanel}>
                        <View style={styles.nameRow}>
                            <Text style={styles.heroName}>
                                {profile?.full_name || 'Meera Antony'}
                            </Text>
                            <Text style={styles.heroAge}>
                                {profile?.age ? `, ${profile.age}` : ', 26'}
                            </Text>
                        </View>

                        <View style={styles.locationRow}>
                            <Text style={styles.locationIcon}>📍</Text>
                            <Text style={styles.locationText}>
                                {profile?.current_location || 'Kochi, Kerala'}
                            </Text>
                        </View>

                        <View style={styles.tagRow}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>
                                    ⛪ {profile?.community || 'Syro-Malabar'}
                                </Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>
                                    💼 {profile?.occupation || 'Software Engineer'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.ctaRow}>
                            <TouchableOpacity
                                style={styles.btnPrimary}
                                activeOpacity={0.85}
                                onPress={() => navigation.navigate('ViewProfile')}
                            >
                                <Text style={styles.btnPrimaryText}>
                                    View Full Profile →
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnGhost}
                                activeOpacity={0.75}
                                onPress={() => setLiked(v => !v)}
                            >
                                <Text style={styles.btnGhostIcon}>{liked ? '❤️' : '🤍'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnGhost} activeOpacity={0.75}>
                                <Text style={styles.btnGhostIcon}>↗</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                {/* ── Profile Completeness ────────────────────── */}
                <View style={styles.completeCard}>
                    <View style={styles.completeHeader}>
                        <Text style={styles.completeLabel}>Profile Completeness</Text>
                        <Text style={styles.completePercent}>72%</Text>
                    </View>
                    <View style={styles.barTrack}>
                        <View style={styles.barFill} />
                    </View>
                </View>

                {/* ── Explore ─────────────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Explore</Text>
                    <TouchableOpacity>
                        <Text style={styles.sectionLink}>See All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.exploreRow}
                >
                    {EXPLORE_ITEMS.map((item, idx) => (
                        <TouchableOpacity key={idx} style={styles.exploreItem} activeOpacity={0.7}>
                            <View style={styles.exploreCircle}>
                                <Text style={styles.exploreIcon}>{item.icon}</Text>
                            </View>
                            <Text style={styles.exploreLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ── Grooms for You ──────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Grooms for You</Text>
                    <TouchableOpacity>
                        <Text style={styles.sectionLink}>Refine</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.groomsRow}
                >
                    {GROOMS_DATA.map((groom) => (
                        <View key={groom.id} style={styles.groomCard}>
                            <View>
                                <Image source={{ uri: groom.image }} style={styles.groomImage} />
                                <View style={styles.compatPill}>
                                    <Text style={styles.compatPillText}>{groom.match} Match</Text>
                                </View>
                            </View>
                            <View style={styles.groomBody}>
                                <Text style={styles.groomName}>{groom.name}</Text>
                                <Text style={styles.groomMeta}>
                                    {groom.age} · {groom.location}{'\n'}
                                    {groom.denomination} · {groom.profession}
                                </Text>
                                <TouchableOpacity style={styles.connectBtn} activeOpacity={0.8}>
                                    <Text style={styles.connectBtnText}>CONNECT NOW</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* ── Elite Circle ────────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: GOLD_MUTED }]}>Elite Circle</Text>
                </View>

                <View style={styles.eliteCard}>
                    {/* Decorative orbs */}
                    <View style={styles.eliteOrb1} />
                    <View style={styles.eliteOrb2} />

                    <View style={styles.eliteHeadRow}>
                        <View style={styles.eliteIconBox}>
                            <Text style={styles.eliteIconEmoji}>🛡️</Text>
                        </View>
                        <Text style={styles.eliteTitle}>Elite Circle</Text>
                    </View>

                    <Text style={styles.eliteSub}>
                        Unlock verified matches, compatibility reports & faith-centered counseling.
                    </Text>

                    <View style={styles.elitePerks}>
                        {ELITE_PERKS.map((perk, i) => (
                            <View key={i} style={styles.perkRow}>
                                <View style={styles.perkDot} />
                                <Text style={styles.perkText}>{perk}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.eliteBtn} activeOpacity={0.85}>
                        <Text style={styles.eliteBtnText}>Upgrade to Premium</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
            {showMenu && (
                <>
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={() => setShowMenu(false)}
                    />

                    <View style={styles.sideMenu}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setShowMenu(false);
                                navigation.navigate('Notifications');
                            }}
                        >
                            <Text style={styles.menuText}>⚙️ Settings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={async () => {
                                await AsyncStorage.clear();
                                navigation.replace('Login');
                            }}
                        >
                            <Text style={[styles.menuText, { color: 'red' }]}>
                                🚪 Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

// ════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({

    // ── Root & Scroll ──────────────────────────────────────────
    root: {
        flex: 1,
        backgroundColor: IVORY,
    },
    scrollContent: {
        paddingBottom: 48,
    },

    // ── Top Bar ────────────────────────────────────────────────
    topbar: {
        height: 60,
        backgroundColor: '#FAF8F4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: GOLD_BORDER,
    },
    topbarLogo: {
        fontSize: 20,
        fontWeight: '700',
        color: GOLD_MUTED,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        letterSpacing: 0.3,
    },
    topbarLogoAccent: {
        color: GOLD,
    },
    topbarIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: IVORY_CARD,
        borderWidth: 0.5,
        borderColor: GOLD_BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconEmoji: {
        fontSize: 16,
    },

    // ── Hero Card ──────────────────────────────────────────────
    heroWrap: {
        margin: 16,
        height: 440,
        borderRadius: 22,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#EAEAEA',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroScrim: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        // Simulated gradient using overlapping views
        backgroundColor: 'transparent',
    },
    // We use two overlaid views to simulate a gradient scrim
    // (LinearGradient requires expo-linear-gradient; keeping vanilla RN here)
    verifiedBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: GOLD,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    verifiedBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: BROWN_TEXT,
        letterSpacing: 0.8,
    },
    glassPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 22,
        backgroundColor: 'rgba(10,6,2,0.68)',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 5,
    },
    heroName: {
        fontSize: 26,
        fontWeight: '700',
        color: WHITE,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        letterSpacing: 0.2,
    },
    heroAge: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.65)',
        marginLeft: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 4,
    },
    locationIcon: {
        fontSize: 13,
    },
    locationText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.65)',
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 18,
    },
    tag: {
        backgroundColor: TAG_BG,
        borderWidth: 0.5,
        borderColor: TAG_BORDER,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    tagText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.88)',
        fontWeight: '500',
    },
    ctaRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    btnPrimary: {
        flex: 1,
        backgroundColor: GOLD,
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnPrimaryText: {
        color: BROWN_TEXT,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    btnGhost: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: GHOST_BG,
        borderWidth: 0.5,
        borderColor: GHOST_BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnGhostIcon: {
        fontSize: 18,
        color: WHITE,
    },

    // ── Profile Completeness ───────────────────────────────────
    completeCard: {
        marginHorizontal: 16,
        marginTop: 4,
        backgroundColor: IVORY_CARD,
        borderWidth: 0.5,
        borderColor: GOLD_BORDER,
        borderRadius: 14,
        padding: 14,
    },
    completeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    completeLabel: {
        fontSize: 12,
        color: GOLD_MUTED,
        fontWeight: '600',
    },
    completePercent: {
        fontSize: 12,
        color: GOLD,
        fontWeight: '700',
    },
    barTrack: {
        height: 5,
        backgroundColor: '#EDE3D0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        width: '72%',
        backgroundColor: GOLD,
        borderRadius: 3,
    },

    // ── Section Header ─────────────────────────────────────────
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 22,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#5C3D0A',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    sectionLink: {
        fontSize: 12,
        fontWeight: '600',
        color: GOLD,
    },

    // ── Explore ────────────────────────────────────────────────
    exploreRow: {
        paddingHorizontal: 16,
        gap: 14,
        paddingBottom: 4,
    },
    exploreItem: {
        alignItems: 'center',
        gap: 7,
        width: 64,
    },
    exploreCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: IVORY_CARD,
        borderWidth: 0.5,
        borderColor: GOLD_BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exploreIcon: {
        fontSize: 20,
    },
    exploreLabel: {
        fontSize: 11,
        color: BROWN_MUTED,
        fontWeight: '500',
        textAlign: 'center',
    },

    // ── Groom Cards ────────────────────────────────────────────
    groomsRow: {
        paddingHorizontal: 16,
        gap: 14,
        paddingBottom: 4,
    },
    groomCard: {
        width: width * 0.52,
        backgroundColor: WHITE,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: GOLD_BORDER,
    },
    groomImage: {
        width: '100%',
        height: 185,
        resizeMode: 'cover',
    },
    compatPill: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(201,168,76,0.92)',
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 12,
    },
    compatPillText: {
        fontSize: 10,
        fontWeight: '700',
        color: BROWN_TEXT,
    },
    groomBody: {
        padding: 12,
        alignItems: 'center',
    },
    groomName: {
        fontSize: 14,
        fontWeight: '700',
        color: BROWN_TEXT,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 3,
        textAlign: 'center',
    },
    groomMeta: {
        fontSize: 11,
        color: BROWN_META,
        textAlign: 'center',
        lineHeight: 16,
        marginBottom: 12,
    },
    connectBtn: {
        width: '100%',
        borderWidth: 0.5,
        borderColor: GOLD,
        borderRadius: 20,
        paddingVertical: 8,
        alignItems: 'center',
    },
    connectBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: GOLD_MUTED,
        letterSpacing: 0.6,
    },

    // ── Elite Card ─────────────────────────────────────────────
    eliteCard: {
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 20,
        backgroundColor: DARK_CARD,
        padding: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    eliteOrb1: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(201,168,76,0.07)',
    },
    eliteOrb2: {
        position: 'absolute',
        bottom: -20,
        left: 20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(201,168,76,0.05)',
    },
    eliteHeadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
    },
    eliteIconBox: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(201,168,76,0.15)',
        borderWidth: 0.5,
        borderColor: 'rgba(201,168,76,0.40)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eliteIconEmoji: {
        fontSize: 18,
    },
    eliteTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: GOLD_LIGHT,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    eliteSub: {
        fontSize: 12,
        color: 'rgba(245,230,192,0.55)',
        lineHeight: 19,
        marginBottom: 18,
    },
    elitePerks: {
        gap: 8,
        marginBottom: 22,
    },
    perkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    perkDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: GOLD,
        flexShrink: 0,
    },
    perkText: {
        fontSize: 12,
        color: 'rgba(245,230,192,0.75)',
        lineHeight: 18,
    },
    eliteBtn: {
        backgroundColor: GOLD,
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
    },
    eliteBtnText: {
        color: BROWN_TEXT,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },

    sideMenu: {
        position: 'absolute',
        top: 80,
        right: 15,
        width: 180,
        backgroundColor: '#FFF',
        borderRadius: 12,
        elevation: 10,
        paddingVertical: 8,
    },

    menuItem: {
        paddingVertical: 15,
        paddingHorizontal: 16,
    },

    menuText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
});