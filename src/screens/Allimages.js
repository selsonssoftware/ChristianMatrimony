import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  navy: '#12203A',
  bg: '#F6F3EE',
  gold: '#C9A84C',
  white: '#FFFFFF',
  text: '#1A1F2E',
  textSub: '#5E6577',
  border: '#EAE3D6',
  overlay: 'rgba(0,0,0,0.85)',
  success: '#19A87A',
  danger: '#D04E28',
};

const RADIUS = { sm: 10, md: 14, lg: 20 };
const FONT = { sm: 11, md: 14, lg: 16, xl: 18, xxl: 20 };

const BASE_URL = 'https://matrimony.gmworld.net';

export default function UserImagesScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  const { userId, userName } = route?.params || {};
   
  // States
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageCount, setImageCount] = useState(0);
  const [error, setError] = useState(null);

  // Fetch Gallery
  const fetchGallery = async () => {
    if (!userId) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint = `${BASE_URL}/api/getgallery/${userId}`;

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } 

      const res = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      const result = await res.json();

      if (result.status === true || result.success === true) {
        
        let imagesList = [];

        // 👇 FIXED: The backend sends a stringified array (e.g. "[\"url1\", \"url2\"]")
        // We must parse it back into a real JavaScript array.
        if (typeof result.images === 'string') {
          try {
            imagesList = JSON.parse(result.images);
          } catch (parseError) {
            console.error('[Gallery] Failed to parse stringified array:', parseError);
            imagesList = [];
          }
        } else if (Array.isArray(result.images)) {
          // Fallback just in case backend gets updated later to send a real array
          imagesList = result.images;
        }

        setImages(imagesList);
        setImageCount(imagesList.length);
      } else {
        setImages([]);
        setImageCount(0);
        setError(result.message || 'Failed to load gallery');
      }
    } catch (error) {
      console.error('[Gallery] Fetch Error:', error);
      setError('Failed to load gallery. Please try again.');
      setImages([]);
      setImageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      fetchGallery();
    }, [userId])
  );

  // Resolve image URL correctly
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
  };

  // ─── UI Components ────────────────────────────────────────────────────────────

  const renderImageItem = ({ item, index }) => {
    const uri = getFullImageUrl(item);
    if (!uri) return null;

    return (
      <TouchableOpacity
        style={styles.imageWrap}
        activeOpacity={0.75}
        onPress={() => setSelectedImage(uri)}
      >
        <Image
          source={{ uri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>🖼️</Text>
      <Text style={styles.emptyTitle}>No Images Found</Text>
      <Text style={styles.emptySub}>
        This user hasn't uploaded any gallery images yet.
      </Text>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.errorWrap}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Unable to Load Gallery</Text>
      <Text style={styles.errorSub}>{error}</Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={fetchGallery}
      >
        <Text style={styles.retryBtnTxt}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.backTxt}>‹ Back</Text>
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.headerTitle}>{userName || 'Gallery'}</Text>
        {imageCount > 0 && (
          <Text style={styles.headerSubtitle}>
            {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
          </Text>
        )}
      </View>
      <View style={{ width: 60 }} />
    </View>
  );

  const FullscreenModal = () => (
    <Modal
      visible={!!selectedImage}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setSelectedImage(null)}
    >
      <View style={styles.modalBg}>
        <SafeAreaView style={{ flex: 1 }}>
          <Pressable
            style={styles.modalHeader}
            onPress={() => setSelectedImage(null)}
          >
            <View style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕ Close</Text>
            </View>
          </Pressable>

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.navy}
        translucent={false}
      />

      <Header />

      {/* Main Content */}
      {loading ? (
        <View style={styles.centerLoad}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Loading Gallery...</Text>
        </View>
      ) : error ? (
        <ErrorState />
      ) : images.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item, index) => `image_${userId}_${index}`}
          numColumns={2}
          contentContainerStyle={styles.gridPad}
          columnWrapperStyle={{ gap: 10, justifyContent: 'space-between' }}
          renderItem={renderImageItem}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        />
      )}

      <FullscreenModal />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 8,
  },
  backTxt: {
    color: COLORS.gold,
    fontSize: FONT.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: FONT.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT.sm,
    color: COLORS.gold,
    marginTop: 2,
    fontWeight: '600',
  },
  centerLoad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: FONT.md,
    color: COLORS.textSub,
    fontWeight: '500',
    marginTop: 8,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SH * 0.15,
    paddingHorizontal: 30,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: FONT.xl,
    fontWeight: '800',
    color: COLORS.danger,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: FONT.md,
    color: COLORS.textSub,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  retryBtnTxt: {
    color: COLORS.navy,
    fontWeight: '700',
    fontSize: FONT.md,
  },
  gridPad: {
    padding: 10,
    paddingBottom: 40,
  },
  imageWrap: {
    flex: 1,
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SH * 0.15,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: FONT.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FONT.md,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBg: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  modalHeader: {
    alignItems: 'flex-end',
    padding: 12,
    paddingRight: 16,
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
  },
  closeTxt: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT.md,
    letterSpacing: 0.3,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});