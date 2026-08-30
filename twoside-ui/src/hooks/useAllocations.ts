import { useState } from "react";

export type Allocation = {
  id: string;
  account_id: string;
  amount: string;
};

let counter = 0;
function nextId() {
  counter += 1;
  return `alloc_${counter}`;
}

export function useAllocations() {
  const [allocations, set_allocations] = useState<Allocation[]>([
    { id: nextId(), account_id: "", amount: "" },
  ]);

  function addAllocation() {
    set_allocations((prev) => [...prev, { id: nextId(), account_id: "", amount: "" }]);
  }

  function removeAllocation(id: string) {
    set_allocations((prev) => (prev.length > 1 ? prev.filter((a) => a.id !== id) : prev));
  }

  function updateAccount(id: string, account_id: string) {
    set_allocations((prev) => prev.map((a) => (a.id === id ? { ...a, account_id } : a)));
  }

  function updateAmount(id: string, amount: string) {
    set_allocations((prev) => prev.map((a) => (a.id === id ? { ...a, amount } : a)));
  }

  const total = allocations.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

  return { allocations, addAllocation, removeAllocation, updateAccount, updateAmount, total };
}