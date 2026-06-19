import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveProfileData } from '../utils/profileStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, SafeAreaView, StatusBar, Platform, Alert,
} from 'react-native';

const EDUCATIONS = [
    'High School', 'Diploma', 'BE/BTech', 'BSc', 'BA', 'BCA',
    'ME/MTech', 'MSc', 'MA', 'MCA', 'MBA', 'PhD', 'Other',
];

export default function EducationCareerScreen({ navigation }) {
    const [education, setEducation] = useState('');
    const [college, setCollege] = useState('');
    const [occupation, setOccupation] = useState('');
    const [company, setCompany] = useState('');
    const [income, setIncome] = useState('');
    const [showEduDrop, setShowEduDrop] = useState(false);
    const [errors, setErrors] = useState({});
    const insets = useSafeAreaInsets();

    const validate = () => {
        const e = {};
        if (!education) e.education = 'Please select your education';
        if (!college.trim()) e.college = 'College / University is required';
        if (!occupation.trim()) e.occupation = 'Occupation is required';
        if (!income.trim()) e.income = 'Income is required';
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

            highest_education: education,
            college_university: college,
            occupation: occupation,
            company_name: company,
            annual_income: income,
        });

        navigation.navigate('HonoringRoots');
    };
    const handleSkip = async () => {
        const userId = await AsyncStorage.getItem('user_id');

        await saveProfileData({
            user_id: userId,
        });

        navigation.navigate('HonoringRoots');
    };

    return (
        <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.stepText}>Step 3 of 6</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '50%' }]} />
                    </View>
                </View>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.pageTitle}>Education & Career</Text>
                <Text style={styles.pageSubtitle}>
                    Sharing your professional journey helps us find matches with shared ambitions and values.
                </Text>

                {/* Education Card */}
                <View style={[styles.card, styles.cardBlue]}>
                    <Text style={styles.cardTitle}>🎓 Education</Text>

                    <Text style={styles.subLabel}>Highest Education <Text style={styles.required}>*</Text></Text>
                    <TouchableOpacity
                        style={[styles.inputLike, errors.education && styles.inputError]}
                        onPress={() => setShowEduDrop(!showEduDrop)}
                        activeOpacity={0.8}
                    >
                        <Text style={education ? styles.inputValue : styles.inputPlaceholder}>
                            {education || 'Select education'}
                        </Text>
                        <Text style={styles.dropArrow}>{showEduDrop ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {errors.education ? <Text style={styles.errorText}>{errors.education}</Text> : null}
                    {showEduDrop && (
                        <View style={styles.dropdownList}>
                            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                                {EDUCATIONS.map(e => (
                                    <TouchableOpacity
                                        key={e}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setEducation(e);
                                            setShowEduDrop(false);
                                            setErrors(p => ({ ...p, education: null }));
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.dropdownItemText, education === e && styles.dropdownItemActive]}>{e}</Text>
                                        {education === e && <Text style={styles.checkmark}>✓</Text>}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <Text style={styles.subLabel}>College / University <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.college && styles.inputError]}
                        placeholder="Enter institution name"
                        placeholderTextColor="#bbb"
                        value={college}
                        onChangeText={(t) => { setCollege(t); setErrors(p => ({ ...p, college: null })); }}
                    />
                    {errors.college ? <Text style={styles.errorText}>{errors.college}</Text> : null}
                </View>

                {/* Professional Details Card */}
                <View style={[styles.card, styles.cardTeal]}>
                    <Text style={styles.cardTitle}>💼 Professional Details</Text>

                    <Text style={styles.subLabel}>Occupation <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.occupation && styles.inputError]}
                        placeholder="e.g. Software Engineer"
                        placeholderTextColor="#bbb"
                        value={occupation}
                        onChangeText={(t) => { setOccupation(t); setErrors(p => ({ ...p, occupation: null })); }}
                    />
                    {errors.occupation ? <Text style={styles.errorText}>{errors.occupation}</Text> : null}

                    <Text style={styles.subLabel}>Company Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Tech Solutions"
                        placeholderTextColor="#bbb"
                        value={company}
                        onChangeText={setCompany}
                    />
                </View>

                {/* Income Card */}
                <View style={[styles.card, styles.cardPurple]}>
                    <Text style={styles.cardTitle}>💰 Annual Income</Text>

                    <Text style={styles.subLabel}>Income <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.income && styles.inputError]}
                        placeholder="e.g. 5 LPA"
                        placeholderTextColor="#bbb"
                        value={income}
                        onChangeText={(t) => { setIncome(t); setErrors(p => ({ ...p, income: null })); }}
                    />
                    {errors.income ? <Text style={styles.errorText}>{errors.income}</Text> : null}
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
    cardBlue: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
    cardTeal: { backgroundColor: '#F0FDFB', borderColor: '#99F6E4' },
    cardPurple: { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#0A0E1A', marginBottom: 14 },
    subLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 10 },
    required: { color: '#E53935' },
    input: {
        backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E8DFD0',
        paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 11,
        fontSize: 14, color: '#0A0E1A',
    },
    inputLike: {
        backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E8DFD0',
        paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 11,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    inputError: { borderColor: '#E53935', borderWidth: 1.5 },
    errorText: { fontSize: 12, color: '#E53935', marginTop: 4, marginLeft: 2 },
    inputValue: { fontSize: 14, color: '#0A0E1A' },
    inputPlaceholder: { fontSize: 14, color: '#bbb' },
    dropArrow: { fontSize: 12, color: '#999' },
    dropdownList: {
        backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E8DFD0',
        marginTop: 4, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
    },
    dropdownItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#F5F0E8',
    },
    dropdownItemText: { fontSize: 14, color: '#444' },
    dropdownItemActive: { color: '#C9A84C', fontWeight: '600' },
    checkmark: { color: '#C9A84C', fontSize: 16, fontWeight: '700' },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FAF7F2', paddingHorizontal: 20, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: '#EEE8DC',
    },
    continueBtn: {
        backgroundColor: '#0A0E1A', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
        borderWidth: 2, borderColor: '#C9A84C',
    },
    continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 1 },
    skipBtn: { alignItems: 'center', paddingVertical: 12 },
    skipText: { fontSize: 14, color: '#999', fontWeight: '500' },
});