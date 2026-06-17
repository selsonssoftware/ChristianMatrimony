import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet,  StatusBar, ActivityIndicator,
    Alert, Switch, Platform, KeyboardAvoidingView, Animated,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {

  SafeAreaView,

} from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// ─── Design Tokens ──────────────────────────────────────────
const GOLD = '#C9A84C';
const GOLD_LIGHT = '#F5E6C0';
const GOLD_MUTED = '#8A6320';
const GOLD_BORDER = 'rgba(180,150,90,0.28)';
const NAVY = '#1A2340';
const IVORY = '#F9F6F1';
const IVORY_CARD = '#FFF8EE';
const BROWN_TEXT = '#2C1A00';
const BROWN_MUTED = '#7A5C2A';
const WHITE = '#FFFFFF';
const BG = '#FAF7F2';
const BORDER = '#EEE8DC';
const MUTED = '#999';
const SUCCESS = '#1D6B45';
const BASE_URL = 'https://matrimony.gmworld.net';

// ─── Steps ──────────────────────────────────────────────────
const STEPS = [
    { key: 'basic', label: 'Basic', emoji: '👤' },
    { key: 'faith', label: 'Faith', emoji: '✝️' },
    { key: 'career', label: 'Career', emoji: '💼' },
    { key: 'family', label: 'Family', emoji: '🏠' },
    { key: 'partner', label: 'Partner', emoji: '💝' },
    { key: 'lifestyle', label: 'Lifestyle', emoji: '🌿' },
];

// ─── Helpers ────────────────────────────────────────────────
const cmToFeet = (cm) => {
    if (!cm) return '';
    const t = Math.round(Number(cm) / 2.54);
    return `${Math.floor(t / 12)}'${t % 12}"`;
};
const feetToCm = (str) => {
    if (!str) return null;
    const m = String(str).match(/(\d+)[''`](\d+)?/);
    if (!m) return null;
    return Math.round((parseInt(m[1] || 0) * 12 + parseInt(m[2] || 0)) * 2.54);
};
const kgFromStr = (str) => {
    if (!str) return null;
    const m = String(str).match(/(\d+)/);
    return m ? parseInt(m[1]) : null;
};
const dateToApi = (d) => {
    if (!d) return '';
    const p = String(d).split('/');
    if (p.length !== 3) return d;
    return `${p[2]}-${p[1]}-${p[0]}`;
};
const dateFromApi = (d) => {
    if (!d) return '';
    const p = String(d).split('-');
    if (p.length !== 3) return d;
    return `${p[2]}/${p[1]}/${p[0]}`;
};
const numOrNull = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
};
const listToArr = (v) => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    return String(v).split(',').map(s => s.trim()).filter(Boolean);
};
const incomeToLPA = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const n = Number(val);
    if (isNaN(n)) return String(val);
    if (n <= 0) return 'Not Disclosed';
    if (n < 200000) return 'Below 2 LPA';
    if (n < 400000) return '2-4 LPA';
    if (n < 600000) return '4-6 LPA';
    if (n < 800000) return '6-8 LPA';
    if (n < 1000000) return '8-10 LPA';
    if (n < 1500000) return '10-15 LPA';
    if (n < 2000000) return '15-20 LPA';
    return '20+ LPA';
};
const houseTypeMap = (val) => {
    const v = String(val || '').trim();
    if (!v) return '';
    const lower = v.toLowerCase();
    if (lower === 'own' || lower === 'own house') return 'Own House';
    if (lower === 'rented') return 'Rented';
    if (lower === 'family' || lower === 'family house') return 'Family House';
    if (lower === 'apartment') return 'Apartment';
    return v;
};

// ─── Field Components ────────────────────────────────────────
const FieldLabel = ({ text, required }) => (
    <Text style={f.label}>
        {text}{required ? <Text style={{ color: GOLD }}> *</Text> : null}
    </Text>
);

const InputField = ({ label, value, onChangeText, placeholder, keyboardType, multiline, required, hint }) => (
    <View style={f.fieldWrap}>
        <FieldLabel text={label} required={required} />
        {hint ? <Text style={f.hint}>{hint}</Text> : null}
        <TextInput
            style={[f.input, multiline && f.multiline]}
            value={String(value ?? '')}
            onChangeText={onChangeText}
            placeholder={placeholder || ''}
            placeholderTextColor="#C0B090"
            keyboardType={keyboardType || 'default'}
            multiline={!!multiline}
            numberOfLines={multiline ? 3 : 1}
        />
    </View>
);

const ToggleField = ({ label, value, onChange, hint }) => (
    <View style={f.toggleWrap}>
        <View style={{ flex: 1 }}>
            <Text style={f.toggleLabel}>{label}</Text>
            {hint ? <Text style={f.hint}>{hint}</Text> : null}
        </View>
        <Switch
            value={!!value}
            onValueChange={onChange}
            trackColor={{ false: '#DDD', true: GOLD }}
            thumbColor={value ? NAVY : '#F4F3F4'}
        />
    </View>
);

const PickerField = ({ label, value, options, onSelect, required }) => (
    <View style={f.fieldWrap}>
        <FieldLabel text={label} required={required} />
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={f.chipRow}
            keyboardShouldPersistTaps="handled"
        >
            {options.map((opt) => {
                const val = typeof opt === 'object' ? opt.value : opt;
                const lbl = typeof opt === 'object' ? opt.label : opt;
                const active = value === val;
                return (
                    <TouchableOpacity
                        key={String(val)}
                        style={[f.chip, active && f.chipActive]}
                        onPress={() => onSelect(val)}
                        activeOpacity={0.7}
                    >
                        <Text style={[f.chipTxt, active && f.chipTxtActive]}>{lbl}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    </View>
);

const MultiPickerField = ({ label, values, options, onToggle, hint }) => (
    <View style={f.fieldWrap}>
        <FieldLabel text={label} />
        {hint ? <Text style={f.hint}>{hint}</Text> : null}
        <View style={f.multiChipWrap}>
            {options.map((opt) => {
                const active = values.includes(opt);
                return (
                    <TouchableOpacity
                        key={opt}
                        style={[f.chip, active && f.chipActive]}
                        onPress={() => onToggle(opt)}
                        activeOpacity={0.7}
                    >
                        <Text style={[f.chipTxt, active && f.chipTxtActive]}>{opt}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </View>
);

const SectionHeader = ({ emoji, title, subtitle }) => (
    <View style={f.sectionHead}>
        <View style={f.sectionIconWrap}>
            <Text style={f.sectionEmoji}>{emoji}</Text>
        </View>
        <View>
            <Text style={f.sectionTitle}>{title}</Text>
            {subtitle ? <Text style={f.sectionSub}>{subtitle}</Text> : null}
        </View>
    </View>
);

const Divider = () => <View style={f.divider} />;

const RowFields = ({ children }) => (
    <View style={{ flexDirection: 'row', gap: 12 }}>{children}</View>
);

const f = StyleSheet.create({
    fieldWrap: { marginBottom: 18 },
    label: { fontSize: 12, fontWeight: '700', color: BROWN_MUTED, marginBottom: 5, letterSpacing: 0.3, textTransform: 'uppercase' },
    hint: { fontSize: 10, color: MUTED, marginBottom: 4 },
    input: {
        backgroundColor: WHITE,
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: BROWN_TEXT,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    multiline: { height: 88, textAlignVertical: 'top' },
    toggleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        backgroundColor: WHITE,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1.5,
        borderColor: BORDER,
    },
    toggleLabel: { fontSize: 13, fontWeight: '600', color: BROWN_TEXT },
    chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
    multiChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 4 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: GOLD_BORDER,
        backgroundColor: IVORY_CARD,
    },
    chipActive: { backgroundColor: NAVY, borderColor: NAVY },
    chipTxt: { fontSize: 12, color: BROWN_MUTED, fontWeight: '500' },
    chipTxtActive: { color: GOLD, fontWeight: '700' },
    sectionHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        marginTop: 4,
    },
    sectionIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: IVORY_CARD,
        borderWidth: 1.5,
        borderColor: GOLD_BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionEmoji: { fontSize: 20 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: NAVY, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    sectionSub: { fontSize: 11, color: MUTED, marginTop: 2 },
    divider: { height: 1, backgroundColor: BORDER, marginVertical: 18 },
});

// ─── Steps ──────────────────────────────────────────────────
const StepBasic = ({ data, set }) => (
    <View>
        <SectionHeader emoji="👤" title="Basic Details" subtitle="Your personal information" />
        <InputField label="Full Name" value={data.full_name} onChangeText={v => set('full_name', v)} required placeholder="Enter your full name" />
        <InputField label="Reference / Contact Name" value={data.reference_name} onChangeText={v => set('reference_name', v)} hint="Parent or guardian name" placeholder="e.g. Father's name" />
        <InputField label="Date of Birth" value={data.date_of_birth} onChangeText={v => set('date_of_birth', v)} placeholder="DD/MM/YYYY" hint="Format: DD/MM/YYYY" />
        <InputField label="Community" value={data.community} onChangeText={v => set('community', v)} placeholder="e.g. CNI, CSI, Catholic" />
        <RowFields>
            <View style={{ flex: 1 }}>
                <InputField label="Height" value={data.height} onChangeText={v => set('height', v)} placeholder="5'8&quot;" hint='Feet & inches' />
            </View>
            <View style={{ flex: 1 }}>
                <InputField label="Weight" value={data.weight} onChangeText={v => set('weight', v)} placeholder="65 kg" keyboardType="numeric" />
            </View>
        </RowFields>
        <PickerField label="Marital Status" value={data.marital_status} onSelect={v => set('marital_status', v)} options={['Single', 'Divorced', 'Widowed', 'Separated']} required />
        <MultiPickerField
            label="Mother Tongue"
            values={listToArr(data.mother_tongue)}
            options={['Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Hindi', 'English', 'Bengali', 'Marathi']}
            onToggle={v => {
                const arr = listToArr(data.mother_tongue);
                set('mother_tongue', arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
            }}
        />
        <InputField label="Current Location" value={data.current_location} onChangeText={v => set('current_location', v)} placeholder="City, State" required />
        <InputField label="Address" value={data.address} onChangeText={v => set('address', v)} multiline placeholder="Full residential address" />
        <PickerField label="House Type" value={data.house_type} onSelect={v => set('house_type', v)} options={['Own House', 'Rented', 'Family House', 'Apartment']} />
    </View>
);

const StepFaith = ({ data, set }) => (
    <View>
        <SectionHeader emoji="✝️" title="Faith & Church" subtitle="Your spiritual life and church involvement" />
        <ToggleField label="Are you a Saved Person?" value={data.saved_person} onChange={v => set('saved_person', v ? 1 : 0)} />
        <ToggleField label="Anointed by Holy Spirit?" value={data.holy_spirit} onChange={v => set('holy_spirit', v ? 1 : 0)} />
        <ToggleField label="Baptized?" value={data.baptized} onChange={v => set('baptized', v ? 1 : 0)} />
        {data.baptized ? <InputField label="Baptism Date" value={data.baptism_date} onChangeText={v => set('baptism_date', v)} placeholder="DD/MM/YYYY" hint="Format: DD/MM/YYYY" /> : null}
        <ToggleField label="Involved in Ministry?" value={data.ministry_participation} onChange={v => set('ministry_participation', v ? 1 : 0)} />
        {data.ministry_participation ? <InputField label="Describe your Ministry" value={data.ministry_description} onChangeText={v => set('ministry_description', v)} multiline placeholder="e.g. Worship team, Sunday school teacher..." /> : null}
        <Divider />
        <InputField label="Church Name" value={data.church_name} onChangeText={v => set('church_name', v)} placeholder="e.g. CSI St. Andrews" required />
        <PickerField label="Church Attendance" value={data.church_attendance_frequency} onSelect={v => set('church_attendance_frequency', v)} options={['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Occasionally']} />
        <RowFields>
            <View style={{ flex: 1 }}>
                <InputField label="Member Since (Year)" value={String(data.membership_year ?? '')} onChangeText={v => set('membership_year', v)} keyboardType="numeric" placeholder="2010" />
            </View>
        </RowFields>
        <InputField label="Pastor Name" value={data.pastor_name} onChangeText={v => set('pastor_name', v)} placeholder="Pastor full name" />
        <InputField label="Pastor Contact" value={data.pastor_contact} onChangeText={v => set('pastor_contact', v)} keyboardType="phone-pad" placeholder="+91 98765 43210" />
    </View>
);

const StepCareer = ({ data, set }) => (
    <View>
        <SectionHeader emoji="💼" title="Career & Education" subtitle="Your professional background" />
        <PickerField
            label="Highest Education"
            value={data.education}
            onSelect={v => set('education', v)}
            options={['Below 10th', '10th Pass', '12th Pass', 'Diploma', 'B.A', 'B.Sc', 'B.Com', 'B.E/B.Tech', 'BCA', 'BBA', 'M.A', 'M.Sc', 'M.Com', 'M.E/M.Tech', 'MBA', 'MCA', 'PhD', 'Medical']}
            required
        />
        <InputField label="College / University" value={data.college_university} onChangeText={v => set('college_university', v)} placeholder="e.g. Anna University" />
        <InputField label="Occupation" value={data.occupation} onChangeText={v => set('occupation', v)} placeholder="e.g. Software Engineer" required />
        <InputField label="Company Name" value={data.company_name} onChangeText={v => set('company_name', v)} placeholder="e.g. TCS, Infosys" />
        <PickerField label="Annual Income" value={data.annual_income} onSelect={v => set('annual_income', v)} options={['Below 2 LPA', '2-4 LPA', '4-6 LPA', '6-8 LPA', '8-10 LPA', '10-15 LPA', '15-20 LPA', '20+ LPA', 'Not Disclosed']} />
    </View>
);

const StepFamily = ({ data, set }) => (
    <View>
        <SectionHeader emoji="🏠" title="Family Details" subtitle="Your family background" />
        <InputField label="Father's Name" value={data.father_name} onChangeText={v => set('father_name', v)} placeholder="Father full name" />
        <InputField label="Mother's Name" value={data.mother_name} onChangeText={v => set('mother_name', v)} placeholder="Mother full name" />
        <InputField label="Parents' Occupation" value={data.parents_occupation} onChangeText={v => set('parents_occupation', v)} multiline placeholder="e.g. Father: Retired Govt Officer, Mother: Homemaker" />
        <Divider />
        <RowFields>
            <View style={{ flex: 1 }}>
                <InputField label="No. of Brothers" value={String(data.brothers_count ?? '')} onChangeText={v => set('brothers_count', v)} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={{ flex: 1 }}>
                <InputField label="No. of Sisters" value={String(data.sisters_count ?? '')} onChangeText={v => set('sisters_count', v)} keyboardType="numeric" placeholder="0" />
            </View>
        </RowFields>
        <RowFields>
            <View style={{ flex: 1 }}>
                <InputField label="Married Brothers" value={String(data.married_brothers_count ?? '')} onChangeText={v => set('married_brothers_count', v)} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={{ flex: 1 }}>
                <InputField label="Married Sisters" value={String(data.married_sisters_count ?? '')} onChangeText={v => set('married_sisters_count', v)} keyboardType="numeric" placeholder="0" />
            </View>
        </RowFields>
        <Divider />
        <InputField label="Partner Values" value={data.partner_values} onChangeText={v => set('partner_values', v)} multiline placeholder="Describe the values you expect in your partner..." hint="What qualities are most important to you?" />
    </View>
);

const StepPartner = ({ data, set }) => (
    <View>
        <SectionHeader emoji="💝" title="Partner Preferences" subtitle="Who you are looking for" />
        <RowFields>
            <View style={{ flex: 1 }}>
                <InputField label="Preferred Age From" value={String(data.preferred_age_from ?? '')} onChangeText={v => set('preferred_age_from', v)} keyboardType="numeric" placeholder="25" />
            </View>
            <View style={{ flex: 1 }}>
                <InputField label="Preferred Age To" value={String(data.preferred_age_to ?? '')} onChangeText={v => set('preferred_age_to', v)} keyboardType="numeric" placeholder="35" />
            </View>
        </RowFields>
        <RowFields>
            <View style={{ flex: 1 }}>
                <InputField label="Min Height" value={String(data.preferred_height_from ?? '')} onChangeText={v => set('preferred_height_from', v)} placeholder="5'4&quot;" />
            </View>
            <View style={{ flex: 1 }}>
                <InputField label="Max Height" value={String(data.preferred_height_to ?? '')} onChangeText={v => set('preferred_height_to', v)} placeholder="6'0&quot;" />
            </View>
        </RowFields>
        <InputField label="Preferred Denomination" value={data.denomination} onChangeText={v => set('denomination', v)} placeholder="e.g. CNI, CSI, Pentecostal" />
        <InputField label="Preferred Location" value={data.preferred_location} onChangeText={v => set('preferred_location', v)} placeholder="City or State" />
        <PickerField label="Partner Required" value={data.partner_required} onSelect={v => set('partner_required', v)} options={[{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }]} />
    </View>
);

const StepLifestyle = ({ data, set }) => (
    <View>
        <SectionHeader emoji="🌿" title="Lifestyle" subtitle="Your day-to-day life and habits" />
        <PickerField label="Want Children?" value={data.wants_children} onSelect={v => set('wants_children', v)} options={[{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }, { label: 'Unsure', value: 2 }]} />
        <ToggleField label="Smoker?" value={!!data.smoker} onChange={v => set('smoker', v ? 1 : 0)} />
        <ToggleField label="Drinker?" value={!!data.drinker} onChange={v => set('drinker', v ? 1 : 0)} />
        <PickerField label="Food Preference" value={data.food_preference} onSelect={v => set('food_preference', v)} options={['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'No Preference']} />
        <MultiPickerField
            label="Hobbies"
            values={listToArr(data.hobbies)}
            options={['Reading', 'Cooking', 'Music', 'Sports', 'Travel', 'Prayer', 'Worship', 'Gardening', 'Photography', 'Art', 'Fitness', 'Movies']}
            onToggle={v => {
                const arr = listToArr(data.hobbies);
                set('hobbies', arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
            }}
        />
        <MultiPickerField
            label="Languages Known"
            values={listToArr(data.languages_known)}
            options={['Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Hindi', 'English', 'Bengali', 'Marathi', 'Gujarati']}
            onToggle={v => {
                const arr = listToArr(data.languages_known);
                set('languages_known', arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
            }}
        />
    </View>
);

// ─── Build Payload ───────────────────────────────────────────
const buildPayload = (d, userId) => ({
    user_id: userId,
    full_name: d.full_name || '',
    reference_name: d.reference_name || '',
    date_of_birth: dateToApi(d.date_of_birth),
    community: d.community || '',
    weight: kgFromStr(String(d.weight || '')),
    height: feetToCm(d.height) || (typeof d.height === 'number' ? d.height : null),
    marital_status: d.marital_status || '',
    mother_tongue: Array.isArray(d.mother_tongue) ? d.mother_tongue.join(',') : (d.mother_tongue || ''),
    current_location: d.current_location || '',
    address: d.address || '',
    house_type: d.house_type || '',
    ministry_participation: d.ministry_participation ? 'Yes' : 'No',
    ministry_description: d.ministry_description || '',
    saved_person: d.saved_person ?? 0,
    holy_spirit: d.holy_spirit ?? 0,
    baptized: d.baptized ?? 0,
    baptism_date: dateToApi(d.baptism_date),
    membership_year: numOrNull(String(d.membership_year || '').replace(/\D/g, '')),
    church_name: d.church_name || '',
    church_attendance_frequency: d.church_attendance_frequency || '',
    pastor_name: d.pastor_name || '',
    pastor_contact: d.pastor_contact || '',
    education: d.education || '',
    college_university: d.college_university || '',
    occupation: d.occupation || '',
    company_name: d.company_name || '',
    annual_income: d.annual_income || '',
    father_name: d.father_name || '',
    mother_name: d.mother_name || '',
    parents_occupation: d.parents_occupation || '',
    brothers_count: numOrNull(d.brothers_count),
    sisters_count: numOrNull(d.sisters_count),
    married_brothers_count: numOrNull(d.married_brothers_count),
    married_sisters_count: numOrNull(d.married_sisters_count),
    partner_values: d.partner_values || '',
    partner_required: d.partner_required ?? 1,
    preferred_age_from: numOrNull(d.preferred_age_from),
    preferred_age_to: numOrNull(d.preferred_age_to),
    preferred_height_from: feetToCm(d.preferred_height_from) || numOrNull(d.preferred_height_from),
    preferred_height_to: feetToCm(d.preferred_height_to) || numOrNull(d.preferred_height_to),
    denomination: d.denomination || '',
    preferred_location: d.preferred_location || '',
    wants_children: d.wants_children ?? 0,
    smoker: d.smoker ?? 0,
    drinker: d.drinker ?? 0,
    food_preference: d.food_preference || '',
    hobbies: Array.isArray(d.hobbies) ? d.hobbies.join(',') : (d.hobbies || ''),
    languages_known: Array.isArray(d.languages_known) ? d.languages_known.join(',') : (d.languages_known || ''),
});

// ════════════════════════════════════════════════════════════
export default function EditProfileScreen({ navigation, route }) {
    const scrollRef = useRef(null);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const [stepIdx, setStepIdx] = useState(0);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const [token, uid] = await Promise.all([
                    AsyncStorage.getItem('userToken'),
                    AsyncStorage.getItem('matrimonyUserId'),
                ]);
                setUserId(uid || '');

                // ✅ Use passed profileData if available, else fetch from API
                const passed = route?.params?.profileData;
                let p = {};

                if (passed) {
                    p = passed;
                } else {
                    const res = await fetch(`${BASE_URL}/api/view_profile/${uid}`, {
                        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                    });
                    const result = await res.json();
                    p = result.data || result.profile || result || {};
                }

                setData({
                    ...p,
                    height: p.height ? cmToFeet(p.height) : '',
                    preferred_height_from: p.preferred_height_from ? cmToFeet(p.preferred_height_from) : '',
                    preferred_height_to: p.preferred_height_to ? cmToFeet(p.preferred_height_to) : '',
                    date_of_birth: p.date_of_birth ? dateFromApi(p.date_of_birth) : '',
                    baptism_date: p.baptism_date ? dateFromApi(p.baptism_date) : '',
                    mother_tongue: listToArr(p.mother_tongue),
                    hobbies: listToArr(p.hobbies),
                    languages_known: listToArr(p.languages_known),
                    weight: p.weight ? `${p.weight} kg` : '',
                    annual_income: incomeToLPA(p.annual_income),
                    house_type: houseTypeMap(p.house_type),
                    partner_required: numOrNull(p.partner_required) ?? 1,
                });
            } catch (e) {
                Alert.alert('Error', 'Could not load profile: ' + e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const animateProgress = (toStep) => {
        Animated.timing(progressAnim, {
            toValue: ((toStep + 1) / STEPS.length) * width,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const set = (key, value) => setData(prev => ({ ...prev, [key]: value }));

    const goToStep = (i) => {
        setStepIdx(i);
        animateProgress(i);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const handleNext = () => {
        const isLast = stepIdx === STEPS.length - 1;
        if (!isLast) { goToStep(stepIdx + 1); return; }
        handleSave();
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const payload = buildPayload(data, userId);
            const res = await fetch(`${BASE_URL}/api/profile_update/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (result.status === true || result.success === true) {
                await AsyncStorage.setItem('profileData', JSON.stringify({ ...data }));
                Alert.alert('✓ Saved!', 'Your profile has been updated.', [
                    {
                        text: 'Done',
                        onPress: () => {
                            // ✅ Go back and signal MemberList to refresh
                            navigation?.goBack();
                        },
                    },
                ]);
            } else {
                Alert.alert('Update Failed', result.message || 'Please try again');
            }
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        if (stepIdx === 0) navigation?.goBack();
        else goToStep(stepIdx - 1);
    };

    if (loading) {
        return (
            <SafeAreaView style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
                <View style={s.loadingBox}>
                    <ActivityIndicator size="large" color={GOLD} />
                    <Text style={s.loadingTxt}>Loading your profile…</Text>
                </View>
            </SafeAreaView>
        );
    }

    const step = STEPS[stepIdx];
    const isLast = stepIdx === STEPS.length - 1;

    return (
        <SafeAreaView style={s.root} edges={['top','bottom']}>
            <StatusBar barStyle="light-content" backgroundColor={NAVY} />

            {/* ── Header ─────────────────────────────────── */}
            <View style={s.header}>
                <TouchableOpacity onPress={handleBack} style={s.backBtn} activeOpacity={0.7}>
                    <Text style={s.backArrow}>‹</Text>
                </TouchableOpacity>
                <View style={s.headerCenter}>
                    <Text style={s.headerTitle}>Edit Profile</Text>
                    <Text style={s.headerSub}>{step.emoji}  {step.label}  —  Step {stepIdx + 1} of {STEPS.length}</Text>
                </View>
                <TouchableOpacity onPress={handleSave} style={s.saveQuickBtn} activeOpacity={0.7}>
                    <Text style={s.saveQuickTxt}>Save</Text>
                </TouchableOpacity>
            </View>

            {/* ── Progress Bar ────────────────────────────── */}
            <View style={s.progressTrack}>
                <Animated.View style={[s.progressFill, { width: progressAnim }]} />
            </View>

            {/* ── Step Pills ──────────────────────────────── */}
            <View style={s.pillsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.pillsRow}
                    keyboardShouldPersistTaps="handled"
                >
                    {STEPS.map((st, i) => {
                        const done = i < stepIdx;
                        const active = i === stepIdx;
                        return (
                            <TouchableOpacity
                                key={st.key}
                                style={[s.pill, active && s.pillActive, done && s.pillDone]}
                                onPress={() => goToStep(i)}
                                activeOpacity={0.75}
                            >
                                <Text style={s.pillEmoji}>{done ? '✓' : st.emoji}</Text>
                                <Text style={[s.pillTxt, active && s.pillTxtActive, done && s.pillTxtDone]}>
                                    {st.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ── Form Body ───────────────────────────────── */}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={s.formBody}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Step card */}
                    <View style={s.stepCard}>
                        {stepIdx === 0 && <StepBasic data={data} set={set} />}
                        {stepIdx === 1 && <StepFaith data={data} set={set} />}
                        {stepIdx === 2 && <StepCareer data={data} set={set} />}
                        {stepIdx === 3 && <StepFamily data={data} set={set} />}
                        {stepIdx === 4 && <StepPartner data={data} set={set} />}
                        {stepIdx === 5 && <StepLifestyle data={data} set={set} />}
                    </View>
                    <View style={{ height: 110 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Footer ──────────────────────────────────── */}
            <View style={s.footer}>
                {stepIdx > 0 && (
                    <TouchableOpacity style={s.prevBtn} onPress={handleBack} activeOpacity={0.8}>
                        <Text style={s.prevBtnTxt}>‹ Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[s.nextBtn, saving && s.nextBtnDisabled, stepIdx === 0 && s.nextBtnFull]}
                    onPress={handleNext}
                    disabled={saving}
                    activeOpacity={0.85}
                >
                    {saving ? (
                        <ActivityIndicator color={BROWN_TEXT} />
                    ) : (
                        <Text style={s.nextBtnTxt}>
                            {isLast ? '✓  Save Changes' : `Next: ${STEPS[stepIdx + 1].label}  ›`}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── Screen Styles ───────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    // Loading
    loadingBox: { alignItems: 'center', gap: 14 },
    loadingTxt: { fontSize: 14, color: MUTED, fontWeight: '500' },

    // Header
    header: {
        backgroundColor: NAVY,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 10,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: { fontSize: 26, color: WHITE, fontWeight: '300', lineHeight: 30 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 15, fontWeight: '700', color: WHITE, letterSpacing: 0.3 },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    saveQuickBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: GOLD,
    },
    saveQuickTxt: { fontSize: 12, fontWeight: '700', color: GOLD },

    // Progress
    progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', backgroundColor: NAVY },
    progressFill: { height: 3, backgroundColor: GOLD },

    // Pills
    pillsContainer: { backgroundColor: NAVY, paddingBottom: 12 },
    pillsRow: { paddingHorizontal: 14, paddingTop: 10, flexDirection: 'row', gap: 8 },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'transparent',
    },
    pillActive: { backgroundColor: GOLD, borderColor: GOLD },
    pillDone: { backgroundColor: 'rgba(29,107,69,0.4)', borderColor: SUCCESS },
    pillEmoji: { fontSize: 12 },
    pillTxt: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
    pillTxtActive: { color: NAVY, fontWeight: '700' },
    pillTxtDone: { color: '#4ADE80', fontWeight: '600' },

    // Form
    formBody: { padding: 14 },
    stepCard: {
        backgroundColor: WHITE,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: BORDER,
        shadowColor: '#C9A84C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: WHITE,
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
        flexDirection: 'row',
        gap: 10,
    },
    prevBtn: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: GOLD_BORDER,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: IVORY_CARD,
    },
    prevBtnTxt: { fontSize: 14, fontWeight: '700', color: BROWN_MUTED },
    nextBtn: {
        flex: 1,
        backgroundColor: NAVY,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: GOLD,
    },
    nextBtnFull: { flex: 1 },
    nextBtnDisabled: { opacity: 0.5 },
    nextBtnTxt: { color: GOLD, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
});