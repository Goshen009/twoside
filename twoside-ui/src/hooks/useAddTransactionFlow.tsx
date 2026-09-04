import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import type {
  AddTransactionFlowContextValue,
  AddTransactionFlowStage,
  TransactionType,
} from "@/types/types";

// eslint-disable-next-line react-refresh/only-export-components
export const AddTransactionFlowContext =
  createContext<AddTransactionFlowContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAddTransactionFlow(): AddTransactionFlowContextValue {
  const context = useContext(AddTransactionFlowContext);
  if (!context) {
    throw new Error(
      "useAddTransactionFlow must be used within AddTransactionFlowProvider",
    );
  }
  return context;
}

export function AddTransactionFlowProvider({ children }: { children: ReactNode }) {
  const { is_authenticated } = useAuth();
  const [is_open, set_is_open] = useState(false);
  const [stage, set_stage] = useState<AddTransactionFlowStage>("type_select");
  const [transaction_type, set_transaction_type] = useState<TransactionType | null>(
    null,
  );

  useEffect(() => {
    if (!is_authenticated) {
      set_is_open(false);
      set_stage("type_select");
      set_transaction_type(null);
    }
  }, [is_authenticated]);

  const value = useMemo<AddTransactionFlowContextValue>(
    () => ({
      is_open,
      stage,
      transaction_type,
      open: () => {
        set_transaction_type(null);
        set_stage("type_select");
        set_is_open(true);
      },
      close: () => {
        set_is_open(false);
        set_stage("type_select");
        set_transaction_type(null);
      },
      select_type: (selected_type) => {
        set_transaction_type(selected_type);
        set_stage("form");
      },
      back_to_types: () => {
        set_transaction_type(null);
        set_stage("type_select");
      },
    }),
    [is_open, stage, transaction_type],
  );

  return (
    <AddTransactionFlowContext.Provider value={value}>
      {children}
    </AddTransactionFlowContext.Provider>
  );
}
