import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, Image,
    StyleSheet, StatusBar, ActivityIndicator,
    Alert, RefreshControl, Dimensions, Animated, Pressable,
    Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';


const { width: SW, height: SH } = Dimensions.get('window');

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
    gold: '#C9A84C',
    goldLight: '#F7EDD4',
    goldDeep: '#A07830',
    navy: '#12203A',
    navyMid: '#1E3358',
    navyLight: '#243059',
    bg: '#F6F3EE',
    bgCard: '#FFFFFF',
    border: '#EAE3D6',
    muted: '#8A96A8',
    mutedLight: '#B8C0CC',
    success: '#19A87A',
    successBg: '#E5F7F1',
    successText: '#0B6E50',
    danger: '#D04E28',
    dangerBg: '#FBF0EC',
    dangerText: '#8B2F12',
    faith: '#2D6BB5',
    faithBg: '#EBF3FD',
    faithText: '#1A4880',
    text: '#1A1F2E',
    textSub: '#5E6577',
    textMuted: '#9198AA',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(18, 32, 58, 0.55)',
};

const RADIUS = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, full: 999 };
const FONT = {
    xs: 10, sm: 11, base: 13, md: 14, lg: 16, xl: 18, xxl: 22, hero: 28,
};

const BASE_URL = 'https://matrimony.gmworld.net';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
};

const cmToFeet = (cm) => {
    if (!cm) return null;
    const totalIn = Math.round(Number(cm) / 2.54);
    return `${Math.floor(totalIn / 12)}'${totalIn % 12}"`;
};

const calcAge = (dob) => {
    if (!dob) return null;
    const b = new Date(dob), t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() - b.getMonth() < 0 ||
        (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
    return a;
};

const resolveImage = (img) => {
    if (!img) return null;
    return img.startsWith('http') ? img : `${BASE_URL}/storage/${img}`;
};

const getMatchColor = (pct) => {
    if (pct >= 80) return COLORS.success;
    if (pct >= 60) return COLORS.gold;
    return COLORS.danger;
};

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────
const ShimmerBox = ({ width, height, radius = RADIUS.sm, style }) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
    return (
        <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: '#CFC9BF', opacity }, style]} />
    );
};

const SkeletonCard = () => (
    <View style={sk.card}>
        <View style={sk.topBand}>
            <ShimmerBox width={90} height={10} radius={5} />
            <ShimmerBox width={60} height={10} radius={5} />
        </View>
        <View style={sk.body}>
            <ShimmerBox width={88} height={108} radius={RADIUS.md} />
            <View style={sk.lines}>
                <ShimmerBox width={150} height={16} style={{ marginBottom: 10 }} />
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                    {[55, 42, 68].map((w, i) => <ShimmerBox key={i} width={w} height={22} radius={RADIUS.full} />)}
                </View>
                {[SW - 165, SW - 185, SW - 205].map((w, i) => (
                    <ShimmerBox key={i} width={w} height={10} radius={4} style={{ marginBottom: 7 }} />
                ))}
            </View>
        </View>
        <View style={sk.footer}>
            <ShimmerBox width="100%" height={5} radius={2.5} style={{ marginBottom: 14 }} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {['35%', '30%', '30%'].map((w, i) => (
                    <ShimmerBox key={i} width={w} height={42} radius={RADIUS.md} />
                ))}
            </View>
        </View>
    </View>
);

const sk = StyleSheet.create({
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        borderWidth: 0.5,
        borderColor: COLORS.border,
        marginBottom: 16,
        overflow: 'hidden',
        padding: 0,
    },
    topBand: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#EDE8E0',
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    body: { flexDirection: 'row', gap: 12, padding: 14, paddingBottom: 10 },
    lines: { flex: 1 },
    footer: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 6 },
});

// ─── Premium Avatar ────────────────────────────────────────────────────────────
const Avatar = ({ uri, initials, size = 90, radius = RADIUS.md }) => {
    const [err, setErr] = useState(false);
    const scale = useRef(new Animated.Value(0.85)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const reveal = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        ]).start();
    };

    const colors = [COLORS.navyLight, COLORS.navyMid, COLORS.navy];

    return (
        <View style={{ width: size, height: size + 8, borderRadius: radius, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.gold }}>
            {uri && !err ? (
                <Animated.Image
                    source={{ uri }}
                    style={{ width: '100%', height: '100%', transform: [{ scale }], opacity }}
                    resizeMode="cover"
                    onLoad={reveal}
                    onError={() => { setErr(true); reveal(); }}
                />
            ) : (
                <View style={{ flex: 1, backgroundColor: COLORS.navyMid, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.gold, letterSpacing: 0.5 }}>
                        {initials}
                    </Text>
                </View>
            )}
        </View>
    );
};

// ─── Tag Pill ──────────────────────────────────────────────────────────────────
const Tag = ({ label, type = 'default', icon }) => {
    if (!label) return null;
    const styles = {
        default: { bg: COLORS.goldLight, border: '#E2CE8A', text: COLORS.goldDeep },
        faith: { bg: COLORS.faithBg, border: '#B5CEE8', text: COLORS.faithText },
        green: { bg: COLORS.successBg, border: '#9FD5C3', text: COLORS.successText },
        navy: { bg: '#E8EBF2', border: '#C8D0E0', text: COLORS.navyMid },
        danger: { bg: COLORS.dangerBg, border: '#EEC0AE', text: COLORS.dangerText },
    };
    const s = styles[type] || styles.default;
    return (
        <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 3,
            backgroundColor: s.bg,
            borderWidth: 0.5, borderColor: s.border,
            borderRadius: RADIUS.full,
            paddingHorizontal: 9, paddingVertical: 4,
        }}>
            {icon ? <Text style={{ fontSize: 9 }}>{icon}</Text> : null}
            <Text style={{ fontSize: FONT.xs, color: s.text, fontWeight: '700', letterSpacing: 0.2 }}>
                {label}
            </Text>
        </View>
    );
};

// ─── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label }) => {
    if (!label) return null;
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <Text style={{ fontSize: 11, lineHeight: 16 }}>{icon}</Text>
            <Text style={{ fontSize: FONT.sm, color: COLORS.textSub, flex: 1 }} numberOfLines={1}>{label}</Text>
        </View>
    );
};

// ─── Divider with Label ────────────────────────────────────────────────────────
const SectionLabel = ({ title }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginVertical: 6 }}>
        <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border }} />
        <Text style={{
            fontSize: 9, color: COLORS.gold, fontWeight: '800',
            letterSpacing: 1.5, marginHorizontal: 10, textTransform: 'uppercase',
        }}>{title}</Text>
        <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border }} />
    </View>
);

// ─── Animated Progress Bar ─────────────────────────────────────────────────────
const MatchScore = ({ pct }) => {
    const p = Math.min(100, Math.max(0, Number(pct) || 0));
    const color = getMatchColor(p);
    const w = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(w, { toValue: p, friction: 7, delay: 300, useNativeDriver: false }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 6, delay: 300, useNativeDriver: true }),
        ]).start();
    }, [p]);

    const barW = w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

    return (
        <View style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: COLORS.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <Text style={{ fontSize: FONT.sm, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 0.4 }}>
                    Compatibility Score
                </Text>
                <Animated.View style={{
                    backgroundColor: `${color}18`,
                    borderRadius: RADIUS.full,
                    paddingHorizontal: 10, paddingVertical: 3,
                    transform: [{ scale: scaleAnim }],
                }}>
                    <Text style={{ fontSize: FONT.md, fontWeight: '900', color }}>
                        {p}%
                    </Text>
                </Animated.View>
            </View>
            <View style={{ height: 5, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' }}>
                <Animated.View style={{ height: 5, width: barW, backgroundColor: color, borderRadius: RADIUS.full }} />
            </View>
        </View>
    );
};

// ─── Ripple Button ─────────────────────────────────────────────────────────────
const RippleBtn = ({ label, icon, variant = 'outline', onPress, flex = 1 }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const pressIn = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, friction: 10 }).start();
    const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

    const variants = {
        dark: { bg: COLORS.navy, border: COLORS.navy, text: COLORS.white },
        gold: { bg: COLORS.goldLight, border: COLORS.gold, text: COLORS.goldDeep },
        blue: { bg: '#1B55E2', border: '#1B55E2', text: COLORS.white },
        outline: { bg: 'transparent', border: COLORS.border, text: COLORS.text },
    };
    const v = variants[variant];

    return (
        <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={{ flex }}>
            <Animated.View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
                backgroundColor: v.bg,
                borderWidth: variant === 'outline' ? 0.5 : 1.5,
                borderColor: v.border,
                borderRadius: RADIUS.md,
                paddingVertical: 12,
                transform: [{ scale }],
            }}>
                {icon && <Text style={{ fontSize: 13 }}>{icon}</Text>}
                <Text style={{ fontSize: FONT.sm, fontWeight: '700', color: v.text, letterSpacing: 0.3 }}>
                    {label}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

// ─── Member Card ───────────────────────────────────────────────────────────────
const MemberCard = React.memo(({
    item,
    onViewProfile,
    onViewMatch,
    onUpdateProfile,
    index,
    myProfileImage
}) => {
    const age = calcAge(item.date_of_birth);
    const height = cmToFeet(item.height);
    const imgUri = item.profile_image
        ? resolveImage(item.profile_image)
        : myProfileImage;
    const initials = getInitials(item?.full_name ?? '');
    const uid = item.user_id || item.id || '';
    const isGroom = item.gender === 'male' || item.gender === 'Male';
    const matchPct = Number(item.match_percentage ?? 0);

    const translateY = useRef(new Animated.Value(30)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0, duration: 400,
                delay: Math.min(index * 70, 350),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1, duration: 400,
                delay: Math.min(index * 70, 350),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[C.cardWrap, { transform: [{ translateY }], opacity }]}>
           
            {/* ── Header Band ── */}
            <View style={C.headerBand}>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Gender badge */}
                    <View style={[C.genderDot, { backgroundColor: isGroom ? '#1B55E2' : '#B5327A' }]} />
                    <Text style={C.headerUID}>#{uid}</Text>
                    <View style={C.genderPill}>
                        <Text style={[C.genderPillTxt, { color: isGroom ? '#5FA4F8' : '#E07CC0' }]}>
                            {isGroom ? 'Groom' : 'Bride'}
                        </Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {item.is_verified && (
                        <View style={C.verifiedBadge}>
                            <Text style={C.verifiedTxt}>✓ Verified</Text>
                        </View>
                    )}
                    <View style={C.matchBubble}>
                        <Text style={[C.matchBubbleTxt, { color: getMatchColor(matchPct) }]}>
                            {matchPct}%
                        </Text>
                    </View>
                </View>
            </View>

            {/* ── Main Content ── */}
            <View style={C.mainRow}>
                <View style={C.avatarCol}>
                    <Avatar
                        uri={imgUri}
                        initials={initials}
                        size={90}
                    />

                    {item.marital_status && (
                        <View style={C.maritalBadge}>
                            <Text style={C.maritalTxt}>
                                {item.marital_status}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={C.name} numberOfLines={1}>{item.full_name || '—'}</Text>
                    <Text style={C.profileCode}>
                        Profile ID : #{uid}
                    </Text>

                    {/* Quick Vitals Row */}
                    <View style={C.tagWrap}>
                        {age && <Tag label={`${age} yrs`} icon="🎂" />}
                        {height && <Tag label={height} icon="📏" />}
                        {item.current_location && <Tag label={item.current_location} icon="📍" />}
                        {item.denomination && <Tag label={item.denomination} type="faith" />}
                        {item.community && !item.denomination && <Tag label={item.community} type="faith" />}
                    </View>

                    <InfoRow icon="💼" label={item.occupation} />
                    <InfoRow icon="🎓" label={item.education} />
                    <InfoRow icon="⛪" label={item.church_name} />
                </View>
            </View>

            {/* ── Extra Details ── */}
            {(item.mother_tongue || item.annual_income || item.house_type) && (
                <>
                    <SectionLabel title="More Details" />
                    <View style={C.extraGrid}>
                        {[
                            { label: 'Mother Tongue', val: item.mother_tongue },
                            { label: 'Income', val: item.annual_income },
                            { label: 'House', val: item.house_type },
                        ].filter(x => x.val).map((x, i) => (
                            <View key={i} style={C.extraCell}>
                                <Text style={C.extraLabel}>{x.label}</Text>
                                <Text style={C.extraVal} numberOfLines={1}>{x.val}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}

            {/* ── Faith Tags ── */}
            {(item.saved_person || item.baptized || item.holy_spirit || item.church_attendance_frequency) && (
                <View style={C.faithRow}>
                    {item.saved_person && <Tag label="Saved" type="faith" icon="✝" />}
                    {item.baptized && <Tag label="Baptized" type="faith" icon="💧" />}
                    {item.holy_spirit && <Tag label="Holy Spirit" type="faith" icon="🕊" />}
                    {item.church_attendance_frequency && (
                        <Tag label={item.church_attendance_frequency} type="faith" />
                    )}
                </View>
            )}

            {/* ── Compatibility Bar ── */}
            <MatchScore pct={matchPct} />

            {/* ── Action Buttons ── */}
            <View style={C.btnRow}>
                <RippleBtn label="Profile" icon="👤" variant="dark" onPress={() => onViewProfile(item)} />
                <RippleBtn label="Match" icon="♡" variant="gold" onPress={() => onViewMatch(item)} />
                <RippleBtn label="Edit" icon="✏️" variant="blue" onPress={() => onUpdateProfile(item)} />
            </View>
        </Animated.View>
    );
});

const C = StyleSheet.create({
    cardWrap: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        borderWidth: 0.5,
        borderColor: COLORS.border,
        marginBottom: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
            },
            android: { elevation: 3 },
        }),
    },
    headerBand: {
        backgroundColor: COLORS.navy,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    profileCode: {
        fontSize: 12,
        color: COLORS.goldDeep,
        fontWeight: '700',
        marginBottom: 6,
    },
    genderDot: { width: 8, height: 8, borderRadius: 4 },
    headerUID: { fontSize: FONT.sm, color: COLORS.gold, fontWeight: '800', letterSpacing: 0.6 },
    genderPill: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: RADIUS.full,
        paddingHorizontal: 8, paddingVertical: 2,
    },
    genderPillTxt: { fontSize: FONT.xs, fontWeight: '700' },
    verifiedBadge: {
        backgroundColor: '#0A3D24',
        borderRadius: RADIUS.full,
        paddingHorizontal: 9, paddingVertical: 3,
    },
    verifiedTxt: { fontSize: FONT.xs, color: '#4ECC8A', fontWeight: '700' },
    matchBubble: {
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: RADIUS.full,
        paddingHorizontal: 8, paddingVertical: 3,
        minWidth: 42, alignItems: 'center',
    },
    matchBubbleTxt: { fontSize: FONT.sm, fontWeight: '900' },
    mainRow: {
        padding: 14,
    },
    avatarCol: { alignItems: 'center', gap: 6 },
    maritalBadge: {
        backgroundColor: COLORS.navy,
        borderRadius: RADIUS.full,
        paddingHorizontal: 8, paddingVertical: 3,
        maxWidth: 90, alignItems: 'center',
    },
    maritalTxt: { fontSize: 8, color: COLORS.gold, fontWeight: '700', letterSpacing: 0.3 },
    name: {
        fontSize: FONT.lg,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 9 },
    extraGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 14,
        paddingBottom: 10,
    },
    extraCell: {
        backgroundColor: COLORS.bg,
        borderRadius: RADIUS.sm,
        paddingHorizontal: 11,
        paddingVertical: 8,
        minWidth: (SW - 72) / 3 - 8,
        borderWidth: 0.5,
        borderColor: COLORS.border,
        flex: 1,
    },
    extraLabel: {
        fontSize: 9,
        color: COLORS.textMuted,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 3,
    },
    extraVal: { fontSize: FONT.sm, color: COLORS.text, fontWeight: '700' },
    faithRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        paddingHorizontal: 14,
        paddingBottom: 10,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        paddingTop: 10,
        paddingHorizontal: 14,
        backgroundColor: COLORS.bg,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.border,
    },
});

// ─── Header Stats Banner ───────────────────────────────────────────────────────
const HeaderBanner = ({ count, loading }) => {
    const numAnim = useRef(new Animated.Value(0)).current;
    const [displayed, setDisplayed] = useState(0);
    const slideY = useRef(new Animated.Value(-20)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideY, { toValue: 0, duration: 500, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        if (!loading) {
            const listener = numAnim.addListener(({ value }) => setDisplayed(Math.floor(value)));
            Animated.timing(numAnim, { toValue: count, duration: 1000, useNativeDriver: false }).start();
            return () => numAnim.removeListener(listener);
        }
    }, [count, loading]);

    return (
        <Animated.View style={[HB.wrap, { transform: [{ translateY: slideY }], opacity: fadeAnim }]}>
            <View style={HB.left}>
                <Text style={HB.eyebrow}>✦ Faith-based Matchmaking</Text>
                <Text style={HB.title}>Suggested Matches</Text>
                <Text style={HB.subtitle}>Curated by denomination & preferences</Text>
            </View>
            <View style={HB.countBox}>
                <Text style={HB.countNum}>{loading ? '—' : displayed}</Text>
                <Text style={HB.countLabel}>Profiles</Text>
            </View>
        </Animated.View>
    );
};
const HB = StyleSheet.create({
    wrap: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gold + '30',
    },
    left: {},
    eyebrow: { fontSize: 9, color: COLORS.gold, fontWeight: '700', letterSpacing: 1.8, marginBottom: 4 },
    title: { fontSize: FONT.xl, fontWeight: '900', color: COLORS.white, letterSpacing: -0.4 },
    subtitle: { fontSize: FONT.sm, color: COLORS.muted, marginTop: 3 },
    countBox: {
        backgroundColor: COLORS.gold,
        borderRadius: RADIUS.lg,
        paddingHorizontal: 18,
        paddingVertical: 10,
        alignItems: 'center',
        minWidth: 72,
    },
    countNum: { fontSize: FONT.xxl, fontWeight: '900', color: COLORS.navy, lineHeight: 28 },
    countLabel: { fontSize: 9, fontWeight: '800', color: COLORS.navyMid, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 1 },
});

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ onRetry }) => {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.1, duration: 750, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={ES.wrap}>
            <Animated.Text style={[ES.icon, { transform: [{ scale: pulse }] }]}>🙏</Animated.Text>
            <Text style={ES.heading}>No Matches Found</Text>
            <Text style={ES.body}>
                Complete your profile to receive faith-based suggestions tailored just for you.
            </Text>
            <TouchableOpacity style={ES.btn} onPress={onRetry} activeOpacity={0.8}>
                <Text style={ES.btnTxt}>Refresh Matches</Text>
            </TouchableOpacity>
        </View>
    );
};
const ES = StyleSheet.create({
    wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    icon: { fontSize: 56, marginBottom: 18 },
    heading: { fontSize: FONT.xl, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
    body: { fontSize: FONT.md, color: COLORS.textSub, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
    btn: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 32, paddingVertical: 14,
        borderRadius: RADIUS.md,
    },
    btnTxt: { color: COLORS.gold, fontWeight: '800', fontSize: FONT.md, letterSpacing: 0.4 },
});

// ─── Filter Tab Bar ────────────────────────────────────────────────────────────
const FilterBar = ({ active, onChange }) => {
    const tabs = ['All', 'Bride', 'Groom'];
    return (
        <View style={FB.wrap}>
            {tabs.map(t => (
                <TouchableOpacity
                    key={t}
                    style={[FB.tab, active === t && FB.tabActive]}
                    onPress={() => onChange(t)}
                    activeOpacity={0.7}
                >
                    <Text style={[FB.tabTxt, active === t && FB.tabTxtActive]}>{t}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};
const FB = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        backgroundColor: COLORS.bgCard,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.border,
    },
    tab: {
        flex: 1, alignItems: 'center',
        paddingVertical: 8,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.bg,
        borderWidth: 0.5,
        borderColor: COLORS.border,
    },
    tabActive: {
        backgroundColor: COLORS.navy,
        borderColor: COLORS.navy,
    },
    tabTxt: { fontSize: FONT.sm, fontWeight: '600', color: COLORS.textSub },
    tabTxtActive: { color: COLORS.gold, fontWeight: '800' },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function MemberListScreen({ navigation }) {

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('All');
    const [myProfileImage, setMyProfileImage] = useState(null);

    const fetchMembers = useCallback(async () => {
        try {
            const [token, userId] = await Promise.all([
                AsyncStorage.getItem('userToken'),
                AsyncStorage.getItem('matrimonyUserId'),
            ]);
            const res = await fetch(
                `${BASE_URL}/api/view_profile/${userId}`,
                { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
            );
            const result = await res.json();
            console.log('[MemberList] API →', result);

            if (result.status === true || result.success === true) {
                const list =
                    Array.isArray(result.data) ? result.data :
                        Array.isArray(result.profiles) ? result.profiles :
                            Array.isArray(result.matches) ? result.matches :
                                Array.isArray(result) ? result : [];
                setMembers(list);
            } else {
                Alert.alert('Error', result.message || 'Could not load profiles');
            }
        } catch (e) {
            console.error('[MemberList] Error:', e);
            Alert.alert('Network Error', e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);
    useEffect(() => {
        loadMyProfile();
        fetchMembers();
    }, []);
    const loadMyProfile = async () => {
        try {
            const stored = await AsyncStorage.getItem('profileData');

            if (stored) {
                const profile = JSON.parse(stored);
                setMyProfileImage(profile?.profile_image);
            }
        } catch (e) {
            console.log('Profile image error:', e);
        }
    };
    useFocusEffect(useCallback(() => { fetchMembers(); }, [fetchMembers]));

    const onRefresh = () => { setRefreshing(true); fetchMembers(); };

    const filtered = filter === 'All' ? members : members.filter(m => {
        const g = (m.gender || '').toLowerCase();
        return filter === 'Groom' ? g === 'male' : g === 'female';
    });

   const handleViewProfile = useCallback((item) => {
    navigation.navigate('ViewProfile', {
        profileId: item?.id,
        profileImage: item?.profile_image
            ? resolveImage(item.profile_image)
            : myProfileImage,
        fullName: item?.full_name,
        age: calcAge(item?.date_of_birth),
        location: item?.current_location,
    });
}, [myProfileImage]);

    const handleViewMatch = useCallback((item) =>
        navigation.navigate('Matches', { memberData: item }), []);
    const handleUpdateProfile = useCallback((item) =>
        navigation.navigate('EditProfile', { profileId: item.id, profileData: item }), []);

    return (
        <SafeAreaView style={SCR.safe} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

            <HeaderBanner count={members.length} loading={loading} />
            <FilterBar active={filter} onChange={setFilter} />

            {loading ? (
                <FlatList
                    data={[1, 2, 3]}
                    keyExtractor={(i) => String(i)}
                    renderItem={() => <SkeletonCard />}
                    contentContainerStyle={SCR.listPad}
                    showsVerticalScrollIndicator={false}
                />
            ) : filtered.length === 0 ? (
                <EmptyState onRetry={fetchMembers} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item, idx) => String(item.user_id || item.id || idx)}
                    renderItem={({ item, index }) => (
                        <MemberCard
                            item={item}
                            index={index}
                            myProfileImage={myProfileImage}
                            onViewProfile={handleViewProfile}
                            onViewMatch={handleViewMatch}
                            onUpdateProfile={handleUpdateProfile}
                        />
                    )}
                    contentContainerStyle={SCR.listPad}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.gold}
                            colors={[COLORS.gold]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const SCR = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    listPad: { padding: 14, paddingBottom: 36 },
});