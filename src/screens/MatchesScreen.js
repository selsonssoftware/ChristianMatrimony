import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,

  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  Animated,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const BASE_URL = 'https://matrimony.gmworld.net';

// ── DESIGN TOKENS ──────────────────────────────────────────────
const COLORS = {
  bgLight: '#FAFAFA',
  pureWhite: '#FFFFFF',
  deepDark: '#0A0E1A',
  brandPurple: '#6A1B9A',
  brandPurpleLight: '#EDE7F6',
  textMain: '#1F2431',
  textMuted: '#656E7B',
  textLight: '#B0B6C3',
  activeGreen: '#2ECC71',
  premiumCardBg: '#1E2130',
  goldAccent: '#FCD34D',
  border: '#EFEFEF',
  borderStrong: '#E0E0E0',
};

// ── SAMPLE DATA ─────────────────────────────────────────────────
const MATCHES_DATA = [
  {
    id: '1',
    name: 'Sarah Grace',
    age: 27,
    loc: 'New York, NY',
    denom: 'Catholic',
    job: 'Pediatrician',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400',
    online: true,
    liked: true,
    isNew: true,
  },
  {
    id: '2',
    name: 'Samuel David',
    age: 31,
    loc: 'Austin, TX',
    denom: 'Baptist',
    job: 'Software Architect',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
    online: false,
    liked: false,
    isNew: true,
  },
  {
    id: '3',
    name: 'Elizabeth Rose',
    age: 24,
    loc: 'Chicago, IL',
    denom: 'Orthodox',
    job: 'Graphic Designer',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
    online: true,
    liked: false,
    isNew: false,
  },
  {
    id: '4',
    name: 'Jonathan Paul',
    age: 29,
    loc: 'Nashville, TN',
    denom: 'Presbyterian',
    job: 'Civil Engineer',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400',
    online: false,
    liked: true,
    isNew: true,
  },
];

const TABS = ['All Matches', 'New', 'Online'];

// ── ANIMATED MATCH ROW ──────────────────────────────────────────
function MatchRow({ item, index, isLiked, onToggleLike, navigation }) {
  // Entry animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  // Heart scale animation
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: index * 70,
        useNativeDriver: true,
        damping: 18,
        stiffness: 160,
      }),
    ]).start();
  }, []);

  const handleHeartPress = () => {
    // Bounce animation on press
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.35,
        useNativeDriver: true,
        damping: 10,
        stiffness: 300,
      }),
      Animated.spring(heartScale, {
        toValue: 0.9,
        useNativeDriver: true,
        damping: 10,
        stiffness: 300,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 14,
        stiffness: 200,
      }),
    ]).start();
    onToggleLike(item.id);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ViewProfile', {
          profileId: item.id,
          profileData: item,
        })
      }
    >
      <Animated.View
        style={[
          styles.matchCardRow,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Avatar + online indicator */}
        <View style={styles.avatarFrame}>
          <Image
            source={{
              uri: item.profile_photo
                ? `${BASE_URL}/storage/${item.profile_photo}`
                : 'https://via.placeholder.com/150',
            }}
            style={styles.profileAvatar}
          />
          {item.online && <View style={styles.onlineDot} />}
        </View>

        {/* Identity block */}
        <View style={styles.profileTextDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.profileNameText} numberOfLines={1}>
              {item.full_name}
            </Text>

            {item.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            )}
          </View>

          <Text style={styles.metaBioText} numberOfLines={1}>
            {item.date_of_birth
              ? new Date().getFullYear() -
              new Date(item.date_of_birth).getFullYear()
              : 'N/A'}{' '}
            · {item.current_location}
          </Text>

          <Text style={styles.metaProfessionText} numberOfLines={1}>
            {item.denomination} · {item.occupation}
          </Text>
        </View>

        {/* Heart button */}
        <TouchableOpacity
          onPress={handleHeartPress}
          activeOpacity={1}
          style={styles.heartActionBtn}
        >
          <Animated.Text
            style={[
              styles.heartIcon,
              isLiked ? styles.heartActive : styles.heartInactive,
              { transform: [{ scale: heartScale }] },
            ]}
          >
            {isLiked ? '♥' : '♡'}
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── ANIMATED TAB UNDERLINE ───────────────────────────────────────
function TabBar({ activeTab, onSelect }) {
  const underlineX = useRef(new Animated.Value(0)).current;
  const tabWidth = (width - 0) / TABS.length;

  const handleSelect = (tab, index) => {
    Animated.spring(underlineX, {
      toValue: index * tabWidth,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
    onSelect(tab);
  };

  return (
    <View style={styles.tabsRowContainer}>
      {TABS.map((tab, i) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={styles.tabItemButton}
            onPress={() => handleSelect(tab, i)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabItemText, isActive && styles.tabItemTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
      {/* Sliding underline */}
      <Animated.View
        style={[
          styles.tabUnderline,
          {
            width: tabWidth,
            transform: [{ translateX: underlineX }],
          },
        ]}
      />
    </View>
  );
}

// ── PREMIUM PROMO CARD ──────────────────────────────────────────
function PremiumCard() {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: 350,
        useNativeDriver: true,
        damping: 14,
        stiffness: 120,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.premiumCard,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.premiumBadgeCircle}>
        <Text style={styles.premiumStar}>★</Text>
      </View>
      <Text style={styles.premiumHeading}>Unlock unlimited connections</Text>
      <Text style={styles.premiumDesc}>
        See who liked you, get priority in search, and send unlimited messages with Premium.
      </Text>
      <TouchableOpacity style={styles.premiumBtn} activeOpacity={0.85}>
        <Text style={styles.premiumBtnText}>LEARN MORE</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── MAIN SCREEN ─────────────────────────────────────────────────
export default function MatchesScreen({ route }) {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Matches');
  const [likedState, setLikedState] = useState({});

  const fetchMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('matrimonyUserId');

      console.log('User ID:', userId);

      const response = await fetch(
        `${BASE_URL}/api/view_profile/${userId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();

      console.log('Matches API:', result);

      if (result.status === true || result.success === true) {

        const list =
          Array.isArray(result.data) ? result.data :
            Array.isArray(result.profiles) ? result.profiles :
              Array.isArray(result.matches) ? result.matches :
                Array.isArray(result) ? result : [];

        setMatches(list);

      } else {
        setMatches([]);
      }
    } catch (error) {
      console.log('Match API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#6A1B9A" />
      </SafeAreaView>
    );
  }

  const toggleLike = (id) => {
    setLikedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredData = matches.filter((item) => {
    if (activeTab === 'New') return item.isNew;
    if (activeTab === 'Online') return item.online;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pureWhite} />

      {/* ── HEADER ── */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize: 24, color: COLORS.textMain }}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Matches</Text>

        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <View style={styles.bellWrap}>
            <Text style={styles.headerIcon}>🔔</Text>
            <View style={styles.bellBadge} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── TAB BAR ── */}
      <TabBar activeTab={activeTab} onSelect={setActiveTab} />

      {/* ── SCROLL BODY ── */}
      <ScrollView
        style={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Match list card */}
        <View style={styles.listWrapper}>
          {filteredData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No matches here yet</Text>
            </View>
          ) : (
            filteredData.map((item, index) => (
              <MatchRow
                key={item.user_id || item.id || index}
                item={item}
                index={index}
                isLiked={likedState[item.user_id || item.id]}
                onToggleLike={toggleLike}
                navigation={navigation}
              />
            ))
          )}
        </View>

        {/* Premium promo */}
        <PremiumCard />

        {/* Continue CTA */}
        <TouchableOpacity style={styles.continueBtn} activeOpacity={0.88}>
          <Text style={styles.continueBtnText}>CONTINUE</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── STYLES ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },

  // Header
  headerBar: {
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
    backgroundColor: COLORS.pureWhite,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingTop: 40,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.bgLight,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.bgLight,
  },
  headerIcon: {
    fontSize: 20,
    color: COLORS.deepDark,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.deepDark,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.2,
  },
  bellWrap: {
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brandPurple,
    borderWidth: 1.5,
    borderColor: COLORS.bgLight,
  },

  // Tabs
  tabsRowContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.pureWhite,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  tabItemButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 0.1,
  },
  tabItemTextActive: {
    color: COLORS.brandPurple,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 2.5,
    backgroundColor: COLORS.brandPurple,
    borderRadius: 2,
  },

  // Scroll
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
  },

  // Match list card
  listWrapper: {
    backgroundColor: COLORS.pureWhite,
    marginHorizontal: 12,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  matchCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },

  // Avatar
  avatarFrame: {
    position: 'relative',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.border,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: COLORS.activeGreen,
    borderWidth: 2,
    borderColor: COLORS.pureWhite,
  },

  // Profile info
  profileTextDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  profileNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMain,
    flexShrink: 1,
  },
  newBadge: {
    backgroundColor: COLORS.brandPurpleLight,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.brandPurple,
    letterSpacing: 0.3,
  },
  metaBioText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  metaProfessionText: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  // Heart
  heartActionBtn: {
    padding: 10,
    marginLeft: 4,
  },
  heartIcon: {
    fontSize: 22,
    lineHeight: 26,
  },
  heartActive: {
    color: COLORS.brandPurple,
  },
  heartInactive: {
    color: COLORS.textLight,
  },

  // Empty state
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textLight,
  },

  // Premium card
  premiumCard: {
    backgroundColor: COLORS.premiumCardBg,
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 16,
    padding: 22,
    alignItems: 'center',
  },
  premiumBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(252, 211, 77, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  premiumStar: {
    fontSize: 18,
    color: COLORS.goldAccent,
  },
  premiumHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.pureWhite,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  premiumDesc: {
    fontSize: 13,
    color: '#8A90A0',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  premiumBtn: {
    backgroundColor: COLORS.goldAccent,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: 'center',
  },
  premiumBtnText: {
    color: COLORS.deepDark,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Continue button
  continueBtn: {
    backgroundColor: COLORS.deepDark,
    marginHorizontal: 12,
    marginTop: 14,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  continueBtnText: {
    color: COLORS.pureWhite,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});