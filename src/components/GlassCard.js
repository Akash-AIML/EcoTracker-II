import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../theme/theme';

export function GlassCard({ children, style, ...props }) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.cardWeb, style]} {...props}>
        {children}
      </View>
    );
  }

  return (
    <BlurView tint="dark" intensity={40} style={[styles.cardNative, style]} {...props}>
      <View style={styles.innerContent}>
        {children}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  cardWeb: {
    backgroundColor: COLORS.glassBg,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: 16,
    // React Native Web compiles object keys to standard CSS
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: 'inset 0px 1px 0px 0px rgba(255, 255, 255, 0.05)',
  },
  cardNative: {
    borderRadius: 16,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    backgroundColor: 'rgba(11, 19, 38, 0.65)',
    overflow: 'hidden',
  },
  innerContent: {
    padding: 24, // default padding matching layouts
  },
});
