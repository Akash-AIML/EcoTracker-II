import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../theme/theme';
import { getUserId, setUserId, API_BASE, getHeaders } from '../config';

const defaultAccounts = [
  { id: 'sarah_j', name: 'Sarah J. (You)', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT1EPgeHbiCyiDKLGp868IabVBLWQJe-FbA4S09aQJipuS6tXAJnHYJnoD4VL-TBLlnzm4xoCEkS_WlOmVhbeXjuNHry4GZPGKfJ5_iQ8X-fVs2ZENwqa0MK2sTi6dgD_hmctOs2tY1U0dbsRFDclOP1Sy81nI9zy56ULwxCR3EAsmngeA71gDstnUUoOs0PVxPurXRdI32iJ5ScLE0CjWgOYh6n808_7lSn7PlX4m0EkobLUHN1beT5h43E4UGhZjiUdK2JjYPK9R' },
  { id: 'james_w', name: 'James W.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8P9QWmkdOOWXq6XrcEKt3wdPMsFJNegdG6UQznpU9ZMfLbsW_fKTfuIWlIHInf0YMPE4MLmRNL20P6VlcsCnd6KLkvc2A_RuBSwHsKvwumkpFZT8hQKxSFUve03mZ3vKJhUIOej633ww6102SdmOn6nfPmGNiLv7WvjtVfUwnGDsbyCIQyJ_B9mmnBqpiH6NUy4eYvDJfHlzbdZ2ZhVkzk8p547M03lRA615RwLExviMZ8p62ikv_uMg-K1FGpiL7YAMp8suTSGhZ' },
  { id: 'mila_k', name: 'Mila K.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkzfO_UyJ2G530wb-ov-OwK5ff3WIT-F_PjNiklYBaBkSnYBGSr6Qup5sIOA0s5OdV_QDLc6gODbXBElL5UckyQ-9ktreb80hwwU5qos-sJXJIUnmCOsYy7tFKmczpTrMWwqioCB6SoLP3N7Du7iecb4edZ5a9O_cI7FgGiIxp29xjkaFWOVWfQ26O3L3nh-gswqV1XGraa-PB8EllrAXdrATbGiQycXKanj1dS3hpbO_kdffmXE-76_8Ol_flCoWuo5gdCpgSfkp' }
];

export function TopNavBar({ activeTab, setActiveTab }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userAccounts, setUserAccounts] = useState(defaultAccounts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const currentUserId = getUserId();
  const currentUser = userAccounts.find(u => u.id === currentUserId) || defaultAccounts[0];

  useEffect(() => {
    fetch(`${API_BASE}/users`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setUserAccounts(data);
        }
      })
      .catch((err) => console.log('Error loading users in TopNavBar:', err));
  }, []);

  const handleSwitchUser = (id) => {
    setUserId(id);
    setShowDropdown(false);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
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
          setShowCreateModal(false);
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
        console.log('Error creating user:', err);
        alert('Network error, please try again.');
      });
  };

  const navItems = [
    { label: 'Dashboard', value: 'home' },
    { label: 'Calculator', value: 'calculate' },
    { label: 'Analytics', value: 'analytics' },
    { label: 'Projects', value: 'projects' },
    { label: 'Marketplace', value: 'marketplace' },
    { label: 'Leaderboard', value: 'impact' },
  ];

  return (
    <View style={styles.navBar}>
      <View style={styles.leftContainer}>
        <Text style={styles.logoText}>EcoTrack AI</Text>
        <View style={styles.linksContainer}>
          {navItems.map((item) => {
            const isActive = activeTab === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setActiveTab(item.value)}
                style={[styles.linkBtn, isActive && styles.activeLinkBtn]}
              >
                <Text style={[styles.linkText, isActive && styles.activeLinkText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {/* User Switcher Dropdown Anchor */}
        <TouchableOpacity style={styles.userSelector} onPress={() => setShowDropdown(!showDropdown)}>
          <Text style={styles.userName}>{currentUser.name}</Text>
          <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="notifications" size={22} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="settings" size={22} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => setShowDropdown(!showDropdown)}>
          <Image
            source={{ uri: currentUser.avatar }}
            style={styles.avatarImg}
          />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {showDropdown && (
          <View style={styles.dropdownMenu}>
            <View style={styles.dropdownUsersScroll}>
              {userAccounts.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.dropdownItem, user.id === currentUserId && styles.activeDropdownItem]}
                  onPress={() => handleSwitchUser(user.id)}
                >
                  <Image source={{ uri: user.avatar }} style={styles.dropdownAvatar} />
                  <Text style={[styles.dropdownText, user.id === currentUserId && styles.activeDropdownText]} numberOfLines={1}>
                    {user.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity
              style={styles.addAccountBtn}
              onPress={() => {
                setShowDropdown(false);
                setShowCreateModal(true);
              }}
            >
              <MaterialIcons name="person-add" size={16} color={COLORS.primary} />
              <Text style={styles.addAccountText}>Add Account</Text>
            </TouchableOpacity>
            
            <View style={styles.dropdownDivider} />
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                setUserId('');
                setShowDropdown(false);
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
            >
              <MaterialIcons name="logout" size={16} color={COLORS.error} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Create Account Modal */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create EcoTrack Profile</Text>
            <Text style={styles.modalSub}>Start tracking your carbon footprint</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. John Doe"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newName}
                onChangeText={setNewName}
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
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => {
                  setShowCreateModal(false);
                  setNewName('');
                  setNewEmail('');
                }}
                disabled={isCreating}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.createBtn, !newName.trim() && styles.disabledBtn]} 
                onPress={handleCreateUser}
                disabled={isCreating || !newName.trim()}
              >
                <Text style={styles.createBtnText}>
                  {isCreating ? 'Creating...' : 'Create & Switch'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    position: Platform.OS === 'web' ? 'fixed' : 'relative',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'rgba(11, 19, 38, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1000,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      },
    }),
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginRight: 40,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  linkBtn: {
    paddingVertical: 6,
  },
  activeLinkBtn: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  linkText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    fontWeight: '500',
  },
  activeLinkText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
  },
  userSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  userName: {
    color: COLORS.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#0c152b',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 9999,
  },
  dropdownUsersScroll: {
    maxHeight: 180,
    overflow: Platform.OS === 'web' ? 'auto' : 'scroll',
    gap: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 8,
  },
  activeDropdownItem: {
    backgroundColor: 'rgba(78, 222, 163, 0.08)',
  },
  dropdownAvatar: {
    width: 24,
    height: 24,
    borderRadius: 9999,
  },
  dropdownText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  activeDropdownText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 6,
  },
  addAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
  },
  addAccountText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '600',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 9999,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(78, 222, 163, 0.3)',
    marginLeft: 8,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  modalTitle: {
    color: COLORS.onSurface,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
    marginTop: -8,
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

