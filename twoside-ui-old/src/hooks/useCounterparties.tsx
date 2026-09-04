import { useCallback, useEffect, useState } from "react";
import API from "../libs/api/api";

export interface Counterparty {
  id: string;
  name: string;
  is_active: boolean;
}

export const useCounterparties = () => {
  const [counterparties, set_counterparties] = useState<Counterparty[]>([]);
  const [loading, set_loading] = useState(true);

  const fetchCounterparties = useCallback(() => API.listCounterparties(true).then(set_counterparties), []);

  useEffect(() => {
    let active = true;
    set_loading(true);
    fetchCounterparties().finally(() => {
      if (active) set_loading(false);
    });
    return () => {
      active = false;
    };
  }, [fetchCounterparties]);

  return { counterparties, loading, refetch: fetchCounterparties };
};