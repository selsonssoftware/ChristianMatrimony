import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveProfileData } from '../utils/profileStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, SafeAreaView, StatusBar, Platform,Alert
} from 'react-native';

const PARTNER_VALUES = [
    { id: 'traditional', label: 'Traditional', icon: '🏠' },
    { id: 'modern', label: 'Modern', icon: '✨' },
    { id: 'liberal', label: 'Liberal', icon: '👥' },
    { id: 'orthodox', label: 'Orthodox', icon: '⚖️' },
];

const SIBLING_COUNT = ['0', '1', '2', '3', '4', '5+'];

export default function HonoringRootsScreen({ navigation }) {
    const [fatherName, setFatherName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [parentOccupation, setParentOccupation] = useState('');
    const [brothers, setBrothers] = useState('');
    const [sisters, setSisters] = useState('');
    const [brotherMarried, setBrotherMarried] = useState(null);
    const [sisterMarried, setSisterMarried] = useState(null);
    const [partnerValues, setPartnerValues] = useState('');
    const [house, setHouse] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState({});
    const insets = useSafeAreaInsets();

    const validate = () => {
        const e = {};
        if (!fatherName.trim()) e.fatherName = 'Father\'s name is required';
        if (!motherName.trim()) e.motherName = 'Mother\'s name is required';
        if (!brothers) e.brothers = 'Required';
        if (!sisters) e.sisters = 'Required';
        if (parseInt(brothers) > 0 && brotherMarried === null) e.brotherMarried = 'Please select Yes or No';
        if (parseInt(sisters) > 0 && sisterMarried === null) e.sisterMarried = 'Please select Yes or No';
        if (!partnerValues) e.partnerValues = 'Please select partner value';
        if (!house) e.house = 'Please select house type';
        if (!address.trim()) e.address = 'Address is required';
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
        user_id: userId,

        father_name: fatherName,
        mother_name: motherName,
        parents_occupation: parentOccupation,
        brothers_count: brothers,
        sisters_count: sisters,
        married_brothers_count: brotherMarried ? 1 : 0,
        married_sisters_count: sisterMarried ? 1 : 0,
        partner_values: partnerValues,
        house_type: house,
        address: address,
    });

    navigation.navigate('Lifestyle');
};
    const handleSkip = () => navigation?.navigate('Lifestyle');

    const SiblingCountPicker = ({ value, onChange, error, clearError }) => (
        <>
            <View style={styles.siblingRow}>
                {SIBLING_COUNT.map(n => (
                    <TouchableOpacity
                        key={n}
                        style={[styles.siblingBtn, value === n && styles.siblingBtnActive]}
                        onPress={() => { onChange(n); clearError && clearError(); }}
                    >
                        <Text style={[styles.siblingBtnText, value === n && styles.siblingBtnTextActive]}>{n}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </>
    );

    return (
        <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.stepText}>Step 4 of 6</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '66.6%' }]} />
                    </View>
                </View>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.pageTitle}>Honoring Your Roots</Text>
                <Text style={styles.pageSubtitle}>Tell us about the family that shaped who you are today.</Text>

                {/* Parents Card */}
                <View style={[styles.card, styles.cardPurple]}>
                    <Text style={styles.cardTitle}>👨‍👩‍👧 Parents</Text>

                    <Text style={styles.subLabel}>Father's Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.fatherName && styles.inputError]}
                        placeholder="Full Name"
                        placeholderTextColor="#bbb"
                        value={fatherName}
                        onChangeText={(t) => { setFatherName(t); setErrors(p => ({ ...p, fatherName: null })); }}
                    />
                    {errors.fatherName ? <Text style={styles.errorText}>{errors.fatherName}</Text> : null}

                    <Text style={styles.subLabel}>Mother's Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.motherName && styles.inputError]}
                        placeholder="Full Name"
                        placeholderTextColor="#bbb"
                        value={motherName}
                        onChangeText={(t) => { setMotherName(t); setErrors(p => ({ ...p, motherName: null })); }}
                    />
                    {errors.motherName ? <Text style={styles.errorText}>{errors.motherName}</Text> : null}

                    <Text style={styles.subLabel}>Father's / Mother's Occupation</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Business Owners"
                        placeholderTextColor="#bbb"
                        value={parentOccupation}
                        onChangeText={setParentOccupation}
                    />

                    {/* Siblings */}
                    <View style={styles.siblingsContainer}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.subLabel}>No. of Brothers <Text style={styles.required}>*</Text></Text>
                            <SiblingCountPicker
                                value={brothers}
                                onChange={setBrothers}
                                error={errors.brothers}
                                clearError={() => setErrors(p => ({ ...p, brothers: null, brotherMarried: null }))}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.subLabel}>No. of Sisters <Text style={styles.required}>*</Text></Text>
                            <SiblingCountPicker
                                value={sisters}
                                onChange={setSisters}
                                error={errors.sisters}
                                clearError={() => setErrors(p => ({ ...p, sisters: null, sisterMarried: null }))}
                            />
                        </View>
                    </View>

                    {brothers && parseInt(brothers) > 0 && (
                        <>
                            <Text style={styles.subLabel}>Is Brother Married? <Text style={styles.required}>*</Text></Text>
                            <View style={styles.yesNoRow}>
                                {['Yes', 'No'].map(opt => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.yesNoBtn, brotherMarried === (opt === 'Yes') && styles.yesNoBtnActive]}
                                        onPress={() => { setBrotherMarried(opt === 'Yes'); setErrors(p => ({ ...p, brotherMarried: null })); }}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.yesNoBtnText, brotherMarried === (opt === 'Yes') && styles.yesNoBtnTextActive]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {errors.brotherMarried ? <Text style={styles.errorText}>{errors.brotherMarried}</Text> : null}
                        </>
                    )}

                    {sisters && parseInt(sisters) > 0 && (
                        <>
                            <Text style={styles.subLabel}>Is Sister Married? <Text style={styles.required}>*</Text></Text>
                            <View style={styles.yesNoRow}>
                                {['Yes', 'No'].map(opt => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.yesNoBtn, sisterMarried === (opt === 'Yes') && styles.yesNoBtnActive]}
                                        onPress={() => { setSisterMarried(opt === 'Yes'); setErrors(p => ({ ...p, sisterMarried: null })); }}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.yesNoBtnText, sisterMarried === (opt === 'Yes') && styles.yesNoBtnTextActive]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {errors.sisterMarried ? <Text style={styles.errorText}>{errors.sisterMarried}</Text> : null}
                        </>
                    )}

                    <Text style={styles.subLabel}>I Value a Partner Who Is <Text style={styles.required}>*</Text></Text>
                    <View style={styles.partnerGrid}>
                        {PARTNER_VALUES.map(pv => (
                            <TouchableOpacity
                                key={pv.id}
                                style={[styles.partnerCard, partnerValues === pv.id && styles.partnerCardActive]}
                                onPress={() => { setPartnerValues(pv.id); setErrors(p => ({ ...p, partnerValues: null })); }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.partnerIcon}>{pv.icon}</Text>
                                <Text style={[styles.partnerLabel, partnerValues === pv.id && styles.partnerLabelActive]}>
                                    {pv.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.partnerValues ? <Text style={styles.errorText}>{errors.partnerValues}</Text> : null}
                </View>

                {/* Residence Card */}
                <View style={[styles.card, styles.cardYellow]}>
                    <Text style={styles.cardTitle}>🏡 Residence</Text>

                    <Text style={styles.subLabel}>Own House or Rented? <Text style={styles.required}>*</Text></Text>
                    <View style={styles.yesNoRow}>
                        {['own', 'rented'].map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.yesNoBtn, { flex: 1 }, house === opt && styles.yesNoBtnActive]}
                                onPress={() => { setHouse(opt); setErrors(p => ({ ...p, house: null })); }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.yesNoBtnText, house === opt && styles.yesNoBtnTextActive]}>
                                    {opt === 'own' ? 'Own House' : 'Rented'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.house ? <Text style={styles.errorText}>{errors.house}</Text> : null}

                    <Text style={styles.subLabel}>Address <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.textarea, errors.address && styles.inputError]}
                        multiline
                        numberOfLines={3}
                        placeholder="Enter your address"
                        placeholderTextColor="#bbb"
                        value={address}
                        onChangeText={(t) => { setAddress(t); setErrors(p => ({ ...p, address: null })); }}
                        textAlignVertical="top"
                    />
                    {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
                <TouchableOpacity style={styles.continueBtn} activeOpacity={0.85} onPress={handleContinue}>
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
    safe: { flex: 1, backgroundColor: '#FAF7F2' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#FAF7F2', borderBottomWidth: 1, borderBottomColor: '#EEE8DC',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E8DFD0',
    },
    backArrow: { fontSize: 20, color: '#0A0E1A', fontWeight: '600' },
    headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
    headerRight: { width: 40 },
    stepText: { fontSize: 12, color: '#999', marginBottom: 6, fontWeight: '500' },
    progressBar: { width: '100%', height: 4, backgroundColor: '#E8DFD0', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#C9A84C', borderRadius: 2 },
    container: { paddingHorizontal: 20, paddingTop: 24 },
    pageTitle: { fontSize: 26, fontWeight: '700', color: '#0A0E1A', marginBottom: 8 },
    pageSubtitle: { fontSize: 14, color: '#7F8C8D', lineHeight: 22, marginBottom: 24 },
    card: { borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1 },
    cardPurple: { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' },
    cardYellow: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#0A0E1A', marginBottom: 14 },
    subLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 10 },
    required: { color: '#E53935' },
    input: {
        backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E8DFD0',
        paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 11,
        fontSize: 14, color: '#0A0E1A',
    },
    textarea: {
        backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E8DFD0',
        paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0A0E1A', minHeight: 80,
    },
    inputError: { borderColor: '#E53935', borderWidth: 1.5 },
    errorText: { fontSize: 12, color: '#E53935', marginTop: 4, marginLeft: 2 },
    siblingsContainer: { flexDirection: 'row', marginTop: 4 },
    siblingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
    siblingBtn: {
        width: 38, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E8DFD0', backgroundColor: '#fff',
    },
    siblingBtnActive: { borderColor: '#C9A84C', backgroundColor: '#FEF8EC', borderWidth: 1.5 },
    siblingBtnText: { fontSize: 13, color: '#555' },
    siblingBtnTextActive: { color: '#C9A84C', fontWeight: '700' },
    yesNoRow: { flexDirection: 'row', gap: 10 },
    yesNoBtn: {
        flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5,
        borderColor: '#E8DFD0', backgroundColor: '#fff', alignItems: 'center',
    },
    yesNoBtnActive: { borderColor: '#C9A84C', backgroundColor: '#FEF8EC' },
    yesNoBtnText: { fontSize: 14, color: '#777', fontWeight: '500' },
    yesNoBtnTextActive: { color: '#C9A84C', fontWeight: '700' },
    partnerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
    partnerCard: {
        width: '46%', alignItems: 'center', paddingVertical: 14,
        borderRadius: 12, borderWidth: 1.5, borderColor: '#E8DFD0', backgroundColor: '#fff',
    },
    partnerCardActive: { borderColor: '#C9A84C', backgroundColor: '#FEF8EC' },
    partnerIcon: { fontSize: 24, marginBottom: 6 },
    partnerLabel: { fontSize: 13, color: '#777', fontWeight: '500' },
    partnerLabelActive: { color: '#C9A84C', fontWeight: '700' },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FAF7F2', paddingHorizontal: 20, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: '#EEE8DC',
    },
    continueBtn: {
        backgroundColor: '#0A0E1A', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
        borderWidth: 2, borderColor: '#C9A84C',
    },
    continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
    skipBtn: { alignItems: 'center', paddingVertical: 12 },
    skipText: { fontSize: 14, color: '#999', fontWeight: '500' },
});