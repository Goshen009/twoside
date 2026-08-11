import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { ChatView } from "./pages/ChatView";
import { LedgerView } from "./pages/LedgerView";
// import { BudgetView } from "./pages/BudgetView";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, overflow: "auto" }}>
          <Routes>
            <Route path="/" element={<ChatView />} />
            <Route path="/ledger" element={<LedgerView />} />
            
            {/* add /categories, /counterparties, /loans the same way */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}