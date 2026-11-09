import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calculator, Download, KeyRound, LogOut, Paperclip, Plus, Trash2 } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostForm } from "@/components/admin/PostForm";
import { TeamForm } from "@/components/admin/TeamForm";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ContentForm } from "@/components/admin/ContentForm";
import { EstimatorForm } from "@/components/admin/EstimatorForm";
import { InsightsPanel } from "@/components/admin/InsightsPanel";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { UserForm } from "@/components/admin/UserForm";
import { InquiryDetail, StatusBadge } from "@/components/admin/InquiryDetail";
import {
  getMe,
  login,
  logout,
  listUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  ROLE_LABELS,
  SESSION_CHANGED_EVENT,
  INQUIRY_STATUS_LABELS,
  listInquiries,
  listWaitlist,
  deleteWaitlistSignup,
  waitlistExportUrl,
  type InquiryStatus,
  type AdminRole,
  type AdminUser,
  listPosts,
  createPost,
  updatePost,
  deletePost,
  listTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  type AdminPost,
  type AdminTeamMember,
  type AdminProject,
} from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { formatRange } from "@shared/estimator.js";

type View =
  | "inquiries"
  | "insights"
  | "waitlists"
  | "posts"
  | "projects"
  | "team"
  | "content"
  | "pricing"
  | "users"
  | "account";

const VIEW_LABELS: Record<View, string> = {
  inquiries: "Inquiries",
  insights: "Insights",
  waitlists: "Waitlists",
  posts: "Blog posts",
  projects: "Projects",
  team: "Team",
  content: "Site content",
  pricing: "Pricing",
  users: "Users",
  account: "Account",
};

/** The tabs each role sees (the API enforces the same rules). */
const VIEWS_BY_ROLE: Record<AdminRole, View[]> = {
  editor: ["posts"],
  admin: ["inquiries", "insights", "waitlists", "posts", "projects", "team", "content", "pricing"],
  superadmin: ["inquiries", "insights", "waitlists", "posts", "projects", "team", "content", "pricing", "users"],
};

/**
 * The inquiry an emailed "Open in the admin" link points at
 * (/admin?inquiry=<id>), read once and then dropped from the address bar.
 */
function takeLinkedInquiry(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("inquiry");
  if (id) {
    params.delete("inquiry");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }
  return id;
}

const Admin = () => {
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["admin", "me"], queryFn: getMe, retry: false });

  // The API reports a session that's over (signed out elsewhere, account
  // disabled, password reset) or a new password that's due: re-check.
  useEffect(() => {
    const recheck = () => qc.invalidateQueries({ queryKey: ["admin", "me"] });
    window.addEventListener(SESSION_CHANGED_EVENT, recheck);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, recheck);
  }, [qc]);

  const user = me.data?.authed ? me.data.user : undefined;
  return (
    <>
      <Seo title="Admin" noindex />
      <div className="min-h-screen bg-[#0f0f12] text-slate-100">
        {me.isLoading ? (
          <div className="grid min-h-screen place-items-center text-slate-400">Loading…</div>
        ) : !user ? (
          <LoginScreen />
        ) : user.mustChangePassword ? (
          <NewPasswordScreen user={user} />
        ) : (
          <Dashboard user={user} />
        )}
      </div>
    </>
  );
};

/** Clears everything cached for the previous account, then re-checks. */
const resetAdminCache = (qc: ReturnType<typeof useQueryClient>) =>
  qc.resetQueries({ queryKey: ["admin"] });

/* ---------------- Login ---------------- */
function LoginScreen() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => login(email.trim(), password),
    onSuccess: () => resetAdminCache(qc),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Sign in failed"),
  });

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8"
      >
        <h1 className="text-xl font-semibold text-white">Nesisoft Admin</h1>
        <p className="mt-1 text-sm text-slate-400">Sign in to manage the site.</p>
        <div className="mt-6 space-y-4">
          <Input
            type="email"
            placeholder="Email"
            aria-label="Email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border-white/10 bg-black/20 text-white placeholder:text-slate-500"
          />
          <Input
            type="password"
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border-white/10 bg-black/20 text-white placeholder:text-slate-500"
          />
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-violet-600 text-white hover:bg-violet-500"
          >
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- First sign-in with a temporary password ---------------- */
function NewPasswordScreen({ user }: { user: AdminUser }) {
  const qc = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => resetAdminCache(qc),
  });
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="text-xl font-semibold text-white">Choose your password</h1>
        <p className="mt-1 text-sm text-slate-400">
          You signed in as {user.email} with a temporary password. Choose your own to continue.
        </p>
        <div className="mt-6">
          <PasswordForm temporary onChanged={() => resetAdminCache(qc)} />
        </div>
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          className="mt-4 text-sm text-slate-400 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ user }: { user: AdminUser }) {
  const qc = useQueryClient();
  const views = VIEWS_BY_ROLE[user.role] ?? ["posts"];
  const canSeeInquiries = views.includes("inquiries");
  const [linkedInquiry] = useState(() => (canSeeInquiries ? takeLinkedInquiry() : null));
  const [view, setView] = useState<View>(linkedInquiry ? "inquiries" : views[0]);
  const [selectedId, setSelectedId] = useState<string | null>(linkedInquiry);

  // New inquiries show as a count on the tab; checked every minute.
  const inquiries = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: listInquiries,
    enabled: canSeeInquiries,
    refetchInterval: 60_000,
  });
  const newInquiries = inquiries.data?.items.filter((i) => i.status === "new").length ?? 0;
  const [creating, setCreating] = useState(false);

  const reset = () => {
    setSelectedId(null);
    setCreating(false);
  };

  const switchView = (v: View) => {
    setView(v);
    reset();
  };

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => resetAdminCache(qc),
  });

  // A role change can take a tab away: fall back to one still allowed.
  const current: View = view === "account" || views.includes(view) ? view : views[0];

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      {/* On phones the tabs get their own row under the name and buttons. */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 px-5 py-3 sm:h-14 sm:flex-nowrap sm:gap-6 sm:py-0">
        <span className="shrink-0 font-bold text-white">
          Nesisoft <span className="font-medium text-violet-400">Admin</span>
        </span>
        <nav className="order-last flex w-full min-w-0 gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors",
                current === v ? "bg-white/[0.06] text-white" : "text-slate-400 hover:text-white"
              )}
            >
              {VIEW_LABELS[v]}
              {v === "inquiries" && newInquiries > 0 && (
                <span
                  className="ml-1.5 bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  aria-label={`${newInquiries} new`}
                >
                  {newInquiries}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="hidden text-xs text-slate-500 lg:inline">
            {user.name || user.email} · {ROLE_LABELS[user.role]}
          </span>
          <Button
            variant="outline"
            aria-label="Account"
            onClick={() => switchView("account")}
            className={cn(
              "h-9 rounded-lg border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white",
              current === "account" && "bg-white/[0.06] text-white"
            )}
          >
            <KeyRound className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Account</span>
          </Button>
          <Button
            variant="outline"
            aria-label="Sign out"
            onClick={() => logoutMutation.mutate()}
            className="h-9 rounded-lg border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      {current === "account" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <AccountView user={user} />
        </div>
      ) : current === "content" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <ContentForm />
        </div>
      ) : current === "insights" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <InsightsPanel
            onOpenInquiry={(id) => {
              setView("inquiries");
              setSelectedId(id);
              setCreating(false);
            }}
          />
        </div>
      ) : current === "pricing" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <EstimatorForm />
        </div>
      ) : current === "waitlists" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <WaitlistsPanel />
        </div>
      ) : (
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-[320px_1fr]">
        {(() => {
          const panelProps: PanelProps = {
            selectedId,
            creating,
            onSelect: (id) => {
              setSelectedId(id);
              setCreating(false);
            },
            onNew: () => {
              setCreating(true);
              setSelectedId(null);
            },
            onAfterSave: (id) => {
              setSelectedId(id);
              setCreating(false);
            },
            onAfterDelete: reset,
          };
          if (current === "inquiries") return <InquiriesPanel {...panelProps} />;
          if (current === "posts") {
            return <PostsPanel {...panelProps} canDelete={user.role !== "editor"} />;
          }
          if (current === "projects") return <ProjectsPanel {...panelProps} />;
          if (current === "users") return <UsersPanel {...panelProps} me={user} />;
          return <TeamPanel {...panelProps} />;
        })()}
      </div>
      )}
    </div>
  );
}

/* ---------------- Shared list/editor chrome ---------------- */
interface PanelProps {
  selectedId: string | null;
  creating: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onAfterSave: (id: string) => void;
  onAfterDelete: () => void;
}

function ListShell({
  title,
  onNew,
  children,
}: {
  title: string;
  /** Left out where there's nothing to create (inquiries). */
  onNew?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="flex min-h-[3.25rem] items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {onNew && (
          <Button
            onClick={onNew}
            className="h-8 rounded-lg bg-violet-600 px-3 text-xs text-white hover:bg-violet-500"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> New
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">{children}</div>
    </section>
  );
}

function EditorShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-0 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-6 [&_input]:border-white/10 [&_input]:bg-black/20 [&_input]:text-white [&_textarea]:border-white/10 [&_textarea]:bg-black/20 [&_textarea]:text-white">
      {children}
    </section>
  );
}

function ListRow({
  active,
  title,
  meta,
  draft,
  onClick,
}: {
  active: boolean;
  title: string;
  meta: string;
  draft: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full rounded-lg px-3 py-2.5 text-left transition-colors",
        active ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
      )}
    >
      <span className="flex items-center gap-2">
        <span className="truncate text-sm font-medium text-white">{title}</span>
        {draft && (
          <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] text-slate-400">
            Draft
          </span>
        )}
      </span>
      <span className="mt-0.5 block truncate text-xs text-slate-500">{meta}</span>
    </button>
  );
}

const Empty = () => (
  <div className="grid h-full place-items-center text-sm text-slate-500">
    Select an item to edit, or create a new one.
  </div>
);

/* ---------------- Account ---------------- */
function AccountView({ user }: { user: AdminUser }) {
  const qc = useQueryClient();
  return (
    <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="text-lg font-semibold text-white">Your account</h2>
      <p className="mt-1 text-sm text-slate-400">
        {user.name ? `${user.name} · ` : ""}
        {user.email} · {ROLE_LABELS[user.role]}
      </p>
      <h3 className="mt-6 text-sm font-semibold text-white">Change password</h3>
      <p className="mb-4 mt-1 text-xs text-slate-500">
        Signs you out on your other devices; you stay signed in here.
      </p>
      <PasswordForm onChanged={() => qc.invalidateQueries({ queryKey: ["admin", "me"] })} />
    </div>
  );
}

/* ---------------- Posts ---------------- */
function PostsPanel(props: PanelProps & { canDelete: boolean }) {
  const qc = useQueryClient();
  const { data: posts = [] } = useQuery({ queryKey: ["admin", "posts"], queryFn: listPosts });
  const selected = posts.find((p) => p._id === props.selectedId) ?? null;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "posts"] });
    qc.invalidateQueries({ queryKey: ["posts"] }); // public list
  };

  const save = useMutation({
    mutationFn: (payload: Partial<AdminPost>) =>
      props.selectedId ? updatePost(props.selectedId, payload) : createPost(payload),
    onSuccess: (saved) => {
      invalidate();
      toast.success(props.selectedId ? "Post saved" : "Post created");
      props.onAfterSave(saved._id);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: () => deletePost(props.selectedId!),
    onSuccess: () => {
      invalidate();
      toast.success("Post deleted");
      props.onAfterDelete();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  return (
    <>
      <ListShell title="Blog posts" onNew={props.onNew}>
        {posts.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500">No posts yet.</p>
        ) : (
          posts.map((p) => (
            <ListRow
              key={p._id}
              active={p._id === props.selectedId}
              title={p.title}
              meta={`${p.category} · ${new Date(p.date).toLocaleDateString()}`}
              draft={p.published === false}
              onClick={() => props.onSelect(p._id)}
            />
          ))
        )}
      </ListShell>
      <EditorShell>
        {props.creating || selected ? (
          <PostForm
            key={selected?._id ?? "new"}
            post={selected}
            saving={save.isPending}
            onSave={(payload) => save.mutate(payload)}
            onDelete={
              props.canDelete
                ? () => {
                    if (confirm("Delete this post? This cannot be undone.")) remove.mutate();
                  }
                : undefined
            }
          />
        ) : (
          <Empty />
        )}
      </EditorShell>
    </>
  );
}

/* ---------------- Team ---------------- */
function TeamPanel(props: PanelProps) {
  const qc = useQueryClient();
  const { data: team = [] } = useQuery({ queryKey: ["admin", "team"], queryFn: listTeam });
  const selected = team.find((m) => m._id === props.selectedId) ?? null;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "team"] });
    qc.invalidateQueries({ queryKey: ["team"] }); // public list
  };

  const save = useMutation({
    mutationFn: (payload: Partial<AdminTeamMember>) =>
      props.selectedId ? updateTeam(props.selectedId, payload) : createTeam(payload),
    onSuccess: (saved) => {
      invalidate();
      toast.success(props.selectedId ? "Member saved" : "Member added");
      props.onAfterSave(saved._id);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: () => deleteTeam(props.selectedId!),
    onSuccess: () => {
      invalidate();
      toast.success("Member deleted");
      props.onAfterDelete();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  return (
    <>
      <ListShell title="Team" onNew={props.onNew}>
        {team.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500">No team members yet.</p>
        ) : (
          team.map((m) => (
            <ListRow
              key={m._id}
              active={m._id === props.selectedId}
              title={m.name}
              meta={m.role || "—"}
              draft={m.published === false}
              onClick={() => props.onSelect(m._id)}
            />
          ))
        )}
      </ListShell>
      <EditorShell>
        {props.creating || selected ? (
          <TeamForm
            key={selected?._id ?? "new"}
            member={selected}
            saving={save.isPending}
            onSave={(payload) => save.mutate(payload)}
            onDelete={() => {
              if (confirm("Delete this member? This cannot be undone.")) remove.mutate();
            }}
          />
        ) : (
          <Empty />
        )}
      </EditorShell>
    </>
  );
}

/* ---------------- Projects ---------------- */
function ProjectsPanel(props: PanelProps) {
  const qc = useQueryClient();
  const { data: projects = [] } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: listProjects,
  });
  const selected = projects.find((p) => p._id === props.selectedId) ?? null;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "projects"] });
    qc.invalidateQueries({ queryKey: ["projects"] }); // public list + nav
  };

  const save = useMutation({
    mutationFn: (payload: Partial<AdminProject>) =>
      props.selectedId ? updateProject(props.selectedId, payload) : createProject(payload),
    onSuccess: (saved) => {
      invalidate();
      toast.success(props.selectedId ? "Project saved" : "Project created");
      props.onAfterSave(saved._id);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: () => deleteProject(props.selectedId!),
    onSuccess: () => {
      invalidate();
      toast.success("Project deleted");
      props.onAfterDelete();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  return (
    <>
      <ListShell title="Projects" onNew={props.onNew}>
        {projects.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500">No projects yet.</p>
        ) : (
          projects.map((p) => (
            <ListRow
              key={p._id}
              active={p._id === props.selectedId}
              title={p.name}
              meta={`${p.category || "—"} · ${p.type}`}
              draft={p.published === false}
              onClick={() => props.onSelect(p._id)}
            />
          ))
        )}
      </ListShell>
      <EditorShell>
        {props.creating || selected ? (
          <ProjectForm
            key={selected?._id ?? "new"}
            project={selected}
            saving={save.isPending}
            onSave={(payload) => save.mutate(payload)}
            onDelete={() => {
              if (confirm("Delete this project? This cannot be undone.")) remove.mutate();
            }}
          />
        ) : (
          <Empty />
        )}
      </EditorShell>
    </>
  );
}

/* ---------------- Inquiries (admins and super admins) ---------------- */
type InquiryFilter = "all" | InquiryStatus;

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

function InquiriesPanel(props: PanelProps) {
  const { data } = useQuery({ queryKey: ["admin", "inquiries"], queryFn: listInquiries });
  const items = data?.items ?? [];
  const [filter, setFilter] = useState<InquiryFilter>("all");
  const shown = filter === "all" ? items : items.filter((i) => i.status === filter);
  const count = (f: InquiryFilter) =>
    f === "all" ? items.length : items.filter((i) => i.status === f).length;

  return (
    <>
      <ListShell title="Inquiries">
        <div className="mb-2 flex flex-wrap gap-1 px-1" role="group" aria-label="Filter by status">
          {(["all", ...Object.keys(INQUIRY_STATUS_LABELS)] as InquiryFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "px-2 py-1 text-xs transition-colors",
                filter === f ? "bg-white/[0.08] text-white" : "text-slate-400 hover:text-white"
              )}
            >
              {f === "all" ? "All" : INQUIRY_STATUS_LABELS[f]} {count(f)}
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500">
            {items.length === 0 ? "No inquiries yet. Contact-form messages appear here." : "None with this status."}
          </p>
        ) : (
          shown.map((i) => (
            <button
              key={i._id}
              onClick={() => props.onSelect(i._id)}
              className={cn(
                "block w-full px-3 py-2.5 text-left transition-colors",
                i._id === props.selectedId ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
              )}
            >
              <span className="flex items-center gap-2">
                {i.status === "new" && <span aria-hidden className="h-2 w-2 flex-shrink-0 bg-violet-400" />}
                <span
                  className={cn(
                    "truncate text-sm text-white",
                    i.status === "new" ? "font-semibold" : "font-medium"
                  )}
                >
                  {i.firstName} {i.lastName}
                </span>
                {i.estimate && <Calculator aria-label="Quote request from the cost calculator" className="h-3.5 w-3.5 flex-shrink-0 text-gold-300" />}
                {i.attachment && <Paperclip aria-label="Has an attachment" className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />}
                <span className="ml-auto flex-shrink-0 text-xs text-slate-500">{shortDate(i.createdAt)}</span>
              </span>
              <span className="mt-1 flex items-center gap-2">
                <StatusBadge status={i.status} />
                <span className="truncate text-xs text-slate-500">
                  {[i.company, i.service, i.estimate ? formatRange(i.estimate, "GHS") : ""].filter(Boolean).join(" · ") || i.email}
                </span>
              </span>
            </button>
          ))
        )}
      </ListShell>
      <EditorShell>
        {props.selectedId ? (
          <InquiryDetail key={props.selectedId} id={props.selectedId} onDeleted={props.onAfterDelete} />
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-500">
            Select an inquiry to read and reply.
          </div>
        )}
      </EditorShell>
    </>
  );
}

/* ---------------- Waitlists (early-access signups; admins and super admins) ---------------- */
function WaitlistsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "waitlist"], queryFn: listWaitlist });
  const items = data?.items ?? [];
  const [platform, setPlatform] = useState<string>("all");

  // Platforms that have signups, with their counts, in first-seen order.
  const platforms = Array.from(
    items.reduce((map, s) => map.set(s.platform.slug, { name: s.platform.name, count: (map.get(s.platform.slug)?.count ?? 0) + 1 }), new Map<string, { name: string; count: number }>())
  );
  const shown = platform === "all" ? items : items.filter((s) => s.platform.slug === platform);

  const remove = useMutation({
    mutationFn: deleteWaitlistSignup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "waitlist"] });
      toast.success("Signup removed");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't remove it"),
  });

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Waitlists</h2>
          <p className="mt-1 text-sm text-slate-400">
            Early-access signups from the platforms' pages. Export them to email people when a platform opens up.
          </p>
        </div>
        <Button asChild variant="outline" className="border-white/15 bg-transparent text-slate-200 hover:bg-white/[0.06] hover:text-white">
          <a href={waitlistExportUrl(platform === "all" ? undefined : platform)} download>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </a>
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-1" role="group" aria-label="Filter by platform">
        {[["all", { name: "All", count: items.length }] as const, ...platforms].map(([slug, info]) => (
          <button
            key={slug}
            onClick={() => setPlatform(slug)}
            aria-pressed={platform === slug}
            className={cn(
              "px-3 py-1.5 text-sm transition-colors",
              platform === slug ? "bg-white/[0.08] text-white" : "text-slate-400 hover:text-white"
            )}
          >
            {info.name} {info.count}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto border border-white/10">
        {isLoading ? (
          <p className="p-4 text-sm text-slate-400">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No signups yet. They appear here as people join from a platform's page.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium">Signed up</th>
                <th className="px-4 py-3"><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {shown.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3 text-white">{s.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${s.email}`} className="text-violet-300 hover:text-violet-200">{s.email}</a>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{s.role || "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{s.platform.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${s.email} from the ${s.platform.name} waitlist?`)) remove.mutate(s._id);
                      }}
                      aria-label={`Remove ${s.email}`}
                      className="p-1 text-slate-500 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

/* ---------------- Users (super admins) ---------------- */
function UsersPanel(props: PanelProps & { me: AdminUser }) {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ["admin", "users"], queryFn: listUsers });
  const selected = users.find((u) => u._id === props.selectedId) ?? null;
  // The temporary password just given to an account, shown until you move on.
  const [issued, setIssued] = useState<{ id: string; password: string } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });
  const onError = (err: unknown) =>
    toast.error(err instanceof Error ? err.message : "Something went wrong");

  const create = useMutation({
    mutationFn: createUser,
    onSuccess: (user, payload) => {
      invalidate();
      toast.success("Account created");
      setIssued({ id: user._id, password: payload.password });
      props.onAfterSave(user._id);
    },
    onError,
  });

  const save = useMutation({
    mutationFn: (changes: Partial<Pick<AdminUser, "name" | "role" | "active">>) =>
      updateUser(props.selectedId!, changes),
    onSuccess: () => {
      invalidate();
      // Your own name shows in the header.
      qc.invalidateQueries({ queryKey: ["admin", "me"] });
      toast.success("Account saved");
    },
    onError,
  });

  const reset = useMutation({
    mutationFn: (password: string) => resetUserPassword(props.selectedId!, password),
    onSuccess: (user, password) => {
      invalidate();
      setIssued({ id: user._id, password });
      toast.success("Temporary password set");
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: () => deleteUser(props.selectedId!),
    onSuccess: () => {
      invalidate();
      toast.success("Account deleted");
      props.onAfterDelete();
    },
    onError,
  });

  const busy = create.isPending || save.isPending || reset.isPending || remove.isPending;

  return (
    <>
      <ListShell
        title="Users"
        onNew={() => {
          setIssued(null);
          props.onNew();
        }}
      >
        {users.map((u) => (
          <button
            key={u._id}
            onClick={() => {
              if (u._id !== issued?.id) setIssued(null);
              props.onSelect(u._id);
            }}
            className={cn(
              "block w-full rounded-lg px-3 py-2.5 text-left transition-colors",
              u._id === props.selectedId ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
            )}
          >
            <span className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-white">{u.name || u.email}</span>
              {u._id === props.me._id && (
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-300">
                  You
                </span>
              )}
              {!u.active && (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-300">
                  Disabled
                </span>
              )}
            </span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">
              {ROLE_LABELS[u.role]} · {u.email}
            </span>
          </button>
        ))}
      </ListShell>
      <EditorShell>
        {props.creating || selected ? (
          <UserForm
            key={selected?._id ?? "new"}
            user={selected}
            isSelf={selected?._id === props.me._id}
            busy={busy}
            issuedPassword={selected && issued?.id === selected._id ? issued.password : undefined}
            onCreate={(payload) => create.mutate(payload)}
            onSave={(changes) => save.mutate(changes)}
            onResetPassword={(password) => reset.mutate(password)}
            onDelete={() => {
              if (
                selected &&
                confirm(`Delete ${selected.email}'s account? This cannot be undone.`)
              ) {
                remove.mutate();
              }
            }}
          />
        ) : (
          <Empty />
        )}
      </EditorShell>
    </>
  );
}

export default Admin;
