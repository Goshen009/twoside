import { useCallback, useEffect, useState } from "react";
import CounterpartiesApi from "@/lib/api/counterparties";
import type { Counterparty } from "@/lib/types";

export function useCounterparties() {
  const [counterparties, set_counterparties] = useState<Counterparty[]>([]);
  const [loading, set_loading] = useState(true);

  const fetchCounterparties = useCallback(() => CounterpartiesApi.list(true).then(set_counterparties), []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) set_loading(true); });
    fetchCounterparties().finally(() => { if (active) set_loading(false); });
    return () => { active = false; };
  }, [fetchCounterparties]);

  return { counterparties, loading, refetch: fetchCounterparties };
}