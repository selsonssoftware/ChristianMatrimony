import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList, Image,
    StyleSheet, KeyboardAvoidingView, Platform, StatusBar, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOLD = '#C9A84C';
const DARK = '#07122A';

const QUICK_REPLIES = [
    'Praise the Lord 🙏',
    'God bless you!',
    'Sure, let\'s connect',
    'My family is okay 😊',
    'Which church do you attend?',
];

const EMOJI_LIST = ['🙏', '😊', '❤️', '✝️', '😄', '👍', '🌹', '🕊️'];

const formatTime = (date) => {
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
};

export default function ChatScreen({ route }) {
    const navigation = useNavigation();
    const { user } = route.params;
    const insets = useSafeAreaInsets();

    const [messages, setMessages] = useState([
        { id: '1', text: 'Praise the Lord 🙏', sender: 'them', time: new Date(Date.now() - 600000) },
        { id: '2', text: 'Hi! Praise the Lord 🙏 How are you doing?', sender: 'me', time: new Date(Date.now() - 540000) },
        { id: '3', text: 'I am doing well by God\'s grace. Thank you for connecting!', sender: 'them', time: new Date(Date.now() - 480000) },
        { id: '4', text: 'My family would love to know more about yours.', sender: 'them', time: new Date(Date.now() - 60000) },
    ]);
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [showQuick, setShowQuick] = useState(true);
    const flatListRef = useRef(null);
    const inputAnim = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(-10)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const sendScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(headerAnim, { toValue: 0, friction: 8, tension: 55, useNativeDriver: true }),
            Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(inputAnim, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    const sendMessage = (msg) => {
        const content = (msg || text).trim();
        if (!content) return;
        // Animate send button
        Animated.sequence([
            Animated.spring(sendScale, { toValue: 0.85, friction: 5, useNativeDriver: true }),
            Animated.spring(sendScale, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]).start();
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: content,
            sender: 'me',
            time: new Date(),
        }]);
        setText('');
        setShowEmoji(false);
        setShowQuick(false);
    };

    // Group messages by date (simplified: just show time per bubble)
    const MessageBubble = ({ item, index, messages, user }) => {
        const isMe = item.sender === 'me';
        const prevMsg = messages[index - 1];
        const showAvatar = !isMe && (!prevMsg || prevMsg.sender !== 'them');

        const bubbleAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.spring(bubbleAnim, {
                toValue: 1,
                friction: 7,
                tension: 50,
                useNativeDriver: true,
            }).start();
        }, []);

        return (
            <Animated.View
                style={[
                    styles.msgRow,
                    isMe ? styles.msgRowMe : styles.msgRowThem,
                    {
                        opacity: bubbleAnim,
                        transform: [
                            { scale: bubbleAnim },
                            {
                                translateX: bubbleAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [isMe ? 20 : -20, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                {!isMe && (
                    <View style={styles.msgAvatarCol}>
                        {showAvatar ? (
                            <Image source={{ uri: user.image }} style={styles.msgAvatar} />
                        ) : (
                            <View style={styles.msgAvatarPlaceholder} />
                        )}
                    </View>
                )}

                <View style={[styles.bubbleWrap, isMe && { alignItems: 'flex-end' }]}>
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                        <Text style={[styles.bubbleText, { color: isMe ? '#fff' : '#111' }]}>
                            {item.text}
                        </Text>
                    </View>
                    <Text style={styles.timeLabel}>
                        {formatTime(item.time)}
                    </Text>
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" translucent={false} />

            {/* ── HEADER ── */}
            <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerAnim }] }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <View style={styles.avatarWrap}>
                    <Image source={{ uri: user.image }} style={styles.avatar} />
                    <View style={styles.onlineDot} />
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>{user.name}</Text>
                    <View style={styles.headerSubRow}>
                        <View style={styles.onlinePill}><Text style={styles.onlinePillText}>● Online</Text></View>
                        {user.denom && <Text style={styles.headerDenom}>{user.denom}</Text>}
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
                        <Text style={styles.actionBtnIcon}>📹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnGold]} activeOpacity={0.8}>
                        <Text style={styles.actionBtnIcon}>📞</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* ── FAITH BANNER ── */}
            <View style={styles.faithBanner}>
                <Text style={styles.faithBannerText}>✝ Verified Christian Connection  ·  Be respectful & faith-centred</Text>
            </View>

            {/* ── BODY ── */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={insets.top + 60}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={({ item, index }) => (
                        <MessageBubble
                            item={item}
                            index={index}
                            messages={messages}
                            user={user}
                        />
                    )}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.chatBody}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                />

                {/* ── QUICK REPLIES ── */}
                {showQuick && (
                    <Animated.View style={[styles.quickRow, { opacity: inputAnim }]}>
                        <FlatList
                            data={QUICK_REPLIES}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={i => i}
                            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.quickChip} onPress={() => sendMessage(item)} activeOpacity={0.8}>
                                    <Text style={styles.quickChipText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </Animated.View>
                )}

                {/* ── EMOJI PICKER ── */}
                {showEmoji && (
                    <View style={styles.emojiPicker}>
                        {EMOJI_LIST.map(e => (
                            <TouchableOpacity key={e} style={styles.emojiBtn} onPress={() => setText(t => t + e)} activeOpacity={0.7}>
                                <Text style={styles.emoji}>{e}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* ── INPUT BAR ── */}
                <Animated.View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12, opacity: inputAnim }]}>
                    <TouchableOpacity style={styles.emojiToggle} onPress={() => setShowEmoji(v => !v)} activeOpacity={0.8}>
                        <Text style={styles.emojiToggleIcon}>{showEmoji ? '⌨' : '😊'}</Text>
                    </TouchableOpacity>

                    <TextInput
                        value={text}
                        onChangeText={t => { setText(t); setShowEmoji(false); }}
                        placeholder="Type a message…"
                        placeholderTextColor="#B0A898"
                        style={styles.input}
                        multiline
                        onFocus={() => setShowQuick(false)}
                    />

                    <Animated.View style={{ transform: [{ scale: sendScale }] }}>
                        <TouchableOpacity
                            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
                            onPress={() => sendMessage()}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.sendText}>➤</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F7F4EF' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#EEE8DC',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#F5EFE6', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E8DFD0', marginRight: 10,
    },
    backArrow: { fontSize: 20, color: DARK, fontWeight: '600' },
    avatarWrap: { position: 'relative', marginRight: 10 },
    avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: GOLD },
    onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: '#2ECC71', borderWidth: 2, borderColor: '#fff' },
    headerInfo: { flex: 1 },
    headerName: { fontSize: 16, fontWeight: '700', color: DARK },
    headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
    onlinePill: { backgroundColor: '#E8F8F0', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
    onlinePillText: { fontSize: 11, color: '#1D9E5A', fontWeight: '600' },
    headerDenom: { fontSize: 11, color: '#A89060' },
    headerActions: { flexDirection: 'row', gap: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5EFE6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8DFD0' },
    actionBtnGold: { backgroundColor: DARK, borderColor: GOLD },
    actionBtnIcon: { fontSize: 17 },

    faithBanner: { backgroundColor: '#FEF8EC', paddingVertical: 7, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0DFA0' },
    faithBannerText: { fontSize: 11, color: '#A89060', textAlign: 'center', letterSpacing: 0.3 },

    // Chat
    chatBody: { padding: 16, paddingBottom: 10, flexGrow: 1 },
    msgRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-end' },
    msgRowMe: { justifyContent: 'flex-end' },
    msgRowThem: { justifyContent: 'flex-start' },
    msgAvatarCol: { width: 34, marginRight: 8, alignSelf: 'flex-end' },
    msgAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: GOLD },
    msgAvatarPlaceholder: { width: 30, height: 30 },
    bubbleWrap: { maxWidth: '75%' },
    bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, marginBottom: 3 },
    bubbleMe: { backgroundColor: DARK, borderBottomRightRadius: 4 },
    bubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#EEE8DC' },
    bubbleText: { fontSize: 15, lineHeight: 22 },
    timeLabel: { fontSize: 10, color: '#BBB', alignSelf: 'flex-end', marginHorizontal: 4 },

    // Quick replies
    quickRow: { paddingVertical: 10, backgroundColor: '#F7F4EF', borderTopWidth: 1, borderTopColor: '#EEE8DC' },
    quickChip: { backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#E8DFD0' },
    quickChipText: { fontSize: 12, color: '#555', fontWeight: '500' },

    // Emoji picker
    emojiPicker: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEE8DC', gap: 8 },
    emojiBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F9F7F2', alignItems: 'center', justifyContent: 'center' },
    emoji: { fontSize: 22 },

    // Input
    inputContainer: {
        flexDirection: 'row', alignItems: 'flex-end',
        paddingHorizontal: 12, paddingTop: 10,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE8DC',
        gap: 8,
    },
    emojiToggle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#F5EFE6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8DFD0' },
    emojiToggleIcon: { fontSize: 20 },
    input: {
        flex: 1, minHeight: 46, maxHeight: 120,
        borderWidth: 1.5, borderColor: '#E8DFD0', borderRadius: 24,
        paddingHorizontal: 16, paddingVertical: 10,
        backgroundColor: '#FAFAF8', fontSize: 15, color: '#222',
    },
    sendButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: DARK, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: GOLD },
    sendButtonDisabled: { backgroundColor: '#D5D5D5', borderColor: '#D5D5D5' },
    sendText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});