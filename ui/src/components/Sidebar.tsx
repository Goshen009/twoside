import { Link } from "react-router-dom";

export function Sidebar() {
  const links = [
    { to: "/", label: "Chat" },
    { to: "/ledger", label: "My Transactions" },
    { to: "/budget", label: "Budget" },
    { to: "/categories", label: "Categories" },
    { to: "/counterparties", label: "People" },
    { to: "/loans", label: "Loans" },
  ];
  return (
    <nav style={{ width: 220, borderRight: "1px solid #e5e5e5", padding: 16 }}>
      <h2 style={{ marginBottom: 20 }}>Twoside</h2>
      {links.map((l) => (
        <Link key={l.to} to={l.to} style={{ display: "block", padding: "8px 0" }}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}