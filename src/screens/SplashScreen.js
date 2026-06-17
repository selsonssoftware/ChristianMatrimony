import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, StatusBar, Dimensions, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const GOLD = '#C9A84C';
const GOLD2 = '#E8C97A';
const DARK = '#080C18';
const DARK2 = '#0F1525';

export default function SplashScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(14)).current;
  const shimmerX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(ring1Scale, { toValue: 1, friction: 4, tension: 30, useNativeDriver: true }),
        Animated.spring(ring2Scale, { toValue: 1, friction: 5, tension: 25, delay: 120, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(lineWidth, { toValue: 100, duration: 600, useNativeDriver: false }),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(taglineY, { toValue: 0, friction: 7, tension: 50, useNativeDriver: true }),
      ]),
    ]).start(async () => {
      Animated.loop(
        Animated.timing(shimmerX, { toValue: 200, duration: 1800, useNativeDriver: true })
      ).start();
      try {
        const userId = await AsyncStorage.getItem('user_id');
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

        setTimeout(() => {
          if (userId && isLoggedIn === 'true') {
            navigation.replace('Home');
          } else {
            navigation.replace('Login');
          }
        }, 900);
      } catch {
        navigation.replace('Login');
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />

      {/* Decorative background rings */}
      <Animated.View style={[styles.bgRingOuter, { transform: [{ scale: ring1Scale }] }]} />
      <Animated.View style={[styles.bgRingInner, { transform: [{ scale: ring2Scale }] }]} />

      {/* Corner accents */}
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerBR]} />

      {/* Logo box */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.crossContainer}>
          <View style={styles.crossV} />
          <View style={styles.crossH} />
          <View style={styles.crossGlow} />
        </View>
        {/* Shimmer overlay */}
        <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]} />
      </Animated.View>

      {/* Divider */}
      <Animated.View style={[styles.dividerWrap]}>
        <Animated.View style={[styles.dividerLine, { width: lineWidth }]} />
      </Animated.View>

      {/* Brand text */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.brandName}>ChristianMatrimony</Text>
        <Animated.Text style={[styles.tagline, { transform: [{ translateY: taglineY }] }]}>
          Where faith meets forever
        </Animated.Text>
      </Animated.View>

      {/* Bottom indicator */}
      <View style={styles.bottomRow}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bgRingOuter: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.08)',
  },
  bgRingInner: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.13)',
  },

  corner: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  cornerTL: {
    top: height * 0.08,
    left: 28,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.2)',
    borderTopLeftRadius: 6,
  },
  cornerBR: {
    bottom: height * 0.08,
    right: 28,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.2)',
    borderBottomRightRadius: 6,
  },

  logoWrap: {
    width: 108,
    height: 108,
    borderRadius: 28,
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ skewX: '-20deg' }],
  },
  crossContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossV: {
    position: 'absolute',
    width: 6,
    height: 56,
    backgroundColor: GOLD,
    borderRadius: 3,
  },
  crossH: {
    position: 'absolute',
    width: 40,
    height: 6,
    backgroundColor: GOLD,
    borderRadius: 3,
    top: 14,
  },
  crossGlow: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(201,168,76,0.18)',
  },

  dividerWrap: {
    height: 2,
    marginBottom: 20,
    alignItems: 'center',
  },
  dividerLine: {
    height: 1.5,
    backgroundColor: GOLD,
    borderRadius: 1,
  },

  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 11,
    color: 'rgba(201,168,76,0.7)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },

  bottomRow: {
    position: 'absolute',
    bottom: 56,
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(201,168,76,0.25)',
  },
  dotActive: {
    width: 22,
    backgroundColor: GOLD,
    borderRadius: 3,
  },

  version: {
    position: 'absolute',
    bottom: 24,
    fontSize: 10,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 1,
  },
});