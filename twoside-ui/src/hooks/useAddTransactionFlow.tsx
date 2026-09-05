import {
  createContext,
  useContext,
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

  // Reset the flow when the session ends. Adjusting state during render (not in
  // an effect) tracks the auth transition once and then stops — avoids the
  // cascading-render anti-pattern of calling setState inside useEffect.
  const [prev_authenticated, setPrevAuthenticated] = useState(is_authenticated);
  if (prev_authenticated !== is_authenticated) {
    setPrevAuthenticated(is_authenticated);
    if (!is_authenticated) {
      set_is_open(false);
      set_stage("type_select");
      set_transaction_type(null);
    }
  }

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
