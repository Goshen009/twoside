import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TransactionBuilder } from './components/finance/TransactionBuilder';
import { Navbar } from './components/shared/Navbar';
import { LedgerScreen } from './components/finance/LedgerScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/add" replace />} />
        <Route path="/add" element={<TransactionBuilder />} />
        <Route path="/ledger" element={<LedgerScreen />} />
        {/* /ledger, /budgets, /profile routes land here as you build them */}
      </Routes>
      <Navbar />
    </BrowserRouter>
  );
}