"use client";

import { useState, useCallback } from "react";
import { Mail, Plus, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { useSmtpSettings } from "@/hooks/useSmtpSettings";
import * as smtpApi from "@/lib/api/smtp-settings";
import type { SmtpSetting } from "@/types";

interface EmailSettingsTabProps {
  showNotification: (msg: string, type?: "success" | "error") => void;
}

const emptyForm = {
  smtp_host: "",
  smtp_port: 587,
  smtp_user: "",
  smtp_pass: "",
  smtp_from_name: "",
  is_active: true,
};

function isGoogleAccount(s: SmtpSetting) {
  return (
    s.auth_type === "google" ||
    !!(s as Record<string, unknown>).google_access_token
  );
}

export function EmailSettingsTab({ showNotification }: EmailSettingsTabProps) {
  const { smtpSettings, loading, refetch, createSmtpSetting, updateSmtpSetting, deleteSmtpSetting } =
    useSmtpSettings();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [testingId, setTestingId] = useState<string | null>(null);

  const openAdd = useCallback(() => {
    setForm(emptyForm);
    setEditingId(null);
    setShowAddModal(true);
  }, []);

  const openEdit = useCallback((s: SmtpSetting) => {
    setForm({
      smtp_host: s.smtp_host ?? "",
      smtp_port: s.smtp_port ?? 587,
      smtp_user: s.smtp_user ?? "",
      smtp_pass: "",
      smtp_from_name: s.smtp_from_name ?? "",
      is_active: s.is_active ?? true,
    });
    setEditingId(s.id);
    setShowAddModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const payload = {
        user_email: form.smtp_user || undefined,
        smtp_host: form.smtp_host || undefined,
        smtp_port: form.smtp_port,
        smtp_user: form.smtp_user || undefined,
        smtp_from_name: form.smtp_from_name || undefined,
        is_active: form.is_active,
        auth_type: "smtp",
      } as Partial<SmtpSetting>;
      if (form.smtp_pass) (payload as Record<string, unknown>).smtp_pass = form.smtp_pass;
      if (editingId) {
        await updateSmtpSetting(editingId, payload);
        showNotification("SMTP setting updated.", "success");
      } else {
        await createSmtpSetting(payload);
        showNotification("SMTP setting added.", "success");
      }
      refetch();
      closeModal();
    } catch (e) {
      showNotification(e instanceof Error ? e.message : "Failed to save", "error");
    }
  }, [form, editingId, updateSmtpSetting, createSmtpSetting, refetch, closeModal, showNotification]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteSmtpSetting(id);
        showNotification("SMTP setting removed.", "success");
        refetch();
      } catch (e) {
        showNotification(e instanceof Error ? e.message : "Failed to delete", "error");
      }
    },
    [deleteSmtpSetting, refetch, showNotification]
  );

  const handleToggleActive = useCallback(
    async (s: SmtpSetting) => {
      try {
        await updateSmtpSetting(s.id, { is_active: !s.is_active });
        showNotification(s.is_active ? "Account disabled." : "Account enabled.", "success");
        refetch();
      } catch (e) {
        showNotification(e instanceof Error ? e.message : "Failed to update", "error");
      }
    },
    [updateSmtpSetting, refetch, showNotification]
  );

  const handleTest = useCallback(
    async (id: string) => {
      setTestingId(id);
      try {
        await smtpApi.testSmtpSetting(id);
        showNotification("Test request sent successfully.", "success");
      } catch (e) {
        showNotification(e instanceof Error ? e.message : "Test failed", "error");
      } finally {
        setTestingId(null);
      }
    },
    [showNotification]
  );

  const handleConnectGmail = useCallback(() => {
    showNotification(
      "Connect Gmail: use Sign in with Google in the app; SMTP settings for Gmail can be added manually with your app password.",
      "success"
    );
  }, [showNotification]);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Email Settings</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleConnectGmail}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            <Mail className="w-4 h-4" />
            Connect Gmail
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add SMTP
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase w-10">Provider</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Email / From</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Auth Type</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Active</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {smtpSettings.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="p-3">
                    {isGoogleAccount(s) ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 text-sm font-bold">G</span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm font-bold">SMTP</span>
                    )}
                  </td>
                  <td className="p-3 text-sm font-medium text-gray-800">
                    {s.user_email ?? s.smtp_from_name ?? s.smtp_user ?? "—"}
                  </td>
                  <td className="p-3 text-sm text-gray-600">{s.auth_type ?? "—"}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(s)}
                      className="text-gray-600 hover:text-gray-900"
                      title={s.is_active ? "Disable" : "Enable"}
                    >
                      {s.is_active ? <Power className="w-4 h-4 text-emerald-500" /> : <PowerOff className="w-4 h-4 text-gray-400" />}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!isGoogleAccount(s) && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleTest(s.id)}
                            disabled={!!testingId}
                            className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 text-xs font-medium"
                          >
                            {testingId === s.id ? "Testing…" : "Test"}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(s)}
                            className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {smtpSettings.length === 0 && (
            <p className="p-6 text-center text-gray-500 text-sm">No email accounts. Add SMTP or connect Gmail.</p>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? "Edit SMTP" : "Add SMTP"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Host</label>
                <input
                  type="text"
                  value={form.smtp_host}
                  onChange={(e) => setForm((f) => ({ ...f, smtp_host: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Port</label>
                <input
                  type="number"
                  value={form.smtp_port}
                  onChange={(e) => setForm((f) => ({ ...f, smtp_port: Number(e.target.value) || 587 }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">User</label>
                <input
                  type="text"
                  value={form.smtp_user}
                  onChange={(e) => setForm((f) => ({ ...f, smtp_user: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Password {editingId && "(leave blank to keep)"}</label>
                <input
                  type="password"
                  value={form.smtp_pass}
                  onChange={(e) => setForm((f) => ({ ...f, smtp_pass: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From name</label>
                <input
                  type="text"
                  value={form.smtp_from_name}
                  onChange={(e) => setForm((f) => ({ ...f, smtp_from_name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Your Name"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex items-center justify-between mt-6 gap-2">
              <div>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => editingId && handleTest(editingId)}
                    disabled={!!testingId}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {testingId === editingId ? "Testing…" : "Test"}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
