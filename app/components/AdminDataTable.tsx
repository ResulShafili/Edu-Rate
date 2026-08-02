"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LockKeyhole, MoreHorizontal, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import type { AdminRecordStatus } from "../data/admin";
import type { AdminUserRole } from "../data/admin";
import { AdminDataControls } from "./AdminDataControls";
import { AdminSkeleton } from "./AdminSkeleton";

export type AdminTableKind = "users" | "clubs" | "events";

export type AdminTableRow = {
  id: string;
  name: string;
  detail: string;
  metric: string;
  status: string;
  statusTone: "positive" | "neutral" | "attention";
  updatedAt: string;
  role?: AdminUserRole;
};

type AdminDataTableProps = {
  activeKind: AdminTableKind;
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canEditRow?: (row: AdminTableRow) => boolean;
  error: Error | null;
  loading: boolean;
  mutationPending: boolean;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onKindChange: (kind: AdminTableKind) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: AdminRecordStatus | "all") => void;
  page: number;
  pageSize: number;
  queryPending: boolean;
  restrictionMessage: string | null;
  rows: readonly AdminTableRow[];
  searchValue: string;
  status: AdminRecordStatus | "all";
  total: number;
};

type TableConfig = {
  label: string;
  singular: string;
  detailLabel: string;
  metricLabel: string;
};

const tableKinds: readonly AdminTableKind[] = ["users", "clubs", "events"];

const tableConfig: Record<AdminTableKind, TableConfig> = {
  users: {
    label: "İstifadəçilər",
    singular: "istifadəçi",
    detailLabel: "Əlaqə və rol",
    metricLabel: "Fəallıq",
  },
  clubs: {
    label: "Klublar",
    singular: "klub",
    detailLabel: "Kateqoriya",
    metricLabel: "Üzvlər",
  },
  events: {
    label: "Tədbirlər",
    singular: "tədbir",
    detailLabel: "Tarix və məkan",
    metricLabel: "İştirak",
  },
};

export function AdminDataTable({
  activeKind,
  canCreate,
  canDelete,
  canEdit,
  canEditRow,
  error,
  loading,
  mutationPending,
  onCreate,
  onDelete,
  onEdit,
  onKindChange,
  onPageChange,
  onRetry,
  onSearchChange,
  onStatusChange,
  page,
  pageSize,
  queryPending,
  restrictionMessage,
  rows,
  searchValue,
  status,
  total,
}: AdminDataTableProps) {
  const reducedMotion = useReducedMotion();
  const [selectedRow, setSelectedRow] = useState<AdminTableRow | null>(null);
  const config = tableConfig[activeKind];

  function selectKind(kind: AdminTableKind) {
    setSelectedRow(null);
    onKindChange(kind);
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentKind: AdminTableKind,
  ) {
    const currentIndex = tableKinds.indexOf(currentKind);
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tableKinds.length;
    if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tableKinds.length) % tableKinds.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tableKinds.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextKind = tableKinds[nextIndex];
    selectKind(nextKind);
    document.getElementById(`admin-${nextKind}-tab`)?.focus();
  }

  return (
    <section id="admin-data" className="admin-data-section" aria-labelledby="admin-data-title">
      <header className="admin-data-section__heading">
        <div>
          <span>Məlumat idarəetməsi</span>
          <h2 id="admin-data-title">Platformanı bir yerdən idarə et.</h2>
        </div>
        <p>
          Qeydiyyatları yoxla, vəziyyəti izlə və vacib əməliyyatlara sakit bir iş
          sahəsindən çat.
        </p>
      </header>

      <div className="admin-data-toolbar">
        <div className="admin-data-tabs" role="tablist" aria-label="Məlumat cədvəlini seç">
          {tableKinds.map((kind) => (
            <button
              key={kind}
              id={`admin-${kind}-tab`}
              type="button"
              role="tab"
              aria-selected={activeKind === kind}
              aria-controls="admin-data-panel"
              tabIndex={activeKind === kind ? 0 : -1}
              onClick={() => selectKind(kind)}
              onKeyDown={(event) => handleTabKeyDown(event, kind)}
            >
              <span>{tableConfig[kind].label}</span>
              {activeKind === kind && (
                <motion.span
                  className="admin-data-tabs__active"
                  layoutId="admin-data-active-tab"
                  transition={{ type: "spring", stiffness: 410, damping: 35 }}
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>

        {canCreate ? (
          <button
            type="button"
            className="admin-crud-create-button"
            onClick={onCreate}
            disabled={mutationPending}
          >
            <Plus size={16} aria-hidden="true" />
            Yeni {config.singular}
          </button>
        ) : (
          <span className="admin-permission-badge">
            <LockKeyhole size={14} aria-hidden="true" />
            Məhdud səlahiyyət
          </span>
        )}
      </div>

      {restrictionMessage && (
        <p className="admin-permission-note" role="note">
          <LockKeyhole size={15} aria-hidden="true" />
          {restrictionMessage}
        </p>
      )}

      <AdminDataControls
        kind={activeKind}
        loading={queryPending}
        onPageChange={onPageChange}
        onRefresh={onRetry}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        page={page}
        pageSize={pageSize}
        searchValue={searchValue}
        status={status}
        total={total}
      />

      <div
        id="admin-data-panel"
        className="admin-data-panel"
        role="tabpanel"
        aria-labelledby={`admin-${activeKind}-tab`}
        aria-busy={loading || queryPending}
      >
        {loading ? (
          <AdminSkeleton scope="table" />
        ) : error ? (
          <div className="admin-error-state" role="alert">
            <span>Məlumat alınmadı</span>
            <h3>Cədvəli hazırda göstərə bilmirik.</h3>
            <p>Bağlantını yoxlayıb yenidən cəhd et.</p>
            <button type="button" onClick={onRetry}>
              <RefreshCw size={15} aria-hidden="true" />
              Yenidən yoxla
            </button>
          </div>
        ) : (
          <div className="admin-table-shell">
            <table className="admin-data-table">
              <caption className="sr-only">
                {config.label}: bu səhifədə {rows.length}, ümumilikdə {total} nəticə
              </caption>
              <thead className="admin-data-table__header">
                <tr>
                  <th scope="col">{config.label}</th>
                  <th scope="col">{config.detailLabel}</th>
                  <th scope="col">{config.metricLabel}</th>
                  <th scope="col">Vəziyyət</th>
                  <th scope="col">Yenilənmə</th>
                  <th scope="col">
                    <span className="sr-only">Əməliyyatlar</span>
                  </th>
                </tr>
              </thead>
              <motion.tbody layout>
                <AnimatePresence mode="popLayout" initial={!reducedMotion}>
                  {rows.map((row, index) => (
                    <motion.tr
                      key={`${activeKind}-${row.id}`}
                      layout
                      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.34,
                        delay: reducedMotion ? 0 : Math.min(index * 0.045, 0.28),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <th scope="row">
                        <span className="admin-table-row-index" aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="admin-table-primary">
                          <strong>{row.name}</strong>
                          <small>ID · {row.id}</small>
                        </span>
                      </th>
                      <td>{row.detail}</td>
                      <td>{row.metric}</td>
                      <td>
                        <span className={`admin-table-status is-${row.statusTone}`}>
                          <i aria-hidden="true" />
                          {row.status}
                        </span>
                      </td>
                      <td>{row.updatedAt}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-table-action"
                          onClick={() =>
                            setSelectedRow((current) => (current?.id === row.id ? null : row))
                          }
                          aria-expanded={selectedRow?.id === row.id}
                          aria-controls="admin-row-inspector"
                          aria-label={`${row.name} adlı ${config.singular} üçün detalları göstər`}
                          disabled={mutationPending}
                        >
                          <MoreHorizontal size={18} aria-hidden="true" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </motion.tbody>
            </table>

            {rows.length === 0 && (
              <div className="admin-table-empty" role="status">
                <Search size={20} aria-hidden="true" />
                <strong>Uyğun nəticə tapılmadı.</strong>
                <span>Axtarış sözünü dəyişib yenidən yoxla.</span>
              </div>
            )}

            <AnimatePresence>
              {selectedRow && (
                <motion.aside
                  id="admin-row-inspector"
                  className="admin-row-inspector"
                  aria-live="polite"
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
                  transition={{ duration: reducedMotion ? 0 : 0.24 }}
                >
                  <div>
                    <span>Seçilmiş qeyd</span>
                    <strong>{selectedRow.name}</strong>
                    <small>{selectedRow.detail}</small>
                  </div>
                  <dl>
                    <div>
                      <dt>{config.metricLabel}</dt>
                      <dd>{selectedRow.metric}</dd>
                    </div>
                    <div>
                      <dt>Vəziyyət</dt>
                      <dd>{selectedRow.status}</dd>
                    </div>
                    <div>
                      <dt>Yenilənmə</dt>
                      <dd>{selectedRow.updatedAt}</dd>
                    </div>
                  </dl>
                  <div className="admin-row-inspector__actions">
                    {canEdit && (canEditRow?.(selectedRow) ?? true) && (
                    <button
                      type="button"
                      onClick={() => {
                        onEdit(selectedRow.id);
                        setSelectedRow(null);
                      }}
                      disabled={mutationPending}
                    >
                      <Pencil size={15} aria-hidden="true" />
                      Redaktə et
                    </button>
                    )}
                    {canDelete && (
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => {
                        onDelete(selectedRow.id);
                        setSelectedRow(null);
                      }}
                      disabled={mutationPending}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      Sil
                    </button>
                    )}
                    {(!canEdit || !(canEditRow?.(selectedRow) ?? true)) && !canDelete && (
                      <span className="admin-row-inspector__read-only">
                        <LockKeyhole size={14} aria-hidden="true" />
                        Bu bölmə yalnız baxış üçündür.
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRow(null)}
                    aria-label="Seçilmiş qeydin detallarını bağla"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
