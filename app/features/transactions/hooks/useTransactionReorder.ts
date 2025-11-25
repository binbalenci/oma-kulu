import logger from "@/app/utils/logger";
import { saveTransactions } from "@/app/lib/storage";
import type { Transaction } from "@/app/lib/types";
import React from "react";
import { filterTransactionsByType, hasSameDate, sortTransactionsByDateAndOrder } from "../services/transactionHelpers";

interface UseTransactionReorderProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  showSnackbar: (message: string) => void;
}

interface UseTransactionReorderReturn {
  moveUp: (transactionId: string, isIncome: boolean) => Promise<void>;
  moveDown: (transactionId: string, isIncome: boolean) => Promise<void>;
  canMoveUp: (transactionId: string, isIncome: boolean) => boolean;
  canMoveDown: (transactionId: string, isIncome: boolean) => boolean;
}

/**
 * Hook for reordering transactions within the same date
 *
 * Provides functions to move transactions up/down and check if movement is possible.
 * Only allows reordering transactions that share the same date.
 *
 * @param transactions - Current array of all transactions
 * @param setTransactions - State setter for transactions
 * @param showSnackbar - Function to display snackbar messages
 * @returns Object with moveUp, moveDown, canMoveUp, canMoveDown functions
 *
 * @feature transactions
 * @category hooks
 */
export function useTransactionReorder({
  transactions,
  setTransactions,
  showSnackbar,
}: UseTransactionReorderProps): UseTransactionReorderReturn {
  const moveUp = React.useCallback(
    async (transactionId: string, isIncome: boolean) => {
      setTransactions((prev) => {
        // Get the correct filtered list sorted by date DESC, order_index ASC
        const relevantList = sortTransactionsByDateAndOrder(filterTransactionsByType(prev, isIncome));

        const currentIndex = relevantList.findIndex((t) => t.id === transactionId);
        if (currentIndex <= 0) {
          logger.breadcrumb("Cannot move up - already at top or not found", "reorder", {
            transactionId,
            currentIndex,
          });
          return prev; // Already at the top or not found
        }

        const itemToMove = relevantList[currentIndex];
        const itemToSwap = relevantList[currentIndex - 1];

        // Safety check: only allow reordering within the same date
        if (!hasSameDate(itemToMove, itemToSwap)) {
          logger.breadcrumb("Cannot move up - different dates", "reorder", { transactionId });
          return prev;
        }

        // Swap order_index values
        const updatedItemToMove = { ...itemToMove, order_index: itemToSwap.order_index ?? 0 };
        const updatedItemToSwap = { ...itemToSwap, order_index: itemToMove.order_index ?? 0 };

        logger.breadcrumb("Swapping transactions", "reorder", {
          moveId: itemToMove.id,
          moveOldIndex: itemToMove.order_index,
          moveNewIndex: updatedItemToMove.order_index,
          swapId: itemToSwap.id,
          swapOldIndex: itemToSwap.order_index,
          swapNewIndex: updatedItemToSwap.order_index,
        });

        // Persist to database (fire and forget, but log errors)
        saveTransactions([updatedItemToMove, updatedItemToSwap]).then((success) => {
          if (!success) {
            logger.error(new Error("Failed to save transaction order"), {
              operation: "move_transaction_up",
              transactionId,
              isIncome,
            });
            showSnackbar("Failed to save order");
          } else {
            logger.databaseSuccess("update_transaction_order", { transactionId, isIncome, direction: "up" });
          }
        });

        // Create new array with swapped positions
        const newTransactions = prev.map((t) => {
          if (t.id === itemToMove.id) return updatedItemToMove;
          if (t.id === itemToSwap.id) return updatedItemToSwap;
          return t;
        });

        logger.breadcrumb("Returning new transaction array", "reorder", {
          prevLength: prev.length,
          newLength: newTransactions.length,
        });
        return newTransactions;
      });
      logger.userAction("move_transaction_up", { transactionId, isIncome });
    },
    [setTransactions, showSnackbar]
  );

  const moveDown = React.useCallback(
    async (transactionId: string, isIncome: boolean) => {
      setTransactions((prev) => {
        // Get the correct filtered list sorted by date DESC, order_index ASC
        const relevantList = sortTransactionsByDateAndOrder(filterTransactionsByType(prev, isIncome));

        const currentIndex = relevantList.findIndex((t) => t.id === transactionId);
        if (currentIndex < 0 || currentIndex >= relevantList.length - 1) {
          logger.breadcrumb("Cannot move down - already at bottom or not found", "reorder", {
            transactionId,
            currentIndex,
            listLength: relevantList.length,
          });
          return prev; // Already at bottom or not found
        }

        const itemToMove = relevantList[currentIndex];
        const itemToSwap = relevantList[currentIndex + 1];

        // Safety check: only allow reordering within the same date
        if (!hasSameDate(itemToMove, itemToSwap)) {
          logger.breadcrumb("Cannot move down - different dates", "reorder", { transactionId });
          return prev;
        }

        // Swap order_index values
        const updatedItemToMove = { ...itemToMove, order_index: itemToSwap.order_index ?? 0 };
        const updatedItemToSwap = { ...itemToSwap, order_index: itemToMove.order_index ?? 0 };

        logger.breadcrumb("Swapping transactions", "reorder", {
          moveId: itemToMove.id,
          moveOldIndex: itemToMove.order_index,
          moveNewIndex: updatedItemToMove.order_index,
          swapId: itemToSwap.id,
          swapOldIndex: itemToSwap.order_index,
          swapNewIndex: updatedItemToSwap.order_index,
        });

        // Persist to database (fire and forget, but log errors)
        saveTransactions([updatedItemToMove, updatedItemToSwap]).then((success) => {
          if (!success) {
            logger.error(new Error("Failed to save transaction order"), {
              operation: "move_transaction_down",
              transactionId,
              isIncome,
            });
            showSnackbar("Failed to save order");
          } else {
            logger.databaseSuccess("update_transaction_order", { transactionId, isIncome, direction: "down" });
          }
        });

        // Create new array with swapped positions
        const newTransactions = prev.map((t) => {
          if (t.id === itemToMove.id) return updatedItemToMove;
          if (t.id === itemToSwap.id) return updatedItemToSwap;
          return t;
        });

        logger.breadcrumb("Returning new transaction array", "reorder", {
          prevLength: prev.length,
          newLength: newTransactions.length,
        });
        return newTransactions;
      });
      logger.userAction("move_transaction_down", { transactionId, isIncome });
    },
    [setTransactions, showSnackbar]
  );

  const canMoveUp = React.useCallback(
    (transactionId: string, isIncome: boolean): boolean => {
      const relevantList = sortTransactionsByDateAndOrder(filterTransactionsByType(transactions, isIncome));
      const currentIndex = relevantList.findIndex((t) => t.id === transactionId);

      if (currentIndex <= 0) return false;

      const current = relevantList[currentIndex];
      const previous = relevantList[currentIndex - 1];

      return hasSameDate(current, previous);
    },
    [transactions]
  );

  const canMoveDown = React.useCallback(
    (transactionId: string, isIncome: boolean): boolean => {
      const relevantList = sortTransactionsByDateAndOrder(filterTransactionsByType(transactions, isIncome));
      const currentIndex = relevantList.findIndex((t) => t.id === transactionId);

      if (currentIndex < 0 || currentIndex >= relevantList.length - 1) return false;

      const current = relevantList[currentIndex];
      const next = relevantList[currentIndex + 1];

      return hasSameDate(current, next);
    },
    [transactions]
  );

  return {
    moveUp,
    moveDown,
    canMoveUp,
    canMoveDown,
  };
}
