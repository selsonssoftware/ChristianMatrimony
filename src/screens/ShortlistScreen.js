import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,

    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Platform
} from 'react-native';
import {

    SafeAreaView,

} from 'react-native-safe-area-context';
const MOCK_PROFILES = [
    {
        id: '1',
        name: 'Priya',
        verified: true,
        community: 'CSI (Church of South India)',
        age: 26,
        height: "5'4\"",
        profession: 'Software Engineer',
        location: 'Chennai',
        language: 'Tamil',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600',
        online: true,
    },
    {
        id: '2',
        name: 'David',
        verified: true,
        community: 'Catholic',
        age: 30,
        height: "5'11\"",
        profession: 'Marketing Manager',
        location: 'Coimbatore',
        language: 'Tamil',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600',
        online: true,
    }
];

export default function ShortlistScreen() {
    const [savedList, setSavedList] = useState(MOCK_PROFILES);

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Nav Header Bar */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.navBtn}>
              <Text style={styles.navMenuIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shortlist</Text>
                <TouchableOpacity style={styles.navBtn}>
                    <Text style={styles.navBellIcon}>🔔</Text>
                    <View style={styles.redDotBadge} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Statistics Total Pill */}
                <View style={styles.chipContainer}>
                    <View style={styles.savedChip}>
                        <Text style={styles.chipText}>🔖  28 Saved Profiles</Text>
                    </View>
                </View>

                {/* Profile Directories Iteration */}
                {savedList.map(profile => (
                    <View key={profile.id} style={styles.profileCard}>
                        {/* Image wrapper frame */}
                        <View style={styles.imageWrapper}>
                            <Image source={{ uri: profile.image }} style={styles.profileImage} />

                            {/* Interactive online dot asset */}
                            {profile.online && (
                                <View style={styles.onlineBadge}>
                                    <View style={styles.onlineDot} />
                                    <Text style={styles.onlineText}>ONLINE</Text>
                                </View>
                            )}

                            {/* Floating Save/Heart Selector */}
                            <TouchableOpacity style={styles.heartButton}>
                                <Text style={styles.heartIcon}>❤️</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Summary Identifiers Body */}
                        <View style={styles.detailsContainer}>
                            <View style={styles.nameRow}>
                                <Text style={styles.profileName}>{profile.name}</Text>
                                {profile.verified && (
                                    <View style={styles.verifiedBadge}>
                                        <Text style={styles.verifiedText}>✓ VERIFIED</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.communitySub}>⛪ {profile.community}</Text>

                            {/* Info Detail Grid Layout */}
                            <View style={styles.metaGrid}>
                                <View style={styles.gridItem}><Text style={styles.metaText}>🎂 {profile.age} Yrs, {profile.height}</Text></View>
                                <View style={styles.gridItem}><Text style={styles.metaText}>💼 {profile.profession}</Text></View>
                                <View style={styles.gridItem}><Text style={styles.metaText}>📍 {profile.location}</Text></View>
                                <View style={styles.gridItem}><Text style={styles.metaText}>🗣️ {profile.language}</Text></View>
                            </View>

                            {/* Lower Secondary Component Action Buttons Row */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.outlineBtn}>
                                    <Text style={styles.outlineBtnText}>VIEW PROFILE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.filledBtn}>
                                    <Text style={styles.filledBtnText}>➤  SEND MESSAGE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

                {/* Premium Banner Engagement Callout Box */}
                <View style={styles.premiumCard}>
                    <View style={styles.premiumIconCircle}>
                        <Text style={styles.premiumCrown}>👑</Text>
                    </View>
                    <View style={styles.premiumInfo}>
                        <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                        <Text style={styles.premiumSubtitle}>Connect instantly with your saved matches</Text>
                    </View>
                    <TouchableOpacity style={styles.premiumBtn}>
                        <Text style={styles.premiumBtnText}>UPGRADE NOW</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F8F9FB' },
    header: {
        height: 60,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#050914',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    navBtn: { padding: 6, position: 'relative' },
    navMenuIcon: { fontSize: 22, color: '#000' },
    navBellIcon: { fontSize: 20, color: '#000' },
    redDotBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D9383A',
    },
    scrollContainer: { padding: 16, paddingBottom: 32 },
    chipContainer: { alignItems: 'flex-start', marginBottom: 16 },
    savedChip: {
        backgroundColor: '#0F1421',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    chipText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    imageWrapper: { position: 'relative', width: '100%', height: 240 },
    profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    onlineBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ecc71', marginRight: 6 },
    onlineText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    heartButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#FFFFFF',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    heartIcon: { fontSize: 16 },
    detailsContainer: { padding: 16 },
    nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    profileName: { fontSize: 20, fontWeight: 'bold', color: '#050914', marginRight: 8 },
    verifiedBadge: {
        backgroundColor: '#FCF7E8',
        borderWidth: 1,
        borderColor: '#D4AF37',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    verifiedText: { color: '#927238', fontSize: 9, fontWeight: '800' },
    communitySub: { fontSize: 14, color: '#666666', fontWeight: '500', marginBottom: 14 },
    metaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
        rowGap: 10,
    },
    gridItem: { width: '48%' },
    metaText: { fontSize: 13, color: '#555555' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
    outlineBtn: {
        width: '47%',
        borderWidth: 1,
        borderColor: '#050914',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    outlineBtnText: { color: '#050914', fontSize: 13, fontWeight: '700' },
    filledBtn: {
        width: '47%',
        backgroundColor: '#1E2213',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    filledBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    premiumCard: {
        backgroundColor: '#151922',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    premiumIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F7C942',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    premiumCrown: { fontSize: 24 },
    premiumInfo: { alignItems: 'center', marginBottom: 16 },
    premiumTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    premiumSubtitle: { color: '#9A9FA7', fontSize: 13, textAlign: 'center' },
    premiumBtn: {
        backgroundColor: '#FBC723',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
    },
    premiumBtnText: { color: '#0F1421', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});