import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, Budget, Category, RecurringTemplate, Transaction } from './types';

const TX_KEY = 'storage_transactions_v1';
const CAT_KEY = 'storage_categories_v1';
const BUDGET_KEY = 'storage_budgets_v1';
const SETTINGS_KEY = 'storage_settings_v1';
const TEMPLATES_KEY = 'storage_templates_v1';

export async function loadTransactions(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(TX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveTransactions(items: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(TX_KEY, JSON.stringify(items));
}

export async function loadCategories(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(CAT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Category[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCategories(items: Category[]): Promise<void> {
  await AsyncStorage.setItem(CAT_KEY, JSON.stringify(items));
}

export async function loadBudgets(): Promise<Budget[]> {
  const raw = await AsyncStorage.getItem(BUDGET_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Budget[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveBudgets(items: Budget[]): Promise<void> {
  await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(items));
}

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as AppSettings;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadTemplates(): Promise<RecurringTemplate[]> {
  const raw = await AsyncStorage.getItem(TEMPLATES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as RecurringTemplate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveTemplates(items: RecurringTemplate[]): Promise<void> {
  await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(items));
}

