import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS, SPACING } from '../theme/theme';
import { useResponsive } from '../hooks/useResponsive';
import { GlassCard } from '../components/GlassCard';
import { API_BASE, getHeaders } from '../config';
import Svg, {
  Path,
  Circle,
  Text as SvgText,
  Line,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export function InsightsScreen({ setActiveTab }) {
  const { isDesktop } = useResponsive();

  // API states
  const [totalMonthly, setTotalMonthly] = useState(182.4);
  const [complianceRate, setComplianceRate] = useState('94.2%');
  const [percentages, setPercentages] = useState({ transport: 45, electricity: 20, food: 20, waste: 10, shopping: 5 });
  const [recommendations, setRecommendations] = useState([]);
  const [goals, setGoals] = useState([]);
  const [history, setHistory] = useState([]);

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);

  // Animations
  const [monthlyTotalCount, setMonthlyTotalCount] = useState(0);
  const [complianceRateCount, setComplianceRateCount] = useState(0);

  // Fetch backend data
  const loadDashboardData = () => {
    // 1. Fetch Insights (totals, breakdown, recommendations)
    fetch(`${API_BASE}/insights`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setTotalMonthly(parseFloat(data.totalMonthly));
          setComplianceRate(data.complianceRate);
          setPercentages(data.percentages);
          setRecommendations(data.recommendations);
          animateTickers(parseFloat(data.totalMonthly), parseFloat(data.complianceRate));
        }
      })
      .catch((err) => console.log('Error loading dashboard insights:', err));

    // 2. Fetch Goals
    fetch(`${API_BASE}/goals`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setGoals(data);
      })
      .catch((err) => console.log('Error loading goals:', err));

    // 3. Fetch History
    fetch(`${API_BASE}/history`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setHistory(data);
      })
      .catch((err) => console.log('Error loading timeline history:', err));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const animateTickers = (totalTarget, complianceTarget) => {
    let currentTotal = 0;
    let currentCompliance = 0;
    const interval = setInterval(() => {
      let finished = true;
      if (currentTotal < totalTarget) {
        currentTotal += 6.5;
        if (currentTotal >= totalTarget) currentTotal = totalTarget;
        else finished = false;
        setMonthlyTotalCount(currentTotal);
      }
      if (currentCompliance < complianceTarget) {
        currentCompliance += 3.5;
        if (currentCompliance >= complianceTarget) currentCompliance = complianceTarget;
        else finished = false;
        setComplianceRateCount(currentCompliance);
      }
      if (finished) clearInterval(interval);
    }, 25);
  };

  // Add new Goal handler
  const handleAddGoal = () => {
    if (!goalTitle) return;

    fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title: goalTitle, target: goalTarget })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setGoals(data.goals);
          setGoalTitle('');
          setGoalTarget('');
          setShowGoalForm(false);
          // Refresh data to update scores
          loadDashboardData();
        }
      })
      .catch((err) => console.log('Error adding goal:', err));
  };

  // Regeneration of AI tips
  const handleAskAICoach = () => {
    fetch(`${API_BASE}/ai/recommend`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ footprint: totalMonthly, breakdown: percentages })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.recommendations) {
          setRecommendations(data.recommendations);
        }
      })
      .catch((err) => console.log('Error regenerating AI recommendations:', err));
  };

  // Line chart coordinates helper
  const renderLineChart = () => {
    if (!history || history.length === 0) return null;

    const width = 500;
    const height = 200;
    const paddingLeft = 45;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const amounts = history.map(h => h.amount);
    const maxVal = Math.max(...amounts, 160);
    const minVal = 0;
    const valRange = maxVal - minVal;

    // Calculate points
    const points = history.map((record, index) => {
      const x = paddingLeft + (index / (history.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((record.amount - minVal) / valRange) * chartHeight;
      return { x, y, record };
    });

    let linePathD = '';
    let areaPathD = '';

    if (points.length > 0) {
      linePathD = `M ${points[0].x} ${points[0].y}`;
      areaPathD = `M ${points[0].x} ${paddingTop + chartHeight} L ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        linePathD += ` L ${points[i].x} ${points[i].y}`;
        areaPathD += ` L ${points[i].x} ${points[i].y}`;
      }

      areaPathD += ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;
    }

    const ticks = [0, 0.25, 0.5, 0.75, 1.0];

    return (
      <View style={{ width: '100%', alignItems: 'center' }}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {ticks.map((tick, index) => {
            const yVal = paddingTop + chartHeight - tick * chartHeight;
            const labelVal = Math.round(minVal + tick * valRange);
            return (
              <G key={index}>
                <Line
                  x1={paddingLeft}
                  y1={yVal}
                  x2={width - paddingRight}
                  y2={yVal}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth={1}
                />
                <SvgText
                  x={paddingLeft - 10}
                  y={yVal + 3}
                  fill={COLORS.onSurfaceVariant}
                  fontSize={10}
                  textAnchor="end"
                >
                  {`${labelVal}kg`}
                </SvgText>
              </G>
            );
          })}

          {/* Filled Area */}
          {areaPathD ? (
            <Path d={areaPathD} fill="url(#areaGrad)" />
          ) : null}

          {/* Chart Line */}
          {linePathD ? (
            <Path d={linePathD} fill="none" stroke={COLORS.primary} strokeWidth={3} />
          ) : null}

          {/* Data Points and values */}
          {points.map((pt, index) => (
            <G key={index}>
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={5}
                fill={COLORS.primary}
                stroke="#fff"
                strokeWidth={1.5}
              />
              <SvgText
                x={pt.x}
                y={pt.y - 10}
                fill="#fff"
                fontSize={9}
                textAnchor="middle"
                fontWeight="700"
              >
                {`${pt.record.amount}kg`}
              </SvgText>
              <SvgText
                x={pt.x}
                y={height - 8}
                fill={COLORS.onSurfaceVariant}
                fontSize={10}
                textAnchor="middle"
              >
                {pt.record.month}
              </SvgText>
            </G>
          ))}
        </Svg>
      </View>
    );
  };

  // Category breakdown donut chart helper
  const renderDonutChart = () => {
    const segments = [
      { label: 'Transport', val: percentages.transport || 0, color: COLORS.primary },
      { label: 'Electricity', val: percentages.electricity || 0, color: COLORS.secondary },
      { label: 'Food', val: percentages.food || 0, color: COLORS.tertiary },
      { label: 'Waste', val: percentages.waste || 0, color: COLORS.error },
      { label: 'Shopping', val: percentages.shopping || 0, color: COLORS.outline },
    ].filter(s => s.val > 0);

    const size = 180;
    const center = size / 2;
    const radius = 60;
    const strokeWidth = 14;
    const C = 2 * Math.PI * radius; // ~376.99

    let accumulatedOffset = 0;

    return (
      <View style={styles.donutContainer}>
        <View style={styles.donutSvgWrapper}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G transform={`rotate(-90 ${center} ${center})`}>
              {/* Background circle */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth={strokeWidth}
              />
              
              {/* Segments */}
              {segments.map((seg, idx) => {
                const strokeLength = (seg.val / 100) * C;
                const strokeOffset = -accumulatedOffset;
                accumulatedOffset += strokeLength;

                return (
                  <Circle
                    key={idx}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${strokeLength} ${C}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                  />
                );
              })}
            </G>

            {/* Center Labels */}
            <SvgText
              x={center}
              y={center - 6}
              fill={COLORS.onSurfaceVariant}
              fontSize={10}
              fontWeight="600"
              textAnchor="middle"
              letterSpacing={1}
            >
              MONTHLY
            </SvgText>
            <SvgText
              x={center}
              y={center + 15}
              fill={COLORS.onSurface}
              fontSize={16}
              fontWeight="800"
              textAnchor="middle"
            >
              {Math.round(totalMonthly)} kg
            </SvgText>
          </Svg>
        </View>

        {/* Legend Panel */}
        <View style={styles.donutLegend}>
          {segments.map((seg, idx) => (
            <View key={idx} style={styles.legendRow}>
              <View style={styles.legendColorGroup}>
                <View style={[styles.colorIndicator, { backgroundColor: seg.color }]} />
                <Text style={styles.legendLabel}>{seg.label}</Text>
              </View>
              <Text style={styles.legendValue}>{seg.val}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.innerContainer, isDesktop && styles.desktopContainer]}>
        
        {/* Title */}
        <View style={styles.headerRow}>
          <Text style={isDesktop ? styles.desktopTitle : styles.mobileTitle}>EcoTrack AI Dashboard</Text>
          <Text style={styles.headerSub}>Understand. Track. Reduce.</Text>
        </View>

        {/* Top SaaS Cards */}
        <View style={[styles.statsRow, isDesktop && styles.desktopStatsRow]}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL CARBON FOOTPRINT</Text>
            <Text style={styles.statValue}>
              {monthlyTotalCount.toFixed(1)} <Text style={styles.unit}>kg</Text>
            </Text>
            <Text style={styles.statStatus}>↓ 12.8% vs last month</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>SAAS CARBON SCORE</Text>
            <Text style={[styles.statValue, { color: COLORS.secondary }]}>
              82<Text style={styles.unit}>/100</Text>
            </Text>
            <Text style={styles.statStatus}>Eco Rating: B+ (Good)</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Text style={styles.statLabel}>AI OPTIMIZATION RATE</Text>
            <Text style={[styles.statValue, { color: COLORS.tertiary }]}>
              {complianceRateCount.toFixed(1)}%
            </Text>
            <Text style={styles.statStatus}>Compliance Compliance ({complianceRate})</Text>
          </GlassCard>
        </View>

        {/* Dynamic Charts Grid */}
        <View style={[styles.chartsContainer, isDesktop && styles.desktopChartsRow]}>
          {/* Monthly Emissions Timeline - Line Chart simulation using custom bars */}
          <GlassCard style={[styles.chartCard, { flex: 1.2 }]}>
            <Text style={styles.sectionTitleInside}>Monthly Emissions Timeline (Jan - Jun)</Text>
            {renderLineChart()}
          </GlassCard>

          {/* Category Breakdown Donut chart representation */}
          <GlassCard style={[styles.chartCard, { flex: 0.8 }]}>
            <Text style={styles.sectionTitleInside}>Category Breakdown</Text>
            {renderDonutChart()}
          </GlassCard>
        </View>

        {/* Goal Setting & Offset Grid */}
        <View style={[styles.chartsContainer, isDesktop && styles.desktopChartsRow]}>
          {/* Goal Setting */}
          <GlassCard style={[styles.chartCard, { flex: 1 }]}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitleInside}>Goal Setting</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity 
                  onPress={() => setActiveTab && setActiveTab('projects')}
                  accessible={true}
                  accessibilityRole="link"
                  accessibilityLabel="Manage Projects"
                  accessibilityHint="Navigates to the Projects screen to view net-zero projects"
                >
                  <Text style={[styles.actionText, { color: COLORS.secondary }]}>Manage Projects</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowGoalForm(!showGoalForm)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={showGoalForm ? 'Cancel goal creation' : 'Add new Goal'}
                  accessibilityHint="Toggles the visibility of the new goal creation form"
                >
                  <Text style={styles.actionText}>{showGoalForm ? 'Cancel' : '+ New Goal'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showGoalForm && (
              <View style={styles.goalForm}>
                 <TextInput
                  style={styles.input}
                  placeholder="Goal Title (e.g. Reduce meat consumption)"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={goalTitle}
                  onChangeText={setGoalTitle}
                  accessible={true}
                  accessibilityLabel="Goal Title input field"
                  accessibilityHint="Enter the description of your sustainability goal"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Target (e.g. 2 times/week)"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={goalTarget}
                  onChangeText={setGoalTarget}
                  accessible={true}
                  accessibilityLabel="Goal Target input field"
                  accessibilityHint="Enter the target metric or frequency for this goal"
                />
                <TouchableOpacity 
                  style={styles.addGoalBtn} 
                  onPress={handleAddGoal}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Create Goal"
                  accessibilityHint="Submits and registers your new sustainability goal"
                >
                  <Text style={styles.addGoalText}>Create Goal</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.goalsList}>
              {goals.map((goal) => (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalInfoRow}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalTarget}>{goal.target}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${goal.progress * 100}%`, backgroundColor: COLORS.secondary }]} />
                  </View>
                  <Text style={styles.goalProgressText}>{Math.round(goal.progress * 100)}% Complete</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Offset Suggestions */}
          <GlassCard style={[styles.chartCard, { flex: 1 }]}>
            <Text style={styles.sectionTitleInside}>Offset Opportunities</Text>
            <View style={styles.offsetsList}>
              <View style={styles.offsetCard}>
                <View style={styles.offsetHeader}>
                  <MaterialIcons name="forest" size={24} color={COLORS.primary} />
                  <Text style={styles.offsetTitle}>Tree Planting</Text>
                </View>
                <Text style={styles.offsetDesc}>Offsets up to 22 kg CO₂ yearly per mature tree.</Text>
                <TouchableOpacity 
                  style={styles.offsetActionBtn} 
                  onPress={() => setActiveTab && setActiveTab('marketplace')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Sponsor Tree, cost 5 dollars"
                  accessibilityHint="Navigates to the marketplace to sponsor tree planting"
                >
                  <Text style={styles.offsetActionText}>Sponsor Tree (-$5)</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.offsetCard}>
                <View style={styles.offsetHeader}>
                  <MaterialIcons name="wb-sunny" size={24} color={COLORS.secondary} />
                  <Text style={styles.offsetTitle}>Solar Charger Panels</Text>
                </View>
                <Text style={styles.offsetDesc}>Estimated carbon offset: 35 kg CO₂ yearly.</Text>
                <TouchableOpacity 
                  style={styles.offsetActionBtn} 
                  onPress={() => setActiveTab && setActiveTab('marketplace')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Adopt solar charger offsets"
                  accessibilityHint="Navigates to the marketplace to sponsor solar panels"
                >
                  <Text style={styles.offsetActionText}>Adopt offsets</Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* AI Sustainability Coach Widget */}
        <GlassCard style={styles.aiCoachCard}>
          <View style={styles.aiCoachHeaderRow}>
            <View style={styles.aiTitleGroup}>
              <MaterialIcons name="smart-toy" size={28} color={COLORS.primary} />
              <Text style={styles.aiTitle}>AI Sustainability Coach</Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshBtn} 
              onPress={handleAskAICoach}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ask AI Coach"
              accessibilityHint="Regenerates personalized carbon footprint reduction recommendations from the AI Coach"
            >
              <MaterialIcons name="refresh" size={18} color={COLORS.primary} />
              <Text style={styles.refreshText}>Ask AI Coach</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.aiRecsList}>
            {recommendations.map((rec, i) => (
              <View key={i} style={styles.aiRecRow}>
                <MaterialIcons name={rec.icon || 'star'} size={24} color={rec.color || COLORS.primary} style={{ marginTop: 2 }} />
                <View style={styles.aiRecTextCol}>
                  <Text style={styles.aiRecTitle}>{rec.title}</Text>
                  <Text style={styles.aiRecDesc}>{rec.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

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
    maxWidth: 1000,
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
  statsRow: {
    flexDirection: 'column',
    gap: 16,
  },
  desktopStatsRow: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    padding: 20,
    gap: 8,
  },
  statLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '800',
  },
  unit: {
    fontSize: 18,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  statStatus: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  chartsContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  desktopChartsRow: {
    flexDirection: 'row',
  },
  chartCard: {
    padding: 20,
    gap: 16,
  },
  sectionTitleInside: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
  lineChartContainer: {
    flexDirection: 'row',
    height: 180,
    paddingTop: 10,
  },
  lineChartYAxis: {
    justifyContent: 'space-between',
    paddingRight: 12,
    height: 150,
  },
  yAxisLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    textAlign: 'right',
  },
  lineChartBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    height: 150,
    paddingBottom: 4,
  },
  barCol: {
    alignItems: 'center',
    width: '14%',
  },
  barTrack: {
    width: 14,
    height: 130,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  barLabel: {
    color: COLORS.onSurface,
    fontSize: 11,
    marginTop: 8,
  },
  barValue: {
    color: COLORS.primary,
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600',
  },
  categoryGrid: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  categoryLabel: {
    color: COLORS.onSurface,
    fontSize: 13,
    fontWeight: '500',
  },
  categoryValue: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  goalForm: {
    gap: 8,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 8,
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
  addGoalBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addGoalText: {
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  goalsList: {
    gap: 16,
    marginTop: 8,
  },
  goalItem: {
    gap: 6,
  },
  goalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalTitle: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '500',
  },
  goalTarget: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
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
  goalProgressText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    textAlign: 'right',
  },
  offsetsList: {
    gap: 16,
    marginTop: 8,
  },
  offsetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 6,
  },
  offsetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offsetTitle: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  offsetDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
  },
  offsetActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 0.5,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  offsetActionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  aiCoachCard: {
    padding: 24,
    gap: 16,
    borderColor: 'rgba(78, 222, 163, 0.2)',
  },
  aiCoachHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiTitle: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '700',
  },
  refreshBtn: {
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
  refreshText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  aiRecsList: {
    gap: 16,
  },
  aiRecRow: {
    flexDirection: 'row',
    gap: 14,
  },
  aiRecTextCol: {
    flex: 1,
    gap: 4,
  },
  aiRecTitle: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  aiRecDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
  donutSvgWrapper: {
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutLegend: {
    flex: 1,
    minWidth: 150,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendColorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendLabel: {
    color: COLORS.onSurface,
    fontSize: 13,
    fontWeight: '500',
  },
  legendValue: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '700',
  },
});
