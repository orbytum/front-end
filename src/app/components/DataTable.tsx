import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
} from "lucide-react";

export type ColumnAlign = "left" | "center" | "right";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  align?: ColumnAlign;
  className?: string;
  headerClassName?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: React.ReactNode;
  actions?: React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: React.ReactNode;
  className?: string;
  onRowClick?: (item: T) => void;
  // Controlled pagination (optional)
  page?: number;
  onPageChange?: (page: number) => void;
  // Server-side pagination support (optional)
  totalElements?: number;
  onPageSizeChange?: (size: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

const thAlignClassMap: Record<ColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const tdAlignClassMap: Record<ColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function DataTable<T>({
  data,
  columns,
  title,
  actions,
  keyExtractor,
  pageSize = 5,
  pageSizeOptions = [5, 10, 20],
  emptyMessage,
  className = "",
  onRowClick,
  page: propPage,
  onPageChange,
  totalElements,
  onPageSizeChange,
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(pageSize);

  const isServerPagination = totalElements !== undefined;
  const isControlled = propPage !== undefined;
  const currentPage = isControlled ? propPage : internalPage;

  const totalRecords = isServerPagination ? totalElements : data.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / currentLimit));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    if (isServerPagination) {
      return data;
    }
    const startIndex = (safePage - 1) * currentLimit;
    return data.slice(startIndex, startIndex + currentLimit);
  }, [data, safePage, currentLimit, isServerPagination]);

  const handlePageChange = (newPage: number) => {
    const target = Math.min(Math.max(1, newPage), totalPages);
    if (!isControlled) {
      setInternalPage(target);
    }
    onPageChange?.(target);
  };

  const handlePageSizeChange = (newSize: number) => {
    setCurrentLimit(newSize);
    if (!isControlled) {
      setInternalPage(1);
    }
    onPageChange?.(1);
    onPageSizeChange?.(newSize);
  };

  const startRecord = totalRecords === 0 ? 0 : (safePage - 1) * currentLimit + 1;
  const endRecord = Math.min(
    isServerPagination ? startRecord + data.length - 1 : safePage * currentLimit,
    totalRecords
  );
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div
      className={`bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]/30 overflow-hidden ${className}`}
    >
      {/* Table Header / Action Bar */}
      {(title || actions) && (
        <div className="p-6 border-b border-[#2e2e2e]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {title && typeof title === "string" ? (
            <h2 className="text-white font-semibold text-lg">{title}</h2>
          ) : (
            title
          )}
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2e2e2e]/30">
              {columns.map((col) => {
                const align = col.align || "left";
                return (
                  <th
                    key={col.key}
                    className={`px-6 py-4 text-sm font-medium text-[#9e9e9e] ${ thAlignClassMap[align] } ${col.headerClassName || ""}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-[#9e9e9e]"
                >
                  <Inbox className="w-10 h-10 mx-auto mb-2 text-[#2e2e2e]" />
                  <p>{emptyMessage || "Nenhum registro encontrado."}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => {
                const key = keyExtractor
                  ? keyExtractor(item, rowIndex)
                  : (item as any)?.id ?? rowIndex;
                const isLastRow = rowIndex === paginatedData.length - 1;

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b border-[#2e2e2e]/30 hover:bg-[#121212]/50 transition-colors ${ isLastRow ? "border-b-0" : "" } ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {columns.map((col) => {
                      const align = col.align || "left";
                      const content = col.render
                        ? col.render(item, rowIndex)
                        : (item as any)[col.key];

                      return (
                        <td
                          key={col.key}
                          className={`px-6 py-4 ${tdAlignClassMap[align]} ${ col.className || "" }`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.length > 0 && (
        <div className="p-4 border-t border-[#2e2e2e]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9e9e9e]">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <span>
              Mostrando <strong className="text-white">{startRecord}</strong> a{" "}
              <strong className="text-white">{endRecord}</strong> de{" "}
              <strong className="text-white">{totalRecords}</strong> registros
            </span>

            {pageSizeOptions && pageSizeOptions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9e9e9e]">Exibir:</span>
                <select
                  value={currentLimit}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="bg-[#121212] border border-[#2e2e2e]/40 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#ff8c42]/60 cursor-pointer"
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt} por pág.
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={safePage === 1}
                title="Primeira página"
                className="p-1.5 rounded-lg border border-[#2e2e2e]/30 text-[#9e9e9e] hover:text-white hover:bg-[#2e2e2e]/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage === 1}
                title="Página anterior"
                className="p-1.5 rounded-lg border border-[#2e2e2e]/30 text-[#9e9e9e] hover:text-white hover:bg-[#2e2e2e]/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 mx-1">
                {pageNumbers.map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 text-[#9e9e9e] text-xs"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p as number)}
                      className={`min-w-[30px] h-7 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${ safePage === p ? "bg-[#ff8c42] text-white" : "border border-[#2e2e2e]/30 text-[#9e9e9e] hover:text-white hover:bg-[#2e2e2e]/20" }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage === totalPages}
                title="Próxima página"
                className="p-1.5 rounded-lg border border-[#2e2e2e]/30 text-[#9e9e9e] hover:text-white hover:bg-[#2e2e2e]/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={safePage === totalPages}
                title="Última página"
                className="p-1.5 rounded-lg border border-[#2e2e2e]/30 text-[#9e9e9e] hover:text-white hover:bg-[#2e2e2e]/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
