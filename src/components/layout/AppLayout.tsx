"use client";

import { useState, useEffect, useReducer, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { NotificationToast } from "../ui/NotificationToast";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";
import { DashboardTab } from "../dashboard/DashboardTab";
import { CandidatesTab } from "../candidates/CandidatesTab";
import { ContactsTab } from "../contacts/ContactsTab";
import { CompaniesTab } from "../companies/CompaniesTab";
import { OpportunitiesTab } from "../opportunities/OpportunitiesTab";
import { TasksTab } from "../tasks/TasksTab";
import { DealsTab } from "../deals/DealsTab";
import { ResumeParserTab } from "../parser/ResumeParserTab";
import { ResumeParserModal } from "../parser/ResumeParserModal";
import { ResumePreviewModal } from "../shared/ResumePreviewModal";
import { EmailSettingsTab } from "../settings/EmailSettingsTab";
import { AutomationsTab } from "../settings/AutomationsTab";
import { CustomFieldsTab } from "../settings/CustomFieldsTab";
import { ReportsTab } from "../reports/ReportsTab";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { useCandidates } from "@/hooks/useCandidates";
import { useContacts } from "@/hooks/useContacts";
import { useCompanies } from "@/hooks/useCompanies";
import { useTasks } from "@/hooks/useTasks";
import { useDeals } from "@/hooks/useDeals";
import { useOpportunities } from "@/hooks/useOpportunities";
import { usePipelines } from "@/hooks/usePipelines";
import {
  deleteConfirmReducer,
  initialDeleteConfirmState,
} from "@/reducers/deleteConfirmReducer";
import * as deletedItemsApi from "@/lib/api/deleted-items";
import * as candidatesApi from "@/lib/api/candidates";
import * as contactsApi from "@/lib/api/contacts";
import * as companiesApi from "@/lib/api/companies";
import * as opportunitiesApi from "@/lib/api/opportunities";
import * as pipelinesApi from "@/lib/api/pipelines";

const DELETE_CONFIRM_VALUE = "DELETE";

export function AppLayout() {
  const { user, logout } = useAuth();
  const { message, type, showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedItem, setSelectedItem] = useState<unknown>(null);
  const [showForm, setShowForm] = useState(false);
  const [showResumeParser, setShowResumeParser] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCustomizeTable, setShowCustomizeTable] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteConfirm, dispatchDeleteConfirm] = useReducer(
    deleteConfirmReducer,
    initialDeleteConfirmState
  );

  const { candidates, refetch: refetchCandidates } = useCandidates();
  const { contacts, refetch: refetchContacts } = useContacts();
  const { companies, refetch: refetchCompanies } = useCompanies();
  const { tasks } = useTasks();
  const { deals } = useDeals();
  const { opportunities, refetch: refetchOpportunities } = useOpportunities();
  const { pipelines, refetch: refetchPipelines } = usePipelines();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crm_active_tab");
      if (saved) setActiveTab(saved);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const executeDelete = useCallback(async () => {
    const { type, id, collection, item, items } = deleteConfirm;
    if (!id) return;
    try {
      if (type === "bulk" && Array.isArray(id) && items?.length && collection) {
        const coll = collection as string;
        for (let i = 0; i < items.length; i++) {
          await deletedItemsApi.createDeletedItem({
            original_data: items[i] as Record<string, unknown>,
            original_collection: coll,
            deleted_at: new Date().toISOString(),
          });
        }
        const ids = id as string[];
        if (coll === "candidates") {
          for (const idToDelete of ids) {
            await candidatesApi.deleteCandidate(idToDelete);
          }
          refetchCandidates();
        } else if (coll === "contacts") {
          for (const idToDelete of ids) {
            await contactsApi.deleteContact(idToDelete);
          }
          refetchContacts();
        } else if (coll === "companies") {
          for (const idToDelete of ids) {
            await companiesApi.deleteCompany(idToDelete);
          }
          refetchCompanies();
        } else if (coll === "opportunities") {
          for (const idToDelete of ids) {
            await opportunitiesApi.deleteOpportunity(idToDelete);
          }
          refetchOpportunities();
        }
      } else if (type === "pipeline" && typeof id === "string") {
        await pipelinesApi.deletePipeline(id);
        refetchPipelines();
        refetchOpportunities();
      } else if (type === "single" && typeof id === "string" && item && collection) {
        const coll = collection as string;
        await deletedItemsApi.createDeletedItem({
          original_data: item as Record<string, unknown>,
          original_collection: coll,
          deleted_at: new Date().toISOString(),
        });
        if (coll === "candidates") {
          await candidatesApi.deleteCandidate(id);
          refetchCandidates();
        } else if (coll === "contacts") {
          await contactsApi.deleteContact(id);
          refetchContacts();
        } else if (coll === "companies") {
          await companiesApi.deleteCompany(id);
          refetchCompanies();
        } else if (coll === "opportunities") {
          await opportunitiesApi.deleteOpportunity(id);
          refetchOpportunities();
        }
        setSelectedItem((prev: unknown) => (prev && (prev as { id?: string }).id === id ? null : prev));
      }
      dispatchDeleteConfirm({ type: "CLOSE" });
      setDeleteInput("");
      showNotification("Deleted successfully", "success");
    } catch (e) {
      showNotification((e as Error).message || "Delete failed", "error");
    }
  }, [deleteConfirm, showNotification, refetchCandidates, refetchContacts, refetchCompanies, refetchOpportunities, refetchPipelines]);

  const triggerDelete = useCallback(
    (payload: {
      type: string;
      id: string | string[];
      name: string;
      collection?: string;
      item?: unknown;
      items?: unknown[];
    }) => {
      dispatchDeleteConfirm({ type: "OPEN", payload });
      setDeleteInput("");
    },
    []
  );

  const closeDeleteConfirm = useCallback(() => {
    dispatchDeleteConfirm({ type: "CLOSE" });
    setDeleteInput("");
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      <NotificationToast message={message} type={type} />
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Confirm Delete"
        message={
          deleteConfirm.type === "bulk"
            ? `Permanently move ${(deleteConfirm.id as string[])?.length ?? 0} item(s) to Recycle Bin? You can restore them from Deleted Records.`
            : `Permanently move "${deleteConfirm.name}" to Recycle Bin? You can restore from Deleted Records.`
        }
        confirmValue={DELETE_CONFIRM_VALUE}
        inputValue={deleteInput}
        onInputChange={setDeleteInput}
        onConfirm={executeDelete}
        onClose={closeDeleteConfirm}
      />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedItem={setSelectedItem}
        setShowForm={setShowForm}
        onLogout={handleLogout}
        user={user}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === "dashboard" && (
          <DashboardTab
            candidates={candidates}
            contacts={contacts}
            companies={companies}
            opportunities={opportunities}
            pipelines={pipelines}
          />
        )}
        {activeTab === "candidates" && (
          <CandidatesTab
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            showForm={showForm}
            setShowForm={setShowForm}
            triggerDelete={triggerDelete}
            showFilterModal={showFilterModal}
            setShowFilterModal={setShowFilterModal}
            showCustomizeTable={showCustomizeTable}
            setShowCustomizeTable={setShowCustomizeTable}
            showImportModal={showImportModal}
            setShowImportModal={setShowImportModal}
            openCustomizeTableModal={() => setShowCustomizeTable(true)}
            setShowResumeParser={setShowResumeParser}
            onOpenResumePreview={setResumePreviewUrl}
            showNotification={showNotification}
          />
        )}
        {activeTab === "contacts" && (
          <ContactsTab
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            showForm={showForm}
            setShowForm={setShowForm}
            triggerDelete={triggerDelete}
            showFilterModal={showFilterModal}
            setShowFilterModal={setShowFilterModal}
            showCustomizeTable={showCustomizeTable}
            setShowCustomizeTable={setShowCustomizeTable}
            showImportModal={showImportModal}
            setShowImportModal={setShowImportModal}
            openCustomizeTableModal={() => setShowCustomizeTable(true)}
            showNotification={showNotification}
          />
        )}
        {activeTab === "companies" && (
          <CompaniesTab
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            showForm={showForm}
            setShowForm={setShowForm}
            triggerDelete={triggerDelete}
            showFilterModal={showFilterModal}
            setShowFilterModal={setShowFilterModal}
            showCustomizeTable={showCustomizeTable}
            setShowCustomizeTable={setShowCustomizeTable}
            showImportModal={showImportModal}
            setShowImportModal={setShowImportModal}
            openCustomizeTableModal={() => setShowCustomizeTable(true)}
            showNotification={showNotification}
          />
        )}
        {activeTab === "opportunities" && (
          <OpportunitiesTab
            triggerDelete={triggerDelete}
            showNotification={showNotification}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab showNotification={showNotification} />
        )}
        {activeTab === "deals" && (
          <DealsTab showNotification={showNotification} />
        )}
        {activeTab === "aiparser" && (
          <ResumeParserTab onOpenParser={() => setShowResumeParser(true)} />
        )}
        {activeTab === "emailsettings" && (
          <EmailSettingsTab showNotification={showNotification} />
        )}
        {activeTab === "automations" && (
          <AutomationsTab showNotification={showNotification} />
        )}
        {activeTab === "customFields" && <CustomFieldsTab />}
        {activeTab === "reports" && <ReportsTab />}
      </div>

      <ResumeParserModal
        open={showResumeParser}
        onClose={() => setShowResumeParser(false)}
        onSuccess={refetchCandidates}
        showNotification={showNotification}
      />
      <ResumePreviewModal
        url={resumePreviewUrl}
        onClose={() => setResumePreviewUrl(null)}
      />
    </div>
  );
}
