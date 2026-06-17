import React, { useState } from 'react';
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
} from 'react-native';
import {

  SafeAreaView,

} from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  bgLight: '#F9FAFC',
  pureWhite: '#FFFFFF',
  deepDark: '#111625',
  textMain: '#1F2431',
  textMuted: '#656E7B',
  brandGold: '#A3843B',
  goldBtnBg: '#4A3E1B',
  brightYellow: '#FFD54F',
  verifiedBg: '#FFF9E6',
  verifiedText: '#B38F2D',
  activeGreen: '#2ECC71',
  premiumBg: '#1E222D',
};

const SHORTLIST_DATA = [
  {
    id: 's1',
    name: 'Priya',
    verified: true,
    denom: 'CSI (Church of South India)',
    age: '26 Yrs',
    height: "5'4\"",
    job: 'Software Engineer',
    location: 'Chennai',
    language: 'Tamil',
    img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600',
    online: true,
  },
  {
    id: 's2',
    name: 'David',
    verified: true,
    denom: 'Catholic',
    age: '30 Yrs',
    height: "5'11\"",
    job: 'Marketing Manager',
    location: 'Coimbatore',
    language: 'Tamil',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600',
    online: true,
  },
];

export default function ShortlistScreen() {
  const [profiles, setProfiles] = useState(SHORTLIST_DATA);

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pureWhite} />

      {/* ── HEADER NAVIGATION ── */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shortlist</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={styles.headerIcon}>🔔</Text>
          <View style={styles.notiBadgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>

        {/* ── SAVED COUNT PILL SUBHEADER ── */}
        <View style={styles.subHeaderContainer}>
          <View style={styles.savedProfilesPill}>
            <Text style={styles.bookmarkIcon}>🔖</Text>
            <Text style={styles.savedProfilesText}>28 Saved Profiles</Text>
          </View>
        </View>

        {/* ── SHORTLISTED CARDS LIST ── */}
        <View style={styles.cardsContainer}>
          {profiles.map((item) => (
            <View key={item.id} style={styles.profileCard}>

              {/* Image Frame with Badges */}
              <View style={styles.imageFrameBlock}>
                <Image source={{ uri: item.img }} style={styles.cardCoverImage} />

                {/* Heart Top-Right Button */}
                <TouchableOpacity style={styles.heartFloatingBtn} activeOpacity={0.8}>
                  <Text style={styles.heartGraphicIcon}>❤️</Text>
                </TouchableOpacity>

                {/* Online Status Label */}
                {item.online && (
                  <View style={styles.onlineStatusBadge}>
                    <View style={styles.onlineDotIndicator} />
                    <Text style={styles.onlineStatusText}>ONLINE</Text>
                  </View>
                )}
              </View>

              {/* Profile Details Content */}
              <View style={styles.detailsContentBlock}>
                {/* Name & Verified Row */}
                <View style={styles.identityHeaderRow}>
                  <Text style={styles.profileNameText}>{item.name}</Text>
                  {item.verified && (
                    <View style={styles.verifiedBadgePill}>
                      <Text style={styles.verifiedBadgeCheck}>✓</Text>
                      <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                    </View>
                  )}
                </View>

                {/* Denomination Row */}
                <View style={styles.denominationRowLine}>
                  <Text style={styles.churchIconGraphic}>⛪</Text>
                  <Text style={styles.denominationText}>{item.denom}</Text>
                </View>

                {/* Info Grid Rows */}
                <View style={styles.metaDataGridBlock}>
                  <View style={styles.gridRowPair}>
                    <View style={styles.gridItemCell}>
                      <Text style={styles.cellIcon}>🎂</Text>
                      <Text style={styles.cellValueText}>{item.age}, {item.height}</Text>
                    </View>
                    <View style={styles.gridItemCell}>
                      <Text style={styles.cellIcon}>💼</Text>
                      <Text style={styles.cellValueText} numberOfLines={1}>{item.job}</Text>
                    </View>
                  </View>

                  <View style={styles.gridRowPair}>
                    <View style={styles.gridItemCell}>
                      <Text style={styles.cellIcon}>📍</Text>
                      <Text style={styles.cellValueText}>{item.location}</Text>
                    </View>
                    <View style={styles.gridItemCell}>
                      <Text style={styles.cellIcon}>文</Text>
                      <Text style={styles.cellValueText}>{item.language}</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Action Interactive Buttons */}
                <View style={styles.cardActionsActionRow}>
                  <TouchableOpacity style={styles.viewProfileOutlineBtn} activeOpacity={0.7}>
                    <Text style={styles.viewProfileOutlineBtnText}>VIEW PROFILE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.sendMessageFilledBtn} activeOpacity={0.8}>
                    <Text style={styles.paperPlaneIcon}>➤</Text>
                    <Text style={styles.sendMessageFilledBtnText}>SEND MESSAGE</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          ))}
        </View>

        {/* ── BOTTOM PREMIUM MARKETING BANNER ── */}
        <View style={styles.premiumBoxMarketingBanner}>
          <View style={styles.premiumTextMetaRow}>
            <View style={styles.premiumCrownCircleIcon}>
              <Text style={styles.premiumCrownSymbol}>👑</Text>
            </View>
            <View style={styles.premiumHeadingTextStack}>
              <Text style={styles.premiumBoxMainHeadingText}>Upgrade to Premium</Text>
              <Text style={styles.premiumBoxSubDescriptionText}>
                Connect instantly with your saved matches
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.premiumUpgradeActionYellowBtn} activeOpacity={0.9}>
            <Text style={styles.premiumUpgradeActionYellowBtnText}>UPGRADE NOW</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  headerBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerIcon: {
    fontSize: 22,
    color: COLORS.deepDark,
  },
  notiBadgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.deepDark,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  scrollBody: {
    flex: 1,
  },
  subHeaderContainer: {
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  savedProfilesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.deepDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bookmarkIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  savedProfilesText: {
    color: COLORS.pureWhite,
    fontSize: 13,
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 20,
    marginTop: 10,
  },
  profileCard: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageFrameBlock: {
    height: 220,
    position: 'relative',
    backgroundColor: '#EEEEEE',
  },
  cardCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartFloatingBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.pureWhite,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heartGraphicIcon: {
    fontSize: 16,
  },
  onlineStatusBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineDotIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.activeGreen,
    marginRight: 5,
  },
  onlineStatusText: {
    color: COLORS.pureWhite,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailsContentBlock: {
    padding: 16,
  },
  identityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  profileNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  verifiedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.verifiedBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#F3E5AB',
  },
  verifiedBadgeCheck: {
    fontSize: 10,
    color: COLORS.verifiedText,
    fontWeight: '700',
    marginRight: 3,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.verifiedText,
    letterSpacing: 0.3,
  },
  denominationRowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  churchIconGraphic: {
    fontSize: 14,
    marginRight: 6,
    color: COLORS.textMuted,
  },
  denominationText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  metaDataGridBlock: {
    gap: 10,
    marginBottom: 18,
  },
  gridRowPair: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItemCell: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  cellIcon: {
    fontSize: 14,
    marginRight: 8,
    color: COLORS.textMuted,
    width: 18,
    textAlign: 'center',
  },
  cellValueText: {
    fontSize: 14,
    color: COLORS.textMain,
    fontWeight: '400',
    flex: 1,
  },
  cardActionsActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  viewProfileOutlineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.textMain,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.pureWhite,
  },
  viewProfileOutlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    letterSpacing: 0.5,
  },
  sendMessageFilledBtn: {
    flex: 1.2,
    flexDirection: 'row',
    backgroundColor: COLORS.goldBtnBg,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  paperPlaneIcon: {
    color: COLORS.pureWhite,
    fontSize: 12,
    transform: [{ rotate: '-15deg' }],
  },
  sendMessageFilledBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.pureWhite,
    letterSpacing: 0.5,
  },
  premiumBoxMarketingBanner: {
    backgroundColor: COLORS.premiumBg,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  premiumTextMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  premiumCrownCircleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 213, 79, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  premiumCrownSymbol: {
    fontSize: 20,
  },
  premiumHeadingTextStack: {
    flex: 1,
  },
  premiumBoxMainHeadingText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.pureWhite,
    marginBottom: 3,
  },
  premiumBoxSubDescriptionText: {
    fontSize: 13,
    color: '#A0A5B5',
    lineHeight: 17,
  },
  premiumUpgradeActionYellowBtn: {
    backgroundColor: COLORS.brightYellow,
    width: '100%',
    paddingVertical: 13,
    borderRadius: 25,
    alignItems: 'center',
  },
  premiumUpgradeActionYellowBtnText: {
    color: COLORS.deepDark,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});