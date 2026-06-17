import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Platform, Animated,
} from 'react-native';

export default function OnboardingScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />
      <View style={styles.container}>
        <Animated.View style={[styles.content, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          <View style={styles.crossWrap}>
            <View style={styles.crossV} />
            <View style={styles.crossH} />
          </View>
          <Text style={styles.welcome}>Welcome to</Text>
          <Text style={styles.brand}>ChristianMatrimony</Text>
          <Text style={styles.tagline}>Where faith meets forever</Text>
          <Text style={styles.desc}>
            Let's set up your profile so we can find you the most
            compatible faith-based matches.
          </Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.replace('CreateProfile')}
          >
            <Text style={styles.btnText}>BUILD MY PROFILE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => navigation.replace('Home')}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0E1A' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  content: { alignItems: 'center', width: '100%' },
  crossWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  crossV: { position: 'absolute', width: 6, height: 52, backgroundColor: '#C9A84C', borderRadius: 3 },
  crossH: { position: 'absolute', width: 40, height: 6, backgroundColor: '#C9A84C', borderRadius: 3, top: 12 },
  welcome: { fontSize: 16, color: '#A89060', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  brand: {
    fontSize: 28, fontWeight: '700', color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center', marginBottom: 8,
  },
  tagline: { fontSize: 13, color: '#846215', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 28 },
  desc: { fontSize: 14, color: '#AAB8D4', lineHeight: 22, textAlign: 'center', marginBottom: 40 },
  btn: {
    width: '100%', backgroundColor: '#C9A84C', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 14,
  },
  btnText: { color: '#0A0E1A', fontWeight: '700', fontSize: 15, letterSpacing: 1.5 },
  skipBtn: { paddingVertical: 8 },
  skipText: { color: '#7F8C8D', fontSize: 14 },
});