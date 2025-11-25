import { BreakdownSection, DetailPopup } from "@/app/components/ui/DetailPopup";
import { AppTheme } from "@/app/constants/AppTheme";
import { useMonth } from "@/app/lib/month-context";
import type { Category } from "@/app/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import { format } from "date-fns";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryCard, SavingsCard } from "./components";
import { useReportsData } from "./hooks";
import {
  calculateSavingsProgress,
  calculateSpentByCategory,
  combineSpendingWithBudgets,
  filterInactiveSavingsCategories,
} from "./services";

export default function ReportsScreen() {
  const { currentMonth, setCurrentMonth } = useMonth();
  const curMonth = format(currentMonth, "yyyy-MM");

  // Load data using hook
  const { data, refreshing, refresh } = useReportsData(curMonth);
  const { transactions, budgets, categories, savings, activeSavings } = data;

  // UI state
  const [showAllCategories, setShowAllCategories] = React.useState(true);
  const [inactiveSavingsExpanded, setInactiveSavingsExpanded] =
    React.useState(false);
  const [showCategoryDetail, setShowCategoryDetail] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );
  const [showSavingsDetail, setShowSavingsDetail] = React.useState(false);
  const [selectedSavingsCategory, setSelectedSavingsCategory] =
    React.useState<string | null>(null);

  // Calculate category spending using service
  const spentByCategory = calculateSpentByCategory(transactions, currentMonth);
  const categorySpending = combineSpendingWithBudgets(
    spentByCategory,
    budgets,
    curMonth
  );

  const displayedCategories = showAllCategories
    ? categorySpending
    : categorySpending.slice(0, 6);

  const getCategoryInfo = (categoryName: string): Category | undefined => {
    return categories.find((c) => c.name === categoryName);
  };

  const inactiveCategories = filterInactiveSavingsCategories(
    categories,
    activeSavings.map((a) => a.category)
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <TouchableOpacity
            onPress={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1
                )
              )
            }
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={AppTheme.colors.textPrimary}
            />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.monthText}>
            {format(currentMonth, "MMMM yyyy")}
          </Text>
          <TouchableOpacity
            onPress={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1
                )
              )
            }
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={AppTheme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
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
              €
              {categorySpending.reduce((sum, c) => sum + c.spent, 0).toFixed(1)}
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
            <Ionicons
              name="bar-chart"
              size={24}
              color={AppTheme.colors.primary}
            />
            <Text variant="headlineSmall" style={styles.sectionTitleText}>
              Spendings Report
            </Text>
          </View>

          {categorySpending.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="bar-chart-outline"
                size={64}
                color={AppTheme.colors.textMuted}
              />
              <Text variant="titleLarge" style={styles.emptyText}>
                No spending data
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Add transactions to see your category breakdown
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.gridContainer}>
                {displayedCategories.map((item, index) => (
                  <CategoryCard
                    key={item.category}
                    item={item}
                    index={index}
                    categoryInfo={getCategoryInfo(item.category)}
                    onPress={() => {
                      setSelectedCategory(item.category);
                      setShowCategoryDetail(true);
                    }}
                  />
                ))}
              </View>
              {categorySpending.length > 6 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllCategories(!showAllCategories)}
                >
                  <Text style={styles.showMoreText}>
                    {showAllCategories
                      ? "Show Less"
                      : `Show All ${categorySpending.length} Categories`}
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
            <Ionicons
              name="wallet"
              size={24}
              color={AppTheme.colors.secondary}
            />
            <Text variant="headlineSmall" style={styles.sectionTitleText}>
              Savings Tracking
            </Text>
          </View>

          {activeSavings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="wallet-outline"
                size={64}
                color={AppTheme.colors.textMuted}
              />
              <Text variant="titleLarge" style={styles.emptyText}>
                No active savings
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Add savings contributions to see your progress
              </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {activeSavings
                .sort((a, b) => b.balance - a.balance)
                .map((item) => {
                  const savingsProgress = calculateSavingsProgress(
                    item.category,
                    item.balance,
                    item.target,
                    transactions,
                    savings,
                    curMonth
                  );
                  return (
                    <SavingsCard
                      key={item.category}
                      category={item.category}
                      balance={item.balance}
                      target={item.target}
                      categoryInfo={getCategoryInfo(item.category)}
                      savingsProgress={savingsProgress}
                      onPress={() => {
                        setSelectedSavingsCategory(item.category);
                        setShowSavingsDetail(true);
                      }}
                    />
                  );
                })}
            </View>
          )}

          {/* Inactive Savings */}
          {inactiveCategories.length > 0 && (
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
                            <View
                              style={[
                                styles.cardIcon,
                                {
                                  backgroundColor:
                                    cat.color || AppTheme.colors.textMuted,
                                },
                              ]}
                            >
                              {cat.emoji ? (
                                <Text style={styles.cardEmoji}>{cat.emoji}</Text>
                              ) : (
                                <MaterialIcons
                                  name="folder"
                                  size={16}
                                  color={AppTheme.colors.textInverse}
                                />
                              )}
                            </View>
                            <Text style={styles.cardName} numberOfLines={1}>
                              {cat.name}
                            </Text>
                          </View>
                          <Text style={styles.cardAmount}>Balance: €0</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
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
            amount={transactions
              .filter(
                (t) =>
                  t.category === selectedCategory &&
                  t.amount < 0 &&
                  t.date >= format(currentMonth, "yyyy-MM-01") &&
                  t.date <=
                    format(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1,
                        0
                      ),
                      "yyyy-MM-dd"
                    )
              )
              .reduce((sum, t) => sum + Math.abs(t.amount), 0)}
            items={transactions
              .filter(
                (t) =>
                  t.category === selectedCategory &&
                  t.amount < 0 &&
                  t.date >= format(currentMonth, "yyyy-MM-01") &&
                  t.date <=
                    format(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1,
                        0
                      ),
                      "yyyy-MM-dd"
                    )
              )
              .map((t) => ({
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
      {selectedSavingsCategory &&
        (() => {
          const savingsItem = activeSavings.find(
            (s) => s.category === selectedSavingsCategory
          );
          if (!savingsItem) return null;

          const contributions = transactions
            .filter(
              (t) =>
                t.source_type === "savings" &&
                t.category === selectedSavingsCategory
            )
            .map((t) => ({
              label: t.description || selectedSavingsCategory,
              amount: Math.abs(t.amount),
              description: t.category,
              date: t.date,
            }));

          const payments = transactions
            .filter(
              (t) =>
                t.uses_savings_category === selectedSavingsCategory &&
                (t.savings_amount_used || 0) > 0
            )
            .map((t) => ({
              label: t.description || t.category,
              amount: -(t.savings_amount_used || 0),
              description: `${t.category} (from savings)`,
              date: t.date,
            }));

          const totalContributions = contributions.reduce(
            (sum, c) => sum + c.amount,
            0
          );
          const totalPayments = payments.reduce(
            (sum, p) => sum + Math.abs(p.amount),
            0
          );

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
                <View
                  style={{
                    marginTop: AppTheme.spacing.lg,
                    paddingTop: AppTheme.spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: AppTheme.colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: AppTheme.spacing.md,
                    }}
                  >
                    <Text
                      variant="bodyLarge"
                      style={{ color: AppTheme.colors.textSecondary }}
                    >
                      Target
                    </Text>
                    <Text
                      variant="titleMedium"
                      style={{
                        fontWeight: AppTheme.typography.fontWeight.bold,
                      }}
                    >
                      €{savingsItem.target.toFixed(2)}
                    </Text>
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
    paddingVertical: AppTheme.spacing["5xl"],
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
  // Styles for inactive savings cards (simplified version)
  categoryCardWrapper: {
    width: "47%",
    position: "relative",
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
  cardAmount: {
    fontSize: AppTheme.typography.fontSize.base,
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
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
