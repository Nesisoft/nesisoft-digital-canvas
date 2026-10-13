import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Plus } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostForm } from "@/components/admin/PostForm";
import { TeamForm } from "@/components/admin/TeamForm";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ContentForm } from "@/components/admin/ContentForm";
import {
  getMe,
  login,
  logout,
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

type View = "posts" | "projects" | "team" | "content";

const VIEW_LABELS: Record<View, string> = {
  posts: "Blog posts",
  projects: "Projects",
  team: "Team",
  content: "Site content",
};

const Admin = () => {
  const me = useQuery({ queryKey: ["admin", "me"], queryFn: getMe, retry: false });

  return (
    <>
      <Seo title="Admin" noindex />
      <div className="min-h-screen bg-[#0f0f12] text-slate-100">
        {me.isLoading ? (
          <div className="grid min-h-screen place-items-center text-slate-400">Loading…</div>
        ) : me.data?.authed ? (
          <Dashboard username={me.data.username} />
        ) : (
          <LoginScreen />
        )}
      </div>
    </>
  );
};

/* ---------------- Login ---------------- */
function LoginScreen() {
  const qc = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
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
        <p className="mt-1 text-sm text-slate-400">Sign in to manage the blog and team.</p>
        <div className="mt-6 space-y-4">
          <Input
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-lg border-white/10 bg-black/20 text-white placeholder:text-slate-500"
          />
          <Input
            type="password"
            placeholder="Password"
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

/* ---------------- Dashboard ---------------- */
function Dashboard({ username }: { username?: string }) {
  const qc = useQueryClient();
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-14 items-center gap-6 border-b border-white/10 px-5">
        <span className="font-bold text-white">
          Nesisoft <span className="font-medium text-violet-400">Admin</span>
        </span>
        <nav className="flex gap-1">
          {(["posts", "projects", "team", "content"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                view === v ? "bg-white/[0.06] text-white" : "text-slate-400 hover:text-white"
              )}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {username && <span className="text-xs text-slate-500">Signed in as {username}</span>}
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            className="h-9 rounded-lg border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      {view === "content" ? (
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
          if (view === "posts") return <PostsPanel {...panelProps} />;
          if (view === "projects") return <ProjectsPanel {...panelProps} />;
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

/* ---------------- Posts ---------------- */
function PostsPanel(props: PanelProps) {
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
            onDelete={() => {
              if (confirm("Delete this post? This cannot be undone.")) remove.mutate();
            }}
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

export default Admin;
