import { useState } from "react";
import type { BalancesResponse } from "@/lib/types";
import { mockBalances } from "@/lib/mock/balances";

const USE_MOCK = true;

export function useBalances() {
  const [data] = useState<BalancesResponse | null>(
    USE_MOCK ? mockBalances : null
  );
  const [loading] = useState(!USE_MOCK);

  // Real fetch path only runs when USE_MOCK is false —
  // this is where useEffect legitimately belongs, since a network
  // call is an external system we're syncing with.
  // We'll fill this in when we flip USE_MOCK to false:
  //
  // useEffect(() => {
  //   if (USE_MOCK) return;
  //   apiRequest<BalancesResponse>("/balances").then(setData).finally(() => setLoading(false));
  // }, []);

  return { data, loading };
}