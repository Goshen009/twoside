import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function LedgerView() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8080/transactions/b05d0b4f-02f1-4699-a649-535476b95161?start_date=2026-07-01&end_date=2026-07-31", {
      headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRhM2U2YjZhLTRiNWQtNDYyMS05N2ZlLWJiOTM1ZGQ5YjljZCIsImlhdCI6MTc4NjQyNzkyOCwiZXhwIjoxNzg2NjAwNzI4fQ.9qJ2SeO42G6jrqdTNfaaBtgrw3EiGyj9lv0P8IBOq6A` },
    })
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p style={{ padding: 16 }}>Loading...</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>{data.account_name}</h2>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Debit</TableHead><TableHead>Credit</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell colSpan={2}><b>Opening Balance</b></TableCell><TableCell colSpan={2}>{data.opening_balance}</TableCell></TableRow>
          {data.entries.map((e: any) => (
            <TableRow key={e.id}>
              <TableCell>{new Date(e.trx_date).toLocaleDateString()}</TableCell>
              <TableCell>{e.description}</TableCell>
              <TableCell>{e.side === "DEBIT" ? e.amount : ""}</TableCell>
              <TableCell>{e.side === "CREDIT" ? e.amount : ""}</TableCell>
            </TableRow>
          ))}
          <TableRow><TableCell colSpan={2}><b>Closing Balance</b></TableCell><TableCell colSpan={2}>{data.closing_balance}</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}