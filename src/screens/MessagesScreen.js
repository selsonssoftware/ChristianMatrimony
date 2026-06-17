import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';


const { width } = Dimensions.get('window');

// ── DESIGN TOKENS ────────────────────────────────────────────────
const COLORS = {
  bgLight: '#FAFAFA',
  pureWhite: '#FFFFFF',
  textMain: '#111111',
  textMuted: '#7E7E7E',
  textLight: '#B0B6C3',
  brandPurple: '#4A148C',
  brandPurpleLight: '#EDE7F6',
  activeGreen: '#2ECC71',
  borderLight: '#F0F0F0',
  borderStrong: '#E0E0E0',
  searchBg: '#F2F2F2',
  groupBg: '#E2F0D9',
  groupIcon: '#385723',
  deepDark: '#0A0E1A',
};

// ── DATA ─────────────────────────────────────────────────────────
const RECENTLY_ACTIVE = [
  { id: 'ra1', name: 'Sarah J.', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200' },
  { id: 'ra2', name: 'Mark D.', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200' },
  { id: 'ra3', name: 'Rachel K.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' },
  { id: 'ra4', name: 'Anoop', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200' },
];

const CHATS_DATA = [
  { id: '1', name: 'Sarah Jacob', msg: 'I really liked your profile! Would love to chat...', time: '10:45 AM', unread: 2, online: true, isGroup: false, img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300' },
  { id: '2', name: "Mark D'Souza", msg: 'Thank you for accepting my interest. God bless!', time: 'Yesterday', unread: 0, online: false, isGroup: false, img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300' },
  { id: '3', name: 'Rachel Kurian', msg: 'Sent a photo', time: 'Yesterday', unread: 0, online: false, isGroup: false, isMedia: true, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300' },
  { id: '4', name: 'David Wilson', msg: 'How was the service at your parish yesterday?', time: 'Monday', unread: 0, online: false, isGroup: false, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300' },
  { id: '5', name: 'Sunday Fellowship', msg: 'You: Hope to see everyone there!', time: 'May 12', unread: 0, online: false, isGroup: true },
];

const TABS = ['All', 'Unread', 'Favorites'];

// ── ANIMATED CHAT ROW ─────────────────────────────────────────────
function ChatRow({ item, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        delay: index * 60,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX }] }}>
      <TouchableOpacity style={styles.chatRow} activeOpacity={0.7}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          {item.isGroup ? (
            <View style={styles.groupAvatar}>
              <Text style={styles.groupAvatarIcon}>👥</Text>
            </View>
          ) : (
            <Image source={{ uri: item.img }} style={styles.chatAvatar} />
          )}
          {item.online && <View style={styles.onlineDot} />}
        </View>

        {/* Info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatTopRow}>
            <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.chatTime, item.unread > 0 && styles.chatTimeUnread]}>
              {item.time}
            </Text>
          </View>
          <View style={styles.chatBottomRow}>
            <View style={styles.previewRow}>
              {item.isMedia && <Text style={styles.mediaIcon}>🖼️ </Text>}
              <Text style={[styles.chatPreview, item.unread > 0 && styles.chatPreviewBold]} numberOfLines={1}>
                {item.msg}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── ANIMATED TAB BAR ──────────────────────────────────────────────
function TabBar({ activeTab, onSelect }) {
  const tabWidth = (width - 32) / TABS.length;
  const underlineX = useRef(new Animated.Value(0)).current;

  const handleSelect = (tab, i) => {
    Animated.spring(underlineX, {
      toValue: i * tabWidth,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
    onSelect(tab);
  };

  return (
    <View style={styles.tabsContainer}>
      {TABS.map((tab, i) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, { width: tabWidth }]}
            onPress={() => handleSelect(tab, i)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
      <Animated.View
        style={[styles.tabUnderline, { width: tabWidth, transform: [{ translateX: underlineX }] }]}
      />
    </View>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────
export default function MessagesScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredChats = CHATS_DATA.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
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
        {/* Center: title — absolutely centered */}
        <Text style={styles.headerTitle}>Messages</Text>

        {/* Right: bell button */}
        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
          <Text style={styles.headerIconText}>🔔</Text>
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>

        {/* ── SEARCH BAR ── */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── RECENTLY ACTIVE ── */}
        {!searchQuery && (
          <View style={styles.activeSection}>
            <View style={styles.sectionHeadRow}>
              <Text style={styles.sectionTitle}>Recently Active</Text>
              <View style={styles.greenDot} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeScroll}
            >
              {/* Your status */}
              <View style={styles.activeUnit}>
                <View style={styles.statusPlaceholder}>
                  <Text style={styles.plusIcon}>+</Text>
                </View>
                <Text style={styles.activeName} numberOfLines={1}>My status</Text>
              </View>

              {RECENTLY_ACTIVE.map(user => (
                <View key={user.id} style={styles.activeUnit}>
                  <View style={styles.activeAvatarRing}>
                    <Image source={{ uri: user.img }} style={styles.activeAvatarImg} />
                  </View>
                  <Text style={styles.activeName} numberOfLines={1}>{user.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── TAB BAR ── */}
        <TabBar activeTab={activeTab} onSelect={setActiveTab} />

        {/* ── CHAT LIST ── */}
        <View style={styles.chatList}>
          {filteredChats.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No conversations found</Text>
            </View>
          ) : (
            filteredChats.map((item, index) => (
              <ChatRow key={item.id} item={item} index={index} />
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>📝</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ── STYLES ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },

  // ── Header ──
  headerBar: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.pureWhite,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
    paddingTop:20,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.bgLight,
    position: 'relative',
  },
  headerIconText: {
    fontSize: 20,
    color: COLORS.textMain,
  },
  headerTitle: {
    // Centered naturally between two equal-width buttons
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.2,
    // Absolutely fill remaining space centered
    flex: 1,
    textAlign: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
    borderWidth: 1.5,
    borderColor: COLORS.bgLight,
  },

  // ── Search ──
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.searchBg,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 0.5,
    borderColor: COLORS.borderLight,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
    color: COLORS.textMuted,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 13,
    color: COLORS.textMuted,
    paddingLeft: 8,
  },

  // ── Recently Active ──
  activeSection: {
    marginBottom: 16,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.activeGreen,
    marginLeft: 6,
  },
  activeScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  activeUnit: {
    alignItems: 'center',
    width: 66,
  },
  statusPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
    borderStyle: 'dashed',
    marginBottom: 5,
  },
  plusIcon: {
    fontSize: 22,
    color: COLORS.brandPurple,
    fontWeight: '500',
    lineHeight: 26,
  },
  activeAvatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 2,
    borderWidth: 2,
    borderColor: COLORS.brandPurple,
    marginBottom: 5,
    overflow: 'hidden',
  },
  activeAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  activeName: {
    fontSize: 11,
    color: COLORS.textMain,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Tab Bar ──
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 4,
    position: 'relative',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  tabBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabTextActive: {
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

  // ── Chat List ──
  chatList: {
    paddingHorizontal: 16,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  chatAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.borderLight,
    borderWidth: 0.5,
    borderColor: COLORS.borderStrong,
  },
  groupAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.groupBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatarIcon: {
    fontSize: 20,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.activeGreen,
    borderWidth: 2,
    borderColor: COLORS.pureWhite,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMain,
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    flexShrink: 0,
  },
  chatTimeUnread: {
    color: COLORS.brandPurple,
    fontWeight: '600',
  },
  chatBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  mediaIcon: {
    fontSize: 13,
    marginRight: 3,
  },
  chatPreview: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  chatPreviewBold: {
    color: COLORS.textMain,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: COLORS.brandPurple,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  unreadText: {
    color: COLORS.pureWhite,
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Empty state ──
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: COLORS.brandPurple,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.brandPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: {
    fontSize: 20,
  },
});