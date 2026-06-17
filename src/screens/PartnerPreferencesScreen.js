import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveProfileData } from '../utils/profileStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    View, Text, TouchableOpacity, ScrollView, StyleSheet,
    SafeAreaView, StatusBar, TextInput, Platform,Alert
} from 'react-native';

const AGE_RANGES = ['18-24', '25-29', '30-34', '35-40', '40+'];
const DENOMINATIONS = ['Catholic', 'Protestant', 'Pentecostal', 'Orthodox', 'Evangelical', 'Any'];
const LOCATIONS = ['Same City', 'Same State', 'Any in India', 'Open to Abroad'];

export default function PartnerPreferencesScreen({ navigation }) {
    const [ageRange, setAgeRange] = useState('');
    const [denomination, setDenomination] = useState('');
    const [location, setLocation] = useState('');
    const [minHeight, setMinHeight] = useState('');
    const [maxHeight, setMaxHeight] = useState('');
    const [errors, setErrors] = useState({});
    const insets = useSafeAreaInsets();

    const validate = () => {
        const e = {};
        if (!ageRange) e.ageRange = 'Please select preferred age range';
        if (!denomination) e.denomination = 'Please select denomination';
        if (!location) e.location = 'Please select location preference';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleContinue = async () => {
        if (!validate()) return;

        const userId = await AsyncStorage.getItem('user_id');

        if (!userId) {
            Alert.alert('Error', 'User ID not found');
            return;
        }

        let ageFrom = '';
        let ageTo = '';

        if (ageRange) {
            const splitAge = ageRange.split('-');
            ageFrom = splitAge[0];
            ageTo = splitAge[1] || splitAge[0].replace('+', '');
        }

        await saveProfileData({
            user_id: userId,   // add this

            partner_required: 1,
            preferred_age_from: ageFrom,
            preferred_age_to: ageTo,
            preferred_height_from: minHeight,
            preferred_height_to: maxHeight,
            denomination: denomination,
            preferred_location: location,
        });

        navigation.navigate('ReviewProfile');
    };

    const handleSkip = () => navigation?.navigate('ReviewProfile');

    return (
        <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FDFBF8" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.stepText}>Step 6 of 6</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '100%' }]} />
                    </View>
                </View>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.container}
            >
                <Text style={styles.pageTitle}>Partner Preferences</Text>
                <Text style={styles.pageSubtitle}>
                    Help us understand what you're looking for in your future life partner.
                </Text>

                {/* Basic Preferences Card */}
                <View style={[styles.card, styles.cardPink]}>
                    <View style={styles.titleRow}>
                        <Text style={styles.sectionIcon}>💑</Text>
                        <Text style={styles.cardTitle}>Basic Preferences</Text>
                    </View>

                    <Text style={styles.subLabel}>Preferred Age Range <Text style={styles.required}>*</Text></Text>
                    <View style={styles.chipRow}>
                        {AGE_RANGES.map(item => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.chip, ageRange === item && styles.chipActive]}
                                onPress={() => { setAgeRange(item); setErrors(p => ({ ...p, ageRange: null })); }}
                            >
                                <Text style={[styles.chipText, ageRange === item && styles.chipTextActive]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.ageRange ? <Text style={styles.errorText}>{errors.ageRange}</Text> : null}

                    <Text style={styles.subLabel}>Preferred Height Range</Text>
                    <View style={styles.rowGap}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder='e.g. 5\'
                            placeholderTextColor="#AAA"
                            value={minHeight}
                            onChangeText={setMinHeight}
                        />
                        <Text style={styles.rangeSep}>to</Text>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder='e.g. 6\'
                            placeholderTextColor="#AAA"
                            value={maxHeight}
                            onChangeText={setMaxHeight}
                        />
                    </View>
                </View>

                {/* Faith Preferences Card */}
                <View style={[styles.card, styles.cardGreen]}>
                    <View style={styles.titleRow}>
                        <Text style={styles.sectionIcon}>🙏</Text>
                        <Text style={styles.cardTitle}>Faith Preferences</Text>
                    </View>

                    <Text style={styles.subLabel}>Denomination <Text style={styles.required}>*</Text></Text>
                    <View style={styles.chipRow}>
                        {DENOMINATIONS.map(item => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.chip, denomination === item && styles.chipActive]}
                                onPress={() => { setDenomination(item); setErrors(p => ({ ...p, denomination: null })); }}
                            >
                                <Text style={[styles.chipText, denomination === item && styles.chipTextActive]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.denomination ? <Text style={styles.errorText}>{errors.denomination}</Text> : null}
                </View>

                {/* Location Preference Card */}
                <View style={[styles.card, styles.cardBlue]}>
                    <View style={styles.titleRow}>
                        <Text style={styles.sectionIcon}>📍</Text>
                        <Text style={styles.cardTitle}>Location Preference</Text>
                    </View>

                    <Text style={styles.subLabel}>Where should your partner be from? <Text style={styles.required}>*</Text></Text>
                    <View style={styles.chipRow}>
                        {LOCATIONS.map(item => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.chip, location === item && styles.chipActive]}
                                onPress={() => { setLocation(item); setErrors(p => ({ ...p, location: null })); }}
                            >
                                <Text style={[styles.chipText, location === item && styles.chipTextActive]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
                <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
                    <Text style={styles.continueBtnText}>CONTINUE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
                    <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FDFBF8' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        backgroundColor: '#FDFBF8', borderBottomWidth: 1, borderBottomColor: '#EEE8DC',
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#E8DFD0',
    },
    backArrow: { fontSize: 22, color: '#111', fontWeight: '700' },
    headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
    headerRight: { width: 38 },
    stepText: { textAlign: 'center', fontSize: 13, color: '#777', marginBottom: 8, fontWeight: '500' },
    progressBar: { width: '100%', height: 6, backgroundColor: '#E8E8E8', borderRadius: 20 },
    progressFill: { height: 6, backgroundColor: '#C9A84C', borderRadius: 20 },
    container: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 170 },
    pageTitle: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 8 },
    pageSubtitle: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 24 },
    card: {
        borderRadius: 18, padding: 18, marginBottom: 18, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    },
    cardPink: { backgroundColor: '#FFF5F8', borderColor: '#F5D4DE' },
    cardGreen: { backgroundColor: '#F7FFF7', borderColor: '#D2F0D2' },
    cardBlue: { backgroundColor: '#F3F9FF', borderColor: '#D2E8F7' },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionIcon: { fontSize: 20, marginRight: 8 },
    cardTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
    subLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10, marginTop: 8 },
    required: { color: '#E53935' },
    errorText: { fontSize: 12, color: '#E53935', marginTop: 4, marginLeft: 2 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25,
        borderWidth: 1, borderColor: '#E3E3E3', backgroundColor: '#FFF',
    },
    chipActive: { backgroundColor: '#111', borderColor: '#C9A84C' },
    chipText: { fontSize: 13, color: '#555' },
    chipTextActive: { color: '#FFF', fontWeight: '700' },
    rowGap: { flexDirection: 'row', alignItems: 'center' },
    rangeSep: { marginHorizontal: 10, color: '#888', fontSize: 14 },
    input: {
        borderWidth: 1, borderColor: '#DDD', borderRadius: 12,
        paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 13 : 11,
        backgroundColor: '#FFF', fontSize: 14, color: '#111',
    },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FDFBF8', paddingHorizontal: 20, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: '#EEE8DC',
    },
    continueBtn: {
        backgroundColor: '#111', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
        borderWidth: 2, borderColor: '#C9A84C',
        shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
    },
    continueBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
    skipBtn: { alignItems: 'center', marginTop: 10 },
    skipText: { color: '#777', fontSize: 14 },
});