import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, ShieldCheck, HelpCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import LandingHero from '../components/landing/LandingHero';
import HowItWorks from '../components/landing/HowItWorks';
import HorizontalCaseList from '../components/landing/HorizontalCaseList';
import TrustSection from '../components/landing/TrustSection';
import ImpactPreview from '../components/landing/ImpactPreview';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabType = 'EXPLORE' | 'TRUST' | 'ABOUT';

export default function LandingScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('EXPLORE');

  const handleTabChange = (tabId: TabType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tabId);
  };

  const TABS = [
    { id: 'EXPLORE' as TabType, label: t('home.allCases'), icon: Flame },
    { id: 'TRUST' as TabType, label: t('landing.verified'), icon: ShieldCheck },
    { id: 'ABOUT' as TabType, label: t('landing.badge'), icon: HelpCircle },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'EXPLORE':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContentScroll}>
            <HorizontalCaseList onCasePress={() => navigation.navigate('Login')} />
            <ImpactPreview onPressItem={() => navigation.navigate('Login')} />
            <View style={{ height: 40 }} />
          </ScrollView>
        );
      case 'TRUST':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContentScroll}>
            <TrustSection />
            <View style={{ height: 40 }} />
          </ScrollView>
        );
      case 'ABOUT':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContentScroll}>
            <HowItWorks />
            <View style={{ height: 40 }} />
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Section (Always visible, condensed) */}
      <LandingHero 
        onPrimaryAction={() => navigation.navigate('Login')}
        onSecondaryAction={() => navigation.navigate('Login')}
      />

      {/* Discovery Zone - Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: colors.secondary + '30', borderColor: colors.border }]}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabChange(tab.id)}
              style={[
                styles.tabItem,
                isActive && { backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }
              ]}
              activeOpacity={0.7}
            >
              <Icon color={isActive ? colors.primary : colors.mutedForeground} size={16} strokeWidth={2.5} />
              <Text style={[
                styles.tabLabel, 
                { 
                  color: isActive ? colors.text : colors.mutedForeground,
                  fontFamily: isActive ? typography.fontFamily.medium : typography.fontFamily.regular 
                }
              ]}>
                {tab.id === 'ABOUT' ? 'How' : tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Discovery Viewport */}
      <View style={styles.contentArea}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  tabLabel: {
    fontSize: 13,
  },
  contentArea: {
    flex: 1,
  },
  tabContentScroll: {
    paddingBottom: 20,
  },
});
