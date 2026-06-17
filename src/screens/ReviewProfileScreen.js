import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View, Text, TouchableOpacity, ScrollView,
    StyleSheet, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { getProfileData } from '../utils/profileStorage';
import {

    SafeAreaView,

} from 'react-native-safe-area-context';
const Section = ({ title, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={5}>
            {value === null || value === undefined || value === '' ? '—' : String(value)}
        </Text>
    </View>
);

// ---- Helpers to convert UI strings -> API format ----

// "5'8\"" -> 173 (cm)
const heightToCm = (h) => {
    if (!h) return null;
    const match = String(h).match(/(\d+)'(\d+)?/);
    if (!match) return null;
    const feet = parseInt(match[1] || '0', 10);
    const inches = parseInt(match[2] || '0', 10);
    return Math.round((feet * 12 + inches) * 2.54);
};

// "65 kg" -> 65
const weightToNumber = (w) => {
    if (!w) return null;
    const match = String(w).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
};

// "DD/MM/YYYY" -> "YYYY-MM-DD"
const dateToApi = (d) => {
    if (!d) return '';
    const parts = String(d).split('/');
    if (parts.length !== 3) return d;
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
};

// array or string -> comma separated string
const listToString = (val) => {
    if (!val) return '';
    if (Array.isArray(val)) return val.join(',');
    return String(val);
};

const numOrNull = (val) => {
    if (val === undefined || val === null || val === '') return null;
    const n = parseInt(val, 10);
    return isNaN(n) ? val : n;
};

export default function ReviewProfileScreen({ navigation }) {
    const [agreed, setAgreed] = useState(false);
    const [profile, setProfile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const data = await getProfileData();
        setProfile(data);
    };

    const buildPayload = (p, userId) => {
        return {
            user_id: userId,
            full_name: p.full_name || '',
            reference_name: p.reference_name || '',
            date_of_birth: dateToApi(p.date_of_birth),
            community: p.community || '',
            weight: weightToNumber(p.weight),
            height: heightToCm(p.height),
            marital_status: p.marital_status || '',
            mother_tongue: listToString(p.mother_tongue),
            current_location: p.current_location || '',

            ministry_participation: p.ministry_description
                ? (p.ministry_participation ? 'Yes' : 'No')
                : (p.ministry_participation ? 'Yes' : 'No'),
            ministry_description: p.ministry_description || '',
            saved_person: p.saved_person ?? 0,
            holy_spirit: p.holy_spirit ?? 0,
            baptized: p.baptized ?? 0,
            baptism_date: dateToApi(p.baptism_date),
            membership_year: numOrNull(String(p.membership_year || '').replace(/[^0-9]/g, '')),
            church_name: p.church_name || '',
            church_attendance_frequency: p.church_attendance_frequency || '',
            pastor_name: p.pastor_name || '',
            pastor_contact: p.pastor_contact || '',

            education: p.education || '',
            college_university: p.college_university || '',
            occupation: p.occupation || '',
            company_name: p.company_name || '',
            annual_income: p.annual_income ? String(p.annual_income).substring(0, 50) : '',

            father_name: p.father_name || '',
            mother_name: p.mother_name || '',
            parents_occupation: p.parents_occupation || '',
            brothers_count: numOrNull(p.brothers_count),
            sisters_count: numOrNull(p.sisters_count),
            married_brothers_count: numOrNull(p.married_brothers_count),
            married_sisters_count: numOrNull(p.married_sisters_count),

            partner_required: p.partner_required ?? 1,
            preferred_age_from: numOrNull(p.preferred_age_from),
            preferred_age_to: numOrNull(p.preferred_age_to),
            preferred_height_from: heightToCm(p.preferred_height_from) || numOrNull(p.preferred_height_from),
            preferred_height_to: heightToCm(p.preferred_height_to) || numOrNull(p.preferred_height_to),
            denomination: p.denomination || '',
            preferred_location: p.preferred_location || '',

            house_type: p.house_type || '',
            address: p.address || '',

            wants_children: p.wants_children ?? 0,
            smoker: p.smoker ?? 0,
            drinker: p.drinker ?? 0,
            food_preference: p.food_preference || '',
            hobbies: listToString(p.hobbies),
            languages_known: listToString(p.languages_known),

            partner_values: p.partner_values || '',
        };
    };

    const handleSubmit = async () => {
        if (!agreed || !profile) return;
        setSubmitting(true);

        try {
            const userId = await AsyncStorage.getItem('user_id');
            const payload = buildPayload(profile, userId);
            const token = await AsyncStorage.getItem('userToken');
            console.log("USER_ID:", userId);
            console.log("TOKEN:", token);
            console.log('Final Payload:', payload);

            const response = await fetch(
                'https://matrimony.gmworld.net/api/profile_create',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();
            console.log('API Response:', result);

            if (result.status === true) {
                if (result.user_id) {
                    await AsyncStorage.setItem('matrimonyUserId', String(result.user_id));
                }
                if (result.data) {
                    await AsyncStorage.setItem('profileData', JSON.stringify(result.data));
                }
                navigation.replace('Home');
            } else {
                Alert.alert('API Error', result.message || 'Profile creation failed');
            }
        } catch (error) {
            console.log('Submit Error:', error);
            Alert.alert('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!profile) {
        return (
            <SafeAreaView style={[styles.safe, { paddingTop: insets.top, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#C9A84C" />
            </SafeAreaView>
        );
    }

    const p = profile;

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.stepText}>Review Profile</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '100%' }]} />
                    </View>
                </View>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.pageTitle}>Review Your Profile</Text>
                <Text style={styles.pageSubtitle}>
                    Double-check your details before we share your profile with the community.
                </Text>

                <View style={styles.banner}>
                    <View style={styles.bannerIcon}>
                        <Text style={{ fontSize: 20, color: '#fff' }}>✓</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.bannerTitle}>Almost there!</Text>
                        <Text style={styles.bannerSubtitle}>Review everything below before submitting.</Text>
                    </View>
                </View>

                {/* Basic Details */}
                <Section title="Basic Details">
                    <InfoRow label="Full Name" value={p.full_name} />
                    <InfoRow label="Reference" value={p.reference_name} />
                    <InfoRow label="Date of Birth" value={p.date_of_birth} />
                    <InfoRow label="Community" value={p.community} />
                    <InfoRow label="Weight" value={p.weight} />
                    <InfoRow label="Height" value={p.height} />
                    <InfoRow label="Marital Status" value={p.marital_status} />
                    <InfoRow label="Mother Tongue" value={Array.isArray(p.mother_tongue) ? p.mother_tongue.join(', ') : p.mother_tongue} />
                    <InfoRow label="Current Location" value={p.current_location} />
                </Section>

                {/* Faith & Values */}
                <Section title="Faith & Values">
                    <InfoRow label="Ministry Participation" value={p.ministry_participation ? 'Yes' : 'No'} />
                    <InfoRow label="Ministry Description" value={p.ministry_description} />
                    <InfoRow label="Saved Person" value={p.saved_person ? 'Yes' : 'No'} />
                    <InfoRow label="Anointed (Holy Spirit)" value={p.holy_spirit ? 'Yes' : 'No'} />
                    <InfoRow label="Baptized" value={p.baptized ? 'Yes' : 'No'} />
                    <InfoRow label="Baptism Date" value={p.baptism_date} />
                    <InfoRow label="Membership Years" value={p.membership_year} />
                    <InfoRow label="Church Name" value={p.church_name} />
                    <InfoRow label="Church Attendance" value={p.church_attendance_frequency} />
                    <InfoRow label="Pastor Name" value={p.pastor_name} />
                    <InfoRow label="Pastor Contact" value={p.pastor_contact} />
                </Section>

                {/* Career & Education */}
                <Section title="Career & Education">
                    <InfoRow label="Education" value={p.education} />
                    <InfoRow label="College / University" value={p.college_university} />
                    <InfoRow label="Occupation" value={p.occupation} />
                    <InfoRow label="Company Name" value={p.company_name} />
                    <InfoRow label="Annual Income" value={p.annual_income} />
                </Section>

                {/* Family */}
                <Section title="Family">
                    <InfoRow label="Father's Name" value={p.father_name} />
                    <InfoRow label="Mother's Name" value={p.mother_name} />
                    <InfoRow label="Parents' Occupation" value={p.parents_occupation} />
                    <InfoRow label="Brothers" value={p.brothers_count} />
                    <InfoRow label="Sisters" value={p.sisters_count} />
                    <InfoRow label="Married Brothers" value={p.married_brothers_count ? 'Yes' : 'No'} />
                    <InfoRow label="Married Sisters" value={p.married_sisters_count ? 'Yes' : 'No'} />
                    <InfoRow label="Partner Values" value={p.partner_values} />
                </Section>

                {/* Residence */}
                <Section title="Residence">
                    <InfoRow label="House Type" value={p.house_type} />
                    <InfoRow label="Address" value={p.address} />
                </Section>

                {/* Lifestyle */}
                <Section title="Lifestyle">
                    <InfoRow label="Wants Children" value={p.wants_children === 1 ? 'Yes' : p.wants_children === 2 ? 'Unsure' : 'No'} />
                    <InfoRow label="Smoker" value={p.smoker ? 'Yes' : 'No'} />
                    <InfoRow label="Drinker" value={p.drinker ? 'Yes' : 'No'} />
                    <InfoRow label="Food Preference" value={p.food_preference} />
                    <InfoRow label="Hobbies" value={Array.isArray(p.hobbies) ? p.hobbies.join(', ') : p.hobbies} />
                    <InfoRow label="Languages Known" value={Array.isArray(p.languages_known) ? p.languages_known.join(', ') : p.languages_known} />
                </Section>

                {/* Partner Preferences */}
                <Section title="Partner Preferences">
                    <InfoRow label="Preferred Age" value={`${p.preferred_age_from || '-'} - ${p.preferred_age_to || '-'}`} />
                    <InfoRow label="Preferred Height" value={`${p.preferred_height_from || '-'} - ${p.preferred_height_to || '-'}`} />
                    <InfoRow label="Denomination" value={p.denomination} />
                    <InfoRow label="Preferred Location" value={p.preferred_location} />
                </Section>

                {/* Agreement */}
                <TouchableOpacity style={styles.agreeRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.8}>
                    <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                        {agreed && <Text style={styles.checkboxTick}>✓</Text>}
                    </View>
                    <Text style={styles.agreeText}>
                        I confirm that all information provided is accurate and reflects my sincere intention to find a faith-based union.
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
                {!agreed && (
                    <Text style={styles.agreeHint}>Please confirm the declaration above to continue</Text>
                )}
                <TouchableOpacity
                    style={[styles.continueBtn, (!agreed || submitting) && styles.continueBtnDisabled]}
                    disabled={!agreed || submitting}
                    onPress={handleSubmit}
                    activeOpacity={0.85}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.continueBtnText}>SUBMIT PROFILE</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FAF7F2' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FAF7F2', paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#EEE8DC',
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#E8DFD0',
    },
    backArrow: { fontSize: 22, color: '#111', fontWeight: '700' },
    headerCenter: { flex: 1, marginHorizontal: 12 },
    headerRight: { width: 38 },
    stepText: { textAlign: 'center', fontSize: 13, color: '#888', marginBottom: 8 },
    progressBar: { height: 4, backgroundColor: '#E5E5E5', borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: '#C9A84C', borderRadius: 2 },
    container: { paddingHorizontal: 16, paddingTop: 8 },
    pageTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 6, textAlign: 'center' },
    pageSubtitle: { fontSize: 13, color: '#777', lineHeight: 19, marginBottom: 16, textAlign: 'center' },
    banner: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#1A2340', borderRadius: 14, padding: 16, marginBottom: 16,
    },
    bannerIcon: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center',
    },
    bannerTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
    bannerSubtitle: { fontSize: 12, color: '#AAB8D4' },
    section: {
        backgroundColor: '#fff', borderRadius: 14, padding: 14,
        marginBottom: 12, borderWidth: 1, borderColor: '#EEE8DC',
    },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 12,
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F5F0E8',
    },
    infoLabel: { fontSize: 12, color: '#888', flex: 1, flexWrap: 'wrap', paddingRight: 8 },
    infoValue: { fontSize: 12, color: '#333', fontWeight: '500', flex: 1, textAlign: 'right' },
    agreeRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: '#fff', borderRadius: 12, padding: 14,
        marginBottom: 8, borderWidth: 1.5, borderColor: '#EEE8DC',
    },
    checkbox: {
        width: 22, height: 22, borderRadius: 5,
        borderWidth: 2, borderColor: '#C9A84C',
        alignItems: 'center', justifyContent: 'center', marginTop: 1,
    },
    checkboxChecked: { backgroundColor: '#C9A84C' },
    checkboxTick: { color: '#fff', fontSize: 13, fontWeight: '700' },
    agreeText: { flex: 1, fontSize: 12, color: '#555', lineHeight: 18 },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FAF7F2', paddingHorizontal: 20, paddingTop: 10,
        borderTopWidth: 1, borderTopColor: '#EEE8DC',
    },
    agreeHint: { fontSize: 12, color: '#C9A84C', textAlign: 'center', marginBottom: 8 },
    continueBtn: {
        backgroundColor: '#111', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
        borderWidth: 2, borderColor: '#C9A84C',
    },
    continueBtnDisabled: { opacity: 0.4 },
    continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1.5 },
});