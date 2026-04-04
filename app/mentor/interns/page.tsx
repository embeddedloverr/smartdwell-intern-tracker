"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import InternForm from "@/components/forms/InternForm";
import Toast from "@/components/ui/Toast";
import { UserPlus, Loader2, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { formatIST } from "@/lib/utils";

interface Intern {
  _id: string;
  name: string;
  email: string;
  phase: number;
  joinDate: string;
  avatarInitials: string;
  active: boolean;
}

export default function ManageInternsPage() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIntern, setEditingIntern] = useState<Intern | null>(null);
  const [editPhase, setEditPhase] = useState(1);
  const [editPassword, setEditPassword] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadInterns = async () => {
    const res = await fetch("/api/mentor/interns");
    setInterns(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    loadInterns();
  }, []);

  const handleCreate = async (data: { name: string; email: string; password: string; phase: number }) => {
    const res = await fetch("/api/mentor/interns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    setShowModal(false);
    setToast({ message: "Intern created successfully!", type: "success" });
    loadInterns();
  };

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/mentor/interns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setToast({ message: `Intern ${active ? "deactivated" : "activated"}`, type: "success" });
    loadInterns();
  };

  const handleEditSave = async () => {
    if (!editingIntern) return;
    const body: Record<string, unknown> = { phase: editPhase };
    if (editPassword) body.password = editPassword;

    await fetch(`/api/mentor/interns/${editingIntern._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditingIntern(null);
    setEditPassword("");
    setToast({ message: "Intern updated!", type: "success" });
    loadInterns();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-sdw-teal" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-sdw-navy">Manage Interns</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-sdw-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sdw-teal/90"
        >
          <UserPlus size={18} />
          Add New Intern
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {interns.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No intern accounts yet. Click &quot;Add New Intern&quot; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Phase</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Joined</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {interns.map((intern) => (
                  <tr key={intern._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sdw-teal text-white flex items-center justify-center text-xs font-medium">
                          {intern.avatarInitials}
                        </div>
                        <span className="font-medium text-sdw-navy">{intern.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{intern.email}</td>
                    <td className="px-4 py-3 text-center">{intern.phase}</td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {formatIST(intern.joinDate, "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          intern.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {intern.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingIntern(intern);
                            setEditPhase(intern.phase);
                            setEditPassword("");
                          }}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggle(intern._id, intern.active)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title={intern.active ? "Deactivate" : "Activate"}
                        >
                          {intern.active ? (
                            <ToggleRight size={20} className="text-green-600" />
                          ) : (
                            <ToggleLeft size={20} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Intern">
        <InternForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingIntern}
        onClose={() => setEditingIntern(null)}
        title={`Edit ${editingIntern?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
            <select
              value={editPhase}
              onChange={(e) => setEditPhase(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
            >
              {[1, 2, 3, 4].map((p) => (
                <option key={p} value={p}>
                  Phase {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
              placeholder="New password"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEditSave}
              className="flex-1 bg-sdw-teal text-white py-2 rounded font-medium text-sm hover:bg-sdw-teal/90"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingIntern(null)}
              className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
