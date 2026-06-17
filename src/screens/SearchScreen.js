import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Platform
} from 'react-native';

const STORIES_DATA = [
    { id: '1', name: 'Sarah', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200', active: true },
    { id: '2', name: 'Michael', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200', active: false },
    { id: '3', name: 'Grace', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200', active: false },
    { id: '4', name: 'David', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200', active: false },
];

const CHATS_DATA = [
    {
        id: '1',
        name: 'Julianne',
        message: 'Blessings! How was your weekend?',
        time: '2m ago',
        unreadCount: 2,
        status: 'unread',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200'
    },
    {
        id: '2',
        name: 'Mark',
        message: 'I really enjoyed our discussion about the scripture...',
        time: '1h ago',
        unreadCount: 1,
        status: 'unread',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200'
    },
    {
        id: '3',
        name: 'Elena',
        message: 'Thank you for sharing that quote!',
        time: '4h ago',
        unreadCount: 0,
        status: 'read',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200'
    },
    {
        id: '4',
        name: 'Samuel',
        message: 'Looking forward to seeing you at the group...',
        time: 'Yesterday',
        unreadCount: 0,
        status: 'read',
        image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200'
    }
];

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    return (
        <SafeAreaView style={styles.safeContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAF8F6" />

            {/* Top Navigation Bar */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.iconButton}>
                    <Text style={styles.menuIconText}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Search</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Text style={styles.searchHeaderIcon}>🔍</Text>
                </TouchableOpacity>
            </View>

            {/* Sticky Main Container */}
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                {/* Search Conversations Input */}
                <View style={styles.searchBarContainer}>
                    <Text style={styles.searchBarIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search conversations"
                        placeholderTextColor="#8E8E93"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Horizontal Active Stories Row */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.storiesScrollView}
                    contentContainerStyle={styles.storiesContainer}
                >
                    {STORIES_DATA.map((item) => (
                        <View key={item.id} style={styles.storyWrapper}>
                            <View style={item.active ? styles.activeAvatarRing : styles.inactiveAvatarRing}>
                                <Image source={{ uri: item.image }} style={styles.storyAvatar} />
                                {item.active && <View style={styles.activeDotIndicator} />}
                            </View>
                            <Text style={styles.storyName}>{item.name}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Segmented Category Filter Tabs */}
                <View style={styles.tabBarContainer}>
                    {['All', 'Unread', 'Favorites'].map((tab) => {
                        const isSelected = activeTab === tab;
                        return (
                            <TouchableOpacity 
                                key={tab} 
                                style={[styles.tabItem, isSelected && styles.activeTabItem]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabItemText, isSelected && styles.activeTabItemText]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Conversations Feed List Container */}
                <View style={styles.conversationsList}>
                    {CHATS_DATA.map((chat) => (
                        <TouchableOpacity key={chat.id} style={styles.chatRowItem} activeOpacity={0.7}>
                            <Image source={{ uri: chat.image }} style={styles.chatAvatar} />
                            
                            <View style={styles.chatDetailsContainer}>
                                <View style={styles.chatHeaderRow}>
                                    <Text style={styles.chatUserName}>{chat.name}</Text>
                                    <Text style={styles.chatTimeText}>{chat.time}</Text>
                                </View>
                                
                                <View style={styles.chatMessageRow}>
                                    <Text style={styles.chatSnippetText} numberOfLines={2}>
                                        {chat.message}
                                    </Text>
                                    
                                    {chat.unreadCount > 0 ? (
                                        <View style={styles.unreadBadgeCircle}>
                                            <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.doubleCheckmarkIcon}>✓✓</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Styled Scripture Feature Divider Footer */}
                <View style={styles.scriptureBlockContainer}>
                    <View style={styles.scriptureDividerLine} />
                    <Text style={styles.scriptureQuoteText}>
                        "Let all that you do be done in love."
                    </Text>
                    <Text style={styles.scriptureReferenceText}>1 Corinthians 16:14</Text>
                    <View style={styles.scriptureDividerLine} />
                </View>

            </ScrollView>

            {/* Absolute Placed Floating Action Action Button (FAB) */}
            <TouchableOpacity style={styles.floatingActionButton} activeOpacity={0.85}>
                <Text style={styles.fabPlusSign}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#FAF8F6', // Off-white ivory canvas matching search.png
    },
    headerContainer: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#FAF8F6',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0A0B0D',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    iconButton: {
        padding: 4,
    },
    menuIconText: {
        fontSize: 24,
        color: '#4A154B',
    },
    searchHeaderIcon: {
        fontSize: 20,
        color: '#4A154B',
    },
    scrollContainer: {
        paddingBottom: 100, // Leave padding clean navigation allowance for FAB
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E6E3',
    },
    searchBarIcon: {
        fontSize: 16,
        color: '#8E8E93',
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0A0B0D',
    },
    storiesScrollView: {
        marginBottom: 20,
    },
    storiesContainer: {
        paddingHorizontal: 16,
        gap: 16,
    },
    storyWrapper: {
        alignItems: 'center',
        width: 72,
    },
    activeAvatarRing: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 2,
        borderColor: '#4A154B', // Bold purple profile boundary matching Sarah's border
        padding: 2,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inactiveAvatarRing: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 1,
        borderColor: '#E8E6E3',
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyAvatar: {
        width: 58,
        height: 58,
        borderRadius: 29,
    },
    activeDotIndicator: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4A154B',
        borderWidth: 2,
        borderColor: '#FAF8F6',
    },
    storyName: {
        fontSize: 13,
        color: '#555555',
        marginTop: 6,
        textAlign: 'center',
    },
    tabBarContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E6E3',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabItem: {
        borderBottomColor: '#4A154B', // Thick indicator underscore alignment
    },
    tabItemText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#8E8E93',
    },
    activeTabItemText: {
        color: '#4A154B',
        fontWeight: '700',
    },
    conversationsList: {
        paddingHorizontal: 16,
    },
    chatRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    chatAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 14,
    },
    chatDetailsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatUserName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1C1C1E',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    chatTimeText: {
        fontSize: 13,
        color: '#8E8E93',
    },
    chatMessageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    chatSnippetText: {
        fontSize: 14,
        color: '#555555',
        lineHeight: 18,
        flex: 1,
        paddingRight: 8,
    },
    unreadBadgeCircle: {
        backgroundColor: '#4A154B', // Custom brand message count metric bubbles
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    doubleCheckmarkIcon: {
        fontSize: 14,
        color: '#8E8E93',
    },
    scriptureBlockContainer: {
        alignItems: 'center',
        marginTop: 32,
        paddingHorizontal: 32,
    },
    scriptureDividerLine: {
        width: 32,
        height: 1,
        backgroundColor: '#E5C158', // Earthy decorative underline divider
        marginVertical: 16,
    },
    scriptureQuoteText: {
        fontSize: 18,
        color: '#4A154B',
        textAlign: 'center',
        lineHeight: 26,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontStyle: 'italic',
    },
    scriptureReferenceText: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 6,
        textAlign: 'center',
    },
    floatingActionButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: '#4A154B',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4A154B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    fabPlusSign: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '300',
        marginTop: -2,
    },
});