import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ChevronLeft, ChevronRight, X, Heart } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

interface OutcomeShowcaseProps {
  description: string;
  images: string[];
}

export default function OutcomeShowcase({ description, images }: OutcomeShowcaseProps) {
  const { colors, typography } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!description && (!images || images.length === 0)) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
          <Heart color="#ffffff" size={16} fill="#ffffff" />
        </View>
        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          The Impact Story
        </Text>
      </View>

      {images && images.length > 0 && (
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveIndex(Math.round(x / (width - 64)));
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, idx) => (
              <TouchableOpacity
                key={img}
                activeOpacity={0.9}
                onPress={() => setFullscreenImage(img)}
              >
                <Image
                  source={{ uri: img }}
                  style={[styles.image, { backgroundColor: colors.secondary }]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    { backgroundColor: idx === activeIndex ? colors.primary : colors.mutedForeground + '40' }
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.storyText, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
          {description}
        </Text>
      </View>

      {/* Fullscreen Overlay */}
      <Modal visible={!!fullscreenImage} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalClose} 
            onPress={() => setFullscreenImage(null)}
          >
            <X color="#fff" size={28} />
          </TouchableOpacity>
          {fullscreenImage && (
            <Image source={{ uri: fullscreenImage }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
  },
  imageSection: {
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: width - 64, // container width minus padding
    height: 220,
    borderRadius: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  content: {
    paddingHorizontal: 4,
  },
  storyText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});
