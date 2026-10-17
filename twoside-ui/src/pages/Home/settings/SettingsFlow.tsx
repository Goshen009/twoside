import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Download, LogOut, User, Bell, Tag as TagIcon } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { BottomPanel } from "@/components/BottomPanel";
import { TagDetail } from "./TagDetail";
import { MergeTag } from "./MergeTag";
import { useAuthStore } from "@/stores/useAuthStore";
import { ApiError } from "@/api/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditProfile } from "./EditProfile";
import { InstallGuide } from "../components/InstallGuide";
import { usePushStore } from "@/stores/usePushStore";

type Screen =
  | { name: "menu" }
  | { name: "profile" }
  | { name: "tags" }
  | { name: "install" }
  | { name: "tag"; tag_id: string }
  | { name: "merge"; tag_id: string };

const panelVariants = {
  enter: (dir: 1 | -1) => ({ x: dir * 50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 1 | -1) => ({ x: dir * -50, opacity: 0 }),
};

export function SettingsFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomPanel open={open} onClose={onClose}>
      {open && <SettingsBody onClose={onClose} />}
    </BottomPanel>
  );
}

function SettingsBody({ onClose }: { onClose: () => void }) {
	const tags = useUserStore((s) => s.data?.tags) ?? [];
	const has_info = useUserStore((s) => !!s.data);
  const [state, setState] = useState<{ screen: Screen; dir: 1 | -1 }>({
    screen: { name: "menu" },
    dir: 1,
  });
  const { screen, dir } = state;
	
  const [confirm_logout, setConfirmLogout] = useState(false);
  const [is_logging_out, setIsLoggingOut] = useState(false);
  const [logout_error, setLogoutError] = useState<string | null>(null);
  const in_flight = useRef(false);
	
  const go = (next: Screen, d: 1 | -1) => setState({ screen: next, dir: d });
  const tag = "tag_id" in screen ? tags.find((t) => t.id === screen.tag_id) : undefined;
	
  async function handleLogout() {
    if (in_flight.current) return;
	
    in_flight.current = true;
    setIsLoggingOut(true);
    setLogoutError(null);
	
    try {
      await useAuthStore.getState().logout();
      // Success: App swaps HomePage for LoginPage, so this whole panel unmounts.
    } catch (err) {
      setLogoutError(ApiError.getErrorMessage(err));
      setConfirmLogout(false);
      setIsLoggingOut(false);
      in_flight.current = false;
    }
  }
  
  return (
  	<>
	    <AnimatePresence mode="wait" custom={dir} initial={false}>
	      <motion.div
	        key={"tag_id" in screen ? `${screen.name}-${screen.tag_id}` : screen.name}
	        custom={dir}
	        variants={panelVariants}
	        initial="enter"
	        animate="center"
	        exit="exit"
	        transition={{ duration: 0.16, ease: "easeOut" }}
	        className="flex min-h-0 flex-1 flex-col"
	      >
	        {screen.name === "menu" && (
					  <>
					    <Header title="Settings" />
					    <Scroll>
								<NavRow icon={<User className="h-4 w-4" />} label="Edit profile" onClick={() => go({ name: "profile" }, 1)} />
					      <NavRow icon={<TagIcon className="h-4 w-4" />} label="Manage tags" onClick={() => go({ name: "tags" }, 1)} />
								<ReminderRow onInstall={() => go({ name: "install" }, 1)} />
								<NavRow icon={<Download className="h-4 w-4" />} label="Install the app" onClick={() => go({ name: "install" }, 1)} />
								
					      <div className="space-y-2.5 border-t border-border pt-4">
					        {logout_error && (
					          <p role="alert" className="rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-xs font-medium text-rose">
					            {logout_error}
					          </p>
					        )}
					        <button
					          type="button"
					          onClick={() => {
					            setLogoutError(null);
					            setConfirmLogout(true);
					          }}
					          className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-rose/30 bg-rose/10 px-4 py-3 text-left transition-colors active:bg-rose/20"
					        >
					          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose/10 text-rose">
					            <LogOut className="h-4 w-4" />
					          </span>
					          <span className="text-xs font-semibold text-rose">Log out</span>
					        </button>
					      </div>
					    </Scroll>
					  </>
					)}

					{screen.name === "profile" && (
					  <>
					    <Header title="Edit profile" onBack={() => go({ name: "menu" }, -1)} />
					    {has_info ? (
					      <EditProfile onDone={onClose} />
					    ) : (
					      <p className="py-10 text-center text-xs text-muted">Loading…</p>
					    )}
					  </>
					)}
	
	        {screen.name === "tags" && (
	          <>
	            <Header title="Manage tags" onBack={() => go({ name: "menu" }, -1)} />
	            <Scroll>
	              {tags.length === 0 ? (
	                <p className="py-10 text-center text-xs text-muted">
	                  No tags yet. They show up once you log a spend with one.
	                </p>
	              ) : (
	                tags.map((t) => (
	                  <NavRow key={t.id} label={t.name} onClick={() => go({ name: "tag", tag_id: t.id }, 1)} />
	                ))
	              )}
	            </Scroll>
	          </>
	        )}
	
	        {screen.name === "tag" && tag && (
	          <>
	            <Header title={tag.name} onBack={() => go({ name: "tags" }, -1)} />
	            <TagDetail
	              key={tag.id}
	              tag={tag}
	              tags={tags}
	              onDone={onClose}
	              onMerge={() => go({ name: "merge", tag_id: tag.id }, 1)}
	            />
	          </>
	        )}
	        
	        {screen.name === "merge" && tag && (
	          <>
	            <Header
	              title={`Merge ${tag.name} into...`}
	              onBack={() => go({ name: "tag", tag_id: tag.id }, -1)}
	            />
	            <MergeTag key={tag.id} tag={tag} tags={tags} onDone={onClose} />
	          </>
	        )}

					{screen.name === "install" && (
					  <>
					    <Header title="Install the app" onBack={() => go({ name: "menu" }, -1)} />
					    <Scroll>
					      <p className="text-xs leading-relaxed text-muted">
					        Add it to your home screen and it opens like any other app. No browser, no link, just tap and log.
					      </p>
					      <InstallGuide />
					    </Scroll>
					  </>
					)}
	      </motion.div>
	    </AnimatePresence>
	
	    <ConfirmDialog
	      open={confirm_logout}
	      title="Log out?"
	      message="Are you sure you want to log out?"
	      confirm_label="Yes, log out"
	      danger
	      loading={is_logging_out}
	      onConfirm={handleLogout}
	      onCancel={() => setConfirmLogout(false)}
	    />
   </>
  );
}

function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="flex shrink-0 items-center gap-2.5 border-b border-border px-5 py-2">
      {onBack && (
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}
      <h2 className="min-w-0 truncate text-md font-semibold tracking-tight text-foreground">{title}</h2>
    </header>
  );
}

function Scroll({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3.5">
      {children}
    </div>
  );
}

function NavRow({ icon, label, onClick }: { icon?: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-picker-border bg-picker-background px-4 py-3 text-left transition-colors active:bg-picker-surface-hover"
    >
      <span className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        <span className="truncate text-xs font-semibold text-foreground">{label}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
    </button>
  );
}

function ReminderRow({ onInstall }: { onInstall: () => void }) {
  const status = usePushStore((s) => s.status);
  const busy = usePushStore((s) => s.busy);
  const enable = usePushStore((s) => s.enable);
  const disable = usePushStore((s) => s.disable);
  const [error, setError] = useState<string | null>(null);

  if (status === "checking") return null;

  const on = status === "on";
  const can_toggle = status === "on" || status === "off";

  async function toggle() {
    setError(null);
    try { await (on ? disable() : enable()); }
    catch (err) { setError(ApiError.getErrorMessage(err)); }
  }

  return (
    <div className="rounded-2xl border border-picker-border bg-picker-background px-4 py-3">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold text-foreground">Daily reminders</span>
        </span>

        {can_toggle && (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            disabled={busy}
            onClick={toggle}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${on ? "bg-primary" : "bg-border"}`}
          >
            <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${on ? "translate-x-5" : ""}`} />
          </button>
        )}
      </div>

      {status === "needs_install" && (
        <p className="mt-2 text-2xs leading-relaxed text-muted">
          On iPhone, reminders only work from the installed app.{" "}
          <button type="button" onClick={onInstall} className="font-semibold text-primary">
            See how to install
          </button>
        </p>
      )}
      {status === "blocked" && (
        <p className="mt-2 text-2xs leading-relaxed text-muted">
          Notifications are blocked for this app. Allow them in your phone or browser settings, then come back.
        </p>
      )}
      {status === "unsupported" && (
        <p className="mt-2 text-2xs leading-relaxed text-muted">This browser doesn't support reminders.</p>
      )}
      {error && <p role="alert" className="mt-2 text-2xs text-rose">{error}</p>}
    </div>
  );
}