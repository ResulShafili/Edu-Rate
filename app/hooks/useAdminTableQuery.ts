"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AdminCollectionKind,
  AdminListQuery,
  AdminRecordStatus,
} from "../data/admin";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 320;

export type AdminTableQueryController = {
  draftSearch: string;
  isDebouncing: boolean;
  page: number;
  pageSize: number;
  query: AdminListQuery;
  status: AdminRecordStatus | "all";
  setDraftSearch: (value: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setStatus: (status: AdminRecordStatus | "all") => void;
};

function normalizeSearch(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function useAdminTableQuery(
  kind: AdminCollectionKind,
): AdminTableQueryController {
  const previousKind = useRef(kind);
  const [draftSearch, setDraftSearchState] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatusState] = useState<AdminRecordStatus | "all">("all");
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);
  const normalizedDraft = normalizeSearch(draftSearch);

  useEffect(() => {
    if (previousKind.current === kind) return;

    previousKind.current = kind;
    setDraftSearchState("");
    setSearch("");
    setStatusState("all");
    setPageState(1);
  }, [kind]);

  useEffect(() => {
    if (normalizedDraft === search) return;

    const timeout = window.setTimeout(() => {
      setSearch(normalizedDraft);
      setPageState(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [normalizedDraft, search]);

  const setDraftSearch = useCallback((value: string) => {
    setDraftSearchState(value);
  }, []);

  const setStatus = useCallback((value: AdminRecordStatus | "all") => {
    setStatusState(value);
    setPageState(1);
  }, []);

  const setPage = useCallback((value: number) => {
    setPageState(Math.max(1, Math.floor(value)));
  }, []);

  const setPageSize = useCallback((value: number) => {
    setPageSizeState(Math.max(1, Math.min(100, Math.floor(value))));
    setPageState(1);
  }, []);

  const query = useMemo<AdminListQuery>(
    () => ({
      search: search || undefined,
      status,
      page,
      pageSize,
    }),
    [page, pageSize, search, status],
  );

  return {
    draftSearch,
    isDebouncing: normalizedDraft !== search,
    page,
    pageSize,
    query,
    status,
    setDraftSearch,
    setPage,
    setPageSize,
    setStatus,
  };
}
