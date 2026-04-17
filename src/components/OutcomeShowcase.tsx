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
import { ChevronLeft, ChevronRight, X, Heart, FileText, ImageIcon, Calendar, Shield } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface OutcomeShowcaseProps {
  description: string;
  images: string[];
  outcomeDate?: string;
  isApproved?: boolean;
}

function getFileType(url: string): 'pdf' | 'image' {
  const lower = url.toLowerCase();
  if (lower.endsWith('.pdf') || lower.includes('/pdf')) return 'pdf';
  return 'image';
}

export default function OutcomeShowcase({ description, images, outcomeDate, isApproved }: OutcomeShowcaseProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!description && (!images || images.length === 0)) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
          <Heart color="#ffffff" size={16} fill="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            {t('caseDetail.impactReport', { defaultValue: 'Impact Report' })}
          </Text>
          {isApproved && (
            <View style={styles.approvedRow}>
              <Shield color="#22C55E" size={12} />
              <Text style={{ color: '#22C55E', fontSize: 11, fontFamily: typography.fontFamily.medium }}>
                {t('landing.immutableProof', { defaultValue: 'Immutable Proof' })} • {t('landing.adminVetted', { defaultValue: 'Admin Vetted' })}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Outcome Date */}
      {outcomeDate && (
        <View style={[styles.dateBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Calendar color={colors.mutedForeground} size={14} />
          <Text style={[styles.dateText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {t('caseDetail.outcomeDate', { defaultValue: 'Outcome Date' })}: {format(new Date(outcomeDate), 'MMMM dd, yyyy')}
          </Text>
        </View>
      )}

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
            {images.map((img, idx) => {
              const fileType = getFileType(img);
              return (
                <TouchableOpacity
                  key={img}
                  activeOpacity={0.9}
                  onPress={() => fileType === 'image' ? setFullscreenImage(img) : null}
                >
                  {fileType === 'image' ? (
                    <View>
                      <Image
                        source={{ uri: img }}
                        style={[styles.image, { backgroundColor: colors.secondary }]}
                      />
                      {/* File type badge */}
                      <View style={[styles.typeBadge, { backgroundColor: '#3B82F6' }]}>
                        <ImageIcon color="#fff" size={10} />
                        <Text style={styles.typeBadgeText}>IMAGE</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.image, styles.pdfPlaceholder, { backgroundColor: colors.secondary }]}>
                      <FileText color={colors.mutedForeground} size={40} />
                      <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 8 }}>
                        {t('common.document', { defaultValue: 'Document' })} {idx + 1}
                      </Text>
                      {/* File type badge */}
                      <View style={[styles.typeBadge, { backgroundColor: '#EF4444' }]}>
                        <FileText color="#fff" size={10} />
                        <Text style={styles.typeBadgeText}>PDF</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
  approvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
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
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 13,
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
  pdfPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
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
