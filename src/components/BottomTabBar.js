import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../theme/theme';

export function BottomTabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { label: 'Home', value: 'home', icon: 'home' },
    { label: 'Calculate', value: 'calculate', icon: 'calculate' },
    { label: 'Insights', value: 'analytics', icon: 'analytics' },
    { label: 'Impact', value: 'impact', icon: 'workspace-premium' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <TouchableOpacity
            key={tab.value}
            onPress={() => setActiveTab(tab.value)}
            style={[styles.tabBtn, isActive && styles.activeTabBtn]}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={tab.icon}
              size={22}
              color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
            />
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 80 : 64,
    backgroundColor: 'rgba(17, 27, 46, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
    zIndex: 1000,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0px -4px 20px rgba(0,0,0,0.15)',
      },
    }),
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  activeTabBtn: {
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    flex: 0.85,
  },
  tabText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '400',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
