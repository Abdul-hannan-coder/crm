"use client";

import { useState, useMemo } from "react";
import {
  Menu,
  Plus,
  Search,
  Trash2,
  ChevronDown,
  Filter,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import type { Task } from "@/types";
import type { Candidate } from "@/types";
import type { Contact } from "@/types";
import type { Company } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import { useCandidates } from "@/hooks/useCandidates";
import { useContacts } from "@/hooks/useContacts";
import { useCompanies } from "@/hooks/useCompanies";

interface TasksTabProps {
  showNotification: (msg: string, type?: "success" | "error") => void;
}

export function TasksTab({ showNotification }: TasksTabProps) {
  const { tasks, createTask, updateTask, deleteTask, bulkDeleteTasks } = useTasks();
  const { candidates } = useCandidates();
  const { contacts } = useContacts();
  const { companies } = useCompanies();

  const [taskSearch, setTaskSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState("All Tasks");
  const [dueFilter, setDueFilter] = useState("All time");
  const [showDueDateDropdown, setShowDueDateDropdown] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTaskRows, setSelectedTaskRows] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    status: "pending",
    owner: "Abdul Rehman",
    related_to: "",
    reminder: "30 Min Before",
    due_date: new Date().toISOString().slice(0, 16),
    task_type: "Follow Up",
    description: "",
    collaborators: "",
    associations: "",
  });

  const resetForm = () =>
    setTaskForm({
      title: "",
      status: "pending",
      owner: "Abdul Rehman",
      related_to: "",
      reminder: "30 Min Before",
      due_date: new Date().toISOString().slice(0, 16),
      task_type: "Follow Up",
      description: "",
      collaborators: "",
      associations: "",
    });

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      list = list.filter(
        (t) =>
          (t.title ?? "").toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q)
      );
    }
    if (taskFilter === "Completed") {
      list = list.filter((t) => t.status === "completed");
    } else if (taskFilter === "Pending") {
      list = list.filter((t) => t.status !== "completed");
    } else if (taskFilter === "Overdue") {
      const now = new Date();
      list = list.filter((t) => {
        if (!t.due_date || t.status === "completed") return false;
        return new Date(t.due_date).getTime() < now.getTime();
      });
    }
    const now = new Date();
    if (dueFilter === "Past Pending (Overdue Tasks)") {
      list = list.filter(
        (t) => t.due_date && new Date(t.due_date) < now && t.status !== "completed"
      );
    } else if (dueFilter === "Today") {
      list = list.filter((t) => {
        if (!t.due_date) return false;
        return new Date(t.due_date).toDateString() === now.toDateString();
      });
    } else if (dueFilter === "Tomorrow") {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      list = list.filter((t) => {
        if (!t.due_date) return false;
        return new Date(t.due_date).toDateString() === tomorrow.toDateString();
      });
    } else if (dueFilter === "This week") {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + 7);
      list = list.filter(
        (t) =>
          t.due_date &&
          new Date(t.due_date) <= weekEnd &&
          new Date(t.due_date) >= now
      );
    } else if (dueFilter === "This month") {
      list = list.filter((t) => {
        if (!t.due_date) return false;
        const d = new Date(t.due_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (dueFilter === "Custom range") {
      if (customDateFrom)
        list = list.filter(
          (t) => t.due_date && new Date(t.due_date) >= new Date(customDateFrom)
        );
      if (customDateTo)
        list = list.filter(
          (t) => t.due_date && new Date(t.due_date) <= new Date(customDateTo)
        );
    }
    return list;
  }, [tasks, taskSearch, taskFilter, dueFilter, customDateFrom, customDateTo]);

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) {
      showNotification("Title is required", "error");
      return;
    }
    try {
      if (editingTask?.id) {
        await updateTask(editingTask.id, {
          ...taskForm,
          reminder: (taskForm as { reminder?: string }).reminder,
          due_date: taskForm.due_date
            ? new Date(taskForm.due_date).toISOString()
            : undefined,
        });
        showNotification("Task updated!");
      } else {
        await createTask({
          ...taskForm,
          reminder: (taskForm as { reminder?: string }).reminder,
          due_date: taskForm.due_date
            ? new Date(taskForm.due_date).toISOString()
            : undefined,
          created_at: new Date().toISOString(),
        });
        showNotification("Task created!");
      }
      setShowAddTaskModal(false);
      resetForm();
      setEditingTask(null);
    } catch (e) {
      showNotification("Failed: " + (e instanceof Error ? e.message : "Error"), "error");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      showNotification("Task deleted.");
      setSelectedTaskRows((prev) => prev.filter((r) => r !== id));
    } catch {
      showNotification("Delete failed.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedTaskRows.length) return;
    if (!window.confirm(`Delete ${selectedTaskRows.length} tasks?`)) return;
    try {
      await bulkDeleteTasks(selectedTaskRows);
      setSelectedTaskRows([]);
      showNotification(`${selectedTaskRows.length} tasks deleted.`);
    } catch {
      showNotification("Bulk delete failed.", "error");
    }
  };

  const entities = [
    ...candidates.map((c) => ({ id: c.id, name: (c as { name?: string }).name ?? "" })),
    ...contacts.map((c) => ({ id: c.id, name: (c as { name?: string }).name ?? "" })),
    ...companies.map((c) => ({ id: c.id, name: (c as { name?: string }).name ?? "" })),
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Menu size={18} className="text-gray-400" />
          <h1 className="text-[15px] font-semibold text-gray-800">
            Tasks <span className="text-gray-400">• Page 1</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedTaskRows.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-sm"
            >
              <Trash2 size={14} /> Delete ({selectedTaskRows.length})
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDueDateDropdown(!showDueDateDropdown)}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
            >
              Due: <span className="text-blue-600">{dueFilter}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {showDueDateDropdown && (
              <div
                className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2"
                onClick={(e) => e.stopPropagation()}
              >
                {[
                  "Past Pending (Overdue Tasks)",
                  "Today",
                  "Tomorrow",
                  "This week",
                  "This month",
                  "All time",
                  "Custom range",
                ].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setDueFilter(opt);
                      setShowDueDateDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-blue-50 hover:text-blue-600 ${dueFilter === opt ? "text-blue-600 font-semibold" : "text-gray-700"}`}
                  >
                    {opt}
                    {dueFilter === opt && <CheckCircle2 size={15} className="text-blue-500" />}
                  </button>
                ))}
                {dueFilter === "Custom range" && (
                  <div className="px-1 pb-2 space-y-2 border-t pt-2 mt-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-500">From</label>
                      <input
                        type="date"
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1"
                        value={customDateFrom}
                        onChange={(e) => setCustomDateFrom(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500">To</label>
                      <input
                        type="date"
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1"
                        value={customDateTo}
                        onChange={(e) => setCustomDateTo(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="border-t mt-2 pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDueFilter("All time");
                      setShowDueDateDropdown(false);
                    }}
                    className="flex-1 py-1.5 border border-gray-200 rounded text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDueDateDropdown(false)}
                    className="flex-1 py-1.5 border border-gray-200 rounded text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-semibold"
            title="Start tasks in a queue (coming soon)"
          >
            <ListTodo size={14} /> Start in Queue
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingTask(null);
              setShowAddTaskModal(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="bg-white border-b px-6 flex items-center gap-1">
        {["All Tasks", "Pending", "Overdue", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setTaskFilter(f)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              taskFilter === f
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto pb-1">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 w-64">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="bg-transparent outline-none ml-2 text-sm w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 w-10 text-center sticky left-0 bg-gray-50 z-20">
                <input
                  type="checkbox"
                  checked={
                    filteredTasks.length > 0 &&
                    selectedTaskRows.length === filteredTasks.length
                  }
                  onChange={(e) =>
                    setSelectedTaskRows(
                      e.target.checked ? filteredTasks.map((t) => t.id) : []
                    )
                  }
                  className="rounded text-blue-600 w-4 h-4"
                />
              </th>
              <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Title
              </th>
              <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Status
              </th>
              <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Due Date
              </th>
              <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTasks.map((task) => (
              <tr
                key={task.id}
                className={`group hover:bg-slate-50/80 ${
                  selectedTaskRows.includes(task.id) ? "bg-blue-50" : ""
                }`}
              >
                <td className="p-3 text-center sticky left-0 bg-white group-hover:bg-slate-50/80 z-10">
                  <input
                    type="checkbox"
                    checked={selectedTaskRows.includes(task.id)}
                    onChange={(e) =>
                      setSelectedTaskRows(
                        e.target.checked
                          ? [...selectedTaskRows, task.id]
                          : selectedTaskRows.filter((id) => id !== task.id)
                      )
                    }
                    className="rounded text-blue-600 w-4 h-4"
                  />
                </td>
                <td className="p-3 text-sm text-gray-800">{task.title ?? "—"}</td>
                <td className="p-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded border ${
                      task.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {task.status ?? "pending"}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-500">
                  {task.due_date
                    ? new Date(task.due_date).toLocaleString()
                    : "—"}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setTaskForm({
                        title: task.title ?? "",
                        status: task.status ?? "pending",
                        owner: (task as { owner?: string }).owner ?? "Abdul Rehman",
                        related_to: (task as { related_to?: string }).related_to ?? "",
                        reminder: (task as { reminder?: string }).reminder ?? "30 Min Before",
                        due_date: task.due_date
                          ? new Date(task.due_date).toISOString().slice(0, 16)
                          : new Date().toISOString().slice(0, 16),
                        task_type: (task as { task_type?: string }).task_type ?? "Follow Up",
                        description: task.description ?? "",
                        collaborators: (task as { collaborators?: string }).collaborators ?? "",
                        associations: (task as { associations?: string }).associations ?? "",
                      });
                      setEditingTask(task);
                      setShowAddTaskModal(true);
                    }}
                    className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-lg ml-1"
                    title="Edit"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] max-w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {editingTask ? "Edit Task" : "Add Task"}
              </h3>
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setEditingTask(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={taskForm.status}
                  onChange={(e) =>
                    setTaskForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Related To
                </label>
                <select
                  value={taskForm.related_to}
                  onChange={(e) =>
                    setTaskForm((f) => ({ ...f, related_to: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name || e.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reminder
                </label>
                <select
                  value={taskForm.reminder}
                  onChange={(e) =>
                    setTaskForm((f) => ({ ...f, reminder: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="30 Min Before">30 Min Before</option>
                  <option value="1 Hour Before">1 Hour Before</option>
                  <option value="1 Day Before">1 Day Before</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Task Type
                </label>
                <select
                  value={taskForm.task_type}
                  onChange={(e) =>
                    setTaskForm((f) => ({ ...f, task_type: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Follow Up">Follow Up</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Demo">Demo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={taskForm.due_date}
                  onChange={(e) =>
                    setTaskForm((f) => ({ ...f, due_date: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Collaborators
                </label>
                <input
                  type="text"
                  value={taskForm.collaborators}
                  onChange={(e) =>
                    setTaskForm((f) => ({ ...f, collaborators: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Comma-separated"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Associations
                </label>
                <input
                  type="text"
                  value={taskForm.associations}
                  onChange={(e) =>
                    setTaskForm((f) => ({ ...f, associations: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Comma-separated"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setEditingTask(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
