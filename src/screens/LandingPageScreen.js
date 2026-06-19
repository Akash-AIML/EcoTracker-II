import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS, SPACING } from '../theme/theme';
import { useResponsive } from '../hooks/useResponsive';
import { GlassCard } from '../components/GlassCard';
import { API_BASE, getHeaders } from '../config';

export function LandingPageScreen({ onStartCalculator }) {
  const { isDesktop } = useResponsive();

  // Landing Page Stats state from backend
  const [stats, setStats] = useState({
    globalReduction: '-14.2%',
    globalSavedTons: '12 Tons',
    activeProjectCount: '50,000+',
    treesRestoredCount: '8,000+',
    aiPrecision: '99.9%'
  });

  // Fetch stats on mount
  useEffect(() => {
    fetch(`${API_BASE}/stats`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setStats(data);
        }
      })
      .catch((err) => console.log('Error loading landing page stats:', err));
  }, []);

  // Floating animation for globe
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Pulsing scale for CTA glow
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Slide-in for live reduction widget
  const widgetAnim = useRef(new Animated.Value(0)).current;

  // Staggered animations for bento grid cards
  const cardAnims = useRef([
    new Animated.Value(0), // large card
    new Animated.Value(0), // vertical card
    new Animated.Value(0), // small card 1
    new Animated.Value(0), // small card 2
    new Animated.Value(0), // small card 3
  ]).current;

  useEffect(() => {
    // 1. Globe floating loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Pulse CTA loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Slide-in widget animation
    Animated.spring(widgetAnim, {
      toValue: 1,
      tension: 30,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // 4. Staggered card fade/slide-up
    const cardTimings = cardAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      })
    );
    Animated.stagger(120, cardTimings).start();
  }, []);

  const getAnimatedCardStyle = (index) => {
    return {
      opacity: cardAnims[index],
      transform: [
        {
          translateY: cardAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [40, 0],
          }),
        },
      ],
    };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {isDesktop ? (
        /* ================= DESKTOP LAYOUT ================= */
        <View style={styles.desktopWrapper}>
          {/* Hero Section */}
          <View style={styles.desktopHeroContainer}>
            <View style={styles.desktopHeroTextSide}>
              <View style={styles.badge}>
                <MaterialIcons name="eco" size={16} color={COLORS.primary} />
                <Text style={styles.badgeText}>NEXT-GEN CARBON INTELLIGENCE</Text>
              </View>
              <Text style={styles.desktopHeroTitle}>
                Understand Your{'\n'}
                <Text style={styles.gradientText}>Carbon Footprint</Text>
              </Text>
              <Text style={styles.desktopHeroDescription}>
                Track emissions, receive AI-powered insights, and build a greener future.
              </Text>
              <View style={styles.heroBtnGroup}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={onStartCalculator}>
                    <Text style={styles.primaryBtnText}>Calculate My Footprint</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>

            <View style={styles.desktopHeroGraphicSide}>
              <Animated.View style={[styles.glowBg, { transform: [{ scale: pulseAnim }] }]} />
              <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARn6LPgO5xyl1SYMESvfRFJ_QHX4-deMVJfFEy08qvNhxSsOptjhx-Iigx2GLU0wmocEvqJilo9lEz9WA235ci5zKt-rwHvD3Ljr_LWLBQn18zAHnjvCzaPQ0IWbBWa1mKgQM8tWpBcp9tfLDIK16fbSpto8P6iXJW8jnqwSv-OUg1iSBbL9nvTdwra8Ji6ZdTWJNu8Lnc6W7ubegZqVewLe59t5RHwRX-o2dSR3A6xOJKSNAhvxMNj5gProo2em903alVTcOr_3Ty' }}
                  style={styles.desktopGlobeImg}
                />
              </Animated.View>

              {/* Slide-in Live Reduction Widget */}
              <Animated.View style={[
                styles.liveReductionWidgetContainer,
                {
                  opacity: widgetAnim,
                  transform: [
                    {
                      translateX: widgetAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [120, 0],
                      }),
                    },
                  ],
                },
              ]}>
                <GlassCard style={styles.liveReductionWidget}>
                  <View style={styles.widgetHeader}>
                    <MaterialIcons name="trending-down" size={20} color={COLORS.secondary} />
                    <View>
                      <Text style={styles.widgetSub}>Live Reduction</Text>
                      <Text style={styles.widgetValue}>{stats.globalReduction}</Text>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            </View>
          </View>

          {/* Stats Ticker */}
          <View style={styles.statsTicker}>
            {[
              { label: 'FOOTPRINTS CALCULATED', val: stats.activeProjectCount },
              { label: 'CO₂ REDUCED', val: stats.globalSavedTons },
              { label: 'ACTIVE USERS', val: stats.treesRestoredCount },
              { label: 'AI PRECISION', val: stats.aiPrecision },
            ].map((stat, i) => (
              <View key={i} style={styles.tickerCol}>
                <Text style={styles.tickerLabel}>{stat.label}</Text>
                <Text style={styles.tickerVal}>{stat.val}</Text>
              </View>
            ))}
          </View>

          {/* Bento Grid Section (Three Glass Feature Cards) */}
          <View style={styles.bentoSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Understand. Track. Reduce.</Text>
              <Text style={styles.sectionSub}>Everything you need to quantify environmental impact and take climate action.</Text>
            </View>

            {/* Grid Layout (3 Column Feature Cards) */}
            <View style={styles.bentoGrid}>
              <View style={styles.gridRow}>
                <Animated.View style={[styles.flex4, getAnimatedCardStyle(2)]}>
                  <GlassCard style={styles.bentoCard}>
                    <View style={styles.iconCirclePrimary}>
                      <MaterialIcons name="eco" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.cardTitleSmall}>🌱 Track Emissions</Text>
                    <Text style={styles.cardDescSmall}>Monitor transport, energy, food, and waste emissions dynamically.</Text>
                  </GlassCard>
                </Animated.View>
                <Animated.View style={[styles.flex4, getAnimatedCardStyle(3)]}>
                  <GlassCard style={styles.bentoCard}>
                    <View style={styles.iconCircleSecondary}>
                      <MaterialIcons name="smart-toy" size={32} color={COLORS.secondary} />
                    </View>
                    <Text style={styles.cardTitleSmall}>🤖 AI Sustainability Coach</Text>
                    <Text style={styles.cardDescSmall}>Receive personalized recommendations to reduce your carbon impact.</Text>
                  </GlassCard>
                </Animated.View>
                <Animated.View style={[styles.flex4, getAnimatedCardStyle(4)]}>
                  <GlassCard style={styles.bentoCard}>
                    <View style={styles.iconCircleTertiary}>
                      <MaterialIcons name="workspace-premium" size={32} color={COLORS.tertiary} />
                    </View>
                    <Text style={styles.cardTitleSmall}>🏆 Green Challenges</Text>
                    <Text style={styles.cardDescSmall}>Earn rewards, badges, and compete with eco-conscious users on leaderboards.</Text>
                  </GlassCard>
                </Animated.View>
              </View>
            </View>
          </View>

          {/* CTA Banner */}
          <View style={styles.desktopCtaBg}>
            <GlassCard style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>Ready to lead the <Text style={{ color: COLORS.primary }}>Green Revolution</Text>?</Text>
              <Text style={styles.ctaDesc}>
                Join the 1,500+ enterprises and thousands of eco-conscious users using EcoTrack AI to reach Net Zero.
              </Text>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity style={styles.ctaBtn} onPress={onStartCalculator}>
                  <Text style={styles.ctaBtnText}>Calculate My Footprint</Text>
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.ctaCaption}>Takes less than 3 minutes. Secure SaaS platform.</Text>
            </GlassCard>
          </View>
        </View>
      ) : (
        /* ================= MOBILE LAYOUT ================= */
        <View style={styles.mobileWrapper}>
          {/* Header Bar */}
          <View style={styles.mobileHeader}>
            <View style={styles.logoAndText}>
              <View style={styles.mobileIconBox}>
                <MaterialIcons name="eco" size={18} color={COLORS.onPrimaryContainer} />
              </View>
              <Text style={styles.mobileLogoText}>EcoTrack AI</Text>
            </View>
            <TouchableOpacity style={styles.mobileNotifyBtn}>
              <MaterialIcons name="notifications" size={20} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Globe Image Floating */}
          <View style={styles.mobileGlobeContainer}>
            <Animated.View style={[styles.glowBgMobile, { transform: [{ scale: pulseAnim }] }]} />
            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARn6LPgO5xyl1SYMESvfRFJ_QHX4-deMVJfFEy08qvNhxSsOptjhx-Iigx2GLU0wmocEvqJilo9lEz9WA235ci5zKt-rwHvD3Ljr_LWLBQn18zAHnjvCzaPQ0IWbBWa1mKgQM8tWpBcp9tfLDIK16fbSpto8P6iXJW8jnqwSv-OUg1iSBbL9nvTdwra8Ji6ZdTWJNu8Lnc6W7ubegZqVewLe59t5RHwRX-o2dSR3A6xOJKSNAhvxMNj5gProo2em903alVTcOr_3Ty' }}
                style={styles.mobileGlobeImg}
              />
            </Animated.View>
          </View>

          {/* Title & Description */}
          <View style={styles.mobileHeroTextContainer}>
            <Text style={styles.mobileTitle}>ECOTRACK AI</Text>
            <Text style={styles.mobileSubtitle}>Understand Your Carbon Footprint</Text>
            <Text style={styles.mobileDesc}>
              Track emissions, receive AI-powered insights, and build a greener future.
            </Text>
            <Animated.View style={{ width: '100%', transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity style={styles.mobileJourneyBtn} onPress={onStartCalculator}>
                <Text style={styles.mobileJourneyBtnText}>Calculate My Footprint</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Stats Grid */}
          <View style={styles.mobileStatsGrid}>
            <GlassCard style={styles.mobileStatCell}>
              <Text style={styles.mobileStatValPrimary}>{stats.activeProjectCount}</Text>
              <Text style={styles.mobileStatLabel}>FOOTPRINTS CALCULATED</Text>
            </GlassCard>
            <GlassCard style={styles.mobileStatCell}>
              <Text style={styles.mobileStatValSecondary}>{stats.treesRestoredCount}</Text>
              <Text style={styles.mobileStatLabel}>ACTIVE USERS</Text>
            </GlassCard>
          </View>

          {/* Features Section */}
          <View style={styles.mobileFeaturesContainer}>
            <Text style={styles.mobileSectionTitle}>Ecosystem Features</Text>

            <Animated.View style={getAnimatedCardStyle(2)}>
              <GlassCard style={styles.mobileFeatureCard}>
                <View style={styles.iconCirclePrimary}>
                  <MaterialIcons name="eco" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureCardTitle}>🌱 Track Emissions</Text>
                  <Text style={styles.featureCardDesc}>
                    Monitor transport, energy, food, and waste emissions dynamically.
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            <Animated.View style={getAnimatedCardStyle(3)}>
              <GlassCard style={styles.mobileFeatureCard}>
                <View style={styles.iconCircleSecondary}>
                  <MaterialIcons name="smart-toy" size={24} color={COLORS.secondary} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureCardTitle}>🤖 AI Sustainability Coach</Text>
                  <Text style={styles.featureCardDesc}>
                    Receive personalized recommendations to reduce your carbon impact.
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            <Animated.View style={getAnimatedCardStyle(4)}>
              <GlassCard style={styles.mobileFeatureCard}>
                <View style={styles.iconCircleTertiary}>
                  <MaterialIcons name="workspace-premium" size={24} color={COLORS.tertiary} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureCardTitle}>🏆 Green Challenges</Text>
                  <Text style={styles.featureCardDesc}>
                    Earn rewards, points, badges, and compete with eco-conscious users.
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          </View>

          {/* Progress Visualizer */}
          <GlassCard style={styles.progressCard}>
            <Text style={styles.progressCardTitle}>Global Sustainability Progress</Text>
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Current: {stats.globalSavedTons} Reduced</Text>
              <Text style={styles.progressLabel}>Target: 100% Net Zero</Text>
            </View>
          </GlassCard>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100, // accommodate bottom navigations
  },

  /* ================= DESKTOP LAYOUT STYLES ================= */
  desktopWrapper: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 80, // space below top navbar
  },
  desktopHeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 500,
    marginBottom: 40,
  },
  desktopHeroTextSide: {
    flex: 1.2,
    alignItems: 'flex-start',
    gap: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
    borderColor: 'rgba(78, 222, 163, 0.2)',
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  desktopHeroTitle: {
    color: COLORS.onSurface,
    fontSize: 54,
    fontWeight: '800',
    lineHeight: 58,
    letterSpacing: -1,
  },
  gradientText: {
    color: COLORS.primary, // Web-friendly fallback
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, #4edea3 0%, #89ceff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
    }),
  },
  desktopHeroDescription: {
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 500,
  },
  heroBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    color: COLORS.onPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    borderColor: 'rgba(78, 222, 163, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  desktopHeroGraphicSide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 400,
  },
  glowBg: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: 'rgba(78, 222, 163, 0.15)',
    borderRadius: 9999,
    filter: 'blur(60px)',
    zIndex: 0,
  },
  glowBgMobile: {
    position: 'absolute',
    width: 140,
    height: 140,
    backgroundColor: 'rgba(78, 222, 163, 0.15)',
    borderRadius: 9999,
    filter: 'blur(40px)',
    zIndex: 0,
  },
  desktopGlobeImg: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
    zIndex: 2,
    ...Platform.select({
      web: {
        filter: 'drop-shadow(0 0 30px rgba(78, 222, 163, 0.4))',
      },
    }),
  },
  liveReductionWidgetContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  liveReductionWidget: {
    padding: 16,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  widgetSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  widgetValue: {
    color: COLORS.secondary,
    fontSize: 22,
    fontWeight: '700',
  },
  statsTicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(6, 14, 32, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 40,
    marginBottom: 64,
  },
  tickerCol: {
    alignItems: 'center',
  },
  tickerLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  tickerVal: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  bentoSection: {
    marginBottom: 64,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  sectionTitle: {
    color: COLORS.onSurface,
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
  },
  sectionSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 600,
  },
  bentoGrid: {
    gap: 24,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 24,
  },
  bentoCard: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    minHeight: 180,
    padding: 24,
  },
  flex7: { flex: 7 },
  flex5: { flex: 5 },
  flex4: { flex: 4 },
  iconCirclePrimary: {
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  iconCircleSecondary: {
    backgroundColor: 'rgba(137, 206, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  iconCircleTertiary: {
    backgroundColor: 'rgba(255, 185, 95, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  cardTitle: {
    color: COLORS.onSurface,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardImg: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  satelliteImg: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    resizeMode: 'cover',
    marginTop: 'auto',
  },
  cardTitleSmall: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardDescSmall: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
  },
  desktopCtaBg: {
    marginVertical: 40,
    position: 'relative',
  },
  ctaCard: {
    padding: 48,
    alignItems: 'center',
    backgroundColor: 'rgba(78, 222, 163, 0.03)',
    borderColor: 'rgba(78, 222, 163, 0.15)',
  },
  ctaTitle: {
    color: COLORS.onSurface,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 24,
    marginBottom: 32,
  },
  ctaBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  ctaBtnText: {
    color: COLORS.onPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  ctaCaption: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },

  /* ================= MOBILE LAYOUT STYLES ================= */
  mobileWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
    marginBottom: 16,
  },
  logoAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mobileIconBox: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 9999,
    padding: 6,
  },
  mobileLogoText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  mobileNotifyBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 9999,
  },
  mobileGlobeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    position: 'relative',
    marginBottom: 16,
  },
  mobileGlobeImg: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    zIndex: 2,
    ...Platform.select({
      web: {
        filter: 'drop-shadow(0 0 20px rgba(78, 222, 163, 0.45))',
      },
    }),
  },
  mobileHeroTextContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  mobileTitle: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, #4edea3 0%, #89ceff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
    }),
  },
  mobileSubtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 18,
    fontWeight: '600',
  },
  mobileDesc: {
    color: 'rgba(218, 226, 253, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  mobileJourneyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  mobileJourneyBtnText: {
    color: COLORS.onPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  mobileStatsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  mobileStatCell: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  mobileStatValPrimary: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  mobileStatValSecondary: {
    color: COLORS.secondary,
    fontSize: 24,
    fontWeight: '700',
  },
  mobileStatLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  mobileFeaturesContainer: {
    marginBottom: 40,
    gap: 16,
  },
  mobileSectionTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  mobileFeatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureTextCol: {
    flex: 1,
    gap: 4,
  },
  featureCardTitle: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
  featureCardDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
  },
  progressCard: {
    padding: 20,
    gap: 12,
  },
  progressCardTitle: {
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    width: '65%',
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
});
