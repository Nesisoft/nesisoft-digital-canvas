import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, LogOut, Plus } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostForm } from "@/components/admin/PostForm";
import { TeamForm } from "@/components/admin/TeamForm";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ContentForm } from "@/components/admin/ContentForm";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { UserForm } from "@/components/admin/UserForm";
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

type View = "posts" | "projects" | "team" | "content" | "users" | "account";

const VIEW_LABELS: Record<View, string> = {
  posts: "Blog posts",
  projects: "Projects",
  team: "Team",
  content: "Site content",
  users: "Users",
  account: "Account",
};

/** The tabs each role sees (the API enforces the same rules). */
const VIEWS_BY_ROLE: Record<AdminRole, View[]> = {
  editor: ["posts"],
  admin: ["posts", "projects", "team", "content"],
  superadmin: ["posts", "projects", "team", "content", "users"],
};

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
  const [view, setView] = useState<View>("posts");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  onNew: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <Button
          onClick={onNew}
          className="h-8 rounded-lg bg-violet-600 px-3 text-xs text-white hover:bg-violet-500"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> New
        </Button>
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
