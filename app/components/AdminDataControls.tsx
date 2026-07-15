"use client";

import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useId } from "react";
import type {
  AdminCollectionKind,
  AdminRecordStatus,
} from "../data/admin";

type StatusOption = {
  label: string;
  value: AdminRecordStatus | "all";
};

const statusOptions: Record<AdminCollectionKind, readonly StatusOption[]> = {
  users: [
    { value: "all", label: "Bütün vəziyyətlər" },
    { value: "Aktiv", label: "Aktiv" },
    { value: "Gözləmədə", label: "Diqqət · Gözləmədə" },
    { value: "Məhdudlaşdırılıb", label: "Diqqət · Məhdudlaşdırılıb" },
  ],
  clubs: [
    { value: "all", label: "Bütün vəziyyətlər" },
    { value: "Aktiv", label: "Aktiv" },
    { value: "Gözləmədə", label: "Diqqət · Gözləmədə" },
    { value: "Məhdudlaşdırılıb", label: "Diqqət · Məhdudlaşdırılıb" },
  ],
  events: [
    { value: "all", label: "Bütün vəziyyətlər" },
    { value: "Açıq", label: "Açıq" },
    { value: "Qaralama", label: "Diqqət · Qaralama" },
    { value: "Tamamlanıb", label: "Tamamlanıb" },
  ],
};

const collectionLabels: Record<AdminCollectionKind, string> = {
  users: "İstifadəçilər",
  clubs: "Klublar",
  events: "Tədbirlər",
};

export type AdminDataControlsProps = {
  kind: AdminCollectionKind;
  loading: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: AdminRecordStatus | "all") => void;
  page: number;
  pageSize: number;
  searchValue: string;
  status: AdminRecordStatus | "all";
  total: number;
};

export function AdminDataControls({
  kind,
  loading,
  onPageChange,
  onRefresh,
  onSearchChange,
  onStatusChange,
  page,
  pageSize,
  searchValue,
  status,
  total,
}: AdminDataControlsProps) {
  const searchId = useId();
  const statusId = useId();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const rangeStart = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, total);
  const label = collectionLabels[kind];

  useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [onPageChange, page, totalPages]);

  return (
    <div className="admin-server-controls" aria-busy={loading}>
      <div className="admin-server-controls__query">
        <label className="admin-data-search" htmlFor={searchId}>
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">{label} daxilində axtar</span>
          <input
            id={searchId}
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Ad və ya məlumata görə axtar…"
            autoComplete="off"
          />
        </label>

        <label className="admin-status-filter" htmlFor={statusId}>
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span className="sr-only">Vəziyyətə görə filtrlə</span>
          <select
            id={statusId}
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as AdminRecordStatus | "all")
            }
          >
            {statusOptions[kind].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="admin-data-refresh-button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Cədvəli yenilə"
        >
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      </div>

      <nav className="admin-pagination" aria-label={`${label} səhifələri`}>
        <p aria-live="polite">
          <strong>{rangeStart}–{rangeEnd}</strong>
          <span> / {total} nəticə</span>
        </p>
        <div>
          <button
            type="button"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage <= 1 || loading}
            aria-label="Əvvəlki səhifə"
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <span aria-current="page">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= totalPages || loading}
            aria-label="Növbəti səhifə"
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </nav>
    </div>
  );
}
