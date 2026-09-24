import { useUserStore } from "@/stores/useUserStore";

export function HomeHeader() {
	const username = useUserStore((state) => state.data?.username);
	const is_fetching = useUserStore((state) => state.is_fetching);
	
  return (
    <header className="px-1 pt-2 pb-3 flex items-center justify-between">
    	{is_fetching && !username ? (
     		<div className="h-7 w-32 rounded-md bg-surface-hover animate-pulse" />
     	) : (
	     	<h1 className="text-xl font-bold tracking-tight text-foreground">
	        Hi {username},
	      </h1>
      )}
      <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" />   
    </header>
  );
}