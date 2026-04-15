import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, FolderHeart, User, ShieldAlert, MessageSquare } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import CasesScreen from '../screens/CasesScreen';
import ProfileScreen from '../screens/ProfileScreen';
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

const Tab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function TabNavigator() {
  const { colors, typography } = useTheme();
  const { profile } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          fontFamily: typography.fontFamily.heading,
          color: colors.text,
        },
        headerRight: () => <NotificationBell />,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          title: 'Explore',
        }}
      />
      <Tab.Screen 
        name="Cases" 
        component={CasesScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <FolderHeart color={color} size={size} />,
          title: 'Cases',
        }}
      />
      {profile?.role === 'admin' && (
        <Tab.Screen 
          name="AdminQueue" 
          component={AdminQueueScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <ShieldAlert color={color} size={size} />,
            title: 'Verify',
          }}
        />
      )}
      <Tab.Screen 
        name="Inbox" 
        component={InboxScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
          title: 'Messages',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
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
    </MainStack.Navigator>
  );
}

export default function RootNavigator() {
  const { colors } = useTheme();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
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
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </AuthStack.Navigator>
    </NavigationContainer>
  );
}
