import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, Image, StyleSheet, TouchableOpacity,
    Animated, StatusBar, Platform, ScrollView, Dimensions
} from 'react-native';

import {

  SafeAreaView,
 
} from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
const IMG_HEIGHT = 420;

// Color palette extracted exactly from the design image
const BRAND_SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';
const COLOR_DARK = '#1A1C24';
const COLOR_MUTED = '#7D8494';
const COLOR_MAROON = '#8B263E';
const COLOR_GOLD = '#C9960C';
const COLOR_GOLD_LIGHT = '#FFF9ED';
const COLOR_GREEN = '#27AE60';

export default function ProfizleDetailScreen({ route, navigation }) {
    // Graceful fallbacks provided to display the design dataset if no route params exist
    const user = route?.params?.user || {
        name: 'Sarah Grace Johnson',
        age: 27,
        height: "5'5\" (165cm)",
        status: 'Never Married',
        language: 'English',
        loc: 'Chennai, India',
        score: '95%',
        verified: true,
        denom: 'Protestant (CSI)',
        job: 'Software Engineer',
        company: 'Leading IT Company',
        edu: 'M.S. Computer Science',
        income: '₹8-12 Lakhs',
        churchActivity: 'Active Member',
        fatherJob: 'Businessman',
        motherJob: 'Homemaker',
        familyStatus: 'Upper Middle Class',
        about: '“God-fearing, family-oriented Christian seeking a faithful life partner who values faith, love, and commitment. Passionate about serving the church and building a Christ-centered family.”'
    };

    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(30)).current;
    const scaleImg = useRef(new Animated.Value(1)).current;

    const [liked, setLiked] = useState(false);
    const heartScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const toggleLike = () => {
        setLiked(prev => !prev);
        Animated.sequence([
            Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true }),
            Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
        ]).start();
    };

    // Gallery images mock list matching the photo gallery visual reel
    const galleryPhotos = [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300',
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=300'
    ];

    return (
        <SafeAreaView style={styles.root} edges={['top','bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

            {/* Solid Fixed Navigation Header matching image layout */}
            <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) }]}>
                <TouchableOpacity style={styles.navAction} onPress={() => navigation.goBack()}>
                    <Text style={styles.navIconText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>View Profile</Text>
                <TouchableOpacity style={styles.navAction}>
                    <Text style={styles.navIconText}>⋮</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Hero Image Section Container */}
                <Animated.View style={[styles.heroContainer, { transform: [{ scale: scaleImg }] }]}>
                    <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=600' }} 
                        style={styles.heroImg} 
                    />
                    
                    {/* Top Right Strategic Stacked Badges */}
                    <View style={styles.badgeColumnStack}>
                        <View style={styles.verifiedPill}>
                            <Text style={styles.verifiedPillText}>✓ Verified</Text>
                        </View>
                        <View style={styles.premiumPill}>
                            <Text style={styles.premiumPillText}>👑 PREMIUM MEMBER</Text>
                        </View>
                    </View>

                    {/* Bottom Floating Identity Box Overlay & Score Card */}
                    <View style={styles.identityOverlayRow}>
                        <View style={styles.identityTextContainer}>
                            <Text style={styles.identityNameText}>{user.name}</Text>
                            <Text style={styles.identityLocationText}>📍 {user.loc}</Text>
                        </View>
                        
                        <View style={styles.matchScoreCard}>
                            <Text style={styles.matchScoreLabel}>MATCH SCORE</Text>
                            <Text style={styles.matchScoreValue}>{user.score}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Main Body Wrapped Container with Entry Fade Transitions */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUp }] }}>
                    
                    {/* 1. Core Profile Attribute Quick Grid */}
                    <View style={styles.quickGridContainer}>
                        <View style={styles.gridQuadBox}>
                            <Text style={styles.gridQuadLabel}>AGE</Text>
                            <Text style={styles.gridQuadValue}>{user.age} Years</Text>
                        </View>
                        <View style={styles.gridQuadBox}>
                            <Text style={styles.gridQuadLabel}>HEIGHT</Text>
                            <Text style={styles.gridQuadValue}>{user.height}</Text>
                        </View>
                        <View style={styles.gridQuadBox}>
                            <Text style={styles.gridQuadLabel}>STATUS</Text>
                            <Text style={styles.gridQuadValue}>{user.status}</Text>
                        </View>
                        <View style={styles.gridQuadBox}>
                            <Text style={styles.gridQuadLabel}>LANGUAGE</Text>
                            <Text style={styles.gridQuadValue}>{user.language}</Text>
                        </View>
                    </View>

                    {/* 2. About Me Block */}
                    <View style={styles.plainSectionBlock}>
                        <Text style={styles.sectionHeadingTitle}>About Me</Text>
                        <Text style={styles.aboutParagraphText}>{user.about}</Text>
                    </View>

                    {/* 3. Card-Based Grouped Information Sections */}
                    {/* Section: Professional Life */}
                    <Text style={styles.groupedSectionLabel}>💼 Professional Life</Text>
                    <View style={styles.infoCardWrapper}>
                        <View style={styles.dataRowItem}>
                            <View>
                                <Text style={styles.dataInputLabel}>OCCUPATION</Text>
                                <Text style={styles.dataInputValue}>{user.job}</Text>
                                <Text style={styles.dataSubValueText}>{user.company}</Text>
                            </View>
                        </View>
                        <View style={styles.rowDividerLine} />
                        <View style={styles.dataRowItem}>
                            <View>
                                <Text style={styles.dataInputLabel}>EDUCATION</Text>
                                <Text style={styles.dataInputValue}>{user.edu}</Text>
                            </View>
                        </View>
                        <View style={styles.rowDividerLine} />
                        <View style={styles.dataRowItem}>
                            <View>
                                <Text style={styles.dataInputLabel}>ANNUAL INCOME</Text>
                                <Text style={[styles.dataInputValue, { color: COLOR_MAROON }]}>{user.income}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Section: Faith & Spiritual Life */}
                    <Text style={styles.groupedSectionLabel}>⛪ Faith & Spiritual Life</Text>
                    <View style={styles.infoCardWrapper}>
                        <View style={styles.dataRowItemHorizontal}>
                            <Text style={styles.horizontalLabelText}>Denomination</Text>
                            <Text style={[styles.horizontalValueText, { color: COLOR_MAROON }]}>{user.denom}</Text>
                        </View>
                        <View style={styles.rowDividerLine} />
                        <View style={styles.dataRowItemHorizontal}>
                            <Text style={styles.horizontalLabelText}>Baptized</Text>
                            <View style={styles.checkedCircleIcon}>
                                <Text style={styles.checkmarkSymbol}>✓</Text>
                            </View>
                        </View>
                        <View style={styles.rowDividerLine} />
                        <View style={styles.dataRowItemHorizontal}>
                            <Text style={styles.horizontalLabelText}>Church Activity</Text>
                            <Text style={styles.horizontalValueText}>{user.churchActivity}</Text>
                        </View>
                    </View>

                    {/* Section: Family Roots */}
                    <Text style={styles.groupedSectionLabel}>👥 Family Roots</Text>
                    <View style={styles.infoCardWrapper}>
                        <View style={styles.dataRowItemHorizontal}>
                            <Text style={styles.horizontalLabelText}>Father's Occupation</Text>
                            <Text style={styles.horizontalValueText}>{user.fatherJob}</Text>
                        </View>
                        <View style={styles.rowDividerLine} />
                        <View style={styles.dataRowItemHorizontal}>
                            <Text style={styles.horizontalLabelText}>Mother's Occupation</Text>
                            <Text style={styles.horizontalValueText}>{user.motherJob}</Text>
                        </View>
                        <View style={styles.rowDividerLine} />
                        <View style={styles.dataRowItemHorizontal}>
                            <Text style={styles.horizontalLabelText}>Family Status</Text>
                            <Text style={styles.horizontalValueText}>{user.familyStatus}</Text>
                        </View>
                    </View>

                    {/* 4. Horizontal Photo Gallery Reel */}
                    <View style={styles.galleryHeaderTitleRow}>
                        <Text style={styles.gallerySectionHeading}>Photo Gallery</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllActionLink}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryHorizontalScroll}>
                        {galleryPhotos.map((url, index) => (
                            <Image key={index} source={{ uri: url }} style={styles.galleryThumbnailImage} />
                        ))}
                    </ScrollView>

                    {/* 5. Partner Preferences Block Component */}
                    <Text style={styles.groupedSectionLabel}>💚 Partner Preferences</Text>
                    <View style={styles.partnerPreferencesContainerBlock}>
                        <View style={styles.preferenceInnerCard}>
                            <Text style={styles.preferenceLabelTag}>AGE RANGE</Text>
                            <Text style={styles.preferenceValueText}>25 - 32 Years</Text>
                        </View>
                        <View style={styles.preferenceInnerCard}>
                            <Text style={styles.preferenceLabelTag}>FAITH</Text>
                            <Text style={styles.preferenceValueText}>Christian (Strictly)</Text>
                        </View>
                        <View style={styles.preferenceInnerCard}>
                            <Text style={styles.preferenceLabelTag}>HABITS</Text>
                            <Text style={styles.preferenceValueText}>Non-Smoker / Non-Drinker</Text>
                        </View>
                    </View>

                    {/* Screen Bottom Layout Floating Actions */}
                    <View style={styles.actionButtonsWrapperRow}>
                        <Animated.View style={{ transform: [{ scale: heartScale }], flex: 1 }}>
                            <TouchableOpacity 
                                style={[styles.actionButtonBase, styles.secondaryFavoriteButton, liked && styles.activeFavoriteButtonBg]} 
                                onPress={toggleLike} 
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.secondaryButtonText, liked && { color: '#FFFFFF' }]}>
                                    {liked ? '❤️ Shortlisted' : '♡ Shortlist'}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <TouchableOpacity 
                            style={[styles.actionButtonBase, styles.primaryMessageButton]}
                            onPress={() => navigation.navigate('Messages')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.primaryButtonText}>✉ Send Message</Text>
                        </TouchableOpacity>
                    </View>

                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#FCFBF9',
    },
    headerBar: {
        height: 75,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F7',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLOR_DARK,
        fontFamily: BRAND_SERIF,
    },
    navAction: {
        padding: 6,
    },
    navIconText: {
        fontSize: 22,
        color: COLOR_DARK,
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 50,
    },
    heroContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        height: IMG_HEIGHT,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#EAEAEA',
    },
    heroImg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    badgeColumnStack: {
        position: 'absolute',
        top: 16,
        right: 16,
        alignItems: 'flex-end',
        gap: 8,
    },
    verifiedPill: {
        backgroundColor: '#FED36A',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    verifiedPillText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLOR_DARK,
    },
    premiumPill: {
        backgroundColor: 'rgba(146, 114, 56, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FED36A',
    },
    premiumPillText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FED36A',
        letterSpacing: 0.5,
    },
    identityOverlayRow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        paddingHorizontal: 20,
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    identityTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    identityNameText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: BRAND_SERIF,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    identityLocationText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginTop: 4,
        fontWeight: '500',
    },
    matchScoreCard: {
        backgroundColor: 'rgba(253, 235, 237, 0.85)',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    matchScoreLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: COLOR_MAROON,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    matchScoreValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLOR_MAROON,
    },
    quickGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#EFECE6',
    },
    gridQuadBox: {
        width: '50%',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    gridQuadLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: COLOR_MUTED,
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    gridQuadValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLOR_DARK,
    },
    plainSectionBlock: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionHeadingTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLOR_MAROON,
        marginBottom: 10,
        fontFamily: BRAND_SERIF,
    },
    aboutParagraphText: {
        fontSize: 14,
        color: '#4A4E5A',
        lineHeight: 22,
        fontStyle: 'italic',
    },
    groupedSectionLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: COLOR_DARK,
        paddingHorizontal: 20,
        marginTop: 28,
        marginBottom: 12,
    },
    infoCardWrapper: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EFECE6',
        paddingVertical: 6,
    },
    dataRowItem: {
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    dataInputLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: COLOR_MUTED,
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    dataInputValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLOR_DARK,
    },
    dataSubValueText: {
        fontSize: 12,
        color: COLOR_MUTED,
        marginTop: 2,
    },
    rowDividerLine: {
        height: 1,
        backgroundColor: '#F5F0E8',
        marginHorizontal: 20,
    },
    dataRowItemHorizontal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    horizontalLabelText: {
        fontSize: 14,
        color: COLOR_MUTED,
        fontWeight: '500',
    },
    horizontalValueText: {
        fontSize: 14,
        color: COLOR_DARK,
        fontWeight: '600',
    },
    checkedCircleIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(39, 174, 96, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkSymbol: {
        color: COLOR_GREEN,
        fontSize: 12,
        fontWeight: 'bold',
    },
    galleryHeaderTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 28,
        marginBottom: 12,
    },
    gallerySectionHeading: {
        fontSize: 16,
        fontWeight: '700',
        color: COLOR_DARK,
    },
    viewAllActionLink: {
        fontSize: 13,
        fontWeight: '600',
        color: COLOR_MAROON,
    },
    galleryHorizontalScroll: {
        paddingLeft: 16,
        paddingRight: 8,
        gap: 12,
    },
    galleryThumbnailImage: {
        width: 140,
        height: 180,
        borderRadius: 16,
        resizeMode: 'cover',
    },
    partnerPreferencesContainerBlock: {
        backgroundColor: COLOR_GOLD_LIGHT,
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#F4EAD4',
    },
    preferenceInnerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#FDF9F0',
    },
    preferenceLabelTag: {
        fontSize: 9,
        fontWeight: '700',
        color: COLOR_MUTED,
        letterSpacing: 0.6,
        marginBottom: 3,
    },
    preferenceValueText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOR_DARK,
    },
    actionButtonsWrapperRow: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 16,
        marginTop: 32,
        marginBottom: 16,
    },
    actionButtonBase: {
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    secondaryFavoriteButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E0DBCE',
    },
    activeFavoriteButtonBg: {
        backgroundColor: COLOR_MAROON,
        borderColor: COLOR_MAROON,
    },
    primaryMessageButton: {
        flex: 1.3,
        backgroundColor: COLOR_DARK,
        borderWidth: 1.5,
        borderColor: COLOR_GOLD,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#555A64',
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
});