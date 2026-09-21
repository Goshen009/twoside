import { NavLink } from "react-router-dom";
import { HandCoins, NotebookPen, Plus, Receipt, Settings } from "lucide-react";
import { useAddTransactionFlow } from "@/hooks/useAddTransactionFlow";

function navClassName(is_active: boolean): string {
	return `flex flex-col items-center gap-1 transition-colors ${
		is_active ? "text-primary" : "text-muted hover:text-foreground"
	}`;
}

export function AppNavbar() {
	const { open } = useAddTransactionFlow();

	return (
		<nav className="fixed bottom-0 inset-x-0 z-40">
			<div className="mx-auto flex max-w-md items-center justify-between border-t border-white/5 bg-surface/85 px-4 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
				<NavLink
					to="/home"
					end
					className={({ isActive }) => navClassName(isActive)}
				>
					<Receipt className="h-5 w-5" />
					<span className="text-[10px] font-medium">Transactions</span>
				</NavLink>

				<NavLink
					to="/loans"
					className={({ isActive }) => navClassName(isActive)}
				>
					<HandCoins className="h-5 w-5" />
					<span className="text-[10px] font-medium">Loans</span>
				</NavLink>

				<button
					type="button"
					aria-label="Add transaction"
					onClick={open}
					className="-mt-5 flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border-4 border-background bg-primary text-background shadow-lg shadow-primary/30 transition-transform duration-150 hover:scale-105 active:scale-95"
				>
					<Plus className="h-6 w-6 stroke-[2.5]" />
				</button>

				<div className="flex cursor-default select-none flex-col items-center gap-1 text-muted">
					<NotebookPen className="h-5 w-5" />
					<span className="text-[10px] font-medium">Notes</span>
				</div>

				<NavLink
					to="/settings"
					className={({ isActive }) => navClassName(isActive)}
				>
					<Settings className="h-5 w-5" />
					<span className="text-[10px] font-medium">Settings</span>
				</NavLink>
			</div>
		</nav>
	);
}
