import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState("user_alice");
  const [selectedGroup, setSelectedGroup] = useState("team_engineering");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-violet-400">convex-invite-links</span> demo
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Acting as:</label>
              <select
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-violet-500"
              >
                <option value="user_alice">Alice</option>
                <option value="user_bob">Bob</option>
                <option value="user_carol">Carol</option>
                <option value="user_dave">Dave</option>
              </select>
            </div>
            <a
              href="https://github.com/TimpiaAI/convex-invite-links"
              className="text-sm text-slate-400 hover:text-white transition"
              target="_blank"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6 flex flex-col gap-8">
        <p className="text-slate-400">
          Membership and invite management component for Convex — create
          shareable invite links with expiration, email locking, group/resource
          access control, and full lifecycle tracking.
        </p>

        <GroupManagement
          currentUser={currentUser}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />
        <MembershipSection
          currentUser={currentUser}
          groupId={selectedGroup}
        />
        <CreateInvite
          currentUser={currentUser}
          groupId={selectedGroup}
        />
        <InviteList groupId={selectedGroup} />
        <ClaimInvite currentUser={currentUser} />
        <ResourceAccessSection currentUser={currentUser} />
      </main>
    </div>
  );
}

// ─── Group Management ────────────────────────────────────────

function GroupManagement({
  currentUser,
  selectedGroup,
  onSelectGroup,
}: {
  currentUser: string;
  selectedGroup: string;
  onSelectGroup: (g: string) => void;
}) {
  const [newGroupId, setNewGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const upsertGroup = useMutation(api.invites.upsertGroup);
  const addMember = useMutation(api.invites.addMember);
  const groups = useQuery(api.invites.getAllGroups, { userId: currentUser });

  const handleCreate = async () => {
    if (!newGroupId.trim()) return;
    await upsertGroup({
      groupId: newGroupId.trim(),
      name: newGroupName.trim() || undefined,
    });
    // Auto-add creator as member
    await addMember({
      userId: currentUser,
      groupId: newGroupId.trim(),
      addedBy: currentUser,
    });
    onSelectGroup(newGroupId.trim());
    setNewGroupId("");
    setNewGroupName("");
  };

  return (
    <section className="bg-slate-900 rounded-lg p-6 border border-slate-800">
      <h2 className="text-lg font-semibold mb-4">Groups</h2>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Group ID (e.g. team_design)"
          value={newGroupId}
          onChange={(e) => setNewGroupId(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
        />
        <input
          type="text"
          placeholder="Display name (optional)"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={handleCreate}
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Create Group
        </button>
      </div>

      {groups && groups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <button
              key={g.groupId}
              onClick={() => onSelectGroup(g.groupId)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition border ${
                selectedGroup === g.groupId
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:border-violet-500"
              }`}
            >
              {g.groupId}
            </button>
          ))}
        </div>
      )}
      {groups && groups.length === 0 && (
        <p className="text-slate-500 text-sm">
          No groups yet. Create one to get started.
        </p>
      )}
    </section>
  );
}

// ─── Membership ──────────────────────────────────────────────

function MembershipSection({
  currentUser,
  groupId,
}: {
  currentUser: string;
  groupId: string;
}) {
  const [newMember, setNewMember] = useState("");
  const members = useQuery(api.invites.getAllMembers, { groupId });
  const isMember = useQuery(api.invites.isMember, {
    userId: currentUser,
    groupId,
  });
  const addMember = useMutation(api.invites.addMember);
  const removeMember = useMutation(api.invites.removeMember);

  const handleAdd = async () => {
    if (!newMember.trim()) return;
    await addMember({
      userId: newMember.trim(),
      groupId,
      addedBy: currentUser,
    });
    setNewMember("");
  };

  return (
    <section className="bg-slate-900 rounded-lg p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Members of{" "}
          <span className="text-violet-400 font-mono text-base">
            {groupId}
          </span>
        </h2>
        <span
          className={`text-xs px-2 py-1 rounded font-medium ${
            isMember
              ? "bg-emerald-900 text-emerald-300"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {isMember ? "You are a member" : "Not a member"}
        </span>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="User ID to add (e.g. user_bob)"
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={handleAdd}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Add Member
        </button>
      </div>

      {members === undefined ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : members.length === 0 ? (
        <p className="text-slate-500 text-sm">No members yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <div
              key={m.userId}
              className="flex items-center justify-between bg-slate-800 rounded px-4 py-3 border border-slate-700"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{m.userId}</span>
                <span className="text-xs text-slate-500">
                  Added {new Date(m.addedAt).toLocaleDateString()}
                  {m.addedBy && ` by ${m.addedBy}`}
                </span>
              </div>
              <button
                onClick={() =>
                  removeMember({ userId: m.userId, groupId })
                }
                className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-3 py-1 rounded transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Create Invite ───────────────────────────────────────────

function CreateInvite({
  currentUser,
  groupId,
}: {
  currentUser: string;
  groupId: string;
}) {
  const [email, setEmail] = useState("");
  const [hours, setHours] = useState("");
  const [result, setResult] = useState<{
    inviteId: string;
    token: string;
  } | null>(null);
  const createInvite = useMutation(api.invites.createInvite);

  const handleCreate = async () => {
    const res = await createInvite({
      groupId,
      email: email.trim() || undefined,
      expiresInHours: hours ? Number(hours) : undefined,
      createdBy: currentUser,
    });
    setResult(res);
    setEmail("");
    setHours("");
  };

  return (
    <section className="bg-slate-900 rounded-lg p-6 border border-slate-800">
      <h2 className="text-lg font-semibold mb-1">Create Invite</h2>
      <p className="text-xs text-slate-500 mb-4">
        Generate an invite link for{" "}
        <span className="text-violet-400 font-mono">{groupId}</span>.
        Optionally lock to an email or set custom expiry.
      </p>
      <div className="flex gap-3 mb-4">
        <input
          type="email"
          placeholder="Lock to email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
        />
        <input
          type="number"
          placeholder="Expires in hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-44 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={handleCreate}
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Create Invite
        </button>
      </div>
      {result && (
        <div className="bg-slate-800 rounded p-4 border border-violet-800">
          <p className="text-xs text-violet-400 mb-1 font-medium">
            Invite created -- share this token!
          </p>
          <code className="text-sm font-mono text-white break-all select-all">
            {result.token}
          </code>
          <p className="text-xs text-slate-500 mt-2">
            Invite ID: {result.inviteId}
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Invite List ─────────────────────────────────────────────

function InviteList({ groupId }: { groupId: string }) {
  const allInvites = useQuery(api.invites.listAllInvites, { groupId });
  const revokeInvite = useMutation(api.invites.revokeInviteByToken);

  const getStatus = (inv: {
    claimedAt?: number;
    revokedAt?: number;
    expiresAt?: number;
  }) => {
    if (inv.claimedAt) return "claimed";
    if (inv.revokedAt) return "revoked";
    if (inv.expiresAt && inv.expiresAt < Date.now()) return "expired";
    return "pending";
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-900 text-amber-300",
    claimed: "bg-emerald-900 text-emerald-300",
    revoked: "bg-red-900 text-red-300",
    expired: "bg-slate-700 text-slate-400",
  };

  if (allInvites === undefined) {
    return (
      <section className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Invites</h2>
        <p className="text-slate-500 text-sm">Loading...</p>
      </section>
    );
  }

  return (
    <section className="bg-slate-900 rounded-lg p-6 border border-slate-800">
      <h2 className="text-lg font-semibold mb-4">
        Invites{" "}
        <span className="text-sm text-slate-500 font-normal">
          ({allInvites.length})
        </span>
      </h2>
      {allInvites.length === 0 ? (
        <p className="text-slate-500 text-sm">
          No invites for this group yet. Create one above.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {allInvites.map((inv) => {
            const status = getStatus(inv);
            return (
              <div
                key={inv.inviteId}
                className={`flex items-center justify-between bg-slate-800 rounded px-4 py-3 border ${
                  status === "revoked" || status === "expired"
                    ? "border-slate-700 opacity-60"
                    : "border-slate-700"
                }`}
              >
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                      {inv.token}
                    </code>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${statusColors[status]}`}
                    >
                      {status}
                    </span>
                    {inv.email && (
                      <span className="text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded">
                        locked: {inv.email}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span>
                      Created:{" "}
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                    {inv.expiresAt && (
                      <span>
                        Expires:{" "}
                        {new Date(inv.expiresAt).toLocaleString()}
                      </span>
                    )}
                    {inv.claimedBy && <span>Claimed by: {inv.claimedBy}</span>}
                    {inv.createdBy && <span>Created by: {inv.createdBy}</span>}
                  </div>
                </div>
                {status === "pending" && (
                  <button
                    onClick={() => revokeInvite({ token: inv.token })}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-3 py-1 rounded transition ml-3 shrink-0"
                  >
                    Revoke
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Claim Invite ────────────────────────────────────────────

function ClaimInvite({ currentUser }: { currentUser: string }) {
  const [token, setToken] = useState("");
  const [claimEmail, setClaimEmail] = useState("");
  const [result, setResult] = useState<{
    ok: boolean;
    reason?: string;
    groupId?: string;
    resourceId?: string;
  } | null>(null);
  const claimInvite = useMutation(api.invites.claimInvite);

  const handleClaim = async () => {
    if (!token.trim()) return;
    const res = await claimInvite({
      token: token.trim(),
      userId: currentUser,
      email: claimEmail.trim() || undefined,
    });
    setResult(res);
    if (res.ok) setToken("");
  };

  return (
    <section className="bg-slate-900 rounded-lg p-6 border border-slate-800">
      <h2 className="text-lg font-semibold mb-1">Claim Invite</h2>
      <p className="text-xs text-slate-500 mb-4">
        Paste an invite token to claim it as{" "}
        <span className="text-violet-400 font-mono">{currentUser}</span>. If
        the invite is email-locked, provide the matching email.
      </p>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Paste invite token (inv_...)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-500"
        />
        <input
          type="email"
          placeholder="Your email (if locked)"
          value={claimEmail}
          onChange={(e) => setClaimEmail(e.target.value)}
          className="w-56 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={handleClaim}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Claim
        </button>
      </div>
      {result && (
        <div
          className={`rounded p-4 border ${
            result.ok
              ? "bg-emerald-950 border-emerald-800"
              : "bg-red-950 border-red-800"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              result.ok ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {result.ok
              ? `Invite claimed! ${result.groupId ? `Added to group ${result.groupId}` : ""}${result.resourceId ? `Granted access to ${result.resourceId}` : ""}`
              : `Claim failed -- ${result.reason}`}
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Resource Access ─────────────────────────────────────────

function ResourceAccessSection({ currentUser }: { currentUser: string }) {
  const [resourceId, setResourceId] = useState("doc_quarterly_report");
  const [targetUser, setTargetUser] = useState("");
  const [checkResult, setCheckResult] = useState<boolean | null>(null);

  const grantAccess = useMutation(api.invites.grantAccess);
  const revokeAccess = useMutation(api.invites.revokeAccess);
  const hasAccess = useQuery(api.invites.hasAccess, {
    userId: currentUser,
    resourceId,
  });

  const handleGrant = async () => {
    if (!targetUser.trim() || !resourceId.trim()) return;
    await grantAccess({
      userId: targetUser.trim(),
      resourceId: resourceId.trim(),
      grantedBy: currentUser,
    });
    setTargetUser("");
  };

  const handleCheck = () => {
    setCheckResult(hasAccess ?? false);
  };

  return (
    <section className="bg-slate-900 rounded-lg p-6 border border-slate-800">
      <h2 className="text-lg font-semibold mb-1">Resource Access</h2>
      <p className="text-xs text-slate-500 mb-4">
        Grant and check fine-grained resource-level access independently of
        group membership.
      </p>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Resource ID"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          className="w-56 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-500"
        />
        <input
          type="text"
          placeholder="User ID to grant access"
          value={targetUser}
          onChange={(e) => setTargetUser(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGrant()}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={handleGrant}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Grant
        </button>
        <button
          onClick={() =>
            revokeAccess({
              userId: targetUser.trim() || currentUser,
              resourceId: resourceId.trim(),
            })
          }
          className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-3 py-2 rounded transition"
        >
          Revoke
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleCheck}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Check My Access
        </button>
        {hasAccess !== undefined && (
          <span
            className={`text-xs px-2 py-1 rounded font-medium ${
              hasAccess
                ? "bg-emerald-900 text-emerald-300"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            {hasAccess
              ? `${currentUser} has access to ${resourceId}`
              : `${currentUser} does NOT have access to ${resourceId}`}
          </span>
        )}
        {checkResult !== null && hasAccess === undefined && (
          <span className="text-xs text-slate-500">Loading...</span>
        )}
      </div>
    </section>
  );
}
