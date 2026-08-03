import React from 'react';
// Navigation configuration for Kafil App
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, FolderHeart, User, ShieldAlert, MessageSquare, Award, Compass, Bell } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
import { useAuth } from '../supabase/AuthContext';
import { useChat } from '../supabase/ChatContext';
import { useNotifications } from '../supabase/NotificationsContext';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CasesScreen from '../screens/CasesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import CreateCaseScreen from '../screens/cases/CreateCaseScreen';
import SubmissionSuccessScreen from '../screens/cases/SubmissionSuccessScreen';

import AdminQueueScreen from '../screens/admin/AdminQueueScreen';
import AdminCaseVerificationScreen from '../screens/admin/AdminCaseVerificationScreen';
import AdminContributionsScreen from '../screens/admin/AdminContributionsScreen';
import AdminContributionDetailScreen from '../screens/admin/AdminContributionDetailScreen';
import AdminCompletionQueueScreen from '../screens/admin/AdminCompletionQueueScreen';
import AdminCaseCompletionDetailScreen from '../screens/admin/AdminCaseCompletionDetailScreen';
import CaseDetailScreen from '../screens/cases/CaseDetailScreen';
import FundCaseScreen from '../screens/cases/FundCaseScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import InboxScreen from '../screens/InboxScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import NotificationBell from '../components/NotificationBell';
import SubmitCompletionProofScreen from '../screens/cases/SubmitCompletionProofScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import AddPaymentMethodScreen from '../screens/AddPaymentMethodScreen';

const Tab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function TabNavigator() {
  const { colors, typography } = useTheme();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.accent, // Gold
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface, // White tab bar
          borderTopColor: colors.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: colors.surface, // White header
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontFamily: typography.fontFamily.heading,
          fontSize: typography.size.section,
          color: colors.textPrimary, // Navy title
        },
        headerTintColor: colors.textPrimary,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Home color={color} size={size} />,
          title: t('tabs.home', { defaultValue: 'Home' }),
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Compass color={color} size={size} />,
          title: t('tabs.explore', { defaultValue: 'Explore' }),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Award color={color} size={size} />,
          title: t('tabs.history'),
        }}
      />
      {profile?.role === 'admin' && (
        <Tab.Screen 
          name="AdminQueue" 
          component={AdminQueueScreen} 
          options={{
            tabBarIcon: ({ color, size }: { color: string; size: number }) => <ShieldAlert color={color} size={size} />,
            title: t('tabs.verify'),
          }}
        />
      )}
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Bell color={color} size={size} />,
          title: t('tabs.notifications', { defaultValue: 'Notifications' }),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.textOnPrimary },
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <User color={color} size={size} />,
          title: t('tabs.profile'),
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Tabs" component={TabNavigator} />
      <MainStack.Screen
        name="CreateCase"
        component={CreateCaseScreen}
        options={{ presentation: 'modal' }}
      />
      <MainStack.Screen 
        name="SubmissionSuccess" 
        component={SubmissionSuccessScreen}
      />
      <MainStack.Screen 
        name="AdminCaseVerification" 
        component={AdminCaseVerificationScreen}
      />
      <MainStack.Screen 
        name="AdminContributions" 
        component={AdminContributionsScreen}
      />
      <MainStack.Screen 
        name="AdminContributionDetail" 
        component={AdminContributionDetailScreen}
      />
      <MainStack.Screen 
        name="AdminCompletionQueue" 
        component={AdminCompletionQueueScreen}
      />
      <MainStack.Screen 
        name="AdminCaseCompletionDetail" 
        component={AdminCaseCompletionDetailScreen}
      />
      <MainStack.Screen 
        name="CaseDetail" 
        component={CaseDetailScreen}
      />
      <MainStack.Screen 
        name="FundCase" 
        component={FundCaseScreen}
        options={{ presentation: 'modal' }}
      />
      <MainStack.Screen 
        name="SubmitCompletionProof" 
        component={SubmitCompletionProofScreen}
        options={{ presentation: 'modal' }}
      />
      <MainStack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ headerShown: true, title: 'Notifications' }}
      />
      <MainStack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen}
        options={{ headerShown: true }}
      />
      <MainStack.Screen 
        name="AccountSettings" 
        component={AccountSettingsScreen}
        options={{ headerShown: true, title: 'Account Settings' }}
      />
      <MainStack.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsScreen}
        options={{ headerShown: true, title: 'Payment Methods' }}
      />
      <MainStack.Screen 
        name="AddPaymentMethod" 
        component={AddPaymentMethodScreen}
        options={{ headerShown: true, title: 'Add Account', presentation: 'modal' }}
      />
    </MainStack.Navigator>
  );
}

export default function RootNavigator() {
  const { colors } = useTheme();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <AuthStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <>
            <AuthStack.Screen name="Landing" component={LandingScreen} />
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </AuthStack.Navigator>
    </NavigationContainer>
  );
}
