import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'profileData';

export const saveProfileData = async (newData) => {
    try {
        const existing = await AsyncStorage.getItem(KEY);
        const current = existing ? JSON.parse(existing) : {};
        const merged = { ...current, ...newData };
        await AsyncStorage.setItem(KEY, JSON.stringify(merged));
        return merged;
    } catch (e) {
        console.log('saveProfileData error:', e);
        return null;
    }
};

export const getProfileData = async () => {
    try {
        const data = await AsyncStorage.getItem(KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.log('getProfileData error:', e);
        return {};
    }
};

export const clearProfileData = async () => {
    await AsyncStorage.removeItem(KEY);
};