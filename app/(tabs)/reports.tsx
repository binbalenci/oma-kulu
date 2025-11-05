import logger from "@/app/utils/logger";
import { BreakdownSection, DetailPopup } from "@/components/ui/DetailPopup";
import { AppTheme } from "@/constants/AppTheme";
import { useMonth } from "@/lib/month-context";
import { getActiveSavingsCategories, loadBudgets, loadCategories, loadSavings, loadTransactions } from "@/lib/storage";
import type { Budget, Category, ExpectedSavings, Transaction } from "@/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React from "react";
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface CategorySpending {
  category: string;
  spent: number;
  budget?: number;
}

export default function ReportsScreen() {
  const { currentMonth, setCurrentMonth } = useMonth();

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [savings, setSavings] = React.useState<ExpectedSavings[]>([]);
  const [activeSavings, setActiveSavings] = React.useState<{category: string; balance: number; target?: number}[]>([]);
  // TEMP: let's set to show all categories for now and when we add more components to this tab then we change it later
  const [showAllCategories, setShowAllCategories] = React.useState(true);
  const [inactiveSavingsExpanded, setInactiveSavingsExpanded] = React.useState(false);
  
  // Detail popup states
  const [showCategoryDetail, setShowCategoryDetail] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [showSavingsDetail, setShowSavingsDetail] = React.useState(false);
  const [selectedSavingsCategory, setSelectedSavingsCategory] = React.useState<string | null>(null);

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = React.useState(false);

  // Load data on focus
  useFocusEffect(
    React.useCallback(() => {
      logger.navigationAction("ReportsScreen", { month: currentMonth });
      
      (async () => {
        const [txs, cats, bdgts, svgs] = await Promise.all([
          loadTransactions(),
          loadCategories(),
          loadBudgets(),
          loadSavings(),
        ]);
        setTransactions(txs);
        setCategories(cats);
        setBudgets(bdgts);
        setSavings(svgs);
        
        // Load active savings categories
        const active = await getActiveSavingsCategories();
        setActiveSavings(active);
      })();
    }, [currentMonth])
  );

  // Pull-to-refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    logger.breadcrumb("Pull-to-refresh triggered", "data_refresh");
    
    try {
      const [txs, cats, bdgts, svgs] = await Promise.all([
        loadTransactions(),
        loadCategories(),
        loadBudgets(),
        loadSavings(),
      ]);
      
      setTransactions(txs);
      setCategories(cats);
      setBudgets(bdgts);
      setSavings(svgs);
      
      // Load active savings categories
      const active = await getActiveSavingsCategories();
      setActiveSavings(active);
      
      logger.dataAction("pull_to_refresh", { 
        transactionsCount: txs.length,
        categoriesCount: cats.length,
        budgetsCount: bdgts.length
      });
    } catch (error) {
      logger.error(error as Error, { operation: "pull_to_refresh" });
    } finally {
      setRefreshing(false);
    }
  }, []);

  const curMonth = format(currentMonth, "yyyy-MM");
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Filter transactions for current month and calculate spending per category (expenses only)
  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    return d >= monthStart && d <= monthEnd;
  });

  // Calculate spent per category (only expenses, not income)
  const spentByCategory = monthTransactions.reduce<Record<string, number>>((acc, t) => {
    if (t.amount < 0) {
      acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});

  // Filter budgets for current month
  const currentBudgets = budgets.filter((b) => b.month === curMonth);

  // Combine spending data with budgets
  const categorySpending: CategorySpending[] = Object.entries(spentByCategory)
    .map(([category, spent]) => {
      const budget = currentBudgets.find((b) => b.category === category);
      return {
        category,
        spent,
        budget: budget?.allocated_amount,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  const displayedCategories = showAllCategories 
    ? categorySpending 
    : categorySpending.slice(0, 6);

  const getCategoryInfo = (categoryName: string) => {
    return categories.find((c) => c.name === categoryName);
  };

  const getProgressColors = (progress: number) => {
    if (progress <= 0.5) return ['rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.08)'] as const; // green
    if (progress <= 0.75) return ['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.08)'] as const; // amber
    if (progress <= 1.0) return ['rgba(251, 146, 60, 0.15)', 'rgba(251, 146, 60, 0.08)'] as const; // orange
    return ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.08)'] as const; // red
  };

  const renderCategoryCard = (item: CategorySpending, index: number) => {
    const categoryInfo = getCategoryInfo(item.category);
    const hasBudget = item.budget !== undefined && item.budget > 0 && item.budget > 0;
    const progress = hasBudget && item.budget ? item.spent / item.budget : 0;
    const colors = hasBudget ? getProgressColors(progress) : ['rgba(156, 163, 175, 0.08)', 'rgba(156, 163, 175, 0.04)'] as const;

    return (
      <TouchableOpacity 
        key={item.category} 
        style={styles.categoryCardWrapper}
        onPress={() => {
          setSelectedCategory(item.category);
          setShowCategoryDetail(true);
        }}
        activeOpacity={0.7}
      >
        {/* Background gradient/fill based on progress */}
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryCardBackground}
        >
          {/* Content */}
          <View style={styles.categoryCard}>
            {/* Left section: Rank */}
            <View style={styles.rankSection}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>

            {/* Right section: Main content */}
            <View style={styles.cardContent}>
              {/* Info icon - positioned absolutely in top right */}
              <Ionicons name="information-circle-outline" size={14} color={AppTheme.colors.textSecondary} style={styles.infoIconAbsolute} />
              
              {/* Icon and Name */}
              <View style={styles.cardMainRow}>
                <View style={[styles.cardIcon, { backgroundColor: categoryInfo?.color || AppTheme.colors.primary }]}>
                  {categoryInfo?.emoji ? (
                    <Text style={styles.cardEmoji}>{categoryInfo.emoji}</Text>
                  ) : (
                    <MaterialIcons name="folder" size={16} color={AppTheme.colors.textInverse} />
                  )}
                </View>
                <Text style={styles.cardName} numberOfLines={1}>{item.category}</Text>
              </View>

              {/* Amount and Percentage Row */}
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardAmount}>€{item.spent.toFixed(1)}</Text>
                {hasBudget && (
                  <View style={styles.percentageBadge}>
                    <Text style={[styles.percentageText, progress > 1 && styles.percentageOver]}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <TouchableOpacity
            onPress={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
              )
            }
          >
            <Ionicons name="chevron-back" size={24} color={AppTheme.colors.textPrimary} />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.monthText}>
            {format(currentMonth, "MMMM yyyy")}
          </Text>
          <TouchableOpacity
            onPress={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
              )
            }
          >
            <Ionicons name="chevron-forward" size={24} color={AppTheme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Categories</Text>
            <Text style={styles.summaryValue}>{categorySpending.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>
              €{categorySpending.reduce((sum, c) => sum + c.spent, 0).toFixed(1)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>With Budget</Text>
            <Text style={styles.summaryValue}>
              {categorySpending.filter((c) => c.budget && c.budget > 0).length}
            </Text>
          </View>
        </View>

        {/* Spendings Report */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bar-chart" size={24} color={AppTheme.colors.primary} />
            <Text variant="headlineSmall" style={styles.sectionTitleText}>
              Spendings Report
            </Text>
          </View>

          {categorySpending.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bar-chart-outline" size={64} color={AppTheme.colors.textMuted} />
              <Text variant="titleLarge" style={styles.emptyText}>
                No spending data
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Add transactions to see your category breakdown
              </Text>
            </View>
          ) : (
            <>
              {/* Category Grid */}
              <View style={styles.gridContainer}>
                {displayedCategories.map((item, index) => renderCategoryCard(item, index))}
              </View>

              {/* Show More Button */}
              {categorySpending.length > 6 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllCategories(!showAllCategories)}
                >
                  <Text style={styles.showMoreText}>
                    {showAllCategories ? "Show Less" : `Show All ${categorySpending.length} Categories`}
                  </Text>
                  <Ionicons
                    name={showAllCategories ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={AppTheme.colors.primary}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Savings Tracking */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet" size={24} color={AppTheme.colors.secondary} />
            <Text variant="headlineSmall" style={styles.sectionTitleText}>
              Savings Tracking
            </Text>
          </View>

          {activeSavings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={64} color={AppTheme.colors.textMuted} />
              <Text variant="titleLarge" style={styles.emptyText}>
                No active savings
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Add savings contributions to see your progress
              </Text>
            </View>
          ) : (
            <>
              {/* Active Savings */}
              <View style={styles.gridContainer}>
                {activeSavings
                  .sort((a, b) => b.balance - a.balance)
                  .map((item) => {
                    const categoryInfo = getCategoryInfo(item.category);
                    const currentMonthSavings = savings.filter(s => s.category === item.category && s.month === curMonth);
                    const monthlyContributions = currentMonthSavings.reduce((sum, s) => sum + s.amount, 0);
                    const monthlyPayments = monthTransactions
                      .filter(t => t.uses_savings_category === item.category && (t.savings_amount_used || 0) > 0)
                      .reduce((sum, t) => sum + (t.savings_amount_used || 0), 0);
                    const progress = item.target && item.target > 0 ? item.balance / item.target : 0;

                    return (
                      <TouchableOpacity 
                        key={item.category} 
                        style={styles.categoryCardWrapper}
                        onPress={() => {
                          setSelectedSavingsCategory(item.category);
                          setShowSavingsDetail(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.categoryCard, { borderColor: AppTheme.colors.secondary }]}>
                          <View style={styles.cardContent}>
                            {/* Info icon - positioned absolutely in top right */}
                            <Ionicons name="information-circle-outline" size={14} color={AppTheme.colors.textSecondary} style={styles.infoIconAbsolute} />
                            
                            <View style={styles.cardMainRow}>
                              <View style={[styles.cardIcon, { backgroundColor: categoryInfo?.color || AppTheme.colors.secondary }]}>
                                {categoryInfo?.emoji ? (
                                  <Text style={styles.cardEmoji}>{categoryInfo.emoji}</Text>
                                ) : (
                                  <MaterialIcons name="folder" size={16} color={AppTheme.colors.textInverse} />
                                )}
                              </View>
                              <Text style={styles.cardName} numberOfLines={1}>{item.category}</Text>
                            </View>
                            <View style={styles.cardBottomRow}>
                              <View>
                                <Text style={styles.cardAmount}>€{item.balance.toFixed(1)}</Text>
                                {item.target && item.target > 0 && (
                                  <Text style={styles.cardSubtext}>Target: €{item.target.toFixed(1)}</Text>
                                )}
                                <Text style={styles.cardSubtext}>
                                  Contributions: €{monthlyContributions.toFixed(1)} | Payments: €{monthlyPayments.toFixed(1)}
                                </Text>
                              </View>
                              {item.target && item.target > 0 && (
                                <View style={styles.percentageBadge}>
                                  <Text style={[styles.percentageText, progress > 1 && styles.percentageOver]}>
                                    {Math.round(progress * 100)}%
                                  </Text>
                                </View>
                              )}
                            </View>
                            {item.target && item.target > 0 && (
                              <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBar, { width: `${Math.min(100, progress * 100)}%` }]} />
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </>
          )}

          {/* Inactive Savings */}
          {(() => {
            const allSavingsCategories = categories.filter(c => c.type === 'saving');
            const inactiveCategories = allSavingsCategories.filter(cat => 
              !activeSavings.some(active => active.category === cat.name)
            );

            if (inactiveCategories.length === 0) return null;

            return (
              <>
                <TouchableOpacity
                  onPress={() => setInactiveSavingsExpanded(!inactiveSavingsExpanded)}
                  style={styles.sectionHeader}
                >
                  <Text variant="bodyLarge" style={styles.sectionTitleText}>
                    Inactive Savings ({inactiveCategories.length})
                  </Text>
                  <Ionicons
                    name={inactiveSavingsExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={AppTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
                {inactiveSavingsExpanded && (
                  <View style={styles.gridContainer}>
                    {inactiveCategories.map((cat) => (
                      <View key={cat.name} style={styles.categoryCardWrapper}>
                        <View style={[styles.categoryCard, { opacity: 0.6 }]}>
                          <View style={styles.cardContent}>
                            <View style={styles.cardMainRow}>
                              <View style={[styles.cardIcon, { backgroundColor: cat.color || AppTheme.colors.textMuted }]}>
                                {cat.emoji ? (
                                  <Text style={styles.cardEmoji}>{cat.emoji}</Text>
                                ) : (
                                  <MaterialIcons name="folder" size={16} color={AppTheme.colors.textInverse} />
                                )}
                              </View>
                              <Text style={styles.cardName} numberOfLines={1}>{cat.name}</Text>
                            </View>
                            <Text style={styles.cardAmount}>Balance: €0</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            );
          })()}
        </View>
      </ScrollView>

      {/* Category Detail Popup */}
      {selectedCategory && (
        <DetailPopup
          visible={showCategoryDetail}
          onDismiss={() => {
            setShowCategoryDetail(false);
            setSelectedCategory(null);
          }}
          title={`${selectedCategory} Breakdown`}
        >
          <BreakdownSection
            title="Transactions"
            amount={monthTransactions
              .filter(t => t.category === selectedCategory && t.amount < 0)
              .reduce((sum, t) => sum + Math.abs(t.amount), 0)}
            items={monthTransactions
              .filter(t => t.category === selectedCategory && t.amount < 0)
              .map(t => ({
                label: t.description || selectedCategory,
                amount: -Math.abs(t.amount),
                description: t.category,
                date: t.date,
              }))}
            color={AppTheme.colors.error}
          />
        </DetailPopup>
      )}

      {/* Savings Detail Popup */}
      {selectedSavingsCategory && (() => {
        const savingsItem = activeSavings.find(s => s.category === selectedSavingsCategory);
        if (!savingsItem) return null;

        // Get all savings transactions (contributions)
        const contributions = transactions
          .filter(t => t.source_type === 'savings' && t.category === selectedSavingsCategory)
          .map(t => ({
            label: t.description || selectedSavingsCategory,
            amount: Math.abs(t.amount),
            description: t.category,
            date: t.date,
          }));

        // Get all payments from savings
        const payments = transactions
          .filter(t => t.uses_savings_category === selectedSavingsCategory && (t.savings_amount_used || 0) > 0)
          .map(t => ({
            label: t.description || t.category,
            amount: -(t.savings_amount_used || 0),
            description: `${t.category} (from savings)`,
            date: t.date,
          }));

        const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
        const totalPayments = payments.reduce((sum, p) => sum + Math.abs(p.amount), 0);

        return (
          <DetailPopup
            visible={showSavingsDetail}
            onDismiss={() => {
              setShowSavingsDetail(false);
              setSelectedSavingsCategory(null);
            }}
            title={`${selectedSavingsCategory} Savings Breakdown`}
          >
            <BreakdownSection
              title="Contributions"
              amount={totalContributions}
              items={contributions}
              color={AppTheme.colors.success || "#4caf50"}
            />
            <BreakdownSection
              title="Payments"
              amount={totalPayments}
              items={payments}
              color={AppTheme.colors.error}
            />
            {savingsItem.target && savingsItem.target > 0 && (
              <View style={{ marginTop: AppTheme.spacing.lg, paddingTop: AppTheme.spacing.md, borderTopWidth: 1, borderTopColor: AppTheme.colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: AppTheme.spacing.md }}>
                  <Text variant="bodyLarge" style={{ color: AppTheme.colors.textSecondary }}>Target</Text>
                  <Text variant="titleMedium" style={{ fontWeight: AppTheme.typography.fontWeight.bold }}>€{savingsItem.target.toFixed(2)}</Text>
                </View>
              </View>
            )}
          </DetailPopup>
        );
      })()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.card,
    ...AppTheme.shadows.sm,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.md,
  },
  monthText: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
    minWidth: 120,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: AppTheme.spacing.lg,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.lg,
    ...AppTheme.shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: AppTheme.typography.fontSize.xs,
    color: AppTheme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: AppTheme.typography.fontSize.lg,
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: AppTheme.colors.border,
    marginVertical: AppTheme.spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: AppTheme.spacing['5xl'],
  },
  emptyText: {
    marginTop: AppTheme.spacing.lg,
    textAlign: "center",
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  emptySubtext: {
    marginTop: AppTheme.spacing.sm,
    textAlign: "center",
    color: AppTheme.colors.textSecondary,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: AppTheme.spacing.md,
  },
  categoryCardWrapper: {
    width: "47%",
    position: "relative",
  },
  categoryCardBackground: {
    borderRadius: AppTheme.borderRadius.md,
    overflow: "hidden",
  },
  categoryCard: {
    flexDirection: "row",
    padding: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.md,
    ...AppTheme.shadows.sm,
  },
  rankSection: {
    width: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: AppTheme.colors.border,
    marginRight: AppTheme.spacing.sm,
    paddingRight: AppTheme.spacing.sm,
  },
  rankText: {
    fontSize: AppTheme.typography.fontSize.base,
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.textSecondary,
  },
  cardContent: {
    flex: 1,
    position: "relative",
  },
  cardMainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: AppTheme.spacing.sm,
  },
  cardIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  cardEmoji: {
    fontSize: 12,
  },
  cardName: {
    flex: 1,
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
    marginRight: 4,
  },
  infoIcon: {
    marginLeft: 4,
  },
  infoIconAbsolute: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardAmount: {
    fontSize: AppTheme.typography.fontSize.base,
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
  },
  percentageBadge: {
    backgroundColor: AppTheme.colors.backgroundSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: AppTheme.borderRadius.sm,
  },
  percentageText: {
    fontSize: AppTheme.typography.fontSize.xs,
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.success,
  },
  percentageOver: {
    color: AppTheme.colors.error,
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: AppTheme.spacing.md,
    marginTop: AppTheme.spacing.sm,
  },
  showMoreText: {
    fontSize: AppTheme.typography.fontSize.base,
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.primary,
    marginRight: AppTheme.spacing.xs,
  },
  section: {
    marginBottom: AppTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: AppTheme.spacing.lg,
    gap: AppTheme.spacing.sm,
  },
  sectionTitleText: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  cardSubtext: {
    fontSize: AppTheme.typography.fontSize.xs,
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderRadius: 2,
    marginTop: AppTheme.spacing.sm,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: AppTheme.colors.secondary,
    borderRadius: 2,
  },
});
