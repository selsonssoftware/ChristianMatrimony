import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800';

// ─── Helpers ────────────────────────────────────────────────────────────────
function calcAge(dob) {
    if (!dob) return 'N/A';
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

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ReceiveHistoryScreen({ navigation }) {
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const userId = await AsyncStorage.getItem('matrimonyUserId');
            if (!userId) {
                setLoading(false);
                return;
            }

            const response = await fetch(`https://matrimony.gmworld.net/api/connect_receive/${userId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.status) {
                setHistoryList(data.liked_users || data.data || []);
            } else {
                console.warn(data.message);
            }
        } catch (error) {
            console.error("Error fetching request history:", error);
            Alert.alert("Error", "Could not load your request history.");
        } finally {
            setLoading(false);
        }
    };

    // ─── Update Status API ───
    const handleUpdateStatus = async (senderId, receiverId, newStatus) => {
        try {
            const response = await fetch('https://matrimony.gmworld.net/api/update_connect_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    sender_user_id: senderId,     // Using 'like_id' from your JSON
                    receiver_user_id: receiverId, // Using 'liked_id' from your JSON
                    status: newStatus             // 'accepted' or 'rejected'
                })
            });

            const data = await response.json();
            
            if (data.status) {
                Alert.alert('Success', `Request ${newStatus} successfully!`);
                // Re-fetch the list to instantly update the UI highlights and badges
                fetchHistory();
            } else {
                Alert.alert('Failed', data.message || 'Could not update status.');
            }
        } catch (error) {
            console.error("Error updating status:", error);
            Alert.alert("Error", "Something went wrong while updating status.");
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Nav Header Bar */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}>
                    <Text style={styles.navMenuIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Receive History</Text>
                <TouchableOpacity style={styles.navBtn}>
                    <Text style={styles.navBellIcon}>🔔</Text>
                    <View style={styles.redDotBadge} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                    <Text style={styles.loadingText}>Loading history...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* Statistics Total Pill */}
                    <View style={styles.chipContainer}>
                        <View style={styles.savedChip}>
                            <Text style={styles.chipText}>🗂️ {historyList.length} Total Request{historyList.length !== 1 && 's'}</Text>
                        </View>
                    </View>

                    {/* Empty State */}
                    {historyList.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🕰️</Text>
                            <Text style={styles.emptyText}>You haven't received any requests yet.</Text>
                        </View>
                    )}

                    {/* Profile Directories Iteration */}
                    {historyList.map((profile, index) => {
                        const age = calcAge(profile.date_of_birth);
                        const height = cmToFeetInches(profile.height);
                        const photoUri = profile.profile_photo || PLACEHOLDER_IMAGE;
                        
                        // 1. PROFILE VERIFICATION STATUS (From 'status')
                        const profileStatus = (profile.status || '').toLowerCase();
                        const isVerified = profileStatus === 'approved' || profileStatus === 'active';

                        // 2. CONNECTION REQUEST STATUS (From 'profile_status' in your JSON)
                        const connectionStatus = (profile.profile_status || 'pending').toLowerCase();
                        
                        let cardHighlightColor = '#F39C12'; // Default Orange (Pending)
                        let badgeColor = 'rgba(243, 156, 18, 0.9)';
                        let statusText = '⏳ PENDING';

                        if (connectionStatus === 'accepted') {
                            cardHighlightColor = '#2ECC71'; // Green
                            badgeColor = 'rgba(46, 204, 113, 0.9)';
                            statusText = '✓ ACCEPTED';
                        } else if (connectionStatus === 'rejected') {
                            cardHighlightColor = '#E74C3C'; // Red
                            badgeColor = 'rgba(231, 76, 60, 0.9)';
                            statusText = '✕ REJECTED';
                        }

                        return (
                            <View 
                                key={profile.id ? `${profile.id}-${index}` : index.toString()} 
                                style={[
                                    styles.profileCard, 
                                    // Highlight the card border based on CONNECTION status
                                    { borderColor: cardHighlightColor, borderWidth: 1.5 }
                                ]}
                            >
                                {/* Image wrapper frame */}
                                <View style={styles.imageWrapper}>
                                    <Image source={{ uri: photoUri }} style={styles.profileImage} />

                                    {/* Connection Status Badge */}
                                    <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                                        <Text style={styles.statusText}>{statusText}</Text>
                                    </View>
                                </View>

                                {/* Summary Identifiers Body */}
                                <View style={styles.detailsContainer}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.profileName}>{profile.full_name || 'User'}</Text>
                                        
                                        {/* Profile Verified Badge */}
                                        {isVerified && (
                                            <View style={styles.verifiedBadge}>
                                                <Text style={styles.verifiedText}>✓ VERIFIED</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={styles.communitySub}>⛪ {profile.denomination || profile.community || 'Not specified'}</Text>

                                    {/* Info Detail Grid Layout */}
                                    <View style={styles.metaGrid}>
                                        <View style={styles.gridItem}><Text style={styles.metaText}>🎂 {age} Yrs, {height}</Text></View>
                                        <View style={styles.gridItem}><Text style={styles.metaText}>💼 {profile.occupation || 'Professional'}</Text></View>
                                        <View style={styles.gridItem}><Text style={styles.metaText}>📍 {profile.current_location || 'Not updated'}</Text></View>
                                        <View style={styles.gridItem}><Text style={styles.metaText}>🗣️ {profile.mother_tongue || 'Not specified'}</Text></View>
                                    </View>

                                    {/* Action Buttons Section */}
                                    {connectionStatus === 'pending' ? (
                                        // ── PENDING STATE: Show Accept/Reject Buttons ──
                                        <View style={styles.actionColumn}>
                                            <TouchableOpacity 
                                                style={[styles.outlineBtn, { width: '100%', borderColor: '#050914', marginBottom: 10 }]}
                                                onPress={() => navigation.navigate('ViewProfile', { 
                                                    profileId: profile.user_id,
                                                    userid: profile.user_id 
                                                })}
                                            >
                                                <Text style={[styles.outlineBtnText, { color: '#050914' }]}>VIEW PROFILE</Text>
                                            </TouchableOpacity>

                                            <View style={styles.splitRow}>
                                                <TouchableOpacity 
                                                    style={[styles.filledBtn, { width: '48%', backgroundColor: '#E74C3C' }]}
                                                    // Pass like_id (sender) and liked_id (receiver) dynamically based on your JSON
                                                    onPress={() => handleUpdateStatus(profile.like_id, profile.liked_id, 'rejected')}
                                                >
                                                    <Text style={styles.filledBtnText}>✕  REJECT</Text>
                                                </TouchableOpacity>
                                                
                                                <TouchableOpacity 
                                                    style={[styles.filledBtn, { width: '48%', backgroundColor: '#2ECC71' }]}
                                                    // Pass like_id (sender) and liked_id (receiver) dynamically based on your JSON
                                                    onPress={() => handleUpdateStatus(profile.like_id, profile.liked_id, 'accepted')}
                                                >
                                                    <Text style={styles.filledBtnText}>✓  ACCEPT</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        // ── RESOLVED STATE (Accepted/Rejected): Show View Profile Only ──
                                        <View style={styles.actionRow}>
                                            <TouchableOpacity 
                                                style={[styles.outlineBtn, { width: '100%', borderColor: cardHighlightColor }]}
                                                onPress={() => navigation.navigate('ViewProfile', { 
                                                    profileId: profile.id,
                                                    userid: profile.user_id 
                                                })}
                                            >
                                                <Text style={[styles.outlineBtnText, { color: cardHighlightColor }]}>
                                                    VIEW PROFILE
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F8F9FB' },
    centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666', fontSize: 14, fontWeight: '500' },
    emptyContainer: { alignItems: 'center', marginVertical: 40 },
    emptyIcon: { fontSize: 40, marginBottom: 10 },
    emptyText: { fontSize: 15, color: '#888', fontWeight: '500' },

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
        fontSize: 20,
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
        borderColor: '#EAEAEA', 
    },
    imageWrapper: { position: 'relative', width: '100%', height: 240 },
    profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    
    // Status Badges
    statusBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#FFFFFF' },

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
    
    // Action Containers
    actionColumn: { flexDirection: 'column' },
    actionRow: { flexDirection: 'row', justifyContent: 'center' },
    splitRow: { flexDirection: 'row', justifyContent: 'space-between' },
    
    // Buttons
    outlineBtn: {
        borderWidth: 1.5,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#FAFAFA'
    },
    outlineBtnText: { fontSize: 14, fontWeight: '800' },
    filledBtn: {
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    filledBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});