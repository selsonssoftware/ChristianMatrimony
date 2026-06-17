import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveProfileData } from '../utils/profileStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View, Text, TouchableOpacity, ScrollView,
    StyleSheet, SafeAreaView, StatusBar, Platform,
} from 'react-native';

const FOOD_PREFS = ['Any', 'Non-Veg', 'Veg', 'Vegan'];
const HOBBIES = ['Any', 'Bible Study', 'Worship Music', 'Hiking', 'Community Service', 'Gym', 'Painting', 'Traveling'];
const LANGUAGES = ['Any', 'Tamil', 'English', 'Telugu', 'Hindi', 'Malayalam', 'Kannada'];

const ToggleRow = ({ label, value, onChange, required, error, onClear }) => (
    <View style={styles.toggleRowWrap}>
        <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={styles.toggleOptions}>
                <TouchableOpacity
                    style={[styles.toggleBtn, value === 'yes' && styles.toggleBtnActive]}
                    onPress={() => { onChange('yes'); onClear && onClear(); }}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.toggleBtnText, value === 'yes' && styles.toggleBtnTextActive]}>Yes</Text>
                </TouchableOpacity>
                {label === 'Wants children' ? (
                    <TouchableOpacity
                        style={[styles.toggleBtn, value === 'unsure' && styles.toggleBtnActive]}
                        onPress={() => { onChange('unsure'); onClear && onClear(); }}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleBtnText, value === 'unsure' && styles.toggleBtnTextActive]}>Unsure</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.toggleBtn, value === 'no' && styles.toggleBtnActive]}
                        onPress={() => { onChange('no'); onClear && onClear(); }}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleBtnText, value === 'no' && styles.toggleBtnTextActive]}>No</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
);

export default function LifestyleScreen({ navigation }) {
    const [wantsChildren, setWantsChildren] = useState('');
    const [smoker, setSmoker] = useState('');
    const [alcoholic, setAlcoholic] = useState('');
    const [foodPref, setFoodPref] = useState('');
    const [hobbies, setHobbies] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [errors, setErrors] = useState({});
    const insets = useSafeAreaInsets();

    const toggleItem = (list, setList, item, errorKey) => {
        setErrors(p => ({ ...p, [errorKey]: null }));
        if (item === 'Any') { setList(['Any']); return; }
        const filtered = list.filter(x => x !== 'Any');
        if (filtered.includes(item)) {
            const next = filtered.filter(x => x !== item);
            setList(next.length === 0 ? [] : next);
        } else {
            setList([...filtered, item]);
        }
    };

    const validate = () => {
        const e = {};
        if (!wantsChildren) e.wantsChildren = 'Please select an option';
        if (!smoker) e.smoker = 'Please select an option';
        if (!alcoholic) e.alcoholic = 'Please select an option';
        if (!foodPref) e.foodPref = 'Please select food preference';
        if (hobbies.length === 0) e.hobbies = 'Please select at least one hobby';
        if (languages.length === 0) e.languages = 'Please select at least one language';
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

        await saveProfileData({
            user_id: userId,   // add this

            wants_children:
                wantsChildren === 'yes'
                    ? 1
                    : wantsChildren === 'unsure'
                        ? 2
                        : 0,

            smoker: smoker === 'yes' ? 1 : 0,
            drinker: alcoholic === 'yes' ? 1 : 0,
            food_preference: foodPref,
            hobbies: hobbies,
            languages_known: languages,
        });

        navigation.navigate('PartnerPreferences');
    };
    return (
        <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.stepText}>Step 5 of 6</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '83.3%' }]} />
                    </View>
                </View>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.pageTitle}>Lifestyle</Text>
                <Text style={styles.pageSubtitle}>Tell us what you're looking for in a future spouse.</Text>

                <View style={styles.card}>
                    <ToggleRow
                        label="Wants children" value={wantsChildren} onChange={setWantsChildren}
                        required error={errors.wantsChildren}
                        onClear={() => setErrors(p => ({ ...p, wantsChildren: null }))}
                    />
                    <View style={styles.divider} />
                    <ToggleRow
                        label="Smoker" value={smoker} onChange={setSmoker}
                        required error={errors.smoker}
                        onClear={() => setErrors(p => ({ ...p, smoker: null }))}
                    />
                    <View style={styles.divider} />
                    <ToggleRow
                        label="Alcoholic" value={alcoholic} onChange={setAlcoholic}
                        required error={errors.alcoholic}
                        onClear={() => setErrors(p => ({ ...p, alcoholic: null }))}
                    />

                    <Text style={styles.sectionLabel}>
                        Food Preference <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.chipRow}>
                        {FOOD_PREFS.map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.chip, foodPref === f && styles.chipActive]}
                                onPress={() => { setFoodPref(f); setErrors(p => ({ ...p, foodPref: null })); }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chipText, foodPref === f && styles.chipTextActive]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.foodPref ? <Text style={styles.errorText}>{errors.foodPref}</Text> : null}

                    <Text style={styles.sectionLabel}>
                        Hobbies & Interests <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.chipRow}>
                        {HOBBIES.map(h => (
                            <TouchableOpacity
                                key={h}
                                style={[styles.chip, hobbies.includes(h) && styles.chipActive]}
                                onPress={() => toggleItem(hobbies, setHobbies, h, 'hobbies')}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chipText, hobbies.includes(h) && styles.chipTextActive]}>{h}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.hobbies ? <Text style={styles.errorText}>{errors.hobbies}</Text> : null}

                    <Text style={styles.sectionLabel}>
                        Known Languages <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.chipRow}>
                        {LANGUAGES.map(l => (
                            <TouchableOpacity
                                key={l}
                                style={[styles.chip, languages.includes(l) && styles.chipActive]}
                                onPress={() => toggleItem(languages, setLanguages, l, 'languages')}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chipText, languages.includes(l) && styles.chipTextActive]}>{l}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.languages ? <Text style={styles.errorText}>{errors.languages}</Text> : null}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
                <TouchableOpacity style={styles.continueBtn} activeOpacity={0.85} onPress={handleContinue}>
                    <Text style={styles.continueBtnText}>CONTINUE</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FAF7F2' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FAF7F2', paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#EEE8DC',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E8DFD0', marginRight: 12,
    },
    backArrow: { fontSize: 20, color: '#0A0E1A', fontWeight: '600' },
    headerCenter: { flex: 1, alignItems: 'center' },
    stepText: { fontSize: 12, color: '#888', marginBottom: 5 },
    progressBar: { width: '100%', height: 4, backgroundColor: '#E5E5E5', borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: '#C9A84C', borderRadius: 2 },
    headerRight: { width: 40 },
    container: { paddingHorizontal: 20, paddingTop: 16 },
    pageTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 6 },
    pageSubtitle: { fontSize: 13, color: '#777', lineHeight: 20, marginBottom: 20 },
    required: { color: '#E53935' },
    errorText: { fontSize: 12, color: '#E53935', marginTop: 4, marginLeft: 2 },
    card: {
        borderRadius: 14, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: '#E8E0D0', backgroundColor: '#fff',
    },
    toggleRowWrap: { marginBottom: 2 },
    toggleRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingVertical: 4,
    },
    toggleLabel: { fontSize: 14, fontWeight: '500', color: '#222', flex: 1 },
    toggleOptions: { flexDirection: 'row', gap: 6 },
    toggleBtn: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#E0D8CC', backgroundColor: '#F9F9F9',
    },
    toggleBtnActive: { backgroundColor: '#111', borderColor: '#111' },
    toggleBtnText: { fontSize: 13, color: '#555' },
    toggleBtnTextActive: { color: '#fff', fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F0EBE3', marginVertical: 10 },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: '#222', marginTop: 16, marginBottom: 10 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#E0D8CC', backgroundColor: '#F9F9F9',
    },
    chipActive: { backgroundColor: '#111', borderColor: '#111' },
    chipText: { fontSize: 13, color: '#555' },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FAF7F2', paddingHorizontal: 20, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: '#EEE8DC',
    },
    continueBtn: {
        backgroundColor: '#111', borderRadius: 12, paddingVertical: 15,
        alignItems: 'center', borderWidth: 2, borderColor: '#C9A84C',
    },
    continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1.5 },
});