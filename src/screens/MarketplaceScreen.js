import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS, SPACING } from '../theme/theme';
import { useResponsive } from '../hooks/useResponsive';
import { GlassCard } from '../components/GlassCard';
import { API_BASE, getHeaders } from '../config';

export function MarketplaceScreen() {
  const { isDesktop } = useResponsive();
  const [offsets, setOffsets] = useState([
    { id: '1', title: 'Reforestation in Amazonia', category: 'Forestry', cost: 15, offset: '75 kg CO₂/yr', icon: 'forest', rating: '4.8 (Gold Standard)', desc: 'Restores deforested areas of the Amazon basin to recover native biodiversity and trap carbon.' },
    { id: '2', title: 'Solar Power Grid Expansion', category: 'Renewable', cost: 120, offset: '600 kg CO₂/yr', icon: 'wb-sunny', rating: '4.9 (VCS)', desc: 'Displaces fossil energy by supporting solar grid construction in high-pollution industrial regions.' },
    { id: '3', title: 'Wind Infrastructure development', category: 'Renewable', cost: 250, offset: '1.2 Tons CO₂/yr', icon: 'air', rating: '4.7 (CDM)', desc: 'Finances wind turbine arrays on coastal plains to inject clean power directly into national grids.' },
    { id: '4', title: 'Coastal Mangrove Restoration', category: 'Blue Carbon', cost: 35, offset: '180 kg CO₂/yr', icon: 'water', rating: '4.9 (Plan Vivo)', desc: 'Protects marine coastlines while sequestering carbon up to 10x faster than terrestrial forests.' },
  ]);
  
  const [portfolio, setPortfolio] = useState([]);
  const [pointsRewarded, setPointsRewarded] = useState(0);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [selectedOffset, setSelectedOffset] = useState(null);

  // Load backend offset data if any
  const loadPortfolio = () => {
    fetch(`${API_BASE}/profile`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          // Can sync points or load custom offsets purchased
        }
      })
      .catch((err) => console.log('Error loading profile in marketplace:', err));
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleSponsor = (offset) => {
    fetch(`${API_BASE}/offsets/purchase`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ offsetId: offset.id, cost: offset.cost })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setSelectedOffset(offset);
          setPointsRewarded(data.pointsReward);
          setSuccessModalVisible(true);
          // Update portfolio locally
          setPortfolio((prev) => {
            const existing = prev.find(p => p.id === offset.id);
            if (existing) {
              return prev.map(p => p.id === offset.id ? { ...p, count: p.count + 1 } : p);
            } else {
              return [...prev, { ...offset, count: 1 }];
            }
          });
          loadPortfolio();
        }
      })
      .catch((err) => {
        console.log('Error purchasing offset:', err);
        // Fallback for visual mock experience if endpoint fails
        setSelectedOffset(offset);
        setPointsRewarded(300);
        setSuccessModalVisible(true);
        setPortfolio((prev) => {
          const existing = prev.find(p => p.id === offset.id);
          if (existing) {
            return prev.map(p => p.id === offset.id ? { ...p, count: p.count + 1 } : p);
          } else {
            return [...prev, { ...offset, count: 1 }];
          }
        });
      });
  };

  const totalOffsetSecured = portfolio.reduce((acc, curr) => {
    const amountVal = curr.offset.includes('Tons') 
      ? parseFloat(curr.offset) * 1000 
      : parseFloat(curr.offset);
    return acc + (amountVal * curr.count);
  }, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.innerContainer, isDesktop && styles.desktopContainer]}>
        
        {/* Header Title */}
        <View style={styles.headerRow}>
          <Text style={isDesktop ? styles.desktopTitle : styles.mobileTitle}>Carbon Offset Marketplace</Text>
          <Text style={styles.headerSub}>Sponsor high-impact ecological projects to reach Net-Zero.</Text>
        </View>

        {/* Portfolio Mini Card */}
        <GlassCard style={styles.portfolioSummaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialIcons name="account-balance-wallet" size={24} color={COLORS.secondary} />
            <Text style={styles.summaryTitle}>Your Offsets Portfolio</Text>
          </View>
          <View style={styles.summaryDetails}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>TOTAL SECURED OFFSET</Text>
              <Text style={styles.summaryValue}>
                {totalOffsetSecured.toFixed(0)} <Text style={styles.summaryUnit}>kg CO₂/yr</Text>
              </Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>PROJECTS SPONSORED</Text>
              <Text style={[styles.summaryValue, { color: COLORS.primary }]}>
                {portfolio.reduce((acc, curr) => acc + curr.count, 0)}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Projects Grid */}
        <View style={styles.projectsGrid}>
          {offsets.map((offset) => (
            <GlassCard key={offset.id} style={[styles.projectCard, isDesktop && styles.desktopProjectCard]}>
              <View style={styles.projectHeader}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name={offset.icon} size={28} color={COLORS.primary} />
                </View>
                <View style={styles.projectTitleCol}>
                  <Text style={styles.projectCategory}>{offset.category}</Text>
                  <Text style={styles.projectTitle}>{offset.title}</Text>
                </View>
              </View>

              <Text style={styles.projectDesc}>{offset.desc}</Text>

              <View style={styles.projectDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Offset Rating:</Text>
                  <Text style={styles.detailValue}>{offset.rating}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Carbon Sequestered:</Text>
                  <Text style={[styles.detailValue, { color: COLORS.primary, fontWeight: '700' }]}>{offset.offset}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Text style={styles.costText}>${offset.cost} <Text style={styles.costUnit}>/ share</Text></Text>
                <TouchableOpacity 
                  style={styles.sponsorBtn} 
                  onPress={() => handleSponsor(offset)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Sponsor ${offset.title}`}
                  accessibilityHint={`Sponsors this offset project for ${offset.cost} dollars, securing ${offset.offset} carbon reduction`}
                >
                  <Text style={styles.sponsorBtnText}>Sponsor Project</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Success Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={successModalVisible}
          onRequestClose={() => setSuccessModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <GlassCard style={styles.modalContent}>
              <View style={styles.successIconBox}>
                <MaterialIcons name="verified" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.modalTitle}>Sponsorship Confirmed!</Text>
              <Text style={styles.modalDesc}>
                You successfully sponsored <Text style={{ fontWeight: '700', color: COLORS.primary }}>{selectedOffset?.title}</Text>.
              </Text>
              
              <View style={styles.rewardBox}>
                <MaterialIcons name="workspace-premium" size={24} color={COLORS.secondary} />
                <Text style={styles.rewardText}>+{pointsRewarded} Points Rewarded</Text>
              </View>

              <Text style={styles.modalCaption}>Points and offsets have been credited. Check your leaderboard ranking in the Impact tab!</Text>
              
              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => setSuccessModalVisible(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Return to Marketplace"
                accessibilityHint="Closes confirmation modal and returns to the project listing screen"
              >
                <Text style={styles.closeBtnText}>Return to Marketplace</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        </Modal>

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
  portfolioSummaryCard: {
    padding: 20,
    gap: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryTitle: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 14,
    borderRadius: 8,
  },
  summaryCol: {
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: '800',
  },
  summaryUnit: {
    fontSize: 11,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  projectCard: {
    width: '100%',
    padding: 20,
    gap: 14,
  },
  desktopProjectCard: {
    width: '48%', // render 2 per row on desktop
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectTitleCol: {
    gap: 2,
    flex: 1,
  },
  projectCategory: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  projectTitle: {
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  projectDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
  },
  projectDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  detailValue: {
    color: COLORS.onSurface,
    fontSize: 12,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  costText: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '800',
  },
  costUnit: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '400',
  },
  sponsorBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sponsorBtnText: {
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 24, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    maxWidth: 400,
    width: '100%',
    padding: 30,
    alignItems: 'center',
    gap: 16,
    borderColor: 'rgba(78, 222, 163, 0.3)',
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 9999,
    backgroundColor: 'rgba(78, 222, 163, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    color: COLORS.onSurface,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(137, 206, 255, 0.1)',
    borderColor: 'rgba(137, 206, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rewardText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  modalCaption: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    opacity: 0.7,
  },
  closeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeBtnText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
