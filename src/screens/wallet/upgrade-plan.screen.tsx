import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header, MembershipBadge, customAlert } from '@/components/ui';
import { BottomTabInset, Fonts, MaxContentWidth, Palette, Rounded, Spacing } from '@/constants/theme';
import { walletData } from '@/data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { subscriptionService } from '@/services';
import type { RootStackScreenProps } from '@/types/navigation';
import type { MembershipPlan } from '@/types/wallet';
import { triggerHaptic } from '@/utils';

export type UpgradePlanScreenProps = RootStackScreenProps<'UpgradePlan'>;

export function UpgradePlanScreen({ navigation }: UpgradePlanScreenProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePlanUpgrade = (plan: MembershipPlan) => {
    triggerHaptic(25);
    if (plan.isCurrent) {
      customAlert.show({
        title: 'Current Active Plan',
        message:
          'You are currently active on the Free Starter plan. Select Gyanoda Pro or Gyanoda Plus to unlock full test series, video solutions & 1-on-1 mentorship.',
        type: 'info',
      });
      return;
    }

    customAlert.show({
      title: `Upgrade to ${plan.name}`,
      message: `Confirm upgrading to ${plan.name} for ₹${plan.rupeesEquivalent.toLocaleString('en-IN')}/year?\n\nYou'll get instant access to all premium tests, video solutions, and mentor resources.`,
      type: 'confirm',
      buttons: [
        {
          text: 'Confirm & Upgrade',
          style: 'primary',
          onPress: () => {
            triggerHaptic(30);
            subscriptionService.setTier(plan.tier);
            customAlert.show({
              title: 'Upgrade Successful! 🎉',
              message: `Congratulations! You have successfully upgraded to ${plan.name}. All premium courses, video solutions, and features are now unlocked.`,
              type: 'success',
            });
          },
        },
      ],
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Centered Header with Back button */}
      <Header
        align="center"
        title="Upgrade Plan"
        titleStyle={styles.headerTitle}
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={[styles.circleButton, { backgroundColor: theme.backgroundElement }]}>
            <SolarIcon name="ArrowLeft" type="linear" size={22} color={theme.text} />
          </Pressable>
        }
        right={<View style={styles.circleButtonPlaceholder} />}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View
              style={[
                styles.heroIconBadge,
                { backgroundColor: isDark ? '#451a03' : '#fef3c7' },
              ]}>
              <SolarIcon name="Crown" type="bold" size={28} color="#f59e0b" />
            </View>
            <ThemedText style={[styles.heroTitle, { color: theme.text }]}>
              Choose Your Learning Plan
            </ThemedText>
            <ThemedText style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              Unlock full mock test series, chapter-wise video solutions, and 1-on-1 faculty guidance.
            </ThemedText>
          </View>

          {/* Horizontally Scrollable Plan Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plansScrollContent}
            style={styles.plansScrollView}>
            {walletData.membershipPlans.map((plan) => {
              const isFree = plan.tier === 'free';
              const isPro = plan.tier === 'pro';
              const isPlus = plan.tier === 'plus';

              const cardBg = isPro
                ? isDark
                  ? '#1c150c'
                  : '#fffdfa'
                : isPlus
                  ? isDark
                    ? '#0b1629'
                    : '#f8faff'
                  : isDark
                    ? '#141824'
                    : '#f8fafc';

              const cardBorder = isPro
                ? isDark
                  ? '#78350f'
                  : '#fde68a'
                : isPlus
                  ? isDark
                    ? '#1e40af'
                    : '#bfdbfe'
                  : isDark
                    ? '#282c3f'
                    : '#e2e8f0';

              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                    },
                  ]}>
                  <View style={styles.planCardBody}>
                    {/* Top Tier Badge & Tag Row */}
                    <View style={styles.planCardTopRow}>
                      <MembershipBadge tier={plan.tier} size="md" />
                      {plan.tag ? (
                        <View
                          style={[
                            styles.planTag,
                            {
                              backgroundColor: isPro
                                ? isDark
                                ? '#451a03'
                                : '#fef3c7'
                                : isDark
                                ? '#172554'
                                : '#eff6ff',
                            },
                          ]}>
                          <ThemedText
                            style={[
                              styles.planTagText,
                              {
                                color: isPro ? '#d97706' : '#2563eb',
                              },
                            ]}>
                            {plan.tag}
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>

                    {/* Plan Name & Description */}
                    <ThemedText style={[styles.planName, { color: theme.text }]}>
                      {plan.name}
                    </ThemedText>
                    <ThemedText style={[styles.planDescription, { color: theme.textSecondary }]}>
                      {plan.description}
                    </ThemedText>

                    {/* Price Row (Rupees Only - No Coins) */}
                    <View style={styles.priceContainer}>
                      <View style={styles.priceRow}>
                        <ThemedText style={[styles.priceAmount, { color: theme.text }]}>
                          {isFree ? 'Free' : `₹${plan.rupeesEquivalent.toLocaleString('en-IN')}`}
                        </ThemedText>
                        {!isFree ? (
                          <ThemedText style={[styles.pricePeriod, { color: theme.textSecondary }]}>
                            / yr
                          </ThemedText>
                        ) : null}
                      </View>
                      <ThemedText style={[styles.priceSubtitle, { color: theme.textSecondary }]}>
                        {isFree
                          ? 'Free forever • No credit card required'
                          : 'Billed annually • Cancel anytime'}
                      </ThemedText>
                    </View>

                    {/* Feature Checklist */}
                    <View style={styles.featuresList}>
                      {plan.features.map((feature, fIdx) => (
                        <View key={`upgrade-feat-${plan.id}-${fIdx}`} style={styles.featureItem}>
                          <SolarIcon
                            name="CheckCircle"
                            type="bold"
                            size={16}
                            color={isFree ? '#64748b' : isPro ? '#f59e0b' : '#3880FF'}
                          />
                          <ThemedText style={[styles.featureText, { color: theme.text }]}>
                            {feature}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Action Button (No right arrow icon) */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      plan.isCurrent ? 'Current active plan' : `Upgrade to ${plan.name}`
                    }
                    onPress={() => handlePlanUpgrade(plan)}
                    style={[
                      styles.planActionButton,
                      plan.isCurrent
                        ? [styles.planActionButtonCurrent, { borderColor: theme.border }]
                        : isPro
                          ? [styles.planActionButtonPro, { backgroundColor: Palette.accent }]
                          : [styles.planActionButtonPlus, { backgroundColor: isDark ? '#ffffff' : Palette.foreground }],
                    ]}>
                    <ThemedText
                      style={[
                        styles.planActionButtonText,
                        plan.isCurrent
                          ? { color: theme.textSecondary }
                          : isPro
                            ? { color: '#ffffff' }
                            : { color: isDark ? '#0f172a' : '#ffffff' },
                      ]}>
                      {plan.isCurrent ? 'Current Plan' : `Upgrade to ${plan.badgeLabel}`}
                    </ThemedText>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          {/* Guarantee & Trust Info */}
          <View style={styles.trustBoxContainer}>
            <View style={[styles.trustBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <SolarIcon name="ShieldCheck" type="bold" size={24} color="#10b981" />
              <View style={styles.trustTextCol}>
                <ThemedText style={[styles.trustTitle, { color: theme.text }]}>
                  100% Verified WBJEE & NEET Curriculum
                </ThemedText>
                <ThemedText style={[styles.trustSubtitle, { color: theme.textSecondary }]}>
                  Created by top rankers and expert faculty with chapter-wise syllabus tracking and guaranteed solutions.
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingTop: Spacing.three,
  },
  heroSection: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  heroIconBadge: {
    width: 56,
    height: 56,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  heroTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 320,
  },
  plansScrollView: {
    marginBottom: Spacing.five,
  },
  plansScrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  planCard: {
    width: 295,
    borderRadius: Rounded.card,
    borderWidth: 1.5,
    padding: Spacing.four,
    justifyContent: 'space-between',
  },
  planCardBody: {
    marginBottom: Spacing.four,
  },
  planCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  planTag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Rounded.full,
  },
  planTagText: {
    fontFamily: Fonts?.sans,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planName: {
    fontFamily: Fonts?.sans,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  planDescription: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: Spacing.three,
  },
  priceContainer: {
    marginBottom: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5e140',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceAmount: {
    fontFamily: Fonts?.sans,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pricePeriod: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  priceSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    flex: 1,
  },
  planActionButton: {
    width: '100%',
    height: 46,
    borderRadius: Rounded.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planActionButtonCurrent: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  planActionButtonPro: {},
  planActionButtonPlus: {},
  planActionButtonText: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  trustBoxContainer: {
    paddingHorizontal: Spacing.four,
  },
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Rounded.card,
    borderWidth: 1,
    gap: 12,
  },
  trustTextCol: {
    flex: 1,
    gap: 2,
  },
  trustTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  trustSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
});
