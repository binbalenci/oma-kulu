import { AppTheme } from "@/constants/AppTheme";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface DetailPopupProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: React.ReactNode;
}

export function DetailPopup({ visible, onDismiss, title, children }: DetailPopupProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              {title}
            </Text>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={AppTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={true}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface BreakdownSectionProps {
  title: string;
  amount: number;
  items: {
    label: string;
    amount: number;
    date?: string;
    description?: string;
  }[];
  color?: string;
}

export function BreakdownSection({ title, amount, items, color }: BreakdownSectionProps) {
  const amountColor = color || AppTheme.colors.textPrimary;
  
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {title}
        </Text>
        <Text variant="titleLarge" style={[styles.sectionAmount, { color: amountColor }]}>
          €{Math.abs(amount).toFixed(2)}
        </Text>
      </View>
      
      {items.length > 0 ? (
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={index} style={[
              styles.itemRow,
              index % 2 === 1 && styles.itemRowAlternate
            ]}>
              <View style={styles.itemContent}>
                <Text variant="bodyMedium" style={styles.itemLabel}>
                  {item.label}
                </Text>
                {(item.date || item.description) && (
                  <Text variant="bodySmall" style={styles.itemDescription}>
                    {item.date ? `${item.date} - ${item.description || ''}` : item.description}
                  </Text>
                )}
              </View>
              <Text variant="bodyMedium" style={[styles.itemAmount, { color: amountColor }]}>
                {item.amount < 0 ? '-€' : '€'}{Math.abs(item.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text variant="bodySmall" style={styles.emptyText}>
          No items
        </Text>
      )}
    </View>
  );
}

interface CalculationRowProps {
  label: string;
  amount: number;
  color?: string;
}

export function CalculationRow({ label, amount, color }: CalculationRowProps) {
  const amountColor = color || AppTheme.colors.textPrimary;
  
  return (
    <View style={styles.calculationRow}>
      <Text variant="bodyLarge" style={styles.calculationLabel}>
        {label}
      </Text>
      <Text variant="bodyLarge" style={[styles.calculationAmount, { color: amountColor }]}>
        €{Math.abs(amount).toFixed(2)}
      </Text>
    </View>
  );
}

interface CalculationViewProps {
  steps: {
    label: string;
    amount: number;
    color?: string;
  }[];
  result: {
    label: string;
    amount: number;
    color?: string;
  };
  operator?: string; // "+", "-", "="
}

export function CalculationView({ steps, result, operator = "-" }: CalculationViewProps) {
  const firstStep = steps[0];
  const remainingSteps = steps.slice(1);
  
  return (
    <View style={styles.calculationView}>
      {/* First step - bigger and dark grey */}
      <View style={styles.calculationStepContent}>
        <Text variant="titleMedium" style={styles.calculationStepLabelLarge}>
          {firstStep.label}
        </Text>
        <Text 
          variant="headlineSmall" 
          style={[styles.calculationStepAmountLarge, { color: '#000000' }]}
        >
          {firstStep.amount >= 0 ? '€' : '-€'}{Math.abs(firstStep.amount).toFixed(2)}
        </Text>
      </View>
      
      {/* Remaining steps - normal size and lighter color */}
      {remainingSteps.map((step, index) => (
        <View key={index + 1}>
          <View style={styles.calculationStepContent}>
            <Text variant="bodyMedium" style={styles.calculationStepLabel}>
              {step.label}
            </Text>
            <Text 
              variant="titleMedium" 
              style={[styles.calculationStepAmount, { color: AppTheme.colors.textSecondary }]}
            >
              {step.amount >= 0 ? '€' : '-€'}{Math.abs(step.amount).toFixed(2)}
            </Text>
          </View>
        </View>
      ))}
      
      {/* Result - same size and color as first step */}
      <View style={styles.calculationResult}>
        <View style={styles.calculationResultLine} />
        <View style={styles.calculationStepContent}>
          <Text variant="titleMedium" style={styles.calculationResultLabel}>
            {result.label}
          </Text>
          <Text 
            variant="headlineSmall" 
            style={[styles.calculationResultAmount, { color: '#000000' }]}
          >
            {result.amount >= 0 ? '€' : '-€'}{Math.abs(result.amount).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    ...AppTheme.shadows.lg,
    ...(Platform.OS === "android"
      ? {
          position: "absolute",
          bottom: 0,
          width: "100%",
          borderTopLeftRadius: AppTheme.borderRadius.xl,
          borderTopRightRadius: AppTheme.borderRadius.xl,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }
      : {}),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  title: {
    flex: 1,
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: AppTheme.spacing.md,
  },
  content: {
    padding: AppTheme.spacing.lg,
  },
  section: {
    marginBottom: AppTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: AppTheme.spacing.md,
  },
  sectionTitle: {
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textPrimary,
  },
  sectionAmount: {
    fontWeight: AppTheme.typography.fontWeight.bold,
  },
  itemsList: {
    gap: AppTheme.spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: AppTheme.borderRadius.md,
  },
  itemRowAlternate: {
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  itemContent: {
    flex: 1,
    marginRight: AppTheme.spacing.md,
  },
  itemLabel: {
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
  },
  itemDescription: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  itemAmount: {
    fontWeight: AppTheme.typography.fontWeight.medium,
  },
  emptyText: {
    color: AppTheme.colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: AppTheme.spacing.md,
  },
  calculationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  calculationLabel: {
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textPrimary,
  },
  calculationAmount: {
    fontWeight: AppTheme.typography.fontWeight.bold,
  },
  calculationView: {
    paddingVertical: AppTheme.spacing.md,
  },
  calculationStepContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: AppTheme.spacing.md,
  },
  calculationStepLabel: {
    flex: 1,
    color: AppTheme.colors.textSecondary,
  },
  calculationStepLabelLarge: {
    flex: 1,
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
  },
  calculationStepAmount: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    textAlign: "right",
    minWidth: 100,
    opacity: 0.7,
  },
  calculationStepAmountLarge: {
    fontWeight: AppTheme.typography.fontWeight.bold,
    textAlign: "right",
    minWidth: 120,
  },
  calculationOperator: {
    textAlign: "center",
    color: AppTheme.colors.textPrimary,
    fontWeight: AppTheme.typography.fontWeight.bold,
    paddingVertical: AppTheme.spacing.xs,
  },
  calculationResult: {
    marginTop: AppTheme.spacing.md,
    paddingTop: AppTheme.spacing.md,
  },
  calculationResultLine: {
    height: 2,
    backgroundColor: AppTheme.colors.border,
    marginHorizontal: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  },
  calculationResultLabel: {
    flex: 1,
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
  },
  calculationResultAmount: {
    fontWeight: AppTheme.typography.fontWeight.bold,
    textAlign: "right",
    minWidth: 120,
  },
});

