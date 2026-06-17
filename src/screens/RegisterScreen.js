import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Platform, KeyboardAvoidingView,
    ScrollView, Alert, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {

  SafeAreaView,

} from 'react-native-safe-area-context';
export default function RegisterScreen({ navigation }) {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [profileFor, setProfileFor] = useState('bride');
    const [agreed, setAgreed] = useState(false);
    const [focused, setFocused] = useState('');

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const PROFILE_OPTS = [
        { id: 'bride', label: 'Bride', icon: '👰' },
        { id: 'groom', label: 'Groom', icon: '🤵' },
        { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧' },
    ];

    const isFormValid = fullName.trim() && email.trim() && phone.length === 10 && agreed;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleRegister = async () => {
        if (!fullName.trim()) {
            Alert.alert('Missing Name', 'Please enter your full name.');
            shake();
            return;
        }

        if (phone.length !== 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
            shake();
            return;
        }

        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            shake();
            return;
        }

        if (!agreed) {
            Alert.alert('Terms Required', 'Please agree to the Terms of Service.');
            return;
        }

        try {
            const response = await fetch(
                'https://matrimony.gmworld.net/api/registration_api',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        creator: profileFor === 'bride'
                            ? 'Bride'
                            : profileFor === 'groom'
                                ? 'Groom'
                                : 'Parent',
                        name: fullName,
                        email: email,
                        phone: phone,
                    }),
                }
            );

            const data = await response.json();

            console.log('Register Response:', data);

            if (data.status) {
                navigation.navigate('Verification', {
                    phone: phone,
                    flow: 'register',
                    user_id: data.user_id,
                });
            } else {
                Alert.alert('Error', data.message || 'Registration Failed');
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Server Connection Failed');
        }
    };

    return (
        <SafeAreaView style={styles.safe}edges={['top','bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >

                    {/* Back + Brand */}
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Text style={styles.backArrow}>←</Text>
                        </TouchableOpacity>
                        <View style={styles.brandRow}>
                            <View style={styles.miniCross}>
                                <View style={styles.crossV} />
                                <View style={styles.crossH} />
                            </View>
                            <Text style={styles.brandName}>ChristianMatrimony</Text>
                        </View>
                        <View style={{ width: 36 }} />
                    </View>

                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Join our faith-based community and find your match.
                    </Text>

                    {/* Profile For */}
                    <Text style={styles.label}>Creating Profile For</Text>
                    <View style={styles.profileOptRow}>
                        {PROFILE_OPTS.map(opt => (
                            <TouchableOpacity
                                key={opt.id}
                                style={[styles.profileOpt, profileFor === opt.id && styles.profileOptActive]}
                                onPress={() => setProfileFor(opt.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.profileOptIcon}>{opt.icon}</Text>
                                <Text style={[
                                    styles.profileOptLabel,
                                    profileFor === opt.id && styles.profileOptLabelActive,
                                ]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>

                        {/* Full Name */}
                        <Text style={[styles.label, { marginTop: 12 }]}>Full Name</Text>
                        <View style={[styles.inputWrap, focused === 'name' && styles.inputWrapFocused]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#C4B9A8"
                                value={fullName}
                                onChangeText={setFullName}
                                onFocus={() => setFocused('name')}
                                onBlur={() => setFocused('')}
                            />
                        </View>

                        {/* Phone */}
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={[styles.inputWrap, focused === 'phone' && styles.inputWrapFocused]}>
                            <Text style={styles.prefix}>+91</Text>
                            <View style={styles.divider} />
                            <TextInput
                                style={styles.input}
                                placeholder="10-digit mobile number"
                                placeholderTextColor="#C4B9A8"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={phone}
                                onChangeText={t => setPhone(t.replace(/[^0-9]/g, ''))}
                                onFocus={() => setFocused('phone')}
                                onBlur={() => setFocused('')}
                            />
                        </View>

                        {/* Email */}
                        <Text style={styles.label}>Email Address</Text>
                        <View style={[styles.inputWrap, focused === 'email' && styles.inputWrapFocused]}>
                            <TextInput
                                style={styles.input}
                                placeholder="your@email.com"
                                placeholderTextColor="#C4B9A8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocused('email')}
                                onBlur={() => setFocused('')}
                            />
                        </View>

                    </Animated.View>

                    {/* Agreement */}
                    <TouchableOpacity
                        style={styles.agreeRow}
                        onPress={() => setAgreed(!agreed)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                            {agreed && <Text style={styles.checkTick}>✓</Text>}
                        </View>
                        <Text style={styles.agreeText}>
                            I agree to the{' '}
                            <Text style={styles.agreeLink}>Terms of Service</Text>
                            {' '}and{' '}
                            <Text style={styles.agreeLink}>Privacy Policy</Text>.
                            {' '}I affirm this account is for faith-based matrimony purposes.
                        </Text>
                    </TouchableOpacity>

                    {/* Create Account Button */}
                    <TouchableOpacity
                        style={[styles.createBtn, !isFormValid && styles.createBtnDisabled]}
                        disabled={!isFormValid}
                        onPress={handleRegister}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.createBtnText}>CREATE ACCOUNT</Text>
                    </TouchableOpacity>

                    {/* Sign In Link */}
                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FAF7F2' },
    scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },

    topRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 28,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E8DFD0',
    },
    backArrow: { fontSize: 18, color: '#333' },

    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    miniCross: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    crossV: { position: 'absolute', width: 4, height: 20, backgroundColor: '#C9A84C', borderRadius: 2 },
    crossH: { position: 'absolute', width: 14, height: 4, backgroundColor: '#C9A84C', borderRadius: 2, top: 5 },
    brandName: {
        fontSize: 17, fontWeight: '700', color: '#0A0E1A',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },

    title: {
        fontSize: 26, fontWeight: '700', color: '#0A0E1A', marginBottom: 6,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    subtitle: { fontSize: 13, color: '#7F8C8D', marginBottom: 24, lineHeight: 19 },
    label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },

    profileOptRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    profileOpt: {
        flex: 1, alignItems: 'center', paddingVertical: 12,
        borderWidth: 1.5, borderColor: '#E8DFD0', borderRadius: 12,
        backgroundColor: '#fff', gap: 4,
    },
    profileOptActive: { borderColor: '#C9A84C', backgroundColor: '#FEF8EC' },
    profileOptIcon: { fontSize: 22 },
    profileOptLabel: { fontSize: 12, color: '#777' },
    profileOptLabelActive: { color: '#C9A84C', fontWeight: '700' },

    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E8DFD0', borderRadius: 12,
        backgroundColor: '#fff', marginBottom: 12, paddingHorizontal: 14, height: 52,
    },
    inputWrapFocused: { borderColor: '#C9A84C' },
    prefix: { fontSize: 14, color: '#333', fontWeight: '600', marginRight: 8 },
    divider: { width: 1, height: 22, backgroundColor: '#E8DFD0', marginRight: 10 },
    input: { flex: 1, fontSize: 14, color: '#222' },

    agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4, marginBottom: 20 },
    checkbox: {
        width: 20, height: 20, borderRadius: 5,
        borderWidth: 2, borderColor: '#C9A84C',
        alignItems: 'center', justifyContent: 'center', marginTop: 1,
    },
    checkboxChecked: { backgroundColor: '#C9A84C' },
    checkTick: { color: '#fff', fontSize: 12, fontWeight: '700' },
    agreeText: { flex: 1, fontSize: 12, color: '#555', lineHeight: 18 },
    agreeLink: { color: '#C9A84C', fontWeight: '600' },

    createBtn: {
        backgroundColor: '#0A0E1A', borderRadius: 14,
        paddingVertical: 16, alignItems: 'center',
        borderWidth: 2, borderColor: '#C9A84C', marginBottom: 20,
    },
    createBtnDisabled: { opacity: 0.45 },
    createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1.5 },

    loginRow: { flexDirection: 'row', justifyContent: 'center' },
    loginText: { fontSize: 14, color: '#7F8C8D' },
    loginLink: { fontSize: 14, color: '#C9A84C', fontWeight: '700' },
});