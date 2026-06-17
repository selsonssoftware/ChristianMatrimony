import React, { useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
   
    StatusBar,
    Animated,
    Platform,
    KeyboardAvoidingView,
    ImageBackground,
    Alert,
} from 'react-native';
import {

  SafeAreaView,

} from 'react-native-safe-area-context';

export default function LoginScreen({ navigation }) {
    // 1. All Hooks declared strictly at the top level
    const [phone, setPhone] = useState('');
    const buttonScale = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const onPressIn = () => {
        Animated.spring(buttonScale, { toValue: 0.98, useNativeDriver: true }).start();
    };

    const onPressOut = () => {
        Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
    };

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleContinue = async () => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');

        if (cleanPhone.length !== 10) {
            shake();
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
            return;
        }

        try {
            const response = await fetch(
                'https://matrimony.gmworld.net/api/login_send_otp',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: cleanPhone,
                    }),
                }
            );

            const data = await response.json();
            
            if (data.status === true) {
                await AsyncStorage.setItem('matrimonyUserId', String(data.user_id));
               

                // token safe store
                await AsyncStorage.setItem('userToken', data.token ? String(data.token) : '');

                await AsyncStorage.setItem('phone', cleanPhone);

                navigation.navigate('Verification', {
                    phone: cleanPhone,
                    user_id: data.user_id,
                });
            } else {
                shake();
                Alert.alert('Error', data.message || 'Something went wrong');
            }
        } catch (error) {
            // Log the specific error object to the console
            console.error('Network request failed:', error);

            // Optionally, check if error.message provides specific insight
            shake();
            Alert.alert('Network Error', 'Please check your internet connection or try again later.');
        }
    };
    return (
        <SafeAreaView style={styles.safe} edges={['top','bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000' }}
                style={styles.background}
                resizeMode="cover"
            >
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.card}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Continue your journey toward a{'\n'}sacred partnership.
                        </Text>

                        <Animated.View style={[styles.inputSection, { transform: [{ translateX: shakeAnim }] }]}>
                            <Text style={styles.label}>Enter Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your credentials"
                                placeholderTextColor="#A0A0A0"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={phone}
                                onChangeText={t => setPhone(t.replace(/[^0-9]/g, ''))}
                            />
                        </Animated.View>

                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                style={styles.button}
                                activeOpacity={1}
                                onPressIn={onPressIn}
                                onPressOut={onPressOut}
                                onPress={handleContinue}
                            >
                                <Text style={styles.buttonText}>Get OTP</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <Text style={styles.footerText}>
                            New to our fellowship?{' '}
                            <Text style={styles.footerLink} onPress={() => navigation?.navigate('Register')}>
                                Join the{'\n'}Community
                            </Text>
                              
                        </Text>

                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FAF7F2' },
    background: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    keyboardView: { width: '100%', alignItems: 'center', justifyContent: 'center' },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingVertical: 44,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 6,
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#030611',
        textAlign: 'center',
        marginBottom: 12,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    subtitle: { fontSize: 16, color: '#666666', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
    inputSection: { marginBottom: 35 },
    label: { fontSize: 14, fontWeight: '700', color: '#444444', marginBottom: 12 },
    input: { fontSize: 15, color: '#111111', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2DDD6' },
    button: {
        backgroundColor: '#030611',
        borderRadius: 100,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    footerText: { textAlign: 'center', fontSize: 15, color: '#666666', lineHeight: 22 },
    footerLink: { color: '#9E7A3B', fontWeight: 'bold' },
});