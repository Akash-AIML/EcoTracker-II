import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/theme/theme';
import { useResponsive } from './src/hooks/useResponsive';
import { TopNavBar } from './src/components/TopNavBar';
import { BottomTabBar } from './src/components/BottomTabBar';
import { getUserId, API_BASE, getHeaders } from './src/config';

// Import Screens
import { AuthScreen } from './src/screens/AuthScreen';
import { LandingPageScreen } from './src/screens/LandingPageScreen';
import { CarbonCalculatorScreen } from './src/screens/CarbonCalculatorScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { GamificationScreen } from './src/screens/GamificationScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { MarketplaceScreen } from './src/screens/MarketplaceScreen';

export default function App() {
  const { isDesktop } = useResponsive();
  const [activeTab, setActiveTab] = useState('home'); // home, calculate, analytics, projects, marketplace, impact

  const currentUserId = getUserId();

  const [cachedProfile, setCachedProfile] = useState(null);
  const [cachedConfig, setCachedConfig] = useState(null);
  const [cachedLeaderboard, setCachedLeaderboard] = useState(null);

  // Preload and cache profile, config, and leaderboard on startup / user changes
  useEffect(() => {
    if (currentUserId) {
      fetch(`${API_BASE}/config`, { headers: getHeaders() })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) setCachedConfig(data);
        })
        .catch((err) => console.log('Error caching config:', err));

      fetch(`${API_BASE}/profile`, { headers: getHeaders() })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) setCachedProfile(data);
        })
        .catch((err) => console.log('Error caching profile:', err));

      fetch(`${API_BASE}/leaderboard`, { headers: getHeaders() })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) setCachedLeaderboard(data);
        })
        .catch((err) => console.log('Error caching leaderboard:', err));
    }
  }, [currentUserId]);

  if (!currentUserId) {
    return (
      <SafeAreaView style={styles.appContainer}>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <AuthScreen onLoginSuccess={() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }} />
      </SafeAreaView>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPageScreen onStartCalculator={() => setActiveTab('calculate')} setActiveTab={setActiveTab} />;
      case 'calculate':
        return (
          <CarbonCalculatorScreen
            onBackHome={() => setActiveTab('home')}
            setCachedProfile={setCachedProfile}
            setCachedLeaderboard={setCachedLeaderboard}
          />
        );
      case 'analytics':
        return <InsightsScreen setActiveTab={setActiveTab} />;
      case 'projects':
        return <ProjectsScreen setActiveTab={setActiveTab} />;
      case 'marketplace':
        return (
          <MarketplaceScreen
            setActiveTab={setActiveTab}
            cachedProfile={cachedProfile}
            setCachedProfile={setCachedProfile}
            setCachedLeaderboard={setCachedLeaderboard}
          />
        );
      case 'impact':
        return (
          <GamificationScreen
            setActiveTab={setActiveTab}
            cachedProfile={cachedProfile}
            setCachedProfile={setCachedProfile}
            cachedLeaderboard={cachedLeaderboard}
            setCachedLeaderboard={setCachedLeaderboard}
          />
        );
      default:
        return <LandingPageScreen onStartCalculator={() => setActiveTab('calculate')} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      
      {/* Show top header navbar on desktop screens only */}
      {isDesktop && (
        <TopNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Screen Content Wrapper */}
      <View style={[styles.contentContainer, isDesktop && styles.desktopPaddingTop]}>
        {renderActiveScreen()}
      </View>

      {/* Show bottom tabbar navigation on mobile screens only */}
      {!isDesktop && (
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  desktopPaddingTop: {
    paddingTop: 64, // accounts for the fixed TopNavBar height
  },
});
