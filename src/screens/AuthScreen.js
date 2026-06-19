import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../theme/theme';
import { API_BASE, getHeaders, setUserId } from '../config';

const defaultAccounts = [
  { id: 'sarah_j', name: 'Sarah J.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT1EPgeHbiCyiDKLGp868IabVBLWQJe-FbA4S09aQJipuS6tXAJnHYJnoD4VL-TBLlnzm4xoCEkS_WlOmVhbeXjuNHry4GZPGKfJ5_iQ8X-fVs2ZENwqa0MK2sTi6dgD_hmctOs2tY1U0dbsRFDclOP1Sy81nI9zy56ULwxCR3EAsmngeA71gDstnUUoOs0PVxPurXRdI32iJ5ScLE0CjWgOYh6n808_7lSn7PlX4m0EkobLUHN1beT5h43E4UGhZjiUdK2JjYPK9R', points: 12450, title: 'Master Guardian' },
  { id: 'james_w', name: 'James W.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8P9QWmkdOOWXq6XrcEKt3wdPMsFJNegdG6UQznpU9ZMfLbsW_fKTfuIWlIHInf0YMPE4MLmRNL20P6VlcsCnd6KLkvc2A_RuBSwHsKvwumkpFZT8hQKxSFUve03mZ3vKJhUIOej633ww6102SdmOn6nfPmGNiLv7WvjtVfUwnGDsbyCIQyJ_B9mmnBqpiH6NUy4eYvDJfHlzbdZ2ZhVkzk8p547M03lRA615RwLExviMZ8p62ikv_uMg-K1FGpiL7YAMp8suTSGhZ', points: 11200, title: 'Nature Enthusiast' },
  { id: 'mila_k', name: 'Mila K.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkzfO_UyJ2G530wb-ov-OwK5ff3WIT-F_PjNiklYBaBkSnYBGSr6Qup5sIOA0s5OdV_QDLc6gODbXBElL5UckyQ-9ktreb80hwwU5qos-sJXJIUnmCOsYy7tFKmczpTrMWwqioCB6SoLP3N7Du7iecb4edZ5a9O_cI7FgGiIxp29xjkaFWOVWfQ26O3L3nh-gswqV1XGraa-PB8EllrAXdrATbGiQycXKanj1dS3hpbO_kdffmXE-76_8Ol_flCoWuo5gdCpgSfkp', points: 10890, title: 'Carbon Reducer' }
];

export function AuthScreen({ onLoginSuccess }) {
  const [users, setUsers] = useState(defaultAccounts);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/users`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        if (data && Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.log('Error loading users in AuthScreen:', err);
      });
  }, []);

  const handleSelectUser = (id) => {
    setUserId(id);
    onLoginSuccess();
  };

  const handleCreateUser = () => {
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
          setUserId(data.userId);
          onLoginSuccess();
        } else {
          alert(data.error || 'Failed to create user');
        }
      })
      .catch((err) => {
        setIsCreating(false);
        console.log('Error creating user:', err);
        alert('Network error, please try again.');
      });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.logoText}>EcoTrack AI</Text>
          <Text style={styles.tagline}>Understand. Track. Reduce.</Text>
        </View>

        {!isRegistering ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Profile to Login</Text>
            <Text style={styles.sectionSub}>Choose your active session account</Text>

            {isLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 24 }} />
            ) : (
              <View style={styles.usersGrid}>
                {users.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userCard}
                    onPress={() => handleSelectUser(user.id)}
                  >
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    <View style={styles.userInfo}>
                      <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                      <Text style={styles.userSub}>{user.points} pts • {user.title}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.registerToggleBtn} onPress={() => setIsRegistering(true)}>
              <MaterialIcons name="person-add" size={18} color={COLORS.primary} />
              <Text style={styles.registerToggleText}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create Profile</Text>
            <Text style={styles.sectionSub}>Enter details to join the Net-Zero campaign</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. john@example.com"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="email-address"
                value={newEmail}
                onChangeText={setNewEmail}
              />
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  setIsRegistering(false);
                  setNewName('');
                  setNewEmail('');
                }}
                disabled={isCreating}
              >
                <Text style={styles.backBtnText}>Back to Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, !newName.trim() && styles.disabledBtn]}
                onPress={handleCreateUser}
                disabled={isCreating || !newName.trim()}
              >
                <Text style={styles.submitBtnText}>
                  {isCreating ? 'Registering...' : 'Create & Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 32,
    gap: 24,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      },
    }),
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    color: COLORS.onSurface,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 8,
  },
  usersGrid: {
    gap: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  userSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 8,
  },
  registerToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
  },
  registerToggleText: {
    color: COLORS.primary,
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
  input: {
    backgroundColor: COLORS.surfaceContainerLow,
    color: COLORS.onSurface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
