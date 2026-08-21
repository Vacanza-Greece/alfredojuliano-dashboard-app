"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import PageLoader from "../Shared/PageLoader";
import { useGetProtectPurchasesQuery } from "@/redux/features/auth/vacanzaProtectApi";
import {
  ProtectPlanType,
  ProtectPurchase,
  ProtectPurchaseStatus,
} from "@/redux/types/protect.type";

const STATUS_CONFIG: Record<
  ProtectPurchaseStatus,
  { text: string; bg: string; textColor: string }
> = {
  ACTIVE: { text: "Active", bg: "bg-green-100", textColor: "text-green-800" },
  PENDING: {
    text: "Pending",
    bg: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  EXPIRED: { text: "Expired", bg: "bg-gray-100", textColor: "text-gray-700" },
  CANCELLED: {
    text: "Cancelled",
    bg: "bg-purple-100",
    textColor: "text-purple-800",
  },
  FAILED: { text: "Failed", bg: "bg-red-100", textColor: "text-red-800" },
};

const PLAN_LABEL: Record<ProtectPlanType, string> = {
  YEARLY: "Annual home cover",
  PER_TRIP: "Single trip cover",
};

const PAGE_SIZE = 8;

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const ProtectPurchases = () => {
  const [statusFilter, setStatusFilter] = React.useState<
    ProtectPurchaseStatus | "ALL"
  >("ALL");
  const [planFilter, setPlanFilter] = React.useState<ProtectPlanType | "ALL">(
    "ALL"
  );
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);

  const { data, isLoading, isError } = useGetProtectPurchasesQuery();

  const purchases = React.useMemo(() => {
    const all = data?.purchases ?? [];
    const term = search.trim().toLowerCase();

    return all.filter((purchase: ProtectPurchase) => {
      if (statusFilter !== "ALL" && purchase.status !== statusFilter)
        return false;
      if (planFilter !== "ALL" && purchase.planType !== planFilter) return false;
      if (!term) return true;

      const name = purchase.user?.fullName || purchase.fullName || "";
      return (
        purchase.email.toLowerCase().includes(term) ||
        name.toLowerCase().includes(term)
      );
    });
  }, [data, statusFilter, planFilter, search]);

  React.useEffect(() => {
    setPage(0);
  }, [statusFilter, planFilter, search]);

  const pageCount = Math.max(1, Math.ceil(purchases.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const rows = purchases.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm p-4 text-red-500">
        Error loading Vacanza Protect purchases
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#3174CD] lg:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={planFilter}
            onChange={(e) =>
              setPlanFilter(e.target.value as ProtectPlanType | "ALL")
            }
            className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#3174CD]"
          >
            <option value="ALL">All plans</option>
            <option value="YEARLY">Annual home cover</option>
            <option value="PER_TRIP">Single trip cover</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ProtectPurchaseStatus | "ALL")
            }
            className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#3174CD]"
          >
            <option value="ALL">All statuses</option>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>
                {config.text}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow>
              {[
                "Buyer",
                "Plan",
                "Amount",
                "Status",
                "Bought from",
                "Cover until",
                "Purchased",
              ].map((header) => (
                <TableHead
                  key={header}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="bg-white divide-y divide-gray-200">
            {rows.length ? (
              rows.map((purchase) => {
                const status = STATUS_CONFIG[purchase.status];
                const name =
                  purchase.user?.fullName || purchase.fullName || "Guest buyer";

                return (
                  <TableRow key={purchase.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-gray-900">{name}</div>
                      <div className="text-xs text-gray-500">
                        {purchase.email}
                      </div>
                      {!purchase.userId && (
                        <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-500">
                          No account linked
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {PLAN_LABEL[purchase.planType]}
                      {purchase.planType === "PER_TRIP" && (
                        <span className="ml-1 text-xs text-gray-400">
                          × {purchase.tripsCovered}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {new Intl.NumberFormat("en-IE", {
                        style: "currency",
                        currency: purchase.currency || "EUR",
                      }).format(purchase.amount)}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.textColor}`}
                      >
                        {status.text}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {purchase.source === "DASHBOARD"
                        ? "Dashboard"
                        : "Landing page"}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {purchase.planType === "YEARLY"
                        ? formatDate(purchase.endDate)
                        : "Per trip"}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(purchase.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No Vacanza Protect purchases yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {purchases.length ? currentPage * PAGE_SIZE + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min((currentPage + 1) * PAGE_SIZE, purchases.length)}
          </span>{" "}
          of <span className="font-medium">{purchases.length}</span> purchases
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="cursor-pointer border-[#3174CD] text-[#3174CD] hover:bg-[#3174CD] hover:text-white disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage >= pageCount - 1}
            className="cursor-pointer border-[#3174CD] text-[#3174CD] hover:bg-[#3174CD] hover:text-white disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProtectPurchases;
