import React, { useEffect, useState } from "react";

type User = { id: string; role: string; name?: string };
type Attachment = { id: string; filename: string; url: string };
type Assignment = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  attachments?: Attachment[];
  createdBy?: { id: string; name?: string };
};

export default function Assignments({ classId, user }: { classId: string; user: User | null }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch(`/api/classes/${classId}/assignments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => res.json()).then(setAssignments).catch((e) => console.error(e));
  };

  useEffect(() => { load(); }, [classId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Class Work</h2>
        {user && (user.role === "TEACHER" || user.role === "ADMIN") && (
          <button className="neon-button" onClick={() => setShowForm(true)}>+ New Assignment</button>
        )}
      </div>

      {assignments.length === 0 && <div className="p-6 glass-card">No assignments yet.</div>}

      <ul className="space-y-3">
        {assignments.map(a => (
          <li key={a.id} className="glass-card">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{a.title}</h3>
                {a.description && <p className="text-muted">{a.description}</p>}
                <div className="mt-2 text-sm text-muted">Posted by {a.createdBy?.name || "Teacher"} • {new Date(a.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-col gap-2">
                {a.attachments?.map(att => (
                  <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="text-primary underline">{att.filename}</a>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showForm && user && (user.role === "TEACHER" || user.role === "ADMIN") && (
        <CreateAssignmentModal classId={classId} onClose={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}

function CreateAssignmentModal({ classId, onClose }: { classId: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const submit = async () => {
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    if (files) Array.from(files).forEach(f => form.append("files", f));

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/classes/${classId}/assignments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });

    if (res.ok) {
      onClose();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create assignment");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <div className="bg-card p-6 rounded shadow-lg w-[90%] max-w-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">New Assignment</h3>
          <button onClick={onClose} className="text-muted">Close</button>
        </div>
        <div className="mt-4 space-y-3">
          <input className="w-full p-2 rounded bg-input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="w-full p-2 rounded bg-input" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <input type="file" multiple onChange={e => setFiles(e.target.files)} />
          <div className="flex justify-end gap-2 mt-4">
            <button className="neon-button" onClick={submit}>Create</button>
            <button className="glow-border" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
