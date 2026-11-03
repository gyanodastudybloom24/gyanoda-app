import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header, customAlert } from '@/components/ui';
import { BottomTabInset, Fonts, MaxContentWidth, Palette, Rounded, Spacing } from '@/constants/theme';
import { walletData } from '@/data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import type { TransactionFilter } from '@/types';
import type { RootStackScreenProps } from '@/types/navigation';
import type { WalletTransaction } from '@/types/wallet';
import { triggerHaptic } from '@/utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type WalletScreenProps = RootStackScreenProps<'Wallet'>;

export type { TransactionFilter };

export function WalletScreen({ navigation }: WalletScreenProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('All');

  const upgradeButtonScale = useSharedValue(1);

  const upgradeButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: upgradeButtonScale.value }],
  }));

  const formattedAvailable = `${walletData.currency}${walletData.availableBalance.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedEarned = `${walletData.currency}${walletData.earnedAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedUsed = `${walletData.currency}${walletData.usedAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handleUpgradePress = () => {
    triggerHaptic(25);
    navigation.navigate('UpgradePlan');
  };

  const handleTransactionPress = (tx: WalletTransaction) => {
    triggerHaptic(20);
    const isCredit = tx.type === 'credit';
    const amountStr = isCredit ? `+${tx.coins} Coins` : `-${tx.coins} Coins`;
    const rupeesStr = tx.rupees !== undefined ? ` (₹${tx.rupees.toLocaleString('en-IN')})` : '';

    customAlert.show({
      title: tx.title,
      message: `Amount: ${amountStr}${rupeesStr}\nMethod: ${tx.paymentMethod ?? 'Wallet'}\nDate: ${tx.timestamp}\nReference ID: ${tx.referenceId ?? tx.id}\nStatus: ${tx.status.toUpperCase()}`,
      type: 'info',
    });
  };

  const filteredTransactions = walletData.transactions.filter((tx) => {
    if (activeFilter === 'Credited') return tx.type === 'credit';
    if (activeFilter === 'Spent') return tx.type === 'debit';
    return true;
  });

  const renderTransactionItem = ({ item }: { item: WalletTransaction }) => {
    const isCredit = item.type === 'credit';
    const iconBg = isCredit
      ? isDark
        ? '#063023'
        : '#ecfdf5'
      : isDark
        ? '#3b0d11'
        : '#fef2f2';
    const iconColor = isCredit ? '#10b981' : '#f43f5e';
    const coinAmountColor = isCredit ? '#10b981' : theme.text;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${isCredit ? 'credited' : 'spent'} ${item.coins} coins`}
        onPress={() => handleTransactionPress(item)}
        style={styles.transactionRow}>
        {/* Left Circular Type Icon */}
        <View style={[styles.typeIconContainer, { backgroundColor: iconBg }]}>
          <SolarIcon
            name={isCredit ? 'CardRecive' : 'CardSend'}
            type="linear"
            size={20}
            color={iconColor}
          />
        </View>

        {/* Center: Title & Subtitle */}
        <View style={styles.transactionDetails}>
          <ThemedText style={[styles.transactionTitle, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={[styles.transactionSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.timestamp} • {item.paymentMethod ?? item.category}
          </ThemedText>
        </View>

        {/* Right: Coins Amount & INR Value */}
        <View style={styles.amountCol}>
          <ThemedText style={[styles.coinAmount, { color: coinAmountColor }]}>
            {isCredit ? `+${item.coins}` : `-${item.coins}`} Coins
          </ThemedText>
          <ThemedText style={[styles.rupeeValue, { color: theme.textSecondary }]}>
            {item.rupees !== undefined
              ? item.rupees === 0
                ? 'Bonus Reward'
                : `₹${item.rupees.toLocaleString('en-IN')}`
              : item.category}
          </ThemedText>
        </View>
      </Pressable>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Information above available balance */}
      <View style={styles.infoRow}>
        <SolarIcon name="InfoCircle" type="linear" size={16} color={theme.textSecondary} />
        <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
          Add balance to your wallet securely by Razorpay secure gateway and{' '}
          <ThemedText style={[styles.infoHighlight, { color: theme.text }]}>
            1 INR = 1 Coin
          </ThemedText>
          .
        </ThemedText>
      </View>

      <View style={styles.balanceContainer}>
        <ThemedText style={[styles.balanceLabel, { color: theme.textSecondary }]}>
          Available Balance
        </ThemedText>

        {/* Big Bold Amount */}
        <ThemedText style={[styles.balanceAmount, { color: theme.text }]}>
          {formattedAvailable}
        </ThemedText>

        {/* Small Earned & Used amounts at the bottom */}
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownCol}>
            <ThemedText style={[styles.breakdownLabel, { color: theme.textSecondary }]}>
              Earned
            </ThemedText>
            <ThemedText style={[styles.breakdownAmount, { color: theme.text }]}>
              {formattedEarned}
            </ThemedText>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.breakdownCol}>
            <ThemedText style={[styles.breakdownLabel, { color: theme.textSecondary }]}>
              Used
            </ThemedText>
            <ThemedText style={[styles.breakdownAmount, { color: theme.text }]}>
              {formattedUsed}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Horizontal separator line */}
      <View style={[styles.horizontalDivider, { backgroundColor: theme.border }]} />

      {/* Single Sleek Full-Width Upgrade Button */}
      <View style={styles.buttonRow}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Upgrade membership plan"
          onPress={handleUpgradePress}
          onPressIn={() => {
            upgradeButtonScale.value = withSpring(0.97, { damping: 15, stiffness: 350 });
          }}
          onPressOut={() => {
            upgradeButtonScale.value = withSpring(1, { damping: 15, stiffness: 350 });
          }}
          style={[
            styles.upgradeButton,
            { backgroundColor: theme.brand },
            upgradeButtonAnimatedStyle,
          ]}>
          <SolarIcon name="Crown" type="bold" size={18} color="#ffffff" />
          <ThemedText style={styles.upgradeButtonText}>
            Upgrade
          </ThemedText>
        </AnimatedPressable>
      </View>

      {/* Transaction History Section Header with Filter Pills */}
      <View style={styles.sectionHeaderRow}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
          Transaction History
        </ThemedText>

        {/* Filter Pills: All, Credited, Spent */}
        <View style={[styles.filterGroup, { backgroundColor: theme.backgroundElement }]}>
          {(['All', 'Credited', 'Spent'] as const).map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <Pressable
                key={tab}
                accessibilityRole="button"
                accessibilityLabel={`Show ${tab} transactions`}
                onPress={() => {
                  triggerHaptic(15);
                  setActiveFilter(tab);
                }}
                style={[styles.filterTab, isActive && styles.filterTabActive]}>
                <ThemedText
                  style={[
                    styles.filterTabText,
                    isActive ? styles.filterTabTextActive : { color: theme.textSecondary },
                  ]}>
                  {tab}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Centered Header with Back Button */}
      <Header
        align="center"
        title="Wallet"
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

      {/* Main FlatList with Header & Free-form List Items (No cards around items) */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={() => (
          <View style={[styles.itemDivider, { backgroundColor: theme.border }]} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <SolarIcon name="Inbox" type="linear" size={36} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No {activeFilter.toLowerCase()} transactions found
            </ThemedText>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
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
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  headerContainer: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.two,
  },
  infoText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    flexShrink: 1,
  },
  infoHighlight: {
    fontFamily: Fonts?.sans,
    fontWeight: '700',
  },
  balanceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  balanceLabel: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: Spacing.one,
  },
  balanceAmount: {
    fontFamily: Fonts?.sans,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.five,
    gap: Spacing.four,
  },
  breakdownCol: {
    alignItems: 'center',
    gap: 3,
  },
  divider: {
    width: 1,
    height: 28,
  },
  breakdownLabel: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  breakdownAmount: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  horizontalDivider: {
    width: '100%',
    height: 1,
    marginTop: Spacing.five,
    marginBottom: Spacing.four,
  },
  buttonRow: {
    width: '100%',
    marginBottom: Spacing.five,
  },
  upgradeButton: {
    width: '100%',
    height: 50,
    borderRadius: Rounded.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.four,
  },
  upgradeButtonText: {
    fontFamily: Fonts?.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  filterGroup: {
    flexDirection: 'row',
    borderRadius: Rounded.full,
    padding: 3,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Rounded.full,
  },
  filterTabActive: {
    backgroundColor: Palette.foreground,
  },
  filterTabText: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    width: '100%',
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    gap: 2,
  },
  transactionTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  transactionSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  amountCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  coinAmount: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  rupeeValue: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginLeft: 52,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyText: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '500',
  },
});
