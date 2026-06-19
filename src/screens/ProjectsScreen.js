import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS, SPACING } from '../theme/theme';
import { useResponsive } from '../hooks/useResponsive';
import { GlassCard } from '../components/GlassCard';
import { API_BASE, getHeaders } from '../config';

export function ProjectsScreen() {
  const { isDesktop } = useResponsive();
  const [goals, setGoals] = useState([]);
  const [history, setHistory] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectTarget, setProjectTarget] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadData = () => {
    // 1. Fetch Goals / Projects
    fetch(`${API_BASE}/goals`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setGoals(data);
      })
      .catch((err) => console.log('Error loading goals:', err));

    // 2. Fetch Calculation History
    fetch(`${API_BASE}/history`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setHistory(data);
      })
      .catch((err) => console.log('Error loading calculation history:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = () => {
    if (!projectTitle) return;

    fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title: projectTitle, target: projectTarget })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setGoals(data.goals);
          setProjectTitle('');
          setProjectTarget('');
          setShowForm(false);
          loadData();
        }
      })
      .catch((err) => console.log('Error creating project goal:', err));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.innerContainer, isDesktop && styles.desktopContainer]}>
        
        {/* Header Title */}
        <View style={styles.headerRow}>
          <Text style={isDesktop ? styles.desktopTitle : styles.mobileTitle}>Sustainability Projects</Text>
          <Text style={styles.headerSub}>Quantify, manage, and execute Net-Zero projects.</Text>
        </View>

        {/* Layout Grid */}
        <View style={[styles.mainGrid, isDesktop && styles.desktopGrid]}>
          
          {/* Active Reduction Projects */}
          <GlassCard style={[styles.sectionCard, { flex: 1.2 }]}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Active Carbon Projects</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                <MaterialIcons name={showForm ? 'close' : 'add'} size={18} color={COLORS.primary} />
                <Text style={styles.addBtnText}>{showForm ? 'Cancel' : 'New Project'}</Text>
              </TouchableOpacity>
            </View>

            {showForm && (
              <View style={styles.projectForm}>
                <Text style={styles.formLabel}>PROJECT TITLE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Upgrade office to smart LED lighting"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={projectTitle}
                  onChangeText={setProjectTitle}
                />

                <Text style={styles.formLabel}>TARGET / TIMELINE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Save 400kg CO₂ / 3 months"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={projectTarget}
                  onChangeText={setProjectTarget}
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleCreateProject}>
                  <Text style={styles.submitBtnText}>Launch Project</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.projectsList}>
              {goals.length === 0 ? (
                <Text style={styles.emptyText}>No active reduction projects. Launch one above!</Text>
              ) : (
                goals.map((project) => (
                  <View key={project.id} style={styles.projectItem}>
                    <View style={styles.projectInfoRow}>
                      <View style={styles.projectTitleGroup}>
                        <MaterialIcons name="assignment" size={20} color={COLORS.primary} />
                        <Text style={styles.projectTitleText}>{project.title}</Text>
                      </View>
                      <Text style={styles.projectTargetText}>{project.target}</Text>
                    </View>
                    
                    <View style={styles.progressBarWrapper}>
                      <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${project.progress * 100}%` }]} />
                      </View>
                      <Text style={styles.progressPctText}>{Math.round(project.progress * 100)}% Complete</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </GlassCard>

          {/* Footprint Calculation Audit History */}
          <GlassCard style={[styles.sectionCard, { flex: 0.8 }]}>
            <Text style={styles.sectionTitle}>Carbon Ledger Audit Log</Text>
            <Text style={styles.sectionDesc}>Audited timeline records of previous carbon accounting cycles.</Text>

            <View style={styles.historyTimeline}>
              {history.length === 0 ? (
                <Text style={styles.emptyText}>No calculation logs saved in database yet.</Text>
              ) : (
                history.map((record, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineDotLine}>
                      <View style={styles.timelineDot} />
                      {index < history.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeaderRow}>
                        <Text style={styles.timelineMonth}>{record.month}</Text>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>AUDITED</Text>
                        </View>
                      </View>
                      <Text style={styles.timelineAmount}>
                        {record.amount} <Text style={styles.timelineUnit}>kg CO₂</Text>
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </GlassCard>

        </View>

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
    paddingTop: 80,
    paddingBottom: 100,
  },
  innerContainer: {
    paddingHorizontal: 20,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    gap: 24,
  },
  desktopContainer: {
    maxWidth: 1100,
    paddingTop: 40,
  },
  headerRow: {
    marginBottom: 8,
  },
  mobileTitle: {
    color: COLORS.onSurface,
    fontSize: 24,
    fontWeight: '800',
  },
  desktopTitle: {
    color: COLORS.onSurface,
    fontSize: 32,
    fontWeight: '800',
  },
  headerSub: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  mainGrid: {
    flexDirection: 'column',
    gap: 24,
  },
  desktopGrid: {
    flexDirection: 'row',
  },
  sectionCard: {
    padding: 24,
    gap: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
    borderColor: 'rgba(78, 222, 163, 0.2)',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  projectForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    gap: 10,
  },
  formLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surfaceContainerLow,
    color: COLORS.onSurface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 13,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  projectsList: {
    gap: 16,
    marginTop: 8,
  },
  projectItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  projectInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  projectTitleText: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  projectTargetText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarWrapper: {
    gap: 6,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 9999,
  },
  progressPctText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    textAlign: 'right',
  },
  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
  },
  historyTimeline: {
    gap: 16,
    marginTop: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineDotLine: {
    alignItems: 'center',
    width: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 9999,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineMonth: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: 'rgba(137, 206, 255, 0.1)',
    borderColor: 'rgba(137, 206, 255, 0.2)',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timelineAmount: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  timelineUnit: {
    color: COLORS.onSurface,
    fontSize: 12,
    fontWeight: '500',
  },
});
