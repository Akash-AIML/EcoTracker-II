import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { COLORS, SPACING } from '../theme/theme';
import { useResponsive } from '../hooks/useResponsive';
import { GlassCard } from '../components/GlassCard';
import { API_BASE, getHeaders } from '../config';

export function CarbonCalculatorScreen({ onBackHome, setCachedProfile, setCachedLeaderboard }) {
  const { isDesktop } = useResponsive();

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState(1); // 1: Transport, 2: Electricity, 3: Food, 4: Waste, 5: Shopping, 6: Results

  // Step 1: Transport State
  const [transportMode, setTransportMode] = useState('car'); // car, bus, bike, walk, train, ev
  const [distance, setDistance] = useState(15);
  const [fuelType, setFuelType] = useState('gasoline');
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [showFuelDropdown, setShowFuelDropdown] = useState(false);

  // Step 2: Electricity State
  const [elecUnits, setElecUnits] = useState(250); // kWh monthly

  // Step 3: Food State
  const [foodType, setFoodType] = useState('vegetarian'); // vegan, vegetarian, non-vegetarian
  const [chickenFreq, setChickenFreq] = useState(0);
  const [muttonFreq, setMuttonFreq] = useState(0);
  const [beefFreq, setBeefFreq] = useState(0);
  const [fishFreq, setFishFreq] = useState(0);

  // Step 4: Waste State
  const [plasticScale, setPlasticScale] = useState(5); // 1 to 10
  const [recycleHabit, setRecycleHabit] = useState('partial'); // none, partial, full
  const [showRecycleDropdown, setShowRecycleDropdown] = useState(false);

  // Step 5: Shopping State
  const [clothesBought, setClothesBought] = useState(2);
  const [onlineOrders, setOnlineOrders] = useState(5);
  const [electronicsBought, setElectronicsBought] = useState(0);

  // Step 6: Calculations Output from Server
  const [calcResults, setCalcResults] = useState({
    monthlyEmission: 0,
    yearlyEmission: 0,
    breakdown: { transport: 0, electricity: 0, food: 0, waste: 0, shopping: 0 }
  });

  // ANIMATION values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(300)).current;
  const ctaBtnScale = useRef(new Animated.Value(1)).current;

  // Spring animations for selectors
  const carScale = useRef(new Animated.Value(1)).current;
  const busScale = useRef(new Animated.Value(1)).current;
  const bikeScale = useRef(new Animated.Value(1)).current;
  const walkScale = useRef(new Animated.Value(1)).current;
  const trainScale = useRef(new Animated.Value(1)).current;
  const evScale = useRef(new Animated.Value(1)).current;

  const scales = {
    car: carScale,
    bus: busScale,
    bike: bikeScale,
    walk: walkScale,
    train: trainScale,
    ev: evScale,
  };

  const fuelOptions = [
    { label: 'Electric (EV)', value: 'electric' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Gasoline', value: 'gasoline' },
    { label: 'Diesel', value: 'diesel' },
    { label: 'LPG / Compressed Natural Gas', value: 'lpg' },
  ];

  const recycleOptions = [
    { label: 'No Recycling (None)', value: 'none' },
    { label: 'Partial Recycling', value: 'partial' },
    { label: 'Full Recycling (Zero Waste)', value: 'full' },
  ];

  // Load progress animations
  useEffect(() => {
    // Animate progress bar width dynamically based on steps
    Animated.timing(progressAnim, {
      toValue: currentStep / 6,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Reset slide up on mounts
    sheetAnim.setValue(100);
    Animated.spring(sheetAnim, {
      toValue: 0,
      tension: 30,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  // Real-time calculation submit to get results when stepping to final results
  useEffect(() => {
    if (currentStep === 6) {
      // Fetch calculation
      fetch(`${API_BASE}/carbon/calculate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          transport: { mode: transportMode, distance, fuelType, daysPerWeek },
          electricity: { units: elecUnits },
          food: { type: foodType, chicken: chickenFreq, mutton: muttonFreq, beef: beefFreq, fish: fishFreq },
          waste: { plasticUsage: plasticScale, recyclingHabits: recycleHabit },
          shopping: { clothes: clothesBought, onlineOrders, electronics: electronicsBought }
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setCalcResults(data);
          }
        })
        .catch((err) => console.log('Error calculating carbon totals:', err));
    }
  }, [currentStep]);

  const handleSelectMode = (mode) => {
    setTransportMode(mode);
    scales[mode].setValue(0.9);
    Animated.spring(scales[mode], {
      toValue: 1.0,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save footprint to history
      fetch(`${API_BASE}/footprint/save`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          monthlyEmission: calcResults.monthlyEmission,
          breakdown: calcResults.breakdown
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success) {
            if (setCachedProfile && data.profile) {
              setCachedProfile(data.profile);
            }
            if (setCachedLeaderboard) {
              setCachedLeaderboard(null);
            }
          }
          // Trigger dynamic AI Coach generation
          fetch(`${API_BASE}/ai/recommend`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              footprint: calcResults.monthlyEmission,
              breakdown: calcResults.breakdown
            })
          })
            .then(() => onBackHome())
            .catch(() => onBackHome());
        })
        .catch((err) => {
          console.log('Error saving footprint:', err);
          onBackHome();
        });
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBackHome();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Transportation';
      case 2: return 'Electricity & Energy';
      case 3: return 'Diet & Nutrition';
      case 4: return 'Waste Management';
      case 5: return 'Shopping & Goods';
      case 6: return 'Calculated Carbon Footprint';
      default: return 'Carbon Calculator';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            {/* Mode selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MaterialIcons name="directions-car" size={20} color={COLORS.primary} /> Commute Mode
              </Text>
              <View style={styles.modeGrid}>
                {[
                  { label: 'Car', value: 'car', icon: 'directions-car' },
                  { label: 'EV', value: 'ev', icon: 'electric-car' },
                  { label: 'Bus', value: 'bus', icon: 'directions-bus' },
                  { label: 'Train', value: 'train', icon: 'directions-railway' },
                  { label: 'Bike', value: 'bike', icon: 'directions-bike' },
                  { label: 'Walk', value: 'walk', icon: 'directions-walk' },
                ].map((item) => {
                  const isActive = transportMode === item.value;
                  const animScale = scales[item.value] || new Animated.Value(1);
                  return (
                    <Animated.View key={item.value} style={[styles.gridCell, { transform: [{ scale: animScale }] }]}>
                      <TouchableOpacity
                        style={[styles.modeBtn, isActive && styles.modeBtnActive]}
                        onPress={() => handleSelectMode(item.value)}
                        activeOpacity={0.8}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Commute Mode: ${item.label}`}
                        accessibilityState={{ selected: isActive }}
                        accessibilityHint={`Select ${item.label} as your commute mode`}
                      >
                        <MaterialIcons
                          name={item.icon}
                          size={28}
                          color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
                        />
                        <Text style={[styles.modeText, isActive && styles.modeTextActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            </View>

            {/* Commute distance */}
            <GlassCard style={styles.sliderCard}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sectionTitleInside}>
                  <MaterialIcons name="straighten" size={18} color={COLORS.primary} /> Daily commute distance
                </Text>
                <Text style={styles.sliderValueText}>
                  {distance}
                  <Text style={styles.sliderUnit}> km</Text>
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={distance}
                onValueChange={(val) => setDistance(val)}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.surfaceContainerHighest}
                thumbTintColor={COLORS.primary}
                accessible={true}
                accessibilityLabel="Daily commute distance slider"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0km</Text>
                <Text style={styles.sliderLabel}>100km+</Text>
              </View>
            </GlassCard>

            {/* Commute frequency */}
            <GlassCard style={styles.sliderCard}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sectionTitleInside}>
                  <MaterialIcons name="today" size={18} color={COLORS.primary} /> Commuting frequency
                </Text>
                <Text style={styles.sliderValueText}>
                  {daysPerWeek}
                  <Text style={styles.sliderUnit}> days/week</Text>
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={7}
                step={1}
                value={daysPerWeek}
                onValueChange={(val) => setDaysPerWeek(val)}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.surfaceContainerHighest}
                thumbTintColor={COLORS.primary}
                accessible={true}
                accessibilityLabel="Commuting frequency slider"
              />
            </GlassCard>

            {/* Fuel type selector */}
            {(transportMode === 'car' || transportMode === 'bus') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <MaterialIcons name="ev-station" size={20} color={COLORS.primary} /> Vehicle fuel type
                </Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() => setShowFuelDropdown(!showFuelDropdown)}
                    activeOpacity={0.9}
                    accessible={true}
                    accessibilityRole="combobox"
                    accessibilityLabel="Vehicle fuel type selector"
                    accessibilityHint="Expands options to select your vehicle's fuel type"
                  >
                    <Text style={styles.dropdownBtnText}>
                      {fuelOptions.find((f) => f.value === fuelType)?.label || 'Gasoline'}
                    </Text>
                    <MaterialIcons name="expand-more" size={24} color={COLORS.onSurfaceVariant} />
                  </TouchableOpacity>

                  {showFuelDropdown && (
                    <GlassCard style={styles.dropdownList}>
                      {fuelOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.dropdownItem, fuelType === opt.value && styles.dropdownItemActive]}
                          onPress={() => {
                            setFuelType(opt.value);
                            setShowFuelDropdown(false);
                          }}
                          accessible={true}
                          accessibilityRole="checkbox"
                          accessibilityLabel={opt.label}
                          accessibilityState={{ checked: fuelType === opt.value }}
                          accessibilityHint={`Select ${opt.label}`}
                        >
                          <Text style={[styles.dropdownItemText, fuelType === opt.value && styles.dropdownItemTextActive]}>
                            {opt.label}
                          </Text>
                          {fuelType === opt.value && (
                            <MaterialIcons name="check" size={16} color={COLORS.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </GlassCard>
                  )}
                </View>
              </View>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <GlassCard style={styles.sliderCard}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sectionTitleInside}>
                  <MaterialIcons name="lightbulb" size={18} color={COLORS.primary} /> Monthly Electricity units
                </Text>
                <Text style={styles.sliderValueText}>
                  {elecUnits}
                  <Text style={styles.sliderUnit}> kWh</Text>
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1000}
                step={10}
                value={elecUnits}
                onValueChange={(val) => setElecUnits(val)}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.surfaceContainerHighest}
                thumbTintColor={COLORS.primary}
                accessible={true}
                accessibilityLabel="Monthly electricity units slider"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0 kWh</Text>
                <Text style={styles.sliderLabel}>1000 kWh</Text>
              </View>
            </GlassCard>
            <View style={styles.infoRow}>
              <MaterialIcons name="info" size={14} color={COLORS.primary} />
              <Text style={styles.infoText}>Average household emits around 0.85kg CO₂ per kWh consumed.</Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            {/* Food Diet type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MaterialIcons name="restaurant" size={20} color={COLORS.primary} /> Dietary Profile
              </Text>
              <View style={styles.dietRow}>
                {[
                  { label: 'Vegan', value: 'vegan', desc: 'Plant-only' },
                  { label: 'Vegetarian', value: 'vegetarian', desc: 'No meat' },
                  { label: 'Non-Veg', value: 'non-vegetarian', desc: 'Eats meat' },
                ].map((diet) => {
                  const isActive = foodType === diet.value;
                  return (
                    <TouchableOpacity
                      key={diet.value}
                      style={[styles.dietCard, isActive && styles.dietCardActive]}
                      onPress={() => setFoodType(diet.value)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Dietary Profile: ${diet.label}. Description: ${diet.desc}`}
                      accessibilityState={{ selected: isActive }}
                      accessibilityHint={`Select ${diet.label} profile`}
                    >
                      <Text style={[styles.dietLabel, isActive && styles.dietLabelActive]}>{diet.label}</Text>
                      <Text style={styles.dietDesc}>{diet.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Non vegetarian sliders */}
            {foodType === 'non-vegetarian' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Meat consumption frequency (weekly)</Text>

                {/* Chicken slider */}
                <GlassCard style={styles.sliderCardMini}>
                  <View style={styles.sliderHeaderMini}>
                    <Text style={styles.labelMini}>Poultry / Chicken</Text>
                    <Text style={styles.valMini}>{chickenFreq} times</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={7}
                    step={1}
                    value={chickenFreq}
                    onValueChange={(val) => setChickenFreq(val)}
                    minimumTrackTintColor={COLORS.primary}
                    thumbTintColor={COLORS.primary}
                    accessible={true}
                    accessibilityLabel="Weekly poultry or chicken consumption frequency slider"
                  />
                </GlassCard>

                {/* Mutton slider */}
                <GlassCard style={styles.sliderCardMini}>
                  <View style={styles.sliderHeaderMini}>
                    <Text style={styles.labelMini}>Red Meat / Mutton</Text>
                    <Text style={styles.valMini}>{muttonFreq} times</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={7}
                    step={1}
                    value={muttonFreq}
                    onValueChange={(val) => setMuttonFreq(val)}
                    minimumTrackTintColor={COLORS.primary}
                    thumbTintColor={COLORS.primary}
                    accessible={true}
                    accessibilityLabel="Weekly red meat or mutton consumption frequency slider"
                  />
                </GlassCard>

                {/* Beef slider */}
                <GlassCard style={styles.sliderCardMini}>
                  <View style={styles.sliderHeaderMini}>
                    <Text style={styles.labelMini}>Beef / Pork</Text>
                    <Text style={styles.valMini}>{beefFreq} times</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={7}
                    step={1}
                    value={beefFreq}
                    onValueChange={(val) => setBeefFreq(val)}
                    minimumTrackTintColor={COLORS.primary}
                    thumbTintColor={COLORS.primary}
                    accessible={true}
                    accessibilityLabel="Weekly beef or pork consumption frequency slider"
                  />
                </GlassCard>

                {/* Fish slider */}
                <GlassCard style={styles.sliderCardMini}>
                  <View style={styles.sliderHeaderMini}>
                    <Text style={styles.labelMini}>Seafood / Fish</Text>
                    <Text style={styles.valMini}>{fishFreq} times</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={7}
                    step={1}
                    value={fishFreq}
                    onValueChange={(val) => setFishFreq(val)}
                    minimumTrackTintColor={COLORS.primary}
                    thumbTintColor={COLORS.primary}
                    accessible={true}
                    accessibilityLabel="Weekly seafood or fish consumption frequency slider"
                  />
                </GlassCard>
              </View>
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <GlassCard style={styles.sliderCard}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sectionTitleInside}>
                  <MaterialIcons name="delete-outline" size={18} color={COLORS.primary} /> Plastic usage frequency
                </Text>
                <Text style={styles.sliderValueText}>
                  {plasticScale}
                  <Text style={styles.sliderUnit}> / 10</Text>
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={plasticScale}
                onValueChange={(val) => setPlasticScale(val)}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.surfaceContainerHighest}
                thumbTintColor={COLORS.primary}
                accessible={true}
                accessibilityLabel="Plastic usage frequency slider"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Low waste</Text>
                <Text style={styles.sliderLabel}>High waste</Text>
              </View>
            </GlassCard>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MaterialIcons name="recycling" size={20} color={COLORS.primary} /> Recycling Habits
              </Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => setShowRecycleDropdown(!showRecycleDropdown)}
                  activeOpacity={0.9}
                  accessible={true}
                  accessibilityRole="combobox"
                  accessibilityLabel="Recycling habits selector"
                  accessibilityHint="Expands options to select your recycling habits"
                >
                  <Text style={styles.dropdownBtnText}>
                    {recycleOptions.find((r) => r.value === recycleHabit)?.label || 'Partial Recycling'}
                  </Text>
                  <MaterialIcons name="expand-more" size={24} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>

                {showRecycleDropdown && (
                  <GlassCard style={styles.dropdownList}>
                    {recycleOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.dropdownItem, recycleHabit === opt.value && styles.dropdownItemActive]}
                        onPress={() => {
                          setRecycleHabit(opt.value);
                          setShowRecycleDropdown(false);
                        }}
                        accessible={true}
                        accessibilityRole="checkbox"
                        accessibilityLabel={opt.label}
                        accessibilityState={{ checked: recycleHabit === opt.value }}
                        accessibilityHint={`Select ${opt.label}`}
                      >
                        <Text style={[styles.dropdownItemText, recycleHabit === opt.value && styles.dropdownItemTextActive]}>
                          {opt.label}
                        </Text>
                        {recycleHabit === opt.value && (
                          <MaterialIcons name="check" size={16} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </GlassCard>
                )}
              </View>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            {/* Clothes slider */}
            <GlassCard style={styles.sliderCardMini}>
              <View style={styles.sliderHeaderMini}>
                <Text style={styles.labelMini}>Clothes Purchased / month</Text>
                <Text style={styles.valMini}>{clothesBought} items</Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={15}
                step={1}
                value={clothesBought}
                onValueChange={(val) => setClothesBought(val)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
                accessible={true}
                accessibilityLabel="Monthly clothes purchased items slider"
              />
            </GlassCard>

            {/* Online orders slider */}
            <GlassCard style={styles.sliderCardMini}>
              <View style={styles.sliderHeaderMini}>
                <Text style={styles.labelMini}>Online Packages / Orders</Text>
                <Text style={styles.valMini}>{onlineOrders} orders/mo</Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={30}
                step={1}
                value={onlineOrders}
                onValueChange={(val) => setOnlineOrders(val)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
                accessible={true}
                accessibilityLabel="Monthly online packages or orders count slider"
              />
            </GlassCard>

            {/* Electronics slider */}
            <GlassCard style={styles.sliderCardMini}>
              <View style={styles.sliderHeaderMini}>
                <Text style={styles.labelMini}>Major Electronics bought / month</Text>
                <Text style={styles.valMini}>{electronicsBought} units</Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={5}
                step={1}
                value={electronicsBought}
                onValueChange={(val) => setElectronicsBought(val)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
                accessible={true}
                accessibilityLabel="Monthly major electronics items purchased slider"
              />
            </GlassCard>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            {/* Final emission figures */}
            <GlassCard style={styles.resultsSummaryCard}>
              <Text style={styles.resultsLabel}>Monthly Carbon Footprint</Text>
              <Text style={styles.resultsVal}>{calcResults.monthlyEmission.toFixed(1)} <Text style={{ fontSize: 20 }}>kg CO₂e</Text></Text>

              <View style={styles.divider} />

              <Text style={styles.resultsLabel}>Yearly Forecast</Text>
              <Text style={styles.resultsValSecondary}>{calcResults.yearlyEmission.toFixed(0)} kg / year</Text>
            </GlassCard>

            {/* Category Breakdown Horizontal charts */}
            <Text style={styles.sectionTitle}>Category Breakdown (kg CO₂e)</Text>
            <GlassCard style={{ gap: 16 }}>
              {[
                { name: 'Transport', val: calcResults.breakdown.transport, color: COLORS.primary },
                { name: 'Electricity', val: calcResults.breakdown.electricity, color: COLORS.secondary },
                { name: 'Food', val: calcResults.breakdown.food, color: COLORS.tertiary },
                { name: 'Waste', val: calcResults.breakdown.waste, color: COLORS.error },
                { name: 'Shopping', val: calcResults.breakdown.shopping, color: COLORS.outline },
              ].map((cat) => {
                const total = Object.values(calcResults.breakdown).reduce((a, b) => a + b, 0) || 1;
                const percent = Math.min((cat.val / total) * 100, 100);
                return (
                  <View key={cat.name} style={styles.breakdownRow}>
                    <View style={styles.breakdownLabels}>
                      <Text style={styles.breakdownName}>{cat.name}</Text>
                      <Text style={styles.breakdownVal}>{cat.val.toFixed(1)} kg</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: cat.color }]} />
                    </View>
                  </View>
                );
              })}
            </GlassCard>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.innerContainer, isDesktop && styles.desktopContainer]}>
          
          {/* Header Wizard indicator */}
          <View style={styles.wizardHeader}>
            <View style={styles.wizardInfo}>
              <Text style={styles.wizardStep}>STEP {currentStep} OF 6</Text>
              <Text style={styles.wizardCategory}>{getStepTitle()}</Text>
            </View>
            <View style={styles.wizardBarBg}>
              <Animated.View style={[
                styles.wizardBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]} />
            </View>
          </View>

          {/* Form Content */}
          {renderStepContent()}

        </View>
      </ScrollView>

      {/* Floating navigation footer */}
      <Animated.View style={[
        styles.estimateSheet,
        isDesktop && styles.desktopEstimateSheet,
        {
          transform: [{ translateY: sheetAnim }],
        },
      ]}>
        <View style={[styles.estimateContent, isDesktop && styles.desktopEstimateContent]}>
          <View style={styles.wizardNavBtns}>
            <TouchableOpacity 
              style={styles.backBtn} 
              onPress={handleBackStep}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={currentStep === 1 ? 'CANCEL' : 'BACK'}
              accessibilityHint={currentStep === 1 ? 'Cancel calculation and return home' : 'Go back to previous step'}
            >
              <Text style={styles.backBtnText}>
                {currentStep === 1 ? 'CANCEL' : 'BACK'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.nextBtn, currentStep === 6 && { backgroundColor: COLORS.secondary }]} 
              onPress={handleNextStep}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={currentStep === 6 ? 'SAVE FOOTPRINT' : 'NEXT STEP'}
              accessibilityHint={currentStep === 6 ? 'Saves this footprint calculation to your history' : 'Go to next step of the calculator'}
            >
              <Text style={[styles.nextBtnText, currentStep === 6 && { color: COLORS.onSecondary }]}>
                {currentStep === 6 ? 'SAVE FOOTPRINT' : 'NEXT STEP'}
              </Text>
              <MaterialIcons 
                name={currentStep === 6 ? 'save' : 'arrow-forward'} 
                size={18} 
                color={currentStep === 6 ? COLORS.onSecondary : COLORS.onPrimary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 160,
  },
  innerContainer: {
    paddingHorizontal: 20,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    gap: 24,
  },
  desktopContainer: {
    maxWidth: 600,
    paddingTop: 40,
  },
  wizardHeader: {
    marginBottom: 8,
  },
  wizardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  wizardStep: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  wizardCategory: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '700',
  },
  wizardBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 9999,
    overflow: 'hidden',
    marginTop: 8,
  },
  wizardBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
  },
  stepContainer: {
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleInside: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCell: {
    width: '31%',
    aspectRatio: 1,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: COLORS.glassBg,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'border-color 0.2s, background-color 0.2s',
      },
    }),
  },
  modeBtnActive: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: 'rgba(78, 222, 163, 0.08)',
  },
  modeText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '500',
  },
  modeTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sliderCard: {
    padding: 20,
  },
  sliderCardMini: {
    padding: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderHeaderMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelMini: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '500',
  },
  valMini: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  sliderValueText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  sliderUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.onSurfaceVariant,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownBtnText: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownList: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    zIndex: 200,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    gap: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
  dropdownItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  infoText: {
    color: 'rgba(218, 226, 253, 0.55)',
    fontSize: 11,
    flex: 1,
  },
  dietRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dietCard: {
    flex: 1,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  dietCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(78, 222, 163, 0.05)',
  },
  dietLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    fontWeight: '700',
  },
  dietLabelActive: {
    color: COLORS.primary,
  },
  dietDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  resultsSummaryCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderColor: 'rgba(78, 222, 163, 0.2)',
  },
  resultsLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultsVal: {
    color: COLORS.primary,
    fontSize: 36,
    fontWeight: '800',
  },
  resultsValSecondary: {
    color: COLORS.secondary,
    fontSize: 22,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  breakdownRow: {
    gap: 6,
  },
  breakdownLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownName: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownVal: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  estimateSheet: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 19, 38, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    zIndex: 50,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      },
    }),
  },
  desktopEstimateSheet: {
    paddingHorizontal: 40,
  },
  estimateContent: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  desktopEstimateContent: {
    maxWidth: 600,
  },
  wizardNavBtns: {
    flexDirection: 'row',
    gap: 16,
  },
  backBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  nextBtnText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
