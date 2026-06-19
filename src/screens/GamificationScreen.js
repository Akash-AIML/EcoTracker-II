import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  TextInput,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS, SPACING } from '../theme/theme';
import { useResponsive } from '../hooks/useResponsive';
import { GlassCard } from '../components/GlassCard';
import { API_BASE, getHeaders, getUserId, setUserId } from '../config';

export function GamificationScreen({ setActiveTab, cachedProfile, setCachedProfile, cachedLeaderboard, setCachedLeaderboard }) {
  const { isDesktop } = useResponsive();

  const currentUserId = getUserId();
  const [showMobileSwitcher, setShowMobileSwitcher] = useState(false);
  const [showMobileCreate, setShowMobileCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSwitchUserMobile = (id) => {
    setUserId(id);
    setShowMobileSwitcher(false);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleCreateUserMobile = () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newName.trim(),
        email: newEmail.trim()
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setIsCreating(false);
        if (data && data.success) {
          setShowMobileSwitcher(false);
          setShowMobileCreate(false);
          setNewName('');
          setNewEmail('');
          setUserId(data.userId);
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        } else {
          alert(data.error || 'Failed to create user');
        }
      })
      .catch((err) => {
        setIsCreating(false);
        console.log('Error creating user on mobile:', err);
        alert('Network error, please try again.');
      });
  };

  // State from server
  const [profile, setProfile] = useState({
    name: 'Sarah J.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT1EPgeHbiCyiDKLGp868IabVBLWQJe-FbA4S09aQJipuS6tXAJnHYJnoD4VL-TBLlnzm4xoCEkS_WlOmVhbeXjuNHry4GZPGKfJ5_iQ8X-fVs2ZENwqa0MK2sTi6dgD_hmctOs2tY1U0dbsRFDclOP1Sy81nI9zy56ULwxCR3EAsmngeA71gDstnUUoOs0PVxPurXRdI32iJ5ScLE0CjWgOYh6n808_7lSn7PlX4m0EkobLUHN1beT5h43E4UGhZjiUdK2JjYPK9R',
    title: 'Master Guardian',
    points: 12450,
    badges: ['Tree Planter', 'Carbon Ninja', 'Zero Waste']
  });

  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([
    { name: 'Tree Planter', icon: 'forest', color: COLORS.primary, active: true },
    { name: 'Carbon Ninja', icon: 'shutter-speed', color: COLORS.secondary, active: true },
    { name: 'Ocean Guard', icon: 'water-drop', color: COLORS.onSurfaceVariant, active: false },
    { name: 'Solar Pro', icon: 'wb-sunny', color: COLORS.onSurfaceVariant, active: false },
    { name: 'Zero Waste', icon: 'recycling', color: COLORS.tertiary, active: true },
    { name: 'Eco Voyager', icon: 'explore', color: COLORS.onSurfaceVariant, active: false },
  ]);

  // ANIMATIONS
  const leaderboardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const badgeScales = useRef(achievements.map(() => new Animated.Value(1))).current;
  const challengeAnim = useRef(new Animated.Value(0)).current;

  // Load backend datasets
  const loadData = (forceRefresh = false) => {
    // 1. Fetch Profile
    if (cachedProfile && !forceRefresh) {
      setProfile(cachedProfile);
      setAchievements((prev) =>
        prev.map((item) => ({
          ...item,
          active: cachedProfile.badges ? cachedProfile.badges.includes(item.name) : false,
          color: cachedProfile.badges && cachedProfile.badges.includes(item.name)
            ? (item.name === 'Tree Planter' ? COLORS.primary : item.name === 'Carbon Ninja' ? COLORS.secondary : COLORS.tertiary)
            : COLORS.onSurfaceVariant,
        }))
      );
    } else {
      fetch(`${API_BASE}/profile`, { headers: getHeaders() })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProfile(data);
            if (setCachedProfile) setCachedProfile(data);
            // Sync achievements active states
            setAchievements((prev) =>
              prev.map((item) => ({
                ...item,
                active: data.badges ? data.badges.includes(item.name) : false,
                color: data.badges && data.badges.includes(item.name)
                  ? (item.name === 'Tree Planter' ? COLORS.primary : item.name === 'Carbon Ninja' ? COLORS.secondary : COLORS.tertiary)
                  : COLORS.onSurfaceVariant,
              }))
            );
          }
        })
        .catch((err) => console.log('Error loading profile:', err));
    }

    // 2. Fetch Challenges
    fetch(`${API_BASE}/challenges`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setChallenges(data);
      })
      .catch((err) => console.log('Error loading challenges:', err));

    // 3. Fetch Leaderboards
    if (cachedLeaderboard && !forceRefresh) {
      setLeaderboard(cachedLeaderboard);
      const timings = leaderboardAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      );
      Animated.stagger(120, timings).start();
    } else {
      fetch(`${API_BASE}/leaderboard`, { headers: getHeaders() })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setLeaderboard(data);
            if (setCachedLeaderboard) setCachedLeaderboard(data);
            // Animate entry
            const timings = leaderboardAnims.map((anim) =>
              Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              })
            );
            Animated.stagger(120, timings).start();
          }
        })
        .catch((err) => console.log('Error loading leaderboard:', err));
    }
  };

  useEffect(() => {
    loadData();

    // Challenges slide in
    Animated.timing(challengeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTapBadge = (index) => {
    badgeScales[index].setValue(0.8);
    Animated.spring(badgeScales[index], {
      toValue: 1,
      tension: 100,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  // Challenge click mutator (advances progress on server!)
  const handleProgressChallenge = (id) => {
    fetch(`${API_BASE}/challenges/${id}/progress`, {
      method: 'POST',
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          // Refresh statistics and force cache refresh
          loadData(true);
        }
      })
      .catch((err) => console.log('Error modifying challenge progress:', err));
  };

  const getLeaderboardStyle = (idx) => {
    const anim = leaderboardAnims[idx] || new Animated.Value(1);
    return {
      opacity: anim,
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    };
  };

  const renderChallengeCard = (item) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleProgressChallenge(item.id)}
      activeOpacity={0.95}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Challenge: ${item.title}. Value: ${item.points}. Progress: ${Math.round(item.progress * 100)} percent. ${item.completed ? 'Completed' : 'Time left: ' + item.timeLeft}`}
      accessibilityHint="Tap to advance the progress of this challenge"
    >
      <GlassCard style={styles.challengeCard}>
        <View style={styles.challengeCardHeader}>
          <MaterialIcons name={item.icon} size={28} color={item.color} />
          <View style={[styles.pointsBadge, { backgroundColor: item.bgColor }]}>
            <Text style={[styles.pointsText, { color: item.color }]}>
              {item.completed ? 'CLAIMED' : item.points}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <Text style={styles.challengeTime}>
            {item.completed ? 'Completed' : item.timeLeft}
          </Text>
        </View>
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressLabel}>{Math.round(item.progress * 100)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${item.progress * 100}%`, backgroundColor: item.color }]} />
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {isDesktop ? (
        /* ================= DESKTOP LAYOUT ================= */
        <View style={styles.desktopWrapper}>
          <View style={styles.headerRow}>
            <Text style={styles.desktopMainTitle}>Challenges & Gamification</Text>
            <Text style={styles.activeLabel}>3 Active Missions</Text>
          </View>

          <View style={styles.desktopMainGrid}>
            
            {/* Column 1: Challenges & Achievements */}
            <View style={styles.columnLeft}>
              <Text style={styles.sectionHeading}>Current Missions (Tap to Advance)</Text>
              <Animated.View style={[
                styles.desktopChallengesGrid,
                {
                  opacity: challengeAnim,
                  transform: [
                    {
                      translateY: challengeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}>
                {challenges.map(renderChallengeCard)}
              </Animated.View>

              <Text style={styles.sectionHeading}>Achievements</Text>
              <GlassCard style={styles.badgesContainer}>
                <View style={styles.badgesGrid}>
                  {achievements.map((badge, idx) => (
                    <Animated.View key={idx} style={[{ transform: [{ scale: badgeScales[idx] }] }]}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleTapBadge(idx)}
                        style={[styles.badgeCell, !badge.active && styles.badgeLocked]}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Badge: ${badge.name}. Status: ${badge.active ? 'Unlocked' : 'Locked'}`}
                        accessibilityHint="Tap to trigger a spring animation effect on the badge"
                      >
                        <View style={[
                          styles.badgeIconOuter,
                          badge.active ? { borderColor: badge.color } : styles.lockedOuter,
                        ]}>
                          <MaterialIcons name={badge.icon} size={36} color={badge.active ? badge.color : '#666'} />
                          {badge.active && <View style={[styles.badgeGlow, { backgroundColor: badge.color }]} />}
                        </View>
                        <Text style={styles.badgeName}>{badge.name}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </GlassCard>
            </View>

            {/* Column 2: Leaderboard */}
            <View style={styles.columnRight}>
              <View style={styles.leaderboardHeaderRow}>
                <Text style={styles.sectionHeading}>Global Leaderboard</Text>
                <TouchableOpacity
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="View all leaderboard entries"
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.leaderboardList}>
                {leaderboard.map((user, idx) => (
                  <Animated.View key={user.rank} style={getLeaderboardStyle(idx)}>
                    <View style={[styles.leaderboardCell, { backgroundColor: user.bg, borderColor: user.rank === 1 ? COLORS.primary : 'rgba(255,255,255,0.08)' }]}>
                      <View style={styles.leaderboardCellLeft}>
                        <View style={styles.avatarWrapper}>
                          <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: user.borderColor }]} />
                          <View style={[styles.rankBadge, { backgroundColor: user.rank === 1 ? COLORS.tertiary : user.rank === 2 ? COLORS.secondary : COLORS.surfaceContainerHighest }]}>
                            <Text style={styles.rankText}>{user.rank}</Text>
                          </View>
                        </View>
                        <View>
                          <Text style={styles.rankName}>{user.name}</Text>
                          <Text style={[styles.rankTitle, user.rank === 1 && { color: COLORS.primary }]}>
                            {user.title}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.leaderboardCellRight}>
                        <Text style={styles.pointsNumber}>{user.points}</Text>
                        <Text style={styles.pointsSub}>pts</Text>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.discoverBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Discover more carbon reduction challenges"
              >
                <Text style={styles.discoverBtnText}>Discover More Challenges</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      ) : (
        /* ================= MOBILE LAYOUT ================= */
        <View style={styles.mobileWrapper}>
          
          {/* Header */}
          <View style={styles.mobileHeader}>
            <View style={styles.mobileHeaderLeft}>
              <TouchableOpacity 
                style={styles.mobileAvatarBox} 
                onPress={() => setShowMobileSwitcher(true)}
                accessible={true}
                accessibilityRole="imagebutton"
                accessibilityLabel="Open user account and profile switching menu"
              >
                <Image
                  source={{ uri: profile.avatar }}
                  style={styles.mobileAvatar}
                />
              </TouchableOpacity>
              <Text style={styles.mobileTitleText}>EcoTrack AI</Text>
            </View>
            <TouchableOpacity 
              style={styles.notifyBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
            >
              <MaterialIcons name="notifications" size={20} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Active Challenges List */}
          <View style={styles.sectionMobile}>
            <View style={styles.sectionHeaderMobile}>
              <Text style={styles.sectionTitleMobile}>Active Challenges (Tap to Advance)</Text>
              <Text style={styles.sectionBadgeMobile}>3 Active</Text>
            </View>
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              style={{
                opacity: challengeAnim,
                transform: [
                  {
                    translateX: challengeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              }}
            >
              {challenges.map(renderChallengeCard)}
            </Animated.ScrollView>
          </View>

          {/* Leaderboard */}
          <GlassCard style={styles.leaderboardCardMobile}>
            <View style={styles.leaderboardHeaderMobile}>
              <Text style={styles.sectionTitleMobile}>Leaderboard</Text>
              <TouchableOpacity
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="View all leaderboard entries"
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.leaderboardList}>
              {leaderboard.map((user, idx) => (
                <Animated.View key={user.rank} style={getLeaderboardStyle(idx)}>
                  <View style={[styles.leaderboardCell, { backgroundColor: user.bg, borderColor: user.rank === 1 ? COLORS.primary : 'rgba(255,255,255,0.08)' }]}>
                    <View style={styles.leaderboardCellLeft}>
                      <View style={styles.avatarWrapper}>
                        <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: user.borderColor }]} />
                        <View style={[styles.rankBadge, { backgroundColor: user.rank === 1 ? COLORS.tertiary : user.rank === 2 ? COLORS.secondary : COLORS.surfaceContainerHighest }]}>
                          <Text style={styles.rankText}>{user.rank}</Text>
                        </View>
                      </View>
                      <View>
                        <Text style={styles.rankName}>{user.name}</Text>
                        <Text style={[styles.rankTitle, user.rank === 1 && { color: COLORS.primary }]}>
                          {user.title}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.leaderboardCellRight}>
                      <Text style={styles.pointsNumber}>{user.points}</Text>
                      <Text style={styles.pointsSub}>pts</Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </GlassCard>

          {/* Achievements */}
          <View style={styles.sectionMobile}>
            <Text style={styles.sectionTitleMobile}>Achievements</Text>
            <View style={styles.badgesGridMobile}>
              {achievements.map((badge, idx) => (
                <Animated.View key={idx} style={[{ transform: [{ scale: badgeScales[idx] }] }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleTapBadge(idx)}
                    style={[styles.badgeCell, !badge.active && styles.badgeLocked]}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Badge: ${badge.name}. Status: ${badge.active ? 'Unlocked' : 'Locked'}`}
                    accessibilityHint="Tap to trigger a spring animation effect on the badge"
                  >
                    <View style={[
                      styles.badgeIconOuter,
                      badge.active ? { borderColor: badge.color } : styles.lockedOuter,
                    ]}>
                      <MaterialIcons name={badge.icon} size={30} color={badge.active ? badge.color : '#666'} />
                      {badge.active && <View style={[styles.badgeGlow, { backgroundColor: badge.color }]} />}
                    </View>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity 
            style={styles.discoverBtnMobile}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Discover more carbon reduction challenges"
          >
            <Text style={styles.discoverBtnText}>Discover More Challenges</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mobile Account Switcher Modal */}
      {showMobileSwitcher && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderMobile}>
              <Text style={styles.modalTitle}>Manage Accounts</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowMobileSwitcher(false);
                  setShowMobileCreate(false);
                  setNewName('');
                  setNewEmail('');
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close accounts management modal"
              >
                <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            {!showMobileCreate ? (
              <>
                <ScrollView style={styles.mobileUsersScroll} contentContainerStyle={{ gap: 10 }}>
                  {leaderboard.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={[styles.mobileUserItem, user.id === currentUserId && styles.activeMobileUserItem]}
                      onPress={() => handleSwitchUserMobile(user.id)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Switch to user ${user.name}, ${user.points} points, ${user.title}`}
                      accessibilityHint="Select to make this your active user profile"
                    >
                      <Image source={{ uri: user.avatar }} style={styles.mobileUserAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.mobileUserName, user.id === currentUserId && styles.activeMobileUserName]}>
                          {user.name}
                        </Text>
                        <Text style={styles.mobileUserSub}>{user.points} pts • {user.title}</Text>
                      </View>
                      {user.id === currentUserId && (
                        <MaterialIcons name="check" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={styles.mobileAddAccountBtn}
                  onPress={() => setShowMobileCreate(true)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Create New Account"
                  accessibilityHint="Navigates to the sign up form to create a new user profile"
                >
                  <MaterialIcons name="person-add" size={20} color={COLORS.primary} />
                  <Text style={styles.mobileAddAccountText}>Create New Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mobileLogoutBtn}
                  onPress={() => {
                    setUserId('');
                    setShowMobileSwitcher(false);
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Log Out"
                  accessibilityHint="Clears active session and returns to login screen"
                >
                  <MaterialIcons name="logout" size={20} color={COLORS.error} />
                  <Text style={styles.mobileLogoutText}>Log Out</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ gap: 16 }}>
                <Text style={styles.modalSub}>Start tracking your carbon footprint</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={newName}
                    onChangeText={setNewName}
                    accessible={true}
                    accessibilityLabel="Full Name input field"
                    accessibilityHint="Enter your full name to register a new profile"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. john@example.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="email-address"
                    value={newEmail}
                    onChangeText={setNewEmail}
                    accessible={true}
                    accessibilityLabel="Email Address input field"
                    accessibilityHint="Enter your email address to register a new profile"
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={() => {
                      setShowMobileCreate(false);
                      setNewName('');
                      setNewEmail('');
                    }}
                    disabled={isCreating}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    accessibilityHint="Returns to accounts switcher"
                  >
                    <Text style={styles.cancelBtnText}>Back</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.createBtn, !newName.trim() && styles.disabledBtn]} 
                    onPress={handleCreateUserMobile}
                    disabled={isCreating || !newName.trim()}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Create and Switch profile"
                    accessibilityHint="Registers the profile with the entered name and email and logs you in"
                  >
                    <Text style={styles.createBtnText}>
                      {isCreating ? 'Creating...' : 'Create & Switch'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
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
    paddingTop: 80,
    paddingBottom: 100,
  },

  /* ================= DESKTOP LAYOUT STYLES ================= */
  desktopWrapper: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  desktopMainTitle: {
    color: COLORS.onSurface,
    fontSize: 32,
    fontWeight: '800',
  },
  activeLabel: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  desktopMainGrid: {
    flexDirection: 'row',
    gap: 32,
  },
  columnLeft: {
    flex: 1.5,
    gap: 32,
  },
  columnRight: {
    flex: 1,
    gap: 24,
  },
  sectionHeading: {
    color: COLORS.onSurface,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  desktopChallengesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  challengeCard: {
    width: 270,
    minHeight: 180,
    padding: 18,
    justifyContent: 'space-between',
    gap: 12,
  },
  challengeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  challengeTitle: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  challengeTime: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
  },
  progressSection: {
    gap: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  badgesContainer: {
    padding: 24,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'space-between',
  },
  badgeCell: {
    width: 90,
    alignItems: 'center',
    gap: 8,
  },
  badgeLocked: {
    opacity: 0.45,
  },
  badgeIconOuter: {
    width: 72,
    height: 72,
    borderRadius: 9999,
    borderWidth: 1.5,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lockedOuter: {
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 9999,
    opacity: 0.15,
    filter: 'blur(8px)',
  },
  badgeName: {
    color: COLORS.onSurface,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  leaderboardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardCell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  leaderboardCellLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    borderWidth: 2,
  },
  rankBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  rankName: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  rankTitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  leaderboardCellRight: {
    alignItems: 'flex-end',
  },
  pointsNumber: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  pointsSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
  },
  discoverBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  discoverBtnText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },

  /* ================= MOBILE LAYOUT STYLES ================= */
  mobileWrapper: {
    paddingHorizontal: 16,
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
    marginBottom: 20,
  },
  mobileHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileAvatarBox: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(78, 222, 163, 0.3)',
    overflow: 'hidden',
  },
  mobileAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mobileTitleText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  notifyBtn: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sectionMobile: {
    marginBottom: 32,
  },
  sectionHeaderMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleMobile: {
    color: COLORS.onSurface,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionBadgeMobile: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  horizontalScroll: {
    gap: 16,
    paddingHorizontal: 4,
  },
  leaderboardCardMobile: {
    padding: 16,
    marginBottom: 32,
    gap: 16,
  },
  leaderboardHeaderMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgesGridMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  discoverBtnMobile: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  modalOverlay: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: 'rgba(5, 8, 16, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#0c152b',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
  },
  modalTitle: {
    color: COLORS.onSurface,
    fontSize: 20,
    fontWeight: '700',
  },
  modalSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
  },
  mobileUsersScroll: {
    maxHeight: 250,
  },
  mobileUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    gap: 12,
  },
  activeMobileUserItem: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(78, 222, 163, 0.08)',
  },
  mobileUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 9999,
  },
  mobileUserName: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  activeMobileUserName: {
    color: COLORS.primary,
  },
  mobileUserSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  mobileAddAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  mobileAddAccountText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  mobileLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  mobileLogoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    color: COLORS.onSurface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  cancelBtnText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  createBtnText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
