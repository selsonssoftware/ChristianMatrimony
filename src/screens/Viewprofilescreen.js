import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Animated, StatusBar, Platform, Dimensions, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {

  SafeAreaView,

} from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

const GOLD = '#C9A84C';
const DARK = '#0A0E1A';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800';

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function cmToFeetInches(cm) {
  if (!cm) return '—';
  const totalInches = Math.round(parseFloat(cm) / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}

function capitalize(str) {
  if (!str) return '—';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const InfoRow = ({ icon, label, value, last }) => (
  <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

const BoolRow = ({ icon, label, value, last }) => (
  <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={value ? styles.yesBadge : styles.noBadge}>
      <Text style={value ? styles.yesText : styles.noText}>{value ? 'Yes' : 'No'}</Text>
    </View>
  </View>
);

const PrefCard = ({ label, value }) => (
  <View style={styles.prefCard}>
    <Text style={styles.prefLabel}>{label}</Text>
    <Text style={styles.prefValue}>{value}</Text>
  </View>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ViewProfileScreen({ navigation, route }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch from API — pass profileId via route.params or default to 2
  const profileId = route?.params?.profileId ?? 2;

  useEffect(() => {
    fetch(`https://matrimony.gmworld.net/api/user_profile/${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.status && d.data?.length) setProfile(d.data[0]);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [profileId]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const heroScale = useRef(new Animated.Value(1.06)).current;
  const [liked, setLiked] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!profile) return;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 55, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [profile]);

  const handleLike = () => {
    setLiked(prev => !prev);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.45, friction: 4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const sendConnectRequest = async () => {
    try {
      const senderUserId = await AsyncStorage.getItem('matrimonyUserId');
      if (!senderUserId) {
        Alert.alert('Error', 'User ID not found');
        return;
      }
      const response = await fetch(
        'https://matrimony.gmworld.net/api/send_connect',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender_user_id: senderUserId,
            receiver_user_id: profile.user_id,
          }),
        }
      );

      const data = await response.json();

      if (data.status) {
        Alert.alert('Success', 'Connect request sent successfully');
      } else {
        Alert.alert('Failed', data.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };
  if (loading || !profile) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>{loading ? 'Loading profile…' : 'Profile not found.'}</Text>
      </View>
    );
  }

  // ── Derived values ──
  const age = calcAge(profile.date_of_birth);
  const photoUri = profile.profile_photo || PLACEHOLDER_IMAGE;
  const isBride = (profile.reference_name || '').toLowerCase() === 'bride';
  const isVerified = profile.status === 'Active';
  const heightLabel = `${parseFloat(profile.height || 0).toFixed(0)} cm  (${cmToFeetInches(profile.height)})`;
  const weightLabel = profile.weight ? `${parseFloat(profile.weight).toFixed(0)} kg` : '—';

  const tags = [
    profile.saved_person && 'Saved',
    profile.church_attendance_frequency && `${profile.church_attendance_frequency} Church`,
    profile.baptized && 'Baptized',
    profile.holy_spirit && 'Spirit-filled',
    profile.ministry_participation === 'Yes' && 'Ministry Active',
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── HERO IMAGE ── */}
      <Animated.View style={[styles.heroWrap, { transform: [{ scale: heroScale }] }]}>
        <Image source={{ uri: photoUri }} style={styles.heroImg} />
        <View style={styles.heroGradient} />

        {/* Top nav */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.8}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.topNavRight}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleLike} activeOpacity={0.8}>
                <Text style={[styles.iconBtnIcon, liked && styles.iconBtnIconActive]}>
                  {liked ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
              <Text style={styles.iconBtnIcon}>↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero info overlay */}
        <Animated.View style={[styles.heroInfo, { opacity: fadeAnim, transform: [{ translateY: slideUp }] }]}>
          <View style={styles.matchPill}>
            <Text style={styles.matchPillText}>✦ {isBride ? 'Bride' : 'Groom'} Profile</Text>
          </View>
          <Text style={styles.heroName}>{profile.full_name}{age ? `, ${age}` : ''}</Text>
          <Text style={styles.heroMeta}>{profile.occupation || 'Professional'}  ·  {profile.current_location}</Text>
          <Text style={styles.heroUserId}>ID: {profile.user_id}</Text>
          <View style={styles.heroBadgeRow}>
            {isVerified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            ) : (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>⏳ Pending</Text>
              </View>
            )}
            {profile.denomination ? (
              <View style={styles.denomBadge}>
                <Text style={styles.denomText}>{profile.denomination}</Text>
              </View>
            ) : null}
            {profile.community ? (
              <View style={styles.denomBadge}>
                <Text style={styles.denomText}>{profile.community}</Text>
              </View>
            ) : null}
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── CONTENT ── */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* About */}
        {profile.ministry_description ? (
          <Section title="About Me">
            <Text style={styles.aboutText}>
              {profile.ministry_description}
              {profile.hobbies ? `\n\nHobbies & Interests: ${profile.hobbies}.` : ''}
            </Text>
          </Section>
        ) : null}

        {/* Basic Details */}
        <Section title="Basic Details">
          <InfoRow icon="📅" label="Date of Birth" value={profile.date_of_birth} />
          <InfoRow icon="📏" label="Height" value={heightLabel} />
          <InfoRow icon="⚖️" label="Weight" value={weightLabel} />
          <InfoRow icon="💍" label="Marital Status" value={profile.marital_status} />
          <InfoRow icon="🗣️" label="Mother Tongue" value={profile.mother_tongue} />
          <InfoRow icon="📍" label="Location" value={profile.current_location} />
          <InfoRow icon="🏠" label="House Type" value={capitalize(profile.house_type)} />
          <InfoRow icon="🍽️" label="Food Preference" value={profile.food_preference} />
          <InfoRow icon="🌐" label="Languages Known" value={profile.languages_known} last />
        </Section>

        {/* Professional & Education */}
        <Section title="Professional & Education">
          <InfoRow icon="💼" label="Occupation" value={profile.occupation} />
          <InfoRow icon="🏢" label="Company" value={profile.company_name} />
          <InfoRow icon="🎓" label="Education" value={profile.education} />
          <InfoRow icon="🏛️" label="College / University" value={profile.college_university} />
          <InfoRow icon="💰" label="Annual Income" value={profile.annual_income} last />
        </Section>

        {/* Faith & Church */}
        <Section title="Faith & Church">
          <InfoRow icon="✝️" label="Denomination"
            value={[profile.denomination, profile.community].filter(Boolean).join(' · ')} />
          <InfoRow icon="⛪" label="Church Name" value={profile.church_name} />
          <InfoRow icon="📆" label="Attendance" value={profile.church_attendance_frequency} />
          <InfoRow icon="📅" label="Member Since" value={profile.membership_year} />
          <InfoRow icon="👤" label="Pastor" value={profile.pastor_name} />
          <InfoRow icon="📞" label="Pastor Contact" value={profile.pastor_contact} />
          <BoolRow icon="💧" label="Baptized" value={!!profile.baptized} />
          {profile.baptized && profile.baptism_date
            ? <InfoRow icon="📅" label="Baptism Date" value={profile.baptism_date} />
            : null}
          <BoolRow icon="🔥" label="Holy Spirit / Tongues" value={!!profile.holy_spirit} />
          <BoolRow icon="✨" label="Saved" value={!!profile.saved_person} />
          <BoolRow icon="🎵" label="Ministry Participation" value={profile.ministry_participation === 'Yes'} />
          {profile.ministry_description
            ? <InfoRow icon="📝" label="Ministry Details" value={profile.ministry_description} last />
            : <View style={{ height: 2 }} />}
        </Section>

        {/* Family Background */}
        <Section title="Family Background">
          <InfoRow icon="👨" label="Father's Name" value={profile.father_name} />
          <InfoRow icon="👩" label="Mother's Name" value={profile.mother_name} />
          <InfoRow icon="💼" label="Parents' Occupation" value={profile.parents_occupation} />
          <InfoRow icon="👦" label="Brothers"
            value={`${profile.brothers_count} total · ${profile.married_brothers_count} married`} />
          <InfoRow icon="👧" label="Sisters"
            value={`${profile.sisters_count} total · ${profile.married_sisters_count} married`} />
          <InfoRow icon="🏠" label="Address" value={profile.address} last />
        </Section>

        {/* Partner Preference */}
        {!!profile.partner_required && (
          <Section title="Partner Preference">
            <View style={styles.prefGrid}>
              <PrefCard label="Age Range" value={`${profile.preferred_age_from} – ${profile.preferred_age_to} yrs`} />
              <PrefCard label="Height Range" value={`${profile.preferred_height_from}' – ${profile.preferred_height_to}'`} />
              {profile.preferred_weight_min && profile.preferred_weight_max
                ? <PrefCard label="Weight Range" value={`${profile.preferred_weight_min} – ${profile.preferred_weight_max} kg`} />
                : null}
              <PrefCard label="Preferred Location" value={profile.preferred_location || '—'} />
              <PrefCard label="Wants Children" value={profile.wants_children ? 'Yes' : 'No'} />
              <PrefCard label="Smoker" value={profile.smoker ? 'Yes' : 'No'} />
              <PrefCard label="Drinker" value={profile.drinker ? 'Yes' : 'No'} />
            </View>
          </Section>
        )}

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* ── FIXED ACTION BAR ── */}
      <Animated.View style={[styles.actionBar, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.actionOutline}
          onPress={() => navigation?.navigate('Messages')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionOutlineText}>✉  Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSolid}
          onPress={sendConnectRequest}
          activeOpacity={0.85}
        >
          <Text style={styles.actionSolidText}>✦ Connect</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF9F6' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF9F6' },
  loadingText: { color: '#999', fontSize: 14 },

  heroWrap: { height: 420, position: 'relative', backgroundColor: DARK },
  heroImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 260,
    backgroundColor: 'rgba(10,14,26,0.68)',
  },

  topNav: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight ?? 28 : 52,
    left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  backArrow: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 },
  topNavRight: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  iconBtnIcon: { fontSize: 22, color: '#fff' },
  iconBtnIconActive: { color: '#E74C3C' },

  heroInfo: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  matchPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.22)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: GOLD, marginBottom: 8,
  },
  matchPillText: { color: GOLD, fontSize: 12, fontWeight: '700' },
  heroName: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  heroMeta: { fontSize: 13, color: '#CCC', marginTop: 4 },
  heroUserId: { fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3 },
  heroBadgeRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },

  verifiedBadge: {
    backgroundColor: '#1D9E5A', borderRadius: 14,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  verifiedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  pendingBadge: {
    backgroundColor: 'rgba(220,150,0,0.18)', borderRadius: 14,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(220,150,0,0.5)',
  },
  pendingText: { color: '#C07A00', fontSize: 11, fontWeight: '700' },
  denomBadge: {
    backgroundColor: 'rgba(201,168,76,0.2)', borderRadius: 14,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: GOLD,
  },
  denomText: { color: GOLD, fontSize: 11, fontWeight: '700' },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  tag: {
    backgroundColor: '#FEF8EC', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#E8D9A8',
  },
  tagText: { fontSize: 12, color: '#A89060', fontWeight: '500' },

  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionAccent: { width: 4, height: 18, backgroundColor: GOLD, borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: DARK },

  aboutText: { fontSize: 14, color: '#555', lineHeight: 22 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0EBE0',
  },
  infoIcon: { fontSize: 15, width: 28 },
  infoLabel: { flex: 1, fontSize: 13, color: '#999', fontWeight: '500' },
  infoValue: { fontSize: 13, color: DARK, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },

  yesBadge: {
    backgroundColor: '#E6F9F0', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  noBadge: {
    backgroundColor: '#FDECEC', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  yesText: { fontSize: 11, color: '#0F6E56', fontWeight: '700' },
  noText: { fontSize: 11, color: '#A32D2D', fontWeight: '700' },

  prefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  prefCard: {
    width: (width - 40 - 10) / 2,
    backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1, borderColor: '#EEE8DC',
    padding: 14,
  },
  prefLabel: { fontSize: 11, color: '#AAA', marginBottom: 4 },
  prefValue: { fontSize: 14, color: DARK, fontWeight: '600' },

  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 20, paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    borderTopWidth: 1, borderTopColor: '#EEE8DC',
  },
  actionOutline: {
    flex: 1, borderWidth: 1.5, borderColor: DARK,
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
  },
  actionOutlineText: { fontSize: 14, color: DARK, fontWeight: '700' },
  actionSolid: {
    flex: 1.5, backgroundColor: DARK, borderRadius: 16,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: GOLD,
  },
  actionSolidText: { fontSize: 14, color: '#fff', fontWeight: '700' },
});