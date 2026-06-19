import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
  Alert, RefreshControl, Dimensions, Animated, Pressable,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  gold: '#C9A84C', goldLight: '#F7EDD4', goldDeep: '#A07830',
  navy: '#12203A', navyMid: '#1E3358', navyLight: '#243059',
  bg: '#F6F3EE', bgCard: '#FFFFFF', border: '#EAE3D6',
  muted: '#8A96A8', mutedLight: '#B8C0CC',
  success: '#19A87A', successBg: '#E5F7F1', successText: '#0B6E50',
  danger: '#D04E28', dangerBg: '#FBF0EC', dangerText: '#8B2F12',
  faith: '#2D6BB5', faithBg: '#EBF3FD', faithText: '#1A4880',
  text: '#1A1F2E', textSub: '#5E6577', textMuted: '#9198AA',
  white: '#FFFFFF', black: '#000000', overlay: 'rgba(18, 32, 58, 0.55)',
};

const RADIUS = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, full: 999 };
const FONT = { xs: 10, sm: 11, base: 13, md: 14, lg: 16, xl: 18, xxl: 22, hero: 28 };

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
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
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
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: '#CFC9BF', opacity }, style]} />;
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
        {[SW - 165, SW - 185, SW - 205].map((w, i) => <ShimmerBox key={i} width={w} height={10} radius={4} style={{ marginBottom: 7 }} />)}
      </View>
    </View>
    <View style={sk.footer}>
      <ShimmerBox width="100%" height={5} radius={2.5} style={{ marginBottom: 14 }} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['35%', '30%', '30%'].map((w, i) => <ShimmerBox key={i} width={w} height={42} radius={RADIUS.md} />)}
      </View>
    </View>
  </View>
);

const sk = StyleSheet.create({
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 16, overflow: 'hidden', padding: 0 },
  topBand: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#EDE8E0', paddingHorizontal: 14, paddingVertical: 11 },
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

  return (
    <View style={{ width: size, height: size + 8, borderRadius: radius, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.gold }}>
      {uri && !err ? (
        <Animated.Image source={{ uri }} style={{ width: '100%', height: '100%', transform: [{ scale }], opacity }} resizeMode="cover" onLoad={reveal} onError={() => { setErr(true); reveal(); }} />
      ) : (
        <View style={{ flex: 1, backgroundColor: COLORS.navyMid, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.gold, letterSpacing: 0.5 }}>{initials}</Text>
        </View>
      )}
    </View>
  );
};

const Tag = ({ label, type = 'default', icon }) => {
  if (!label) return null;
  const styles = {
    default: { bg: COLORS.goldLight, border: '#E2CE8A', text: COLORS.goldDeep },
    faith: { bg: COLORS.faithBg, border: '#B5CEE8', text: COLORS.faithText },
    green: { bg: COLORS.successBg, border: '#9FD5C3', text: COLORS.successText },
  };
  const s = styles[type] || styles.default;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: s.bg, borderWidth: 0.5, borderColor: s.border, borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 4 }}>
      {icon ? <Text style={{ fontSize: 9 }}>{icon}</Text> : null}
      <Text style={{ fontSize: FONT.xs, color: s.text, fontWeight: '700', letterSpacing: 0.2 }}>{label}</Text>
    </View>
  );
};

const InfoRow = ({ icon, label }) => {
  if (!label) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
      <Text style={{ fontSize: 11, lineHeight: 16 }}>{icon}</Text>
      <Text style={{ fontSize: FONT.sm, color: COLORS.textSub, flex: 1 }} numberOfLines={1}>{label}</Text>
    </View>
  );
};

const SectionLabel = ({ title }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginVertical: 6 }}>
    <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border }} />
    <Text style={{ fontSize: 9, color: COLORS.gold, fontWeight: '800', letterSpacing: 1.5, marginHorizontal: 10, textTransform: 'uppercase' }}>{title}</Text>
    <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border }} />
  </View>
);

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
        <Text style={{ fontSize: FONT.sm, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 0.4 }}>Compatibility Score</Text>
        <Animated.View style={{ backgroundColor: `${color}18`, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3, transform: [{ scale: scaleAnim }] }}>
          <Text style={{ fontSize: FONT.md, fontWeight: '900', color }}>{p}%</Text>
        </Animated.View>
      </View>
      <View style={{ height: 5, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' }}>
        <Animated.View style={{ height: 5, width: barW, backgroundColor: color, borderRadius: RADIUS.full }} />
      </View>
    </View>
  );
};

const RippleBtn = ({ label, icon, variant = 'outline', onPress, flex = 1 }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, friction: 10 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  const variants = {
    gold: { bg: COLORS.goldLight, border: COLORS.gold, text: COLORS.goldDeep },
    blue: { bg: '#1B55E2', border: '#1B55E2', text: COLORS.white },
    outline: { bg: 'transparent', border: COLORS.border, text: COLORS.text },
  };
  const v = variants[variant];

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={{ flex }}>
      <Animated.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: v.bg, borderWidth: variant === 'outline' ? 0.5 : 1.5, borderColor: v.border, borderRadius: RADIUS.md, paddingVertical: 12, transform: [{ scale }] }}>
        {icon && <Text style={{ fontSize: 13 }}>{icon}</Text>}
        <Text style={{ fontSize: FONT.sm, fontWeight: '700', color: v.text, letterSpacing: 0.3 }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

const MemberCard = React.memo(({ item, handleUploadImage, handleViewImages, index }) => {
  const age = calcAge(item.date_of_birth);
  const height = cmToFeet(item.height);
  const imgUri = resolveImage(item.profile_image);
  const initials = getInitials(item?.full_name ?? '');
  const uid = item.user_id || item.id || '';
  const isGroom = item.gender === 'male' || item.gender === 'Male';
  const matchPct = Number(item.match_percentage ?? 0);

  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 400, delay: Math.min(index * 70, 350), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: Math.min(index * 70, 350), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[C.cardWrap, { transform: [{ translateY }], opacity }]}>
      <View style={C.headerBand}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[C.genderDot, { backgroundColor: isGroom ? '#1B55E2' : '#B5327A' }]} />
          <Text style={C.headerUID}>#{uid}</Text>
          <View style={C.genderPill}>
            <Text style={[C.genderPillTxt, { color: isGroom ? '#5FA4F8' : '#E07CC0' }]}>{isGroom ? 'Groom' : 'Bride'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {item.is_verified && <View style={C.verifiedBadge}><Text style={C.verifiedTxt}>✓ Verified</Text></View>}
          <View style={C.matchBubble}><Text style={[C.matchBubbleTxt, { color: getMatchColor(matchPct) }]}>{matchPct}%</Text></View>
        </View>
      </View>

      <View style={C.mainRow}>
        <View style={C.avatarCol}>
          <Avatar uri={imgUri} initials={initials} size={88} />
          {item.marital_status && <View style={C.maritalBadge}><Text style={C.maritalTxt} numberOfLines={1}>{item.marital_status}</Text></View>}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={C.name} numberOfLines={1}>{item.full_name || '—'}</Text>
          <View style={C.tagWrap}>
            {age && <Tag label={`${age} yrs`} icon="🎂" />}
            {height && <Tag label={height} icon="📏" />}
            {item.current_location && <Tag label={item.current_location} icon="📍" />}
            {item.denomination && <Tag label={item.denomination} type="faith" />}
          </View>
          <InfoRow icon="💼" label={item.occupation} />
          <InfoRow icon="🎓" label={item.education} />
          <InfoRow icon="⛪" label={item.church_name} />
        </View>
      </View>

      {(item.mother_tongue || item.annual_income || item.house_type) && (
        <>
          <SectionLabel title="More Details" />
          <View style={C.extraGrid}>
            {[{ label: 'Mother Tongue', val: item.mother_tongue }, { label: 'Income', val: item.annual_income }, { label: 'House', val: item.house_type }].filter(x => x.val).map((x, i) => (
              <View key={i} style={C.extraCell}>
                <Text style={C.extraLabel}>{x.label}</Text>
                <Text style={C.extraVal} numberOfLines={1}>{x.val}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <MatchScore pct={matchPct} />

      <View style={C.btnRow}>
        <RippleBtn label="Upload Images" icon="📤" variant="gold" onPress={() => handleUploadImage(item)} />
        <RippleBtn label="View Images" icon="🖼️" variant="blue" onPress={() => handleViewImages(item)} />
      </View>
    </Animated.View>
  );
});

const C = StyleSheet.create({
  cardWrap: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 16, overflow: 'hidden' },
  headerBand: { backgroundColor: COLORS.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  genderDot: { width: 8, height: 8, borderRadius: 4 }, headerUID: { fontSize: FONT.sm, color: COLORS.gold, fontWeight: '800' },
  genderPill: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 }, genderPillTxt: { fontSize: FONT.xs, fontWeight: '700' },
  verifiedBadge: { backgroundColor: '#0A3D24', borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 3 }, verifiedTxt: { fontSize: FONT.xs, color: '#4ECC8A', fontWeight: '700' },
  matchBubble: { backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, minWidth: 42, alignItems: 'center' }, matchBubbleTxt: { fontSize: FONT.sm, fontWeight: '900' },
  mainRow: { flexDirection: 'row', gap: 12, padding: 14, paddingBottom: 8 }, avatarCol: { alignItems: 'center', gap: 6 },
  maritalBadge: { backgroundColor: COLORS.navy, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 90, alignItems: 'center' }, maritalTxt: { fontSize: 8, color: COLORS.gold, fontWeight: '700' },
  name: { fontSize: FONT.lg, fontWeight: '800', color: COLORS.text, marginBottom: 8 }, tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 9 },
  extraGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingBottom: 10 }, extraCell: { backgroundColor: COLORS.bg, borderRadius: RADIUS.sm, paddingHorizontal: 11, paddingVertical: 8, minWidth: (SW - 72) / 3 - 8, borderWidth: 0.5, borderColor: COLORS.border, flex: 1 },
  extraLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 3 }, extraVal: { fontSize: FONT.sm, color: COLORS.text, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 8, padding: 12, paddingTop: 10, paddingHorizontal: 14, backgroundColor: COLORS.bg, borderTopWidth: 0.5, borderTopColor: COLORS.border },
});

export default function MemberListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const [token, userId] = await Promise.all([ AsyncStorage.getItem('userToken'), AsyncStorage.getItem('matrimonyUserId') ]);
      const res = await fetch(`${BASE_URL}/api/view_profile/${userId}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.status === true || result.success === true) {
        const list = Array.isArray(result.data) ? result.data : Array.isArray(result.profiles) ? result.profiles : Array.isArray(result.matches) ? result.matches : Array.isArray(result) ? result : [];
        setMembers(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, []);
  useFocusEffect(useCallback(() => { fetchMembers(); }, [fetchMembers]));

  // 👇 FULLY FIXED UPLOAD HANDLER
  const handleUploadImage = async (item) => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 0 },
      async (response) => {
        if (response.didCancel || !response.assets || response.assets.length === 0) return;

        const formData = new FormData();
        response.assets.forEach((img, index) => {
          formData.append('image[]', { 
            uri: img.uri, type: img.type || 'image/jpeg', name: img.fileName || `gallery_${Date.now()}_${index}.jpg`,
          });
        });

        try {
          const token = await AsyncStorage.getItem('userToken');
          const profileId = item.id || item.user_id;

          const res = await fetch(
            `${BASE_URL}/api/gallery/${profileId}`, 
            {
              method: 'POST',
              headers: {
                'Accept': 'application/json', // 👈 REQUIRED: Forces Laravel to return JSON errors instead of HTML
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              body: formData,
            }
          );

          // 👈 SAFE JSON PARSING (Prevents the "<" crash if server fails)
          const textResponse = await res.text();
          let result;
          try {
            result = JSON.parse(textResponse);
          } catch (jsonError) {
            console.log('--- LARAVEL HTML ERROR LOG ---', textResponse);
            Alert.alert(
              'Server Error', 
              'The server encountered an error (likely a file size limit or permissions issue). Check the console for details.'
            );
            return;
          }

          // If JSON parsed successfully, handle the actual API response
          if (result.status === true || result.success === true) {
            Alert.alert('Success', result.message || 'Images stored successfully');
          } else {
            // Laravel Validation errors usually come in an 'errors' object
            const errMsg = result.message || (result.errors ? JSON.stringify(result.errors) : 'Could not save images.');
            Alert.alert('Upload Failed', errMsg);
          }

        } catch (error) {
          Alert.alert('Error', error.message);
        }
      }
    );
  };

  const handleViewImages = (item) => {
    navigation.navigate('ViewImages', { userId: item.id  });
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: COLORS.bg }, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      {loading ? (
        <FlatList data={[1, 2, 3]} keyExtractor={(i) => String(i)} renderItem={() => <SkeletonCard />} contentContainerStyle={{ padding: 14, paddingBottom: 36 }} showsVerticalScrollIndicator={false} />
      ) : (
        <FlatList
          data={members}
          // 👈 FIXED WARNING: "Two children with same key". Added index to make it 100% unique
          keyExtractor={(item, idx) => String((item.user_id || item.id || 'usr') + '_' + idx)}
          renderItem={({ item, index }) => (
            <MemberCard item={item} index={index} handleUploadImage={handleUploadImage} handleViewImages={handleViewImages} />
          )}
          contentContainerStyle={{ padding: 14, paddingBottom: 36 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMembers(); }} tintColor={COLORS.gold} />}
        />
      )}
    </SafeAreaView>
  );
}