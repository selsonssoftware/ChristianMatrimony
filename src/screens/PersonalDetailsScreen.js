import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveProfileData } from '../utils/profileStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, SafeAreaView, StatusBar, Alert, Platform,
} from 'react-native';

const MARITAL_STATUS = ['Never Married', 'Married'];
const MOTHER_TONGUES = ['Tamil', 'English', 'Telugu', 'Kannada', 'Malayalam'];
const COMMUNITIES = ['CST', 'CNI', 'Jacobite', 'Pentecostal', 'Roman Catholic'];
const WEIGHTS = Array.from({ length: 80 }, (_, i) => `${40 + i} kg`);
const HEIGHTS = [
    '4\'5"', '4\'6"', '4\'7"', '4\'8"', '4\'9"', '4\'10"', '4\'11"',
    '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"',
    '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"',
];

export default function PersonalDetailsScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [fullName, setFullName] = useState('');
    const [reference, setReference] = useState('groom');
    const [dob, setDob] = useState('');
    const [community, setCommunity] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [maritalStatus, setMaritalStatus] = useState('');
    const [motherTongue, setMotherTongue] = useState([]);
    const [location, setLocation] = useState('');
    const [showCommunityDrop, setShowCommunityDrop] = useState(false);
    const [showWeightDrop, setShowWeightDrop] = useState(false);
    const [showHeightDrop, setShowHeightDrop] = useState(false);
    const [errors, setErrors] = useState({});

    const toggleTongue = (t) => {
        setMotherTongue(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
        );
    };

    const validate = () => {
        const e = {};
        if (!fullName.trim()) e.fullName = 'Full name is required';
        if (!dob.trim()) e.dob = 'Date of birth is required';
        else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob.trim())) e.dob = 'Enter date as DD/MM/YYYY';
        if (!community) e.community = 'Please select your community';
        if (!weight) e.weight = 'Please select weight';
        if (!height) e.height = 'Please select height';
        if (!maritalStatus) e.maritalStatus = 'Please select marital status';
        if (motherTongue.length === 0) e.motherTongue = 'Please select at least one language';
        if (!location.trim()) e.location = 'Current location is required';
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

            full_name: fullName,
            reference_name: reference,
            date_of_birth: dob,
            community: community,
            weight: weight,
            height: height,
            marital_status: maritalStatus,
            mother_tongue: motherTongue,
            current_location: location,
        });

        navigation.navigate('SpiritualFoundation');
    };
    const formatDob = (text) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length <= 2) return cleaned;
        if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    };

    return (
        <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Details</Text>
                <View style={{ width: 36 }} />
            </View>

            <View style={styles.progressContainer}>
                <Text style={styles.stepText}>Step 1 of 6</Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '16.6%' }]} />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Photo Upload */}
                <View style={styles.photoSection}>
                    <TouchableOpacity style={styles.photoCircle}>
                        <Text style={styles.photoIcon}>📷</Text>
                        <Text style={styles.photoText}>Add Photo</Text>
                        <View style={styles.editBadge}>
                            <Text style={styles.editBadgeText}>✏️</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.photoHint}>A clear face photo helps in getting better matches.</Text>
                </View>

                {/* Full Name */}
                <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="Enter your full name"
                    placeholderTextColor="#bbb"
                    value={fullName}
                    onChangeText={(t) => { setFullName(t); setErrors(p => ({ ...p, fullName: null })); }}
                />
                {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

                {/* Reference */}
                <Text style={styles.label}>Reference</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.refBtn, reference === 'groom' && styles.refBtnActive]}
                        onPress={() => setReference('groom')}
                    >
                        <Text style={[styles.refIcon, reference === 'groom' && styles.refIconActive]}>♂</Text>
                        <Text style={[styles.refLabel, reference === 'groom' && styles.refLabelActive]}>Groom</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.refBtn, reference === 'bride' && styles.refBtnActive]}
                        onPress={() => setReference('bride')}
                    >
                        <Text style={[styles.refIcon, reference === 'bride' && styles.refIconActive]}>♀</Text>
                        <Text style={[styles.refLabel, reference === 'bride' && styles.refLabelActive]}>Bride</Text>
                    </TouchableOpacity>
                </View>

                {/* Date of Birth */}
                <Text style={styles.label}>Date Of Birth <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, { flex: 1 }, errors.dob && styles.inputError]}
                        value={dob}
                        onChangeText={(t) => {
                            setDob(formatDob(t));
                            setErrors(p => ({ ...p, dob: null }));
                        }}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor="#bbb"
                        keyboardType="number-pad"
                        maxLength={10}
                    />
                    <Text style={styles.calIcon}>📅</Text>
                </View>
                {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}

                {/* Community */}
                <Text style={styles.label}>Community <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                    style={[styles.dropdown, errors.community && styles.inputError]}
                    onPress={() => {
                        setShowCommunityDrop(!showCommunityDrop);
                        setShowWeightDrop(false);
                        setShowHeightDrop(false);
                    }}
                >
                    <Text style={community ? styles.dropdownValue : styles.dropdownPlaceholder}>
                        {community || 'e.g CST'}
                    </Text>
                    <Text style={styles.dropdownArrow}>{showCommunityDrop ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {errors.community ? <Text style={styles.errorText}>{errors.community}</Text> : null}
                {showCommunityDrop && (
                    <View style={styles.dropdownList}>
                        {COMMUNITIES.map(c => (
                            <TouchableOpacity
                                key={c}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setCommunity(c);
                                    setShowCommunityDrop(false);
                                    setErrors(p => ({ ...p, community: null }));
                                }}
                            >
                                <Text style={[styles.dropdownItemText, community === c && styles.dropdownItemActive]}>{c}</Text>
                                {community === c && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Weight & Height */}
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.label}>Weight <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity
                            style={[styles.dropdown, errors.weight && styles.inputError]}
                            onPress={() => {
                                setShowWeightDrop(!showWeightDrop);
                                setShowCommunityDrop(false);
                                setShowHeightDrop(false);
                            }}
                        >
                            <Text style={weight ? styles.dropdownValue : styles.dropdownPlaceholder}>{weight || 'Select'}</Text>
                            <Text style={styles.dropdownArrow}>{showWeightDrop ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                        {errors.weight ? <Text style={styles.errorText}>{errors.weight}</Text> : null}
                        {showWeightDrop && (
                            <View style={[styles.dropdownList, { maxHeight: 180 }]}>
                                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                    {WEIGHTS.map(w => (
                                        <TouchableOpacity
                                            key={w}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setWeight(w);
                                                setShowWeightDrop(false);
                                                setErrors(p => ({ ...p, weight: null }));
                                            }}
                                        >
                                            <Text style={[styles.dropdownItemText, weight === w && styles.dropdownItemActive]}>{w}</Text>
                                            {weight === w && <Text style={styles.checkmark}>✓</Text>}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.label}>Height <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity
                            style={[styles.dropdown, errors.height && styles.inputError]}
                            onPress={() => {
                                setShowHeightDrop(!showHeightDrop);
                                setShowCommunityDrop(false);
                                setShowWeightDrop(false);
                            }}
                        >
                            <Text style={height ? styles.dropdownValue : styles.dropdownPlaceholder}>{height || 'Select'}</Text>
                            <Text style={styles.dropdownArrow}>{showHeightDrop ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                        {errors.height ? <Text style={styles.errorText}>{errors.height}</Text> : null}
                        {showHeightDrop && (
                            <View style={[styles.dropdownList, { maxHeight: 180 }]}>
                                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                    {HEIGHTS.map(h => (
                                        <TouchableOpacity
                                            key={h}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setHeight(h);
                                                setShowHeightDrop(false);
                                                setErrors(p => ({ ...p, height: null }));
                                            }}
                                        >
                                            <Text style={[styles.dropdownItemText, height === h && styles.dropdownItemActive]}>{h}</Text>
                                            {height === h && <Text style={styles.checkmark}>✓</Text>}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </View>

                {/* Marital Status */}
                <Text style={[styles.label, { marginTop: 16 }]}>Marital Status <Text style={styles.required}>*</Text></Text>
                <View style={styles.chipRow}>
                    {MARITAL_STATUS.map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.chipOutline, maritalStatus === s && styles.chipOutlineActive]}
                            onPress={() => { setMaritalStatus(s); setErrors(p => ({ ...p, maritalStatus: null })); }}
                        >
                            <Text style={[styles.chipOutlineText, maritalStatus === s && styles.chipOutlineTextActive]}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {errors.maritalStatus ? <Text style={styles.errorText}>{errors.maritalStatus}</Text> : null}

                {/* Mother Tongue */}
                <Text style={styles.label}>Mother Tongue <Text style={styles.required}>*</Text></Text>
                <View style={styles.chipGrid}>
                    {MOTHER_TONGUES.map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.chipOutline, motherTongue.includes(t) && styles.chipOutlineActive]}
                            onPress={() => { toggleTongue(t); setErrors(p => ({ ...p, motherTongue: null })); }}
                        >
                            <Text style={[styles.chipOutlineText, motherTongue.includes(t) && styles.chipOutlineTextActive]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {errors.motherTongue ? <Text style={styles.errorText}>{errors.motherTongue}</Text> : null}

                {/* Current Location */}
                <Text style={styles.label}>Current Location <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.input, errors.location && styles.inputError]}
                    value={location}
                    onChangeText={(t) => { setLocation(t); setErrors(p => ({ ...p, location: null })); }}
                    placeholder="City"
                    placeholderTextColor="#bbb"
                />
                {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}

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
    progressContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, backgroundColor: '#FAF7F2' },
    stepText: { textAlign: 'center', fontSize: 13, color: '#888', marginBottom: 8 },
    progressBar: { height: 4, backgroundColor: '#E5E5E5', borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: '#C9A84C', borderRadius: 2 },
    container: { paddingHorizontal: 20, paddingTop: 16 },
    photoSection: { alignItems: 'center', marginBottom: 24 },
    photoCircle: {
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 2, borderColor: '#C9A84C', borderStyle: 'dashed',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#fff', position: 'relative',
    },
    photoIcon: { fontSize: 24 },
    photoText: { fontSize: 11, color: '#888', marginTop: 2 },
    editBadge: {
        position: 'absolute', bottom: 0, right: 0,
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center',
    },
    editBadgeText: { fontSize: 12 },
    photoHint: { fontSize: 12, color: '#888', marginTop: 8, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 8, marginTop: 16 },
    required: { color: '#E53935', fontSize: 14 },
    input: {
        borderWidth: 1, borderColor: '#E0D8CC', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 11,
        fontSize: 14, color: '#222', backgroundColor: '#fff',
    },
    inputError: { borderColor: '#E53935', borderWidth: 1.5 },
    errorText: { fontSize: 12, color: '#E53935', marginTop: 4, marginLeft: 2 },
    inputRow: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
    calIcon: { position: 'absolute', right: 14, fontSize: 18 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    refBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E0D8CC', borderRadius: 10,
        paddingVertical: 13, gap: 6, backgroundColor: '#fff',
    },
    refBtnActive: { borderColor: '#C9A84C', borderWidth: 2, backgroundColor: '#FEF8EC' },
    refIcon: { fontSize: 20, color: '#555' },
    refIconActive: { color: '#C9A84C' },
    refLabel: { fontSize: 13, color: '#555' },
    refLabelActive: { color: '#111', fontWeight: '600' },
    dropdown: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: '#E0D8CC', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 13 : 11,
        backgroundColor: '#fff',
    },
    dropdownPlaceholder: { color: '#bbb', fontSize: 14 },
    dropdownValue: { color: '#222', fontSize: 14 },
    dropdownArrow: { color: '#888', fontSize: 11 },
    dropdownList: {
        borderWidth: 1, borderColor: '#E0D8CC', borderRadius: 10,
        backgroundColor: '#fff', marginTop: 4, zIndex: 99,
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