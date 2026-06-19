import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveProfileData } from '../utils/profileStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, SafeAreaView, StatusBar, Platform, Alert
} from 'react-native';

const ATTENDANCE = ['Weekly', 'Monthly', 'Daily'];
const MEMBERSHIP_YEARS = ['1 year', '2 years', '3 years', '4 years', '5 years', '6+ years', '10+ years'];

const YesNo = ({ value, onChange, label, error, onClear }) => (
    <View style={styles.yesNoSection}>
        {label && <Text style={styles.subLabel}>{label} <Text style={styles.required}>*</Text></Text>}
        <View style={styles.yesNoRow}>
            <TouchableOpacity
                style={[styles.yesNoBtn, value === true && styles.yesNoBtnActive]}
                onPress={() => { onChange(true); onClear && onClear(); }}
            >
                <Text style={[styles.yesNoBtnText, value === true && styles.yesNoBtnTextActive]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.yesNoBtn, value === false && styles.yesNoBtnActive]}
                onPress={() => { onChange(false); onClear && onClear(); }}
            >
                <Text style={[styles.yesNoBtnText, value === false && styles.yesNoBtnTextActive]}>No</Text>
            </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
);

export default function SpiritualFoundationScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [ministryParticipation, setMinistryParticipation] = useState(null);
    const [ministryBrief, setMinistryBrief] = useState('');
    const [isSaved, setIsSaved] = useState(null);
    const [isAnointed, setIsAnointed] = useState(null);
    const [isBaptized, setIsBaptized] = useState(null);
    const [baptizedDate, setBaptizedDate] = useState('');
    const [membershipYears, setMembershipYears] = useState('');
    const [showMemberDrop, setShowMemberDrop] = useState(false);
    const [churchName, setChurchName] = useState('');
    const [attendance, setAttendance] = useState('');
    const [pastorName, setPastorName] = useState('');
    const [pastorContact, setPastorContact] = useState('');
    const [errors, setErrors] = useState({});

    const formatDate = (text) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length <= 2) return cleaned;
        if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    };

    const validate = () => {
        const e = {};
        if (ministryParticipation === null) e.ministryParticipation = 'Please select Yes or No';
        if (isSaved === null) e.isSaved = 'Please select Yes or No';
        if (isAnointed === null) e.isAnointed = 'Please select Yes or No';
        if (isBaptized === null) e.isBaptized = 'Please select Yes or No';
        if (isBaptized && !baptizedDate.trim()) e.baptizedDate = 'Baptized date is required';
        if (!membershipYears) e.membershipYears = 'Please select membership years';
        if (!churchName.trim()) e.churchName = 'Church name is required';
        if (!attendance) e.attendance = 'Please select attendance frequency';
        if (!pastorName.trim()) e.pastorName = 'Pastor name is required';
        if (!pastorContact.trim()) e.pastorContact = 'Pastor contact is required';
        else if (!/^\d{10}$/.test(pastorContact.replace(/\s/g, ''))) e.pastorContact = 'Enter a valid 10-digit number';
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

            ministry_participation: ministryParticipation ? 1 : 0,
            ministry_description: ministryBrief,
            saved_person: isSaved ? 1 : 0,
            holy_spirit: isAnointed ? 1 : 0,
            baptized: isBaptized ? 1 : 0,
            baptism_date: isBaptized ? baptizedDate : '',
            membership_year: membershipYears,
            church_name: churchName,
            church_attendance_frequency: attendance,
            pastor_name: pastorName,
            pastor_contact: pastorContact,
        });

        navigation.navigate('EducationCareer');
    };
    return (
        <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Spiritual Foundation</Text>
                <View style={{ width: 36 }} />
            </View>

            <View style={styles.progressContainer}>
                <Text style={styles.stepText}>Step 2 of 6</Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '33.3%' }]} />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.pageTitle}>Spiritual Foundation</Text>
                <Text style={styles.pageSubtitle}>
                    Help us understand your walk of faith to find a truly compatible partner.
                </Text>

                {/* Ministry Card */}
                <View style={[styles.card, styles.cardYellow]}>
                    <Text style={styles.cardTitle}>🏛️ Ministry Participation Details</Text>
                    <YesNo
                        label="Ministry Participation"
                        value={ministryParticipation}
                        onChange={setMinistryParticipation}
                        error={errors.ministryParticipation}
                        onClear={() => setErrors(p => ({ ...p, ministryParticipation: null }))}
                    />
                    <Text style={styles.subLabel}>Brief On Ministry Involvement</Text>
                    <TextInput
                        style={styles.textarea}
                        multiline
                        numberOfLines={4}
                        placeholder="About Ministry"
                        placeholderTextColor="#bbb"
                        value={ministryBrief}
                        onChangeText={setMinistryBrief}
                        textAlignVertical="top"
                    />
                </View>

                {/* Spiritual Experience Card */}
                <View style={[styles.card, styles.cardGreen]}>
                    <Text style={styles.cardTitle}>🙏 Spiritual Experience</Text>
                    <YesNo
                        label="Are You Saved Person"
                        value={isSaved}
                        onChange={setIsSaved}
                        error={errors.isSaved}
                        onClear={() => setErrors(p => ({ ...p, isSaved: null }))}
                    />
                    <YesNo
                        label="Anointed With The Holy Spirit"
                        value={isAnointed}
                        onChange={setIsAnointed}
                        error={errors.isAnointed}
                        onClear={() => setErrors(p => ({ ...p, isAnointed: null }))}
                    />
                    <YesNo
                        label="Are You Baptized"
                        value={isBaptized}
                        onChange={setIsBaptized}
                        error={errors.isBaptized}
                        onClear={() => setErrors(p => ({ ...p, isBaptized: null }))}
                    />

                    {isBaptized && (
                        <>
                            <Text style={styles.subLabel}>Date Of Baptism <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }, errors.baptizedDate && styles.inputError]}
                                    value={baptizedDate}
                                    onChangeText={(t) => {
                                        setBaptizedDate(formatDate(t));
                                        setErrors(p => ({ ...p, baptizedDate: null }));
                                    }}
                                    placeholder="DD/MM/YYYY"
                                    placeholderTextColor="#bbb"
                                    keyboardType="number-pad"
                                    maxLength={10}
                                />
                                <Text style={styles.calIcon}>📅</Text>
                            </View>
                            {errors.baptizedDate ? <Text style={styles.errorText}>{errors.baptizedDate}</Text> : null}
                        </>
                    )}

                    <Text style={styles.subLabel}>Years Of Membership <Text style={styles.required}>*</Text></Text>
                    <TouchableOpacity
                        style={[styles.dropdown, errors.membershipYears && styles.inputError]}
                        onPress={() => setShowMemberDrop(!showMemberDrop)}
                    >
                        <Text style={membershipYears ? styles.dropdownValue : styles.dropdownPlaceholder}>
                            {membershipYears || 'e.g 5 years'}
                        </Text>
                        <Text style={styles.dropdownArrow}>{showMemberDrop ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {errors.membershipYears ? <Text style={styles.errorText}>{errors.membershipYears}</Text> : null}
                    {showMemberDrop && (
                        <View style={styles.dropdownList}>
                            {MEMBERSHIP_YEARS.map(y => (
                                <TouchableOpacity
                                    key={y}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setMembershipYears(y);
                                        setShowMemberDrop(false);
                                        setErrors(p => ({ ...p, membershipYears: null }));
                                    }}
                                >
                                    <Text style={[styles.dropdownItemText, membershipYears === y && styles.dropdownItemActive]}>{y}</Text>
                                    {membershipYears === y && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Church Service Card */}
                <View style={[styles.card, styles.cardBlue]}>
                    <Text style={styles.cardTitle}>⛪ Church Service</Text>

                    <Text style={styles.subLabel}>Home Church Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.churchName && styles.inputError]}
                        placeholder="e.g. Grace Community Church"
                        placeholderTextColor="#bbb"
                        value={churchName}
                        onChangeText={(t) => { setChurchName(t); setErrors(p => ({ ...p, churchName: null })); }}
                    />
                    {errors.churchName ? <Text style={styles.errorText}>{errors.churchName}</Text> : null}

                    <Text style={styles.subLabel}>Church Attendance Frequency <Text style={styles.required}>*</Text></Text>
                    <View style={styles.chipRow}>
                        {ATTENDANCE.map(a => (
                            <TouchableOpacity
                                key={a}
                                style={[styles.chipOutline, attendance === a && styles.chipOutlineActive]}
                                onPress={() => { setAttendance(a); setErrors(p => ({ ...p, attendance: null })); }}
                            >
                                <Text style={[styles.chipOutlineText, attendance === a && styles.chipOutlineTextActive]}>{a}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.attendance ? <Text style={styles.errorText}>{errors.attendance}</Text> : null}

                    <Text style={styles.subLabel}>Pastor Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.pastorName && styles.inputError]}
                        placeholder="Full Name"
                        placeholderTextColor="#bbb"
                        value={pastorName}
                        onChangeText={(t) => { setPastorName(t); setErrors(p => ({ ...p, pastorName: null })); }}
                    />
                    {errors.pastorName ? <Text style={styles.errorText}>{errors.pastorName}</Text> : null}

                    <Text style={styles.subLabel}>Pastor Contact Number <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.pastorContact && styles.inputError]}
                        placeholder="Enter 10-digit number"
                        placeholderTextColor="#bbb"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={pastorContact}
                        onChangeText={(t) => { setPastorContact(t.replace(/[^0-9]/g, '')); setErrors(p => ({ ...p, pastorContact: null })); }}
                    />
                    {errors.pastorContact ? <Text style={styles.errorText}>{errors.pastorContact}</Text> : null}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
                <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
                    <Text style={styles.continueBtnText}>CONTINUE</Text>
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
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E8DFD0',
    },
    backArrow: { fontSize: 20, color: '#0A0E1A', fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#0A0E1A' },
    progressContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    stepText: { textAlign: 'center', fontSize: 13, color: '#888', marginBottom: 8 },
    progressBar: { height: 4, backgroundColor: '#E5E5E5', borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: '#C9A84C', borderRadius: 2 },
    container: { paddingHorizontal: 20, paddingTop: 8 },
    pageTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 6 },
    pageSubtitle: { fontSize: 13, color: '#777', lineHeight: 19, marginBottom: 20 },
    card: { borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1 },
    cardYellow: { backgroundColor: '#FFFEF2', borderColor: '#F0E080' },
    cardGreen: { backgroundColor: '#F5FEF7', borderColor: '#B5E8C5' },
    cardBlue: { backgroundColor: '#F0F8FF', borderColor: '#BEE0F5' },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#C9A84C', marginBottom: 14 },
    subLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 12 },
    required: { color: '#E53935' },
    yesNoSection: { marginBottom: 4 },
    yesNoRow: { flexDirection: 'row', gap: 10 },
    yesNoBtn: {
        paddingHorizontal: 28, paddingVertical: 10,
        borderRadius: 20, borderWidth: 1, borderColor: '#E0D8CC', backgroundColor: '#fff',
    },
    yesNoBtnActive: { borderColor: '#C9A84C', backgroundColor: '#FEF8EC', borderWidth: 1.5 },
    yesNoBtnText: { fontSize: 14, color: '#555' },
    yesNoBtnTextActive: { color: '#111', fontWeight: '600' },
    input: {
        borderWidth: 1, borderColor: '#E0D8CC', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 11,
        fontSize: 14, color: '#222', backgroundColor: '#fff',
    },
    inputError: { borderColor: '#E53935', borderWidth: 1.5 },
    errorText: { fontSize: 12, color: '#E53935', marginTop: 4, marginLeft: 2 },
    inputRow: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
    calIcon: { position: 'absolute', right: 14, fontSize: 18 },
    textarea: {
        borderWidth: 1, borderColor: '#E0D8CC', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 12, minHeight: 90,
        fontSize: 14, color: '#222', backgroundColor: '#fff',
    },
    dropdown: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: '#E0D8CC', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 11, backgroundColor: '#fff',
    },
    dropdownPlaceholder: { color: '#bbb', fontSize: 14 },
    dropdownValue: { color: '#222', fontSize: 14 },
    dropdownArrow: { color: '#888', fontSize: 11 },
    dropdownList: {
        borderWidth: 1, borderColor: '#E0D8CC', borderRadius: 10,
        backgroundColor: '#fff', marginTop: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
    },
    dropdownItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
    },
    dropdownItemText: { fontSize: 14, color: '#222' },
    dropdownItemActive: { color: '#C9A84C', fontWeight: '600' },
    checkmark: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },
    chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    chipOutline: {
        borderWidth: 1, borderColor: '#E0D8CC', borderRadius: 20,
        paddingHorizontal: 16, paddingVertical: 9, backgroundColor: '#fff',
    },
    chipOutlineActive: { borderColor: '#C9A84C', backgroundColor: '#FEF8EC', borderWidth: 1.5 },
    chipOutlineText: { fontSize: 13, color: '#555' },
    chipOutlineTextActive: { color: '#111', fontWeight: '600' },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FAF7F2', paddingHorizontal: 20, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: '#EEE8DC',
    },
    continueBtn: {
        backgroundColor: '#111', borderRadius: 12,
        paddingVertical: 16, alignItems: 'center',
        borderWidth: 2, borderColor: '#C9A84C',
    },
    continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1.5 },
});