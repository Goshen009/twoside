import { motion, type PanInfo } from "framer-motion";
import { useUserStore } from "@/stores/useUserStore";
import { useUIStore } from "@/stores/useUIStore";
import { Eye, EyeOff } from "lucide-react";
import Format from "@/lib/Format";

interface AccountBalanceCardProps {
	active_index: number;
	onIndexChange: (index: number) => void;
}

const SWIPE_THRESHOLD = 50;

export function AccountBalanceCard({ active_index,	onIndexChange }: AccountBalanceCardProps) {
	const accounts = useUserStore((state) => state.data?.accounts);
	const currency_symbol = useUserStore((state) => state.data?.currency_symbol);
	const is_fetching = useUserStore((state) => state.is_fetching);
	const is_hidden = useUIStore((state) => state.is_amounts_hidden);
	const toggleAmountsHidden = useUIStore((state) => state.toggleAmountsHidden);

	if (is_fetching && !accounts) {
		return (
			<section className="bg-surface rounded-3xl p-5 border border-border h-[152px] animate-pulse" />
		);
	}

	const account = accounts![active_index] ?? accounts![0];
	const { whole, decimal } = Format.balance(account.balance, currency_symbol);

	function handleDragEnd(_: unknown, info: PanInfo) {
		if (
			info.offset.x < -SWIPE_THRESHOLD &&
			active_index < accounts!.length - 1
		) {
			onIndexChange(active_index + 1);
		} else if (info.offset.x > SWIPE_THRESHOLD && active_index > 0) {
			onIndexChange(active_index - 1);
		}
	}

	return (
		<motion.section
			aria-label="Account Balance"
			className="bg-surface rounded-3xl p-5 border border-border shadow-lg relative overflow-hidden cursor-grab active:cursor-grabbing"
			drag={accounts!.length > 1 ? "x" : false}
			dragConstraints={{ left: 0, right: 0 }}
			dragElastic={0.15}
			onDragEnd={handleDragEnd}
		>
			<div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

			<div className="flex justify-end mb-1">
				<button
					type="button"
					aria-label="Toggle balance visibility"
					onClick={toggleAmountsHidden}
					className="text-muted hover:text-foreground p-1 rounded-full hover:bg-white/5 transition-colors"
				>
					{is_hidden ? (
						<EyeOff className="w-5 h-5" />
					) : (
						<Eye className="w-5 h-5" />
					)}
				</button>
			</div>

			<div className="text-center pb-2">
				<p className="text-sm text-foreground/80 font-medium tracking-wide mb-1.5">
					{account.name}
				</p>
				<div className="flex items-center justify-center">
					<span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
						{is_hidden ? (
							"••••••"
						) : (
							<>
								{whole}
								<span className="text-foreground/60">.{decimal}</span>
							</>
						)}
					</span>
				</div>

				{accounts!.length > 1 && (
					<div className="mt-4 flex items-center justify-center gap-1.5">
						{accounts!.map((a, i) => (
							<div
								key={a.id}
								className={`h-1.5 rounded-full transition-all ${
									i === active_index ? "w-4 bg-primary" : "w-1.5 bg-white/20"
								}`}
							/>
						))}
					</div>
				)}
			</div>
		</motion.section>
	);
}
