import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Animated, StatusBar, Platform, Dimensions, FlatList,
  TouchableWithoutFeedback, RefreshControl, Vibration, Easing,
} from 'react-native';
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// ─── Palette ──────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const GOLD_DIM = '#B8954A';
const DARK = '#080C18';
const NAVY = '#0F234A';
const CREAM = '#F5F1EB';
const GREEN = '#1D9E5A';
const ROSE = '#D88C9A';
const RED = '#E74C3C';

const MENU_WIDTH = width * 0.78;

// ─── Slider geometry ────────────────────────────────────────────
const SLIDER_CARD_WIDTH = width - 40;
const SLIDER_SPACING = 14;
const SLIDER_SNAP = SLIDER_CARD_WIDTH + SLIDER_SPACING;
const SLIDER_AUTO = 3500;

const SPOT_CARD_WIDTH = width - 40;
const SPOT_SPACING = 14;
const SPOT_SNAP = SPOT_CARD_WIDTH + SPOT_SPACING;
const SPOT_AUTO = 3800;

const TESTI_CARD_WIDTH = width - 72;
const TESTI_SPACING = 14;
const TESTI_SNAP = TESTI_CARD_WIDTH + TESTI_SPACING;
const TESTI_AUTO = 4200;

// ─── Static data ────────────────────────────────────────────────
const FEATURED = [
  { id: '1', name: 'Sarah', age: 24, location: 'Chennai', denom: 'Protestant', online: true, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400' },
  { id: '2', name: 'David', age: 27, location: 'Kochi', denom: 'Catholic', online: false, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400' },
  { id: '3', name: 'Rachel', age: 25, location: 'Hyderabad', denom: 'Pentecostal', online: true, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400' },
  { id: '4', name: 'Jonathan', age: 29, location: 'Bangalore', denom: 'Baptist', online: false, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400' },
  { id: '5', name: 'Priya', age: 26, location: 'Madurai', denom: 'CSI', online: true, image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400' },
  { id: '6', name: 'Daniel', age: 28, location: 'Trivandrum', denom: 'Marthoma', online: false, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400' },
];

const FALLBACK_SPOTLIGHT = [
  { user_id: 'f1', full_name: 'Grace Matthews', current_location: 'Visakhapatnam', denomination: 'Protestant', education: 'B.Tech, VIT', match_percentage: 98, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800' },
  { user_id: 'f2', full_name: 'Andrew Samuel', current_location: 'Hyderabad', denomination: 'Pentecostal', education: 'M.Sc, BITS Pilani', match_percentage: 95, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800' },
  { user_id: 'f3', full_name: 'Lydia Thomas', current_location: 'Coimbatore', denomination: 'Catholic', education: 'B.Sc Nursing', match_percentage: 91, image: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?q=80&w=800' },
];

const FEED = [
  {
    id: '101', name: 'Grace Matthews', age: 24, location: 'Visakhapatnam',
    matchScore: '98%', job: 'Software Engineer', edu: 'B.Tech, VIT',
    height: "5'4\"", image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
    denom: 'Protestant', tags: ['Saved', 'Weekly Church', 'Baptized'], verified: true,
  },
  {
    id: '102', name: 'Andrew Samuel', age: 28, location: 'Hyderabad',
    matchScore: '95%', job: 'Data Scientist', edu: 'M.Sc, BITS',
    height: "5'10\"", image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600',
    denom: 'Pentecostal', tags: ['Ministry', 'Anointed', 'Cell Group'], verified: true,
  },
  {
    id: '103', name: 'Lydia Thomas', age: 25, location: 'Coimbatore',
    matchScore: '91%', job: 'Nurse', edu: 'B.Sc Nursing',
    height: "5'3\"", image: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?q=80&w=600',
    denom: 'Catholic', tags: ['Catholic', 'Baptized', 'Saved'], verified: false,
  },
  {
    id: '104', name: 'Priya Daniel', age: 26, location: 'Madurai',
    matchScore: '89%', job: 'School Teacher', edu: 'B.Ed, MK University',
    height: "5'5\"", image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600',
    denom: 'CSI', tags: ['Choir', 'Sunday School', 'Saved'], verified: true,
  },
];

const TESTIMONIALS = [
  { id: 't1', names: 'Daniel & Esther', date: 'Married Dec 2025', quote: 'We matched on a quiet Tuesday evening and knew within a month this was different. Grateful for a platform that took our faith seriously.', image: 'https://images.unsplash.com/photo-1521543387467-9ff2e6da5d2a?q=80&w=400' },
  { id: 't2', names: 'Wilson & Anita', date: 'Married Feb 2026', quote: 'Every match felt thoughtful, never random. We were engaged within four months of our first message here.', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=400' },
  { id: 't3', names: 'Thomas & Reema', date: 'Married Sep 2025', quote: 'Verified profiles gave us real peace of mind from day one. Our families connected almost as easily as we did.', image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=400' },
];

const MENU_ITEMS = [
  { label: 'Create My Profile', icon: '👤', screen: 'PersonalDetails', badge: null },
  { label: 'My Matches', icon: '♡', screen: 'member', badge: '12' },
  { label: 'Gallery', icon: '🖼️', screen: 'Gallery', badge: null },
  { label: 'Who Likes Me', icon: '👁', screen: 'whoislike', badge: '5' },
  { label: 'My Shortlist', icon: '☆', screen: 'Shortlist', badge: null },
];
const MENU_ITEMS2 = [
  { label: 'Interests Sent', icon: '➤', screen: 'InterestsSent', badge: null },
  { label: 'Interests Received', icon: '📥', screen: 'InterestsReceived', badge: '3' },
];
const MENU_ITEMS3 = [
  { label: 'Settings', icon: '⚙', screen: null, badge: null },
  { label: 'Logout', icon: '→', screen: null, badge: null, danger: true },
];
const TABS = [
  { name: 'Home', icon: '🏠', screen: 'Home' },
  { name: 'Matches', icon: '💞', screen: 'Matches' },
  { name: 'Messages', icon: '💬', screen: 'Messages' },
  { name: 'Profile', icon: '👤', screen: 'Profile' },
];
const FILTERS = ['All', 'Nearby', 'Verified', 'Protestant', 'Catholic', 'Pentecostal'];

// ─── Generic autoplay helper (works for any horizontal FlatList) ──
function startAutoplay({ timerRef, idxRef, touchedRef, listRef, setIdx, count, snap, interval }) {
  if (timerRef.current) clearInterval(timerRef.current);
  if (!count || count < 2) return;
  timerRef.current = setInterval(() => {
    if (touchedRef.current) return;
    const next = (idxRef.current + 1) % count;
    idxRef.current = next;
    setIdx(next);
    listRef.current?.scrollToOffset({ offset: next * snap, animated: true });
  }, interval);
}

// ════════════════════════════════════════════════════════════════
// Wrapper — provides SafeAreaProvider at the root so insets work
// correctly on every device (notches, punch holes, Android nav bar)
// ════════════════════════════════════════════════════════════════
export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaProvider>
      <HomeScreenInner navigation={navigation} />
    </SafeAreaProvider>
  );
}

function HomeScreenInner({ navigation }) {
  const insets = useSafeAreaInsets();

  // ── Animated values ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;
  const menuAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const mainScaleAnim = useRef(new Animated.Value(1)).current;
  const cardScales = useRef(FEED.map(() => new Animated.Value(0.94))).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const sliderScrollX = useRef(new Animated.Value(0)).current;
  const spotScrollX = useRef(new Animated.Value(0)).current;
  const testiScrollX = useRef(new Animated.Value(0)).current;
  const scrollTopOpacity = useRef(new Animated.Value(0)).current;
  const tabIndicatorX = useRef(new Animated.Value(0)).current;

  // ── Refs ──
  const spotRef = useRef(null);
  const sliderRef = useRef(null);
  const testiRef = useRef(null);
  const scrollRef = useRef(null);
  const sliderTimer = useRef(null);
  const spotTimer = useRef(null);
  const testiTimer = useRef(null);
  const sliderIdxRef = useRef(0);
  const spotIdxRef = useRef(0);
  const testiIdxRef = useRef(0);
  const isSliderTouched = useRef(false);
  const isSpotTouched = useRef(false);
  const isTestiTouched = useRef(false);
  const scrollTopShown = useRef(false);

  // ── State ──
  const [activeTab, setActiveTab] = useState('Home');
  const [liked, setLiked] = useState({});
  const [spotIdx, setSpotIdx] = useState(0);
  const [sliderIdx, setSliderIdx] = useState(0);
  const [testiIdx, setTestiIdx] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Home');
  const [sliders, setSliders] = useState([]);
  const [loadingSliders, setLoadingSliders] = useState(true);
  const [spotlightProfiles, setSpotlightProfiles] = useState([]);
  const [loadingSpotlight, setLoadingSpotlight] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const tabSegment = (width - 32 - 16) / TABS.length;

  // ── Mount sequence ──
  useEffect(() => {
    fetchSliders();
    fetchSpotlightProfiles();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 55, useNativeDriver: true }),
    ]).start();

    FEED.forEach((_, i) => {
      Animated.spring(cardScales[i], {
        toValue: 1, friction: 7, tension: 45,
        delay: 300 + i * 140, useNativeDriver: true,
      }).start();
    });
  }, []);

  // ── Autoplay: promo slider ──
  useEffect(() => {
    startAutoplay({
      timerRef: sliderTimer, idxRef: sliderIdxRef, touchedRef: isSliderTouched,
      listRef: sliderRef, setIdx: setSliderIdx,
      count: sliders.length, snap: SLIDER_SNAP, interval: SLIDER_AUTO,
    });
    return () => { if (sliderTimer.current) clearInterval(sliderTimer.current); };
  }, [sliders.length]);

  // ── Autoplay: spotlight ──
  useEffect(() => {
    startAutoplay({
      timerRef: spotTimer, idxRef: spotIdxRef, touchedRef: isSpotTouched,
      listRef: spotRef, setIdx: setSpotIdx,
      count: spotlightProfiles.length, snap: SPOT_SNAP, interval: SPOT_AUTO,
    });
    return () => { if (spotTimer.current) clearInterval(spotTimer.current); };
  }, [spotlightProfiles.length]);

  // ── Autoplay: testimonials ──
  useEffect(() => {
    startAutoplay({
      timerRef: testiTimer, idxRef: testiIdxRef, touchedRef: isTestiTouched,
      listRef: testiRef, setIdx: setTestiIdx,
      count: TESTIMONIALS.length, snap: TESTI_SNAP, interval: TESTI_AUTO,
    });
    return () => { if (testiTimer.current) clearInterval(testiTimer.current); };
  }, []);

  // ── Tab indicator slide ──
  useEffect(() => {
    const idx = TABS.findIndex(t => t.name === activeTab);
    Animated.spring(tabIndicatorX, {
      toValue: idx * tabSegment + 6, friction: 8, tension: 60, useNativeDriver: true,
    }).start();
  }, [activeTab]);

  // ── Data fetching ──
  const fetchSliders = async () => {
    try {
      const response = await fetch('https://matrimony.gmworld.net/api/get_sliders');
      const json = await response.json();
      if (json.status) {
        setSliders(json.data);
        sliderIdxRef.current = 0;
        setSliderIdx(0);
      }
    } catch (error) {
      console.log('Slider API Error:', error);
    } finally {
      setLoadingSliders(false);
    }
  };

  const fetchSpotlightProfiles = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('matrimonyUserId');

      const response = await fetch(
        `https://matrimony.gmworld.net/api/view_profile/${userId}`,
        { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();

      const profiles =
        Array.isArray(result.data) ? result.data :
          Array.isArray(result.profiles) ? result.profiles :
            Array.isArray(result.matches) ? result.matches : [];

      if ((result.status === true || result.success === true) && profiles.length > 0) {
        setSpotlightProfiles(profiles);
      } else {
        setSpotlightProfiles(FALLBACK_SPOTLIGHT);
      }
      spotIdxRef.current = 0;
      setSpotIdx(0);
    } catch (error) {
      console.log('Spotlight Error:', error);
      setSpotlightProfiles(FALLBACK_SPOTLIGHT);
    } finally {
      setLoadingSpotlight(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchSliders(), fetchSpotlightProfiles()]);
    setRefreshing(false);
  }, []);

  // ── Menu ──
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      if (menuOpen) closeMenu();
      setTimeout(() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }), 200);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.spring(menuAnim, { toValue: 0, friction: 9, tension: 65, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(mainScaleAnim, { toValue: 0.93, friction: 9, tension: 65, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.spring(menuAnim, { toValue: -MENU_WIDTH, friction: 9, tension: 70, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
      Animated.spring(mainScaleAnim, { toValue: 1, friction: 9, tension: 70, useNativeDriver: true }),
    ]).start(() => setMenuOpen(false));
  };

  const handleMenuNav = (item) => {
    if (item.label === 'Logout') { handleLogout(); return; }
    setActiveMenu(item.label);
    closeMenu();
    if (item.screen && item.screen !== 'Home') {
      setTimeout(() => navigation.navigate(item.screen), 320);
    }
  };

  const toggleLike = id => setLiked(prev => ({ ...prev, [id]: !prev[id] }));

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // ── Main scroll handler (drives header shadow + scroll-to-top fab) ──
  const handleMainScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (e) => {
        const y = e.nativeEvent.contentOffset.y;
        const should = y > 420;
        if (should !== scrollTopShown.current) {
          scrollTopShown.current = should;
          setShowScrollTop(should);
          Animated.spring(scrollTopOpacity, { toValue: should ? 1 : 0, friction: 7, useNativeDriver: true }).start();
        }
      },
    }
  );

  const headerShadowOpacity = scrollY.interpolate({ inputRange: [0, 30], outputRange: [0, 0.12], extrapolate: 'clamp' });
  const headerElevation = scrollY.interpolate({ inputRange: [0, 30], outputRange: [0, 6], extrapolate: 'clamp' });
  const greetOpacity = scrollY.interpolate({ inputRange: [0, 50], outputRange: [1, 0], extrapolate: 'clamp' });
  const titleScale = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.92], extrapolate: 'clamp' });

  const fabBottom = 96 + insets.bottom * 0.4;

  return (
    <View style={{ flex: 1, backgroundColor: DARK }}>

      {/* ── Side drawer ── */}
      <Animated.View style={[styles.menuDrawer, { transform: [{ translateX: menuAnim }] }]}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View style={styles.menuProfile}>
            <View style={styles.menuAvatarRing}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200' }}
                style={styles.menuAvatar}
              />
              <View style={styles.menuVerifiedBadge}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>✓</Text>
              </View>
            </View>
            <Text style={styles.menuName}>Sarah Johnson</Text>
            <Text style={styles.menuSub}>27 · Protestant Christian</Text>
            <View style={styles.premiumPill}>
              <Text style={styles.premiumText}>👑  Premium Member</Text>
            </View>
          </View>

          <View style={styles.completionCard}>
            <View style={styles.completionCircle}>
              <Text style={styles.completionPct}>85%</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={styles.completionSub}>Add a bio to reach 100%</Text>
              <View style={styles.completionTrack}>
                <View style={styles.completionFill} />
              </View>
            </View>
          </View>

          <View style={styles.menuDivider} />

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {MENU_ITEMS.map((item, i) => (
              <MenuNavItem
                key={item.label} item={item} active={activeMenu === item.label}
                onPress={() => handleMenuNav(item)} open={menuOpen} delay={i * 45}
              />
            ))}
            <View style={styles.menuDivider} />
            {MENU_ITEMS2.map((item, i) => (
              <MenuNavItem
                key={item.label} item={item} active={activeMenu === item.label}
                onPress={() => handleMenuNav(item)} open={menuOpen} delay={(MENU_ITEMS.length + i) * 45}
              />
            ))}
            <View style={styles.menuDivider} />
            {MENU_ITEMS3.map((item, i) => (
              <MenuNavItem
                key={item.label} item={item} active={activeMenu === item.label}
                onPress={() => handleMenuNav(item)} open={menuOpen}
                delay={(MENU_ITEMS.length + MENU_ITEMS2.length + i) * 45}
              />
            ))}

            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={() => { closeMenu(); navigation.navigate('Membership'); }}
              activeOpacity={0.85}
            >
              <View style={styles.upgradeIconBox}><Text style={{ fontSize: 20 }}>👑</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradeTitle}>Unlock Unlimited Matches</Text>
                <Text style={styles.upgradeSub}>UPGRADE TO PREMIUM</Text>
              </View>
              <Text style={{ color: GOLD, fontSize: 20 }}>›</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Animated.View>

      {/* ── Overlay ── */}
      {menuOpen && (
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} pointerEvents="auto">
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </Animated.View>
      )}

      {/* ── Main content ── */}
      <Animated.View
        style={[styles.mainContent, { transform: [{ scale: mainScaleAnim }] }]}
        pointerEvents={menuOpen ? 'none' : 'auto'}
      >
        <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="dark-content" backgroundColor="#F5F1EB" />

          {/* Header */}
          <Animated.View style={[styles.header, { shadowOpacity: headerShadowOpacity, elevation: headerElevation }]}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.menuBtn} onPress={openMenu} activeOpacity={0.7}>
                <View style={styles.hLine} />
                <View style={[styles.hLine, { width: 14 }]} />
                <View style={styles.hLine} />
              </TouchableOpacity>
              <View>
                <Animated.Text style={[styles.headerGreet, { opacity: greetOpacity }]}>Good morning 👋</Animated.Text>
                <Animated.Text style={[styles.headerTitle, { transform: [{ scale: titleScale }] }]}>Find Your Fellowship</Animated.Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.7}
              >
                <Text style={styles.iconBtnText}>🔔</Text>
                <View style={styles.notifBadge}><Text style={styles.notifText}>3</Text></View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatarBtn}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' }}
                  style={styles.avatar}
                />
                <View style={styles.onlineDot} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleMainScroll}
            contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} colors={[GOLD]} />
            }
          >

            {/* Stats strip */}
            <Animated.View style={[styles.statsStrip, { opacity: fadeAnim, transform: [{ translateY: slideUp }] }]}>
              <View style={styles.statItem}>
                <CountUp to={1240} suffix="+" />
                <Text style={styles.statLbl}>Active Members</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statItem}>
                <CountUp to={860} suffix="+" delay={150} />
                <Text style={styles.statLbl}>Verified Profiles</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statItem}>
                <CountUp to={312} suffix="+" delay={300} />
                <Text style={styles.statLbl}>Success Stories</Text>
              </View>
            </Animated.View>

            {/* ── Promo slider (API driven, parallax cards) ── */}
            <Animated.View style={{ opacity: fadeAnim }}>
              {loadingSliders ? (
                <ShimmerBlock style={[styles.sliderCard, styles.sliderSkeleton, { marginLeft: 20 }]} />
              ) : sliders.length > 0 ? (
                <>
                  <AnimatedFlatList
                    ref={sliderRef}
                    data={sliders}
                    horizontal
                    decelerationRate="fast"
                    snapToInterval={SLIDER_SNAP}
                    snapToAlignment="start"
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: sliderScrollX } } }],
                      { useNativeDriver: false }
                    )}
                    onScrollBeginDrag={() => { isSliderTouched.current = true; }}
                    onScrollEndDrag={() => { setTimeout(() => { isSliderTouched.current = false; }, 1500); }}
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.x / SLIDER_SNAP);
                      sliderIdxRef.current = idx;
                      setSliderIdx(idx);
                    }}
                    getItemLayout={(_, index) => ({ length: SLIDER_SNAP, offset: SLIDER_SNAP * index, index })}
                    renderItem={({ item, index }) => (
                      <PromoSlide item={item} index={index} scrollX={sliderScrollX} />
                    )}
                  />
                  <Pagination count={sliders.length} index={sliderIdx} />
                </>
              ) : null}
            </Animated.View>

            {/* Filter chips */}
            <Animated.View style={[styles.chipsScroll, { opacity: fadeAnim, flexDirection: 'row' }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {FILTERS.map(f => (
                  <FilterChip key={f} label={f} active={selectedFilter === f} onPress={() => setSelectedFilter(f)} />
                ))}
              </ScrollView>
            </Animated.View>

            {/* Urgency / daily refresh banner */}
            <Animated.View style={[styles.urgencyBanner, { opacity: fadeAnim }]}>
              <PulseRing size={10} color={GOLD} style={{ marginRight: 10 }} />
              <Text style={styles.urgencyText}>
                Your Spotlight matches refresh in <Text style={styles.urgencyBold}>06h 42m</Text>
              </Text>
            </Animated.View>

            {/* Spotlight slider */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUp }] }}>
              <View style={[styles.sectionRow, { paddingHorizontal: 20 }]}>
                <View style={styles.sectionTitleWrap}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.sectionTitle}>Spotlight Matches</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Matches')} activeOpacity={0.7}>
                  <Text style={styles.viewAll}>View all →</Text>
                </TouchableOpacity>
              </View>

              {loadingSpotlight ? (
                <ShimmerBlock style={[styles.spotCard, { marginLeft: 20, backgroundColor: '#E5DFD0', borderRadius: 22 }]} />
              ) : (
                <AnimatedFlatList
                  ref={spotRef}
                  data={spotlightProfiles}
                  horizontal
                  decelerationRate="fast"
                  snapToInterval={SPOT_SNAP}
                  snapToAlignment="start"
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => String(item.user_id || item.id || index)}
                  contentContainerStyle={{ paddingHorizontal: 20, gap: SPOT_SPACING }}
                  scrollEventThrottle={16}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: spotScrollX } } }],
                    { useNativeDriver: false }
                  )}
                  onScrollBeginDrag={() => { isSpotTouched.current = true; }}
                  onScrollEndDrag={() => { setTimeout(() => { isSpotTouched.current = false; }, 1500); }}
                  onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / SPOT_SNAP);
                    spotIdxRef.current = idx;
                    setSpotIdx(idx);
                  }}
                  getItemLayout={(_, index) => ({ length: SPOT_SNAP, offset: SPOT_SNAP * index, index })}
                  renderItem={({ item, index }) => (
                    <SpotlightCard item={item} index={index} scrollX={spotScrollX} navigation={navigation} />
                  )}
                />
              )}
              {!loadingSpotlight && <Pagination count={spotlightProfiles.length} index={spotIdx} />}
            </Animated.View>

            {/* New Verified Matches — circles */}
            <View style={styles.sectionPad}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionTitleWrap}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.sectionTitle}>New & Verified</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Matches')} activeOpacity={0.7}>
                  <Text style={styles.viewAll}>View all →</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {FEATURED.map((item, i) => (
                  <FeaturedCircle key={item.id} item={item} index={i} navigation={navigation} />
                ))}
              </ScrollView>
            </View>

            {/* Success stories */}
            <View style={styles.sectionPad}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionTitleWrap}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.sectionTitle}>Success Stories</Text>
                </View>
                <Text style={[styles.viewAll, { color: '#B5A78A' }]}>Real couples ✦</Text>
              </View>
              <AnimatedFlatList
                ref={testiRef}
                data={TESTIMONIALS}
                horizontal
                decelerationRate="fast"
                snapToInterval={TESTI_SNAP}
                snapToAlignment="start"
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 20, gap: TESTI_SPACING }}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: testiScrollX } } }],
                  { useNativeDriver: false }
                )}
                onScrollBeginDrag={() => { isTestiTouched.current = true; }}
                onScrollEndDrag={() => { setTimeout(() => { isTestiTouched.current = false; }, 1500); }}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / TESTI_SNAP);
                  testiIdxRef.current = idx;
                  setTestiIdx(idx);
                }}
                getItemLayout={(_, index) => ({ length: TESTI_SNAP, offset: TESTI_SNAP * index, index })}
                renderItem={({ item, index }) => (
                  <TestimonialCard item={item} index={index} scrollX={testiScrollX} />
                )}
              />
              <Pagination count={TESTIMONIALS.length} index={testiIdx} activeColor={ROSE} />
            </View>

            {/* Recommended feed */}
            <View style={styles.sectionPad}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionTitleWrap}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.sectionTitle}>Recommended For You</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Matches')} activeOpacity={0.7}>
                  <Text style={styles.viewAll}>View all →</Text>
                </TouchableOpacity>
              </View>

              {FEED.map((item, i) => (
                <Animated.View key={item.id} style={{ transform: [{ scale: cardScales[i] }] }}>
                  <MatchCard
                    item={item}
                    liked={liked[item.id]}
                    onLike={() => toggleLike(item.id)}
                    navigation={navigation}
                  />
                </Animated.View>
              ))}
            </View>

          </Animated.ScrollView>

          {/* Floating boost button */}
          <BoostFAB bottom={fabBottom} onPress={() => navigation.navigate('Membership')} />

          {/* Scroll-to-top */}
          <ScrollTopButton
            visible={showScrollTop}
            opacity={scrollTopOpacity}
            onPress={scrollToTop}
            bottom={fabBottom}
          />

          {/* Bottom tab bar */}
          <View style={[styles.tabBarOuter, { bottom: 16 + insets.bottom * 0.4 }]}>
            <View style={styles.tabBar}>
              <Animated.View
                style={[
                  styles.tabIndicator,
                  { width: tabSegment - 12, transform: [{ translateX: tabIndicatorX }] },
                ]}
              />
              {TABS.map(tab => (
                <TabItem
                  key={tab.name}
                  item={tab}
                  active={activeTab === tab.name}
                  onPress={() => {
                    setActiveTab(tab.name);
                    if (tab.screen !== 'Home') navigation.navigate(tab.screen);
                  }}
                />
              ))}
            </View>
          </View>

        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

// ─── Count-up number ──────────────────────────────────────────────
function CountUp({ to, suffix = '', duration = 1400, delay = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    let start;
    const kickoff = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setVal(Math.round(eased * to));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(kickoff); if (raf) cancelAnimationFrame(raf); };
  }, [to, duration, delay]);
  return <Text style={styles.statNum}>{val}{suffix}</Text>;
}

// ─── Shimmer loading block ─────────────────────────────────────────
function ShimmerBlock({ style }) {
  const shimmer = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[style, { opacity: shimmer }]} />;
}

// ─── Pulsing dot (online status / urgency icon) ───────────────────
function PulseRing({ size = 12, color = GREEN, style }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View style={[styles.pulseRing, { width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity, transform: [{ scale }] }]} />
      <View style={[styles.pulseCore, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]} />
    </View>
  );
}

// ─── Shared pagination dots ─────────────────────────────────────────
function Pagination({ count, index, activeColor = GOLD, style }) {
  if (!count || count < 2) return null;
  return (
    <View style={[styles.dotRow, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, i === index && { width: 22, backgroundColor: activeColor }]} />
      ))}
    </View>
  );
}

// ─── Filter chip ─────────────────────────────────────────────────
function FilterChip({ label, active, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.92, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start()}
    >
      <Animated.View style={[styles.chip, active && styles.chipActive, { transform: [{ scale }] }]}>
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Promo slide (parallax) ─────────────────────────────────────────
function PromoSlide({ item, index, scrollX }) {
  const inputRange = [(index - 1) * SLIDER_SNAP, index * SLIDER_SNAP, (index + 1) * SLIDER_SNAP];
  const scale = scrollX.interpolate({ inputRange, outputRange: [0.93, 1, 0.93], extrapolate: 'clamp' });
  const translateY = scrollX.interpolate({ inputRange, outputRange: [10, 0, 10], extrapolate: 'clamp' });
  return (
    <Animated.View style={[styles.sliderCard, { transform: [{ scale }, { translateY }] }]}>
      <Image source={{ uri: `https://matrimony.gmworld.net/${item.slider_image}` }} style={styles.sliderImage} />
      <View style={styles.sliderOverlay}>
        <Text style={styles.sliderHeading} numberOfLines={1}>{item.slider_heading}</Text>
        <Text style={styles.sliderContent} numberOfLines={2}>{item.slider_content}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Spotlight card ─────────────────────────────────────────────
function SpotlightCard({ item, index, scrollX, navigation }) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const meterAnim = useRef(new Animated.Value(0)).current;
  const matchPct = item.match_percentage || 90;

  useEffect(() => {
    Animated.timing(meterAnim, { toValue: matchPct, duration: 900, delay: 250, useNativeDriver: false }).start();
  }, [matchPct]);

  const inputRange = [(index - 1) * SPOT_SNAP, index * SPOT_SNAP, (index + 1) * SPOT_SNAP];
  const scale = scrollX.interpolate({ inputRange, outputRange: [0.94, 1, 0.94], extrapolate: 'clamp' });
  const opacity = scrollX.interpolate({ inputRange, outputRange: [0.7, 1, 0.7], extrapolate: 'clamp' });
  const meterWidth = meterAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <TouchableOpacity
        style={styles.spotCard}
        activeOpacity={1}
        onPressIn={() => Animated.spring(pressScale, { toValue: 0.985, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start()}
        onPress={() => navigation.navigate('ViewProfile', { profileId: item.user_id || item.id, profileData: item })}
      >
        <Animated.View style={[styles.spotCardInner, { transform: [{ scale: pressScale }] }]}>
          <Image
            source={{
              uri: item.profile_image
                ? `https://matrimony.gmworld.net/storage/${item.profile_image}`
                : item.image || 'https://via.placeholder.com/300',
            }}
            style={styles.spotImg}
          />
          <View style={styles.spotGradient}>
            <View style={styles.spotScorePill}>
              <Text style={styles.spotScoreText}>✦ {matchPct}% Match</Text>
            </View>
            <View style={styles.spotMeterTrack}>
              <Animated.View style={[styles.spotMeterFill, { width: meterWidth }]} />
            </View>
            <Text style={styles.spotName}>{item.full_name || item.name}</Text>
            <Text style={styles.spotMeta}>{item.current_location || 'India'}</Text>
            <View style={styles.spotTagRow}>
              {item.denomination ? (
                <View style={styles.spotTag}><Text style={styles.spotTagText}>{item.denomination}</Text></View>
              ) : null}
              {item.education ? (
                <View style={styles.spotTag}><Text style={styles.spotTagText}>{item.education}</Text></View>
              ) : null}
            </View>
          </View>
          <View style={styles.spotVerifiedBadge}>
            <Text style={styles.spotVerifiedText}>✓ Verified</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Featured circle ─────────────────────────────────────────────
function FeaturedCircle({ item, index, navigation }) {
  const scl = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scl, { toValue: 1, friction: 6, tension: 50, delay: index * 80, useNativeDriver: true }).start();
  }, []);
  return (
    <TouchableOpacity
      style={styles.featItem}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ViewProfile', { profileId: item.id, profileData: item })}
    >
      <Animated.View style={{ transform: [{ scale: scl }] }}>
        <View style={styles.featRing}>
          <Image source={{ uri: item.image }} style={styles.featImg} />
        </View>
        {item.online && (
          <View style={styles.featOnlineWrap}><PulseRing size={12} color={GREEN} /></View>
        )}
        <View style={styles.featBadge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>✓</Text></View>
      </Animated.View>
      <Text style={styles.featName} numberOfLines={1}>{item.name}, {item.age}</Text>
      <Text style={styles.featLoc} numberOfLines={1}>{item.location}</Text>
      <View style={styles.featDenom}><Text style={styles.featDenomText}>{item.denom}</Text></View>
    </TouchableOpacity>
  );
}

// ─── Testimonial card ────────────────────────────────────────────
function TestimonialCard({ item, index, scrollX }) {
  const inputRange = [(index - 1) * TESTI_SNAP, index * TESTI_SNAP, (index + 1) * TESTI_SNAP];
  const scale = scrollX.interpolate({ inputRange, outputRange: [0.95, 1, 0.95], extrapolate: 'clamp' });
  return (
    <Animated.View style={[styles.testiCard, { transform: [{ scale }] }]}>
      <Text style={styles.testiQuoteMark}>“</Text>
      <Text style={styles.testiQuote} numberOfLines={5}>{item.quote}</Text>
      <View style={styles.testiFooter}>
        <Image source={{ uri: item.image }} style={styles.testiAvatar} />
        <View>
          <Text style={styles.testiNames}>{item.names}</Text>
          <Text style={styles.testiDate}>{item.date}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Match card ─────────────────────────────────────────────────
function MatchCard({ item, liked, onLike, navigation }) {
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartRotate = useRef(new Animated.Value(0)).current;
  const sentOpacity = useRef(new Animated.Value(0)).current;
  const [sentInterest, setSentInterest] = useState(false);

  const handleLike = () => {
    Vibration.vibrate(10);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(heartScale, { toValue: 1.4, friction: 3, useNativeDriver: true }),
        Animated.timing(heartRotate, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(heartScale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(heartRotate, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
    ]).start();
    onLike();
  };

  const handleSendInterest = () => {
    setSentInterest(true);
    Animated.sequence([
      Animated.timing(sentOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(sentOpacity, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.timing(sentOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setSentInterest(false));
  };

  const rotateDeg = heartRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '18deg'] });

  return (
    <View style={styles.matchCard}>
      <View style={styles.matchImgWrap}>
        <Image source={{ uri: item.image }} style={styles.matchImg} />
        <View style={styles.matchScoreBadge}>
          <Text style={styles.matchScoreText}>✦ {item.matchScore}</Text>
        </View>
        <TouchableOpacity style={styles.likeBtn} onPress={handleLike} activeOpacity={0.8}>
          <Animated.Text
            style={[
              styles.likeIcon, liked && styles.likeActive,
              { transform: [{ scale: heartScale }, { rotate: rotateDeg }] },
            ]}
          >
            {liked ? '♥' : '♡'}
          </Animated.Text>
        </TouchableOpacity>
        {item.verified && (
          <View style={styles.verBadge}><Text style={styles.verText}>✓ Verified</Text></View>
        )}
      </View>

      <View style={styles.matchBody}>
        <View style={styles.matchTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.matchName}>{item.name}, {item.age}</Text>
            <Text style={styles.matchMeta}>{item.job}  ·  {item.location}</Text>
          </View>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => navigation.navigate('Messages')}
            activeOpacity={0.85}
          >
            <Text style={styles.connectText}>Connect</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoGrid}>
          {[['⛪', item.denom], ['🎓', item.edu], ['📍', item.location], ['📏', item.height]].map(([icon, val]) => (
            <View key={val} style={styles.infoCell}>
              <Text style={styles.infoCellIcon}>{icon}</Text>
              <Text style={styles.infoCellText} numberOfLines={1}>{val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tagRow}>
          {item.tags.map(t => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={styles.matchActions}>
          <TouchableOpacity
            style={styles.actionOutline}
            onPress={() => navigation.navigate('ViewProfile', { profile: item })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionOutlineText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSolid}
            onPress={handleSendInterest}
            activeOpacity={0.8}
          >
            <Text style={styles.actionSolidText}>Send Interest</Text>
          </TouchableOpacity>
        </View>

        {sentInterest && (
          <Animated.View style={[styles.sentToast, { opacity: sentOpacity }]}>
            <Text style={styles.sentToastText}>✓ Interest sent to {item.name}</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

// ─── Floating boost button ──────────────────────────────────────
function BoostFAB({ onPress, bottom }) {
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });
  return (
    <View style={[styles.fabWrap, { bottom }]} pointerEvents="box-none">
      <Animated.View style={[styles.fabGlow, { transform: [{ scale: glowScale }], opacity: glowOpacity }]} />
      <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.88}>
        <Text style={styles.fabIcon}>👑</Text>
        <Text style={styles.fabText}>Boost</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Scroll to top ───────────────────────────────────────────────
function ScrollTopButton({ visible, opacity, onPress, bottom }) {
  return (
    <Animated.View
      style={[styles.scrollTopWrap, { bottom, opacity, transform: [{ scale: opacity }] }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity style={styles.scrollTopBtn} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.scrollTopIcon}>↑</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Tab item ───────────────────────────────────────────────────
function TabItem({ item, active, onPress }) {
  const iconScale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      onPressIn={() => Animated.spring(iconScale, { toValue: 0.78, friction: 5, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(iconScale, { toValue: 1, friction: 5, useNativeDriver: true }).start()}
      activeOpacity={0.8}
    >
      <Animated.Text style={[styles.tabIcon, active && styles.tabIconActive, { transform: [{ scale: iconScale }] }]}>
        {item.icon}
      </Animated.Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.name}</Text>
      {active && <View style={styles.tabActiveDot} />}
    </TouchableOpacity>
  );
}

// ─── Menu nav item (with entrance stagger) ───────────────────────
function MenuNavItem({ item, active, onPress, open, delay = 0 }) {
  const scl = useRef(new Animated.Value(1)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      enter.setValue(0);
      Animated.spring(enter, { toValue: 1, friction: 7, tension: 50, delay, useNativeDriver: true }).start();
    }
  }, [open]);

  const translateX = enter.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => Animated.spring(scl, { toValue: 0.96, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scl, { toValue: 1, friction: 6, useNativeDriver: true }).start()}
      activeOpacity={0.9}
    >
      <Animated.View style={[
        styles.menuNavItem,
        active && styles.menuNavItemActive,
        { transform: [{ scale: scl }, { translateX }], opacity: enter },
      ]}>
        <Text style={[styles.menuNavIcon, active && styles.menuNavIconActive, item.danger && styles.menuNavDanger]}>
          {item.icon}
        </Text>
        <Text style={[styles.menuNavLabel, active && styles.menuNavLabelActive, item.danger && styles.menuNavDanger]}>
          {item.label}
        </Text>
        {item.badge && (
          <View style={styles.menuBadge}><Text style={styles.menuBadgeText}>{item.badge}</Text></View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  mainContent: { flex: 1, overflow: 'hidden', backgroundColor: '#F5F1EB' },
  root: { flex: 1, backgroundColor: '#F5F1EB' },

  // Drawer
  menuDrawer: {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    width: MENU_WIDTH, backgroundColor: DARK,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 24,
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 99,
  },

  menuProfile: { alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 20 },
  menuAvatarRing: {
    width: 82, height: 82, borderRadius: 41,
    borderWidth: 2.5, borderColor: GOLD,
    padding: 3, marginBottom: 12, position: 'relative',
  },
  menuAvatar: { width: '100%', height: '100%', borderRadius: 37 },
  menuVerifiedBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: GREEN, borderWidth: 2, borderColor: DARK,
    alignItems: 'center', justifyContent: 'center',
  },
  menuName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  menuSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 10 },
  premiumPill: {
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.45)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  premiumText: { fontSize: 12, color: GOLD, fontWeight: '600' },

  completionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(201,168,76,0.2)',
    borderRadius: 14, padding: 14,
  },
  completionCircle: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 3, borderColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  completionPct: { fontSize: 12, fontWeight: '700', color: GOLD },
  completionTitle: { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 2 },
  completionSub: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 },
  completionTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  completionFill: { height: '100%', width: '85%', backgroundColor: GOLD, borderRadius: 2 },

  menuDivider: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16, marginVertical: 6 },

  menuNavItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 14, paddingVertical: 13,
    marginHorizontal: 8, marginVertical: 1, borderRadius: 12,
  },
  menuNavItemActive: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 0.5, borderColor: 'rgba(201,168,76,0.25)',
  },
  menuNavIcon: { fontSize: 18, color: 'rgba(255,255,255,0.35)', width: 22, textAlign: 'center' },
  menuNavIconActive: { color: GOLD },
  menuNavLabel: { fontSize: 14, color: 'rgba(255,255,255,0.65)', flex: 1 },
  menuNavLabelActive: { color: '#fff', fontWeight: '600' },
  menuNavDanger: { color: 'rgba(231,76,60,0.75)' },
  menuBadge: {
    backgroundColor: 'rgba(201,168,76,0.18)',
    borderWidth: 0.5, borderColor: 'rgba(201,168,76,0.3)',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
  },
  menuBadgeText: { fontSize: 11, color: GOLD, fontWeight: '600' },

  upgradeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    margin: 16, marginTop: 12,
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)',
    borderRadius: 16, padding: 14,
  },
  upgradeIconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(201,168,76,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  upgradeTitle: { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 2 },
  upgradeSub: { fontSize: 10, color: GOLD, letterSpacing: 0.5 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 12,
    paddingBottom: 16,
    backgroundColor: '#F5F1EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  menuBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E8DFD0',
    alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  hLine: { width: 18, height: 2, backgroundColor: DARK, borderRadius: 1 },

  headerGreet: { fontSize: 11, color: '#9A8E80', marginBottom: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },

  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E8DFD0',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 17 },
  notifBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: RED, alignItems: 'center', justifyContent: 'center',
  },
  notifText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: GOLD },
  avatar: { width: '100%', height: '100%', borderRadius: 22 },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#2ECC71', borderWidth: 2, borderColor: '#F5F1EB',
  },

  // Stats
  statsStrip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DARK, borderRadius: 18,
    marginHorizontal: 20, marginTop: 8, marginBottom: 4,
    paddingVertical: 18,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700', color: GOLD },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  statDiv: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.08)' },

  // Chips
  chipsScroll: { paddingHorizontal: 20, paddingVertical: 14 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E8DFD0', backgroundColor: '#fff' },
  chipActive: { backgroundColor: DARK, borderColor: DARK },
  chipText: { fontSize: 12, color: '#888', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  // Urgency banner
  urgencyBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 18,
    backgroundColor: '#FEF8EC', borderWidth: 1, borderColor: '#E8D9A8',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
  },
  urgencyText: { fontSize: 12.5, color: '#7A6533', flex: 1 },
  urgencyBold: { fontWeight: '800', color: '#5C4A1E' },

  // Section
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionPad: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 4, height: 18, backgroundColor: GOLD, borderRadius: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: DARK },
  viewAll: { fontSize: 13, color: GOLD, fontWeight: '600' },

  // Spotlight
  spotCard: { width: SPOT_CARD_WIDTH },
  spotCardInner: { borderRadius: 20, overflow: 'hidden' },
  spotImg: { width: '100%', height: 340, resizeMode: 'cover', backgroundColor: '#E5DFD0' },
  spotGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 18, backgroundColor: 'rgba(8,12,24,0.72)',
  },
  spotScorePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.22)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: GOLD, marginBottom: 8,
  },
  spotScoreText: { color: GOLD, fontSize: 12, fontWeight: '700' },
  spotMeterTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  spotMeterFill: { height: '100%', backgroundColor: GOLD, borderRadius: 2 },
  spotName: { fontSize: 22, fontWeight: '700', color: '#fff' },
  spotMeta: { fontSize: 13, color: '#CCCCCC', marginTop: 4 },
  spotTagRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  spotTag: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  spotTagText: { color: '#fff', fontSize: 11 },
  spotVerifiedBadge: { position: 'absolute', top: 14, right: 14, backgroundColor: GREEN, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  spotVerifiedText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14, marginBottom: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#DDD' },

  // Featured circles
  featItem: { alignItems: 'center', width: 84 },
  featRing: {
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 2.5, borderColor: GOLD,
    padding: 2.5, marginBottom: 7,
  },
  featImg: { width: '100%', height: '100%', borderRadius: 32 },
  featOnlineWrap: { position: 'absolute', top: -2, left: -2 },
  featBadge: {
    position: 'absolute', bottom: 6, right: 0, width: 20, height: 20, borderRadius: 10,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#F5F1EB',
  },
  featName: { fontSize: 11, fontWeight: '600', color: DARK, textAlign: 'center' },
  featLoc: { fontSize: 10, color: '#999', textAlign: 'center', marginTop: 1 },
  featDenom: { marginTop: 4, backgroundColor: '#FEF8EC', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  featDenomText: { fontSize: 9, color: '#A89060', fontWeight: '600' },

  // Pulse dot
  pulseRing: { position: 'absolute' },
  pulseCore: { borderWidth: 1.5, borderColor: '#F5F1EB' },

  // Slider (API)
  sliderCard: {
    width: SLIDER_CARD_WIDTH, height: 220, borderRadius: 20,
    overflow: 'hidden', marginRight: SLIDER_SPACING, backgroundColor: '#EAE3D4',
  },
  sliderSkeleton: { opacity: 0.6 },
  sliderImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  sliderOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingTop: 36,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  sliderHeading: {
    fontSize: 20, fontWeight: '700', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  sliderContent: {
    fontSize: 13, color: '#fff', marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },

  // Testimonials
  testiCard: {
    width: TESTI_CARD_WIDTH, backgroundColor: '#fff', borderRadius: 20,
    padding: 18, borderWidth: 1, borderColor: '#EEE8DC',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  testiQuoteMark: { fontSize: 40, color: GOLD, lineHeight: 40, marginBottom: -8 },
  testiQuote: { fontSize: 13.5, color: '#444', lineHeight: 19, marginBottom: 16 },
  testiFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  testiAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#eee' },
  testiNames: { fontSize: 13, fontWeight: '700', color: DARK },
  testiDate: { fontSize: 11, color: '#999', marginTop: 1 },

  // Match card
  matchCard: {
    backgroundColor: '#fff', borderRadius: 22, marginHorizontal: 20, marginBottom: 20,
    overflow: 'hidden', borderWidth: 1, borderColor: '#EEE8DC',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4,
  },
  matchImgWrap: { position: 'relative' },
  matchImg: { width: '100%', height: 300, resizeMode: 'cover' },
  matchScoreBadge: { position: 'absolute', top: 14, left: 14, backgroundColor: 'rgba(8,12,24,0.88)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  matchScoreText: { color: GOLD, fontSize: 12, fontWeight: '700' },
  likeBtn: {
    position: 'absolute', top: 14, right: 14, width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
  },
  likeIcon: { fontSize: 24, color: '#CCC' },
  likeActive: { color: RED },
  verBadge: { position: 'absolute', bottom: 14, left: 14, backgroundColor: GREEN, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  verText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  matchBody: { padding: 18 },
  matchTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  matchName: { fontSize: 20, fontWeight: '700', color: DARK },
  matchMeta: { fontSize: 13, color: '#7F8C8D', marginTop: 2 },
  connectBtn: {
    backgroundColor: DARK, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9,
    borderWidth: 1.5, borderColor: GOLD,
  },
  connectText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  infoCell: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F9F7F2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: '#EEE8DC', flexBasis: '47%',
  },
  infoCellIcon: { fontSize: 13 },
  infoCellText: { fontSize: 11, color: '#555', fontWeight: '500', flex: 1 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tag: { backgroundColor: '#FEF8EC', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#E8D9A8' },
  tagText: { fontSize: 12, color: '#A89060', fontWeight: '500' },

  matchActions: { flexDirection: 'row', gap: 10 },
  actionOutline: { flex: 1, borderWidth: 1.5, borderColor: '#DDD', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  actionOutlineText: { fontSize: 13, color: '#555', fontWeight: '600' },
  actionSolid: { flex: 1, backgroundColor: DARK, borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: GOLD },
  actionSolidText: { fontSize: 13, color: '#fff', fontWeight: '700' },

  sentToast: {
    marginTop: 10, alignSelf: 'center',
    backgroundColor: 'rgba(29,158,90,0.12)', borderWidth: 1, borderColor: 'rgba(29,158,90,0.3)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  sentToastText: { fontSize: 12, color: GREEN, fontWeight: '600' },

  // Floating boost button
  fabWrap: {
    position: 'absolute', right: 20, alignItems: 'center', justifyContent: 'center',
    width: 64, height: 64,
  },
  fabGlow: {
    position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: GOLD,
  },
  fab: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: DARK,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: GOLD,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10,
  },
  fabIcon: { fontSize: 18, marginBottom: 1 },
  fabText: { fontSize: 9, color: GOLD, fontWeight: '700' },

  // Scroll to top
  scrollTopWrap: { position: 'absolute', left: 20, width: 48, height: 48 },
  scrollTopBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E8DFD0', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
  },
  scrollTopIcon: { fontSize: 18, color: DARK, fontWeight: '700' },

  // Tab bar
  tabBarOuter: { position: 'absolute', left: 16, right: 16 },
  tabBar: {
    flexDirection: 'row', backgroundColor: DARK, borderRadius: 30,
    paddingVertical: 12, paddingHorizontal: 8,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 12,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute', top: 6, bottom: 6, borderRadius: 22,
    backgroundColor: 'rgba(201,168,76,0.16)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)',
  },
  tabItem: { flex: 1, alignItems: 'center', position: 'relative' },
  tabIcon: { fontSize: 22, color: 'rgba(255,255,255,0.3)', marginBottom: 2 },
  tabIconActive: { color: GOLD },
  tabLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  tabLabelActive: { color: '#fff', fontWeight: '700' },
  tabActiveDot: { position: 'absolute', bottom: -4, width: 5, height: 5, borderRadius: 2.5, backgroundColor: GOLD },
});