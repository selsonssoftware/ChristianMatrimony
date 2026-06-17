import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    StatusBar, Platform, Animated, Alert,
    KeyboardAvoidingView, ScrollView, Dimensions,
} from 'react-native';
import {
  
  SafeAreaView,
  
} from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;
const GOLD = '#C9A84C';
const DARK = '#080C18';
const GREEN = '#1D9E5A';

export default function VerificationScreen({ route, navigation }) {
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [success, setSuccess] = useState(false);

    const inputs = useRef([]);
    const timerRef = useRef(null);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const successScale = useRef(new Animated.Value(0)).current;
    const dotsAnim = useRef([...Array(OTP_LENGTH)].map(() => new Animated.Value(1))).current;

    const { phone, flow, user_id } = route.params || {};
    const isLogin = flow !== 'register';

    useEffect(() => {
        startTimer();
        return () => clearInterval(timerRef.current);
    }, []);

    const startTimer = () => {
        clearInterval(timerRef.current);
        setTimer(30);
        setCanResend(false);
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const animateDot = (idx) => {
        Animated.sequence([
            Animated.spring(dotsAnim[idx], { toValue: 0.85, friction: 4, useNativeDriver: true }),
            Animated.spring(dotsAnim[idx], { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
    };

    const handleDigit = (val, idx) => {
        const digit = val.replace(/[^0-9]/g, '').slice(-1);
        const next = [...otp];
        next[idx] = digit;
        setOtp(next);
        if (digit) {
            animateDot(idx);
            if (idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus();
        }
    };

    const handleBackspace = (key, idx) => {
        if (key === 'Backspace' && !otp[idx] && idx > 0) {
            inputs.current[idx - 1]?.focus();
        }
    };

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]).start();
    };

    const handleVerify = async () => {
        const entered = otp.join('');
        if (entered.length < OTP_LENGTH) { shake(); return; }

        try {
            setVerifying(true);
            const apiUrl = isLogin
                ? 'https://matrimony.gmworld.net/api/login_verify_otp'
                : 'https://matrimony.gmworld.net/api/verify_otp';

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: String(phone), otp: String(entered) }),
            });
            const data = await res.json();
            setVerifying(false);

            if (data.status) {
                await AsyncStorage.setItem('isLoggedIn', 'true');
                await AsyncStorage.setItem('user_id', String(user_id));
                await AsyncStorage.setItem('phone', String(phone));
                setSuccess(true);
                Animated.spring(successScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }).start();
                setTimeout(() => {
                    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                }, 1200);
            } else {
                shake();
                setOtp(Array(OTP_LENGTH).fill(''));
                inputs.current[0]?.focus();
                Alert.alert('Incorrect OTP', data.message || 'Please try again.');
            }
        } catch (err) {
            setVerifying(false);
            Alert.alert('Error', err?.message || 'Server connection failed.');
        }
    };

    const maskedPhone = phone
        ? `+91 ${phone.slice(0, 2)}${'•'.repeat(6)}${phone.slice(-2)}`
        : '';

    const filled = otp.filter(Boolean).length;

    return (
        <SafeAreaView style={styles.safe}edges={['top','bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F1EB" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Back button */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>

                    {/* Icon */}
                    <View style={styles.iconWrap}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconText}>✉</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>Enter the code</Text>
                    <Text style={styles.subtitle}>
                        We sent a 6-digit code to{'\n'}
                        <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
                    </Text>

                    {/* OTP input */}
                    <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
                        {otp.map((digit, i) => (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.otpBoxWrap,
                                    { transform: [{ scale: dotsAnim[i] }] },
                                ]}
                            >
                                <TextInput
                                    ref={ref => { inputs.current[i] = ref; }}
                                    style={[
                                        styles.otpBox,
                                        digit && styles.otpBoxFilled,
                                        i === filled && !digit && styles.otpBoxActive,
                                    ]}
                                    value={digit}
                                    onChangeText={val => handleDigit(val, i)}
                                    onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, i)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    textAlign="center"
                                    editable={!verifying && !success}
                                    selectTextOnFocus
                                />
                            </Animated.View>
                        ))}
                    </Animated.View>

                    {/* Progress dots under OTP */}
                    <View style={styles.progressDots}>
                        {otp.map((d, i) => (
                            <View key={i} style={[styles.progressDot, d && styles.progressDotFilled]} />
                        ))}
                    </View>

                    {/* Resend */}
                    <TouchableOpacity
                        onPress={() => { startTimer(); setOtp(Array(OTP_LENGTH).fill('')); }}
                        disabled={!canResend}
                        style={styles.resendWrap}
                        activeOpacity={0.7}
                    >
                        {canResend ? (
                            <Text style={styles.resendActive}>Resend code →</Text>
                        ) : (
                            <Text style={styles.resendTimer}>
                                Resend in <Text style={styles.resendTimerBold}>{timer}s</Text>
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Verify button */}
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                filled < OTP_LENGTH && styles.buttonDim,
                                success && styles.buttonSuccess,
                            ]}
                            onPress={handleVerify}
                            disabled={verifying || success || filled < OTP_LENGTH}
                            activeOpacity={0.9}
                            onPressIn={() => Animated.spring(buttonScale, { toValue: 0.97, useNativeDriver: true }).start()}
                            onPressOut={() => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()}
                        >
                            {success ? (
                                <Animated.Text style={[styles.buttonText, { transform: [{ scale: successScale }] }]}>
                                    ✓ Verified!
                                </Animated.Text>
                            ) : (
                                <Text style={styles.buttonText}>
                                    {verifying ? 'Verifying…' : isLogin ? 'Sign in' : 'Complete Registration'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Info note */}
                    <View style={styles.infoNote}>
                        <Text style={styles.infoIcon}>🔒</Text>
                        <Text style={styles.infoText}>
                            This code expires in 10 minutes. Never share it with anyone.
                        </Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F5F1EB' },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 48,
        alignItems: 'center',
    },

    backBtn: {
        alignSelf: 'flex-start',
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#E8DFD0',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 36,
    },
    backIcon: { fontSize: 18, color: DARK },

    iconWrap: { marginBottom: 24 },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: DARK,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: GOLD,
    },
    iconText: { fontSize: 32 },

    title: {
        fontSize: 28, fontWeight: '700', color: DARK,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 10, textAlign: 'center',
    },
    subtitle: {
        fontSize: 15, color: '#7A7062', textAlign: 'center',
        lineHeight: 22, marginBottom: 36,
    },
    phoneHighlight: { color: DARK, fontWeight: '700' },

    otpRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
        width: '100%',
        justifyContent: 'center',
    },
    otpBoxWrap: {},
    otpBox: {
        width: (width - 48 - 50) / OTP_LENGTH,
        height: 58,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#E8DFD0',
        fontSize: 24,
        fontWeight: '700',
        color: DARK,
    },
    otpBoxActive: { borderColor: GOLD, backgroundColor: '#FEFBF4' },
    otpBoxFilled: { borderColor: DARK, backgroundColor: '#fff' },

    progressDots: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    progressDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#DDD8CE',
    },
    progressDotFilled: { backgroundColor: GOLD },

    resendWrap: { marginBottom: 32 },
    resendActive: { fontSize: 15, color: GOLD, fontWeight: '700' },
    resendTimer: { fontSize: 14, color: '#AAA' },
    resendTimerBold: { color: '#888', fontWeight: '700' },

    button: {
        width: width - 48,
        height: 56,
        backgroundColor: DARK,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: GOLD,
        marginBottom: 24,
    },
    buttonDim: { opacity: 0.5 },
    buttonSuccess: { backgroundColor: GREEN, borderColor: GREEN },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

    infoNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#EEE8DC',
        width: '100%',
    },
    infoIcon: { fontSize: 16, marginTop: 1 },
    infoText: { flex: 1, fontSize: 12, color: '#888', lineHeight: 18 },
});