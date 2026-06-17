import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, Platform,
} from 'react-native';
import {

  SafeAreaView,

} from 'react-native-safe-area-context';



const DENOMINATIONS = ['Catholic', 'Protestant', 'Pentecostal', 'Orthodox', 'Evangelical'];
const PROFILE_TYPES = [
  { id: 'bride', label: 'Bride', icon: '👰' },
  { id: 'groom', label: 'Groom', icon: '🤵' },
  { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧' },
];

export default function CreateProfileScreen({ navigation }) {

  const [selectedType, setSelectedType] = useState('groom');
  const [selectedDenom, setSelectedDenom] = useState('Protestant');
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar translucent={false} backgroundColor="#FAF7F2" barStyle="dark-content" />

      {/* Fixed Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header Section */}
        <View style={styles.headerWrap}>
          <View style={styles.crossWrap}>
            <View style={styles.crossV} />
            <View style={styles.crossH} />
          </View>
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell us a bit about yourself to help us find your sacred connection.
          </Text>
        </View>

        {/* Profile Type */}
        <Text style={styles.sectionLabel}>Creating Profile For</Text>
        <View style={styles.profileTypeRow}>
          {PROFILE_TYPES.map(pt => (
            <TouchableOpacity
              key={pt.id}
              style={[styles.profileTypeBtn, selectedType === pt.id && styles.profileTypeBtnActive]}
              onPress={() => setSelectedType(pt.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.profileIconCircle, selectedType === pt.id && styles.profileIconCircleActive]}>
                <Text style={styles.profileIcon}>{pt.icon}</Text>
              </View>
              <Text style={[styles.profileTypeLabel, selectedType === pt.id && styles.profileTypeLabelActive]}>
                {pt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Denomination */}
        <Text style={styles.sectionLabel}>Faith Denominations</Text>
        <View style={styles.denomCard}>
          {DENOMINATIONS.map((d, index) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.denomItem,
                selectedDenom === d && styles.denomItemActive,
                index === DENOMINATIONS.length - 1 && styles.denomItemLast,
              ]}
              onPress={() => setSelectedDenom(d)}
              activeOpacity={0.8}
            >
              <View style={styles.denomLeft}>
                <View style={[styles.denomRadio, selectedDenom === d && styles.denomRadioActive]}>
                  {selectedDenom === d && <View style={styles.denomRadioDot} />}
                </View>
                <Text style={[styles.denomText, selectedDenom === d && styles.denomTextActive]}>{d}</Text>
              </View>
              {selectedDenom === d && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 112 }} />
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              insets.bottom > 0
                ? insets.bottom + 12
                : 16,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate('PersonalDetails', {
            profileType: selectedType, denomination: selectedDenom,
          })}
        >
          <Text style={styles.continueBtnText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF7F2',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE8DC',
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8DFD0',
  },

  backArrow: {
    fontSize: 20,
    color: '#0A0E1A',
    fontWeight: '600',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A0E1A',
  },

  headerRight: {
    width: 40,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },

  headerWrap: {
    alignItems: 'center',
    marginBottom: 30,
  },

  crossWrap: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  crossV: {
    position: 'absolute',
    width: 5,
    height: 45,
    backgroundColor: '#C9A84C',
    borderRadius: 3,
  },

  crossH: {
    position: 'absolute',
    width: 32,
    height: 5,
    backgroundColor: '#C9A84C',
    borderRadius: 3,
    top: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A0E1A',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },

  profileTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 24,
  },

  profileTypeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#E8DFD0',
    borderRadius: 14,
    backgroundColor: '#fff',
  },

  profileTypeBtnActive: {
    borderColor: '#C9A84C',
    backgroundColor: '#FEF8EC',
  },

  profileIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIconCircleActive: {
    backgroundColor: '#C9A84C',
  },

  profileIcon: {
    fontSize: 24,
  },

  profileTypeLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
  },

  profileTypeLabelActive: {
    color: '#C9A84C',
    fontWeight: '700',
  },

  denomCard: {
    borderWidth: 1,
    borderColor: '#E8DFD0',
    borderRadius: 14,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  denomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0E8',
  },

  denomItemActive: {
    backgroundColor: '#FFFBF0',
  },

  denomItemLast: {
    borderBottomWidth: 0,
  },

  denomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  denomRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0D8CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  denomRadioActive: {
    borderColor: '#C9A84C',
  },

  denomRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C9A84C',
  },

  denomText: {
    fontSize: 16,
    color: '#444',
  },

  denomTextActive: {
    color: '#0A0E1A',
    fontWeight: '600',
  },

  checkmark: {
    color: '#C9A84C',
    fontSize: 18,
    fontWeight: '700',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE8DC',
  },

  continueBtn: {
    backgroundColor: '#0A0E1A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C9A84C',
  },

  continueBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
});