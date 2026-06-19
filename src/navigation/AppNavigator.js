import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerificationScreen from '../screens/VerificationScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import PersonalDetailsScreen from '../screens/PersonalDetailsScreen';
import SpiritualFoundationScreen from '../screens/SpiritualFoundationScreen';
import EducationCareerScreen from '../screens/EducationCareerScreen';
import HonoringRootsScreen from '../screens/HonoringRootsScreen';
import LifestyleScreen from '../screens/LifestyleScreen';
import PartnerPreferencesScreen from '../screens/PartnerPreferencesScreen';
import ReviewProfileScreen from '../screens/ReviewProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MembershipScreen from '../screens/MembershipScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import Viewprofilescreen from '../screens/Viewprofilescreen';
import ShortlistScreen from '../screens/ShortlistScreen';
import SearchScreen from '../screens/SearchScreen';
import whoislikescreen from '../screens/whoislikescreen';
import Memberlistscreen from '../screens/Memberlistscreen';
import Galleryscreen from '../screens/Galleryscreen';
import Allimages from '../screens/Allimages';
import requesthistory from '../screens/requesthistory';
import receivehistory from '../screens/receivehistory';
const Stack = createNativeStackNavigator(); 

export default function AppNavigator() {

    const initialRoute = 'Splash';

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                {/* Auth & Setup */}
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Verification" component={VerificationScreen} />

                {/* Onboarding intro */}
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />

                {/* Profile setup steps */}
                <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
                <Stack.Screen name="SpiritualFoundation" component={SpiritualFoundationScreen} />
                <Stack.Screen name="EducationCareer" component={EducationCareerScreen} />
                <Stack.Screen name="HonoringRoots" component={HonoringRootsScreen} />
                <Stack.Screen name="Lifestyle" component={LifestyleScreen} />
                <Stack.Screen name="PartnerPreferences" component={PartnerPreferencesScreen} />
                <Stack.Screen name="ReviewProfile" component={ReviewProfileScreen} />
                <Stack.Screen name="ProfileDetailScreen" component={ProfileDetailScreen} />
                {/* Main App */}
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Matches" component={MatchesScreen} />
                <Stack.Screen name="Messages" component={MessagesScreen} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="Membership" component={MembershipScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
                <Stack.Screen name="ViewProfile" component={Viewprofilescreen} />
                <Stack.Screen name="Shortlist" component={ShortlistScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />

                <Stack.Screen name="whoislike" component={whoislikescreen} />
                <Stack.Screen name="member" component={Memberlistscreen} />

                <Stack.Screen name="Gallery" component={Galleryscreen } />
                 <Stack.Screen name="ViewImages" component={Allimages } />
                   <Stack.Screen name="req" component={requesthistory } />
                     <Stack.Screen name="rec" component={receivehistory } />
            </Stack.Navigator>
        </NavigationContainer>
    );
}