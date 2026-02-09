import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function StudentTablePagination({
  data,
  page,
  setPage,
  limit,
  setLimit,
}) {
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || 1;
  const totalEntries = data?.total || 0;

  // Logic to calculate showing range
  const from = totalEntries === 0 ? 0 : (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalEntries);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 3; // Reduced for better spacing with the select box
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => setPage(i)}
            className={cn(
              "cursor-pointer h-9 w-9 transition-all",
              currentPage === i
                ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:text-white shadow-sm"
                : "hover:bg-indigo-50 hover:text-indigo-600",
            )}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 gap-6">
      {/* LEFT: Rows per page & Stats */}
      <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Rows
          </span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              setLimit(parseInt(value));
              setPage(1); // Reset to first page when limit changes
            }}
          >
            <SelectTrigger className="h-8 w-[70px] bg-white border-slate-200 text-xs font-bold ring-offset-indigo-600 focus:ring-indigo-600">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent className="min-w-[70px]">
              {[10, 20, 30, 50, 100].map((val) => (
                <SelectItem
                  key={val}
                  value={val.toString()}
                  className="text-xs font-medium"
                >
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:block h-6 w-px bg-slate-200" />

        <p className="text-sm font-medium text-slate-500">
          Showing <span className="text-slate-900 font-bold">{from}</span> to{" "}
          <span className="text-slate-900 font-bold">{to}</span> of{" "}
          <span className="text-slate-900 font-bold">{totalEntries}</span>{" "}
          students
        </p>
      </div>

      {/* RIGHT: Navigation */}
      <div className="flex items-center gap-4">
        <Pagination className="w-auto">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && setPage(currentPage - 1)}
                className={cn(
                  "h-9 px-3 cursor-pointer border-slate-200 bg-white hover:bg-slate-50 transition-all",
                  currentPage === 1 && "pointer-events-none opacity-40",
                )}
              />
            </PaginationItem>

            {/* Ellipsis for start if needed */}
            {currentPage > 2 && totalPages > 4 && (
              <PaginationItem className="hidden md:inline-block">
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {renderPageNumbers()}

            {/* Ellipsis for end if needed */}
            {currentPage < totalPages - 1 && totalPages > 4 && (
              <PaginationItem className="hidden md:inline-block">
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages && setPage(currentPage + 1)
                }
                className={cn(
                  "h-9 px-3 cursor-pointer border-slate-200 bg-white hover:bg-slate-50 transition-all",
                  currentPage === totalPages &&
                    "pointer-events-none opacity-40",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
