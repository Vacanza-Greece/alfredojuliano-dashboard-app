// src/components/admin/UserListTable.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { IoSearch } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { FiAward } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { HiChevronUp, HiChevronDown, HiSelector } from "react-icons/hi";

import {
  useDeleteUserMutation,
  useGiveBadgeMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  BadgeType,
} from "@/redux/features/auth/userApi";

import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import { setSearchTerm } from "@/redux/features/auth/userSlice";

import defaultUserPhoto from "@/assets/images/profile.png";
import { User } from "@/redux/types/user";
import Title from "@/components/reuseabelComponents/Title";
import PageLoader from "../Shared/PageLoader";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------- Enum value formatters ----------
const formatAgeRange = (ageRange?: string | null): string => {
  if (!ageRange) return "N/A";

  const ageMap: Record<string, string> = {
    AGE_18_30: "18-30 years",
    AGE_30_50: "30-50 years",
    AGE_50_65: "50-65 years",
    AGE_65_PLUS: "65+ years",
  };

  return ageMap[ageRange] || ageRange.replace(/_/g, " ").replace("AGE ", "");
};

const formatGender = (gender?: string | null): string => {
  if (!gender) return "N/A";

  const genderMap: Record<string, string> = {
    MALE: "Male",
    FEMALE: "Female",
    NOT_SPECIFIED: "Not specified",
  };

  return genderMap[gender] || gender;
};

const formatEmploymentStatus = (status?: string | null): string => {
  if (!status) return "N/A";

  const statusMap: Record<string, string> = {
    WORKER: "Worker",
    RETIRED: "Retired",
    STUDENT: "Student",
    UNEMPLOYED: "Unemployed",
  };

  return statusMap[status] || status;
};

const formatTravelGroup = (group?: string | null): string => {
  if (!group) return "N/A";

  const groupMap: Record<string, string> = {
    BY_MYSELF: "Myself",
    FAMILY: "Family",
    COUPLE: "Couple",
    FRIENDS: "Friends",
  };

  return groupMap[group] || group.replace(/_/g, " ").toLowerCase();
};

const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  return value ? "Yes" : "No";
};

const formatArray = (arr: any[] | null | undefined): string => {
  if (!arr || arr.length === 0) return "N/A";
  return arr.join(", ");
};

// ---------- Badge Components ----------
const SubscriptionBadge = ({ isSubscribed }: { isSubscribed: boolean }) => (
  <span
    className={`px-3 py-1 text-xs rounded-full font-medium ${isSubscribed ? "bg-green-200 text-green-700" : "bg-gray-100 text-gray-700"
      }`}
  >
    {isSubscribed ? "Subscribed" : "Not Subscribed"}
  </span>
);

const RoleBadge = ({ role }: { role: User["role"] }) => {
  const variants: Record<User["role"], string> = {
    USER: "bg-blue-100 text-blue-700",
    ADMIN: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${variants[role] || "bg-gray-100 text-gray-700"
        }`}
    >
      {role}
    </span>
  );
};

// ---------- Main Component ----------
export default function UserListTable() {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.user.searchTerm);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBadgeDialog, setOpenBadgeDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [selectedBadge, setSelectedBadge] = useState<BadgeType>(
    BadgeType.VERIFIED
  );

  // Fetch all users
  const { data: users = [], isLoading, isError } = useGetUsersQuery({});

  // Fetch single user for viewing
  const { data: singleUser, isLoading: isUserLoading } = useGetUserByIdQuery(
    selectedUserId ?? "",
    { skip: !openViewDialog || !selectedUserId }
  );

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [giveBadge] = useGiveBadgeMutation();

  // ---------- Handlers ----------
  const handleView = (id: string) => {
    setSelectedUserId(id);
    setOpenViewDialog(true);
    setOpenMenuFor(null);
  };

  const handleBadge = (id: string) => {
    setSelectedUserId(id);
    setOpenBadgeDialog(true);
    setOpenMenuFor(null);
  };

  const handleDelete = (id: string) => {
    setSelectedUserId(id);
    setOpenDeleteDialog(true);
    setOpenMenuFor(null);
  };

  const confirmDelete = async () => {
    if (!selectedUserId) return;
    try {
      await deleteUser(selectedUserId).unwrap();
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmBadge = async () => {
    if (!selectedUserId) return;
    try {
      await giveBadge({
        id: selectedUserId,
        badgetype: selectedBadge,
      }).unwrap();
      setOpenBadgeDialog(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- Filtering ----------
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u: User) =>
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.phoneNumber?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // ---------- Table Columns ----------
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "User",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <Image
              src={u.photo || defaultUserPhoto}
              alt={u.fullName}
              width={40}
              height={40}
              className="rounded-full object-cover border"
            />
            <div>
              <p className="font-medium">{u.fullName}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => row.original.phoneNumber || "N/A",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
      accessorKey: "isSubscribed",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Subscription
          <HiSelector className="h-4 w-4 text-gray-500" />
        </div>
      ),
      cell: ({ row }) => (
        <SubscriptionBadge isSubscribed={row.original.isSubscribed} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joined
          <div className="flex flex-col">
            <HiChevronUp
              className={`h-3 w-3 -mb-1 ${column.getIsSorted() === "asc" ? "text-blue-600" : "text-gray-400"
                }`}
            />
            <HiChevronDown
              className={`h-3 w-3 ${column.getIsSorted() === "desc" ? "text-blue-600" : "text-gray-400"
                }`}
            />
          </div>
        </div>
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const u = row.original;
        const isOpen = openMenuFor === u.id;

        return (
          <div className="relative">
            {/* Three-dot button */}
            <button
              onClick={() =>
                setOpenMenuFor((prev) => (prev === u.id ? null : u.id))
              }
              className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute cursor-pointer right-18 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-md z-20">
                <button
                  className="flex items-center cursor-pointer hover:bg-gray-100 gap-2 w-full px-4 py-2 text-sm text-blue-600 "
                  onClick={() => handleView(u.id)}
                >
                  <FaEye /> View
                </button>

                <button
                  className="flex items-center cursor-pointer hover:bg-gray-100 gap-2 w-full px-4 py-2 text-sm text-blue-600 "
                  onClick={() => handleBadge(u.id)}
                >
                  <FiAward /> Give Badge
                </button>

                <button
                  className="flex items-center cursor-pointer hover:bg-gray-100 gap-2 w-full px-4 py-2 text-sm text-red-600 "
                  onClick={() => handleDelete(u.id)}
                >
                  <RiDeleteBinLine /> Delete
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // ---------- Table Setup ----------
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 7 } },
  });

  if (isLoading) return <PageLoader />;
  if (isError)
    return (
      <div className="text-center text-red-500 py-10">Failed to load users</div>
    );

  return (
    <div>
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
        <Title title="All Users" />
        <div className="relative w-full sm:w-72">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-blue-500 focus:ring"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead className="py-4 bg-gray-200" key={h.id}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((c) => (
                      <TableCell key={c.id}>
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-6"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {table.getRowModel().rows.length > 0
                  ? table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                    1
                  : 0}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  filteredData.length
                )}
              </span>{" "}
              of <span className="font-medium">{filteredData.length}</span> users
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 10, 20, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Dialog */}
      <Dialog open={openBadgeDialog} onOpenChange={setOpenBadgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Give Badge</DialogTitle>
            <DialogDescription>Select a badge for the user.</DialogDescription>
          </DialogHeader>

          <select
            className="w-full border rounded-lg px-3 py-2"
            value={selectedBadge}
            onChange={(e) => setSelectedBadge(e.target.value as BadgeType)}
          >
            {Object.values(BadgeType).map((b) => (
              <option key={b} value={b}>
                {b.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenBadgeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBadge}>Give Badge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Onboarding Details</DialogTitle>
          </DialogHeader>

          {isUserLoading ? (
            <div className="py-4 text-center">Loading...</div>
          ) : singleUser ? (
            <div className="space-y-6">
              {/* Profile Section */}
              {/* <div className="flex flex-col md:flex-row gap-6 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <Image
                    src={singleUser.photo || defaultUserPhoto}
                    width={120}
                    height={120}
                    alt="User"
                    className="rounded-full border object-cover"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                  <div>
                    <h2 className="text-xl font-bold">{singleUser.fullName}</h2>
                    <p className="text-gray-600">
                      <span className="font-semibold mr-1">Email:</span>
                      {singleUser.email}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold mr-1">Phone:</span>
                      {singleUser.phoneNumber || "N/A"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold mr-1">City:</span>
                      {singleUser.city || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">
                      <span className="font-semibold mr-1">Language:</span>
                      {singleUser.languagePreference || "N/A"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold mr-1">Age:</span>
                      {singleUser.age || "N/A"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold mr-1">Date of Birth:</span>
                      {singleUser.dateOfBirth
                        ? new Date(singleUser.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold mr-1">
                        Identification:
                      </span>
                      {singleUser.identification || "N/A"}
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Stats Section */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-lg font-bold text-blue-600">
                    {singleUser.role}
                  </p>
                </div>

                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Subscription</p>
                  <p
                    className={`text-lg font-bold ${
                      singleUser.isSubscribed
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {singleUser.isSubscribed ? "Subscribed" : "Not Subscribed"}
                  </p>
                </div>

                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-lg font-bold">
                    €{singleUser.balance ?? 0}
                  </p>
                </div>

                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Total Referrals</p>
                  <p className="text-lg font-bold">
                    {singleUser.totalReferrals ?? 0}
                  </p>
                </div>
              </div> */}

              {/* Onboarding Details */}
              {singleUser.onboarding && (
                <div className="border rounded-lg p-5 space-y-5">
                  {/* <h3 className="font-bold text-lg border-b pb-2">
                    Onboarding Details
                  </h3> */}

                  {/* Home Images */}
                  {(singleUser.onboarding.homeImages?.length ?? 0) > 0 && (
                    <div>
                      <div className="flex flex-wrap gap-3">
                        {singleUser.onboarding.homeImages?.map((img, idx) => (
                          <div key={idx} className="relative">
                            <Image
                              src={img}
                              alt={`Home ${idx + 1}`}
                              width={100}
                              height={100}
                              className="rounded-lg border object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Home Address</h4>
                      <p className="text-gray-600">
                        {singleUser.onboarding.homeAddress || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Destination</h4>
                      <p className="text-gray-600">
                        {singleUser.onboarding.destination || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Age Range</h4>
                      <p className="text-gray-600">
                        {formatAgeRange(singleUser.onboarding.ageRange)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Gender</h4>
                      <p className="text-gray-600">
                        {formatGender(singleUser.onboarding.gender)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Employment Status</h4>
                      <p className="text-gray-600">
                        {formatEmploymentStatus(
                          singleUser.onboarding.employmentStatus
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Travel Preferences */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Travel Type</h4>
                      <p className="text-gray-600">
                        {formatArray(singleUser.onboarding.travelType)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                        Favorite Destinations
                      </h4>
                      <p className="text-gray-600">
                        {formatArray(
                          singleUser.onboarding.favoriteDestinations
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Travel Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Travel Mostly With</h4>
                      <p className="text-gray-600">
                        {formatTravelGroup(
                          singleUser.onboarding.travelMostlyWith
                        )}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Travel with Pets</h4>
                      <p className="text-gray-600">
                        {formatBoolean(singleUser.onboarding.isTravelWithPets)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Max People</h4>
                      <p className="text-gray-600">
                        {singleUser.onboarding.maxPeople || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Property Type</h4>
                      <p className="text-gray-600">
                        {singleUser.onboarding.propertyType || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Main Residence</h4>
                      <p className="text-gray-600">
                        {formatBoolean(singleUser.onboarding.isMainResidence)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                        Available for Exchange
                      </h4>
                      <p className="text-gray-600">
                        {formatBoolean(
                          singleUser.onboarding.isAvailableForExchange
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(singleUser.onboarding.homeName ||
                    singleUser.onboarding.homeDescription ||
                    singleUser.onboarding.aboutNeighborhood) && (
                      <div className="grid grid-cols-1 gap-4">
                        {singleUser.onboarding.homeName && (
                          <div>
                            <h4 className="font-semibold mb-1">Home Name</h4>
                            <p className="text-gray-600">
                              {singleUser.onboarding.homeName}
                            </p>
                          </div>
                        )}
                        {singleUser.onboarding.homeDescription && (
                          <div>
                            <h4 className="font-semibold mb-1">
                              Home Description
                            </h4>
                            <p className="text-gray-600">
                              {singleUser.onboarding.homeDescription}
                            </p>
                          </div>
                        )}
                        {singleUser.onboarding.aboutNeighborhood && (
                          <div>
                            <h4 className="font-semibold mb-1">
                              About Neighborhood
                            </h4>
                            <p className="text-gray-600">
                              {singleUser.onboarding.aboutNeighborhood}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  {/* address  */}
                  {singleUser.onboarding.address && (
                    <div>
                      <h4 className="font-semibold mb-1">Address</h4>
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">
                        {singleUser.onboarding.address}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {singleUser.onboarding.notes && (
                    <div>
                      <h4 className="font-semibold mb-1">Notes</h4>
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">
                        {singleUser.onboarding.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Properties */}
              {/* {(singleUser.properties?.length ?? 0) > 0 && (
                <div className="border rounded-lg p-5 space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2">
                    Properties ({singleUser.properties?.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {singleUser.properties?.map((property) => (
                      <div key={property.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">
                              {property.title}
                            </h4>
                            <p className="text-gray-600">
                              {property.location}, {property.country}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {property.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                              {property.propertyType}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Size</p>
                            <p className="font-semibold">
                              {property.size} sq ft
                            </p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Bedrooms</p>
                            <p className="font-semibold">{property.bedrooms}</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Bathrooms</p>
                            <p className="font-semibold">
                              {property.bathrooms}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Max People</p>
                            <p className="font-semibold">
                              {property.maxPeople}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Badges */}
              {/* {(singleUser.achievementBadges?.length ?? 0) > 0 && (
                <div className="border rounded-lg p-5 space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2">
                    Achievement Badges
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {singleUser.achievementBadges?.map((badge) => (
                      <div
                        key={badge.id}
                        className="border rounded-lg p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        {badge.icon && (
                          <Image
                            src={badge.icon}
                            alt={badge.displayName}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold">{badge.displayName}</h4>
                          <p className="text-sm text-gray-600">
                            {badge.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Earned:{" "}
                            {new Date(badge.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No Data Found</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// // src/components/admin/UserListTable.tsx
// "use client";

// import React, { useMemo, useState } from "react";
// import Image from "next/image";
// import { IoSearch } from "react-icons/io5";
// import { FaEye } from "react-icons/fa";
// import { FiAward } from "react-icons/fi";
// import { RiDeleteBinLine } from "react-icons/ri";
// import {
//   useReactTable,
//   ColumnDef,
//   getCoreRowModel,
//   flexRender,
//   getPaginationRowModel,
// } from "@tanstack/react-table";

// import {
//   useDeleteUserMutation,
//   useGiveBadgeMutation,
//   useGetUsersQuery,
//   useGetUserByIdQuery,
//   BadgeType,
// } from "@/redux/features/auth/userApi";

// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import { setSearchTerm } from "@/redux/features/auth/userSlice";

// import defaultUserPhoto from "@/assets/images/profile.png";
// import { User } from "@/redux/types/user";
// import Title from "@/components/reuseabelComponents/Title";
// import PageLoader from "../Shared/PageLoader";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// // ---------- Badge Components ----------
// const SubscriptionBadge = ({ isSubscribed }: { isSubscribed: boolean }) => (
//   <span
//     className={`px-3 py-1 text-xs rounded-full font-medium ${
//       isSubscribed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
//     }`}
//   >
//     {isSubscribed ? "Subscribed" : "Not Subscribed"}
//   </span>
// );

// const RoleBadge = ({ role }: { role: User["role"] }) => {
//   const variants: Record<User["role"], string> = {
//     USER: "bg-blue-100 text-blue-700",
//     ADMIN: "bg-purple-100 text-purple-700",
//   };

//   return (
//     <span
//       className={`px-3 py-1 text-xs rounded-full font-medium ${
//         variants[role] || "bg-gray-100 text-gray-700"
//       }`}
//     >
//       {role}
//     </span>
//   );
// };

// // ---------- Main Component ----------
// export default function UserListTable() {
//   const dispatch = useAppDispatch();
//   const searchTerm = useAppSelector((state) => state.user.searchTerm);

//   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
//   const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [openBadgeDialog, setOpenBadgeDialog] = useState(false);
//   const [openViewDialog, setOpenViewDialog] = useState(false);

//   const [selectedBadge, setSelectedBadge] = useState<BadgeType>(
//     BadgeType.VERIFIED
//   );

//   // Fetch all users
//   const { data: users = [], isLoading, isError } = useGetUsersQuery({});

//   // Fetch single user for viewing
//   const { data: singleUser, isLoading: isUserLoading } = useGetUserByIdQuery(
//     selectedUserId ?? "",
//     { skip: !openViewDialog || !selectedUserId }
//   );

//   const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
//   const [giveBadge] = useGiveBadgeMutation();

//   // ---------- Handlers ----------
//   const handleView = (id: string) => {
//     setSelectedUserId(id);
//     setOpenViewDialog(true);
//     setOpenMenuFor(null);
//   };

//   const handleBadge = (id: string) => {
//     setSelectedUserId(id);
//     setOpenBadgeDialog(true);
//     setOpenMenuFor(null);
//   };

//   const handleDelete = (id: string) => {
//     setSelectedUserId(id);
//     setOpenDeleteDialog(true);
//     setOpenMenuFor(null);
//   };

//   const confirmDelete = async () => {
//     if (!selectedUserId) return;
//     try {
//       await deleteUser(selectedUserId).unwrap();
//       setOpenDeleteDialog(false);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const confirmBadge = async () => {
//     if (!selectedUserId) return;
//     try {
//       await giveBadge({
//         id: selectedUserId,
//         badgetype: selectedBadge,
//       }).unwrap();
//       setOpenBadgeDialog(false);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ---------- Filtering ----------
//   const filteredData = useMemo(() => {
//     const term = searchTerm.toLowerCase();
//     return users.filter(
//       (u: User) =>
//         u.fullName.toLowerCase().includes(term) ||
//         u.email.toLowerCase().includes(term) ||
//         u.phoneNumber?.toLowerCase().includes(term)
//     );
//   }, [users, searchTerm]);

//   // ---------- Table Columns ----------
//   const columns: ColumnDef<User>[] = [
//     {
//       accessorKey: "fullName",
//       header: "User",
//       cell: ({ row }) => {
//         const u = row.original;
//         return (
//           <div className="flex items-center gap-3">
//             <Image
//               src={u.photo || defaultUserPhoto}
//               alt={u.fullName}
//               width={40}
//               height={40}
//               className="rounded-full object-cover border"
//             />
//             <div>
//               <p className="font-medium">{u.fullName}</p>
//               <p className="text-sm text-gray-500">{u.email}</p>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "phoneNumber",
//       header: "Phone",
//       cell: ({ row }) => row.original.phoneNumber || "N/A",
//     },
//     {
//       accessorKey: "role",
//       header: "Role",
//       cell: ({ row }) => <RoleBadge role={row.original.role} />,
//     },
//     {
//       accessorKey: "isSubscribed",
//       header: "Subscription",
//       cell: ({ row }) => (
//         <SubscriptionBadge isSubscribed={row.original.isSubscribed} />
//       ),
//     },
//     {
//       accessorKey: "createdAt",
//       header: "Joined",
//       cell: ({ row }) =>
//         new Date(row.original.createdAt).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         }),
//     },
//     {
//       id: "actions",
//       header: "Actions",
//       cell: ({ row }) => {
//         const u = row.original;
//         const isOpen = openMenuFor === u.id;

//         return (
//           <div className="relative">
//             {/* Three-dot button */}
//             <button
//               onClick={() =>
//                 setOpenMenuFor((prev) => (prev === u.id ? null : u.id))
//               }
//               className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z"
//                 />
//               </svg>
//             </button>

//             {/* Dropdown Menu */}
//             {isOpen && (
//               <div className="absolute cursor-pointer right-18 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-md z-20">
//                 <button
//                   className="flex items-center cursor-pointer hover:bg-gray-50 gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
//                   onClick={() => handleView(u.id)}
//                 >
//                   <FaEye /> View
//                 </button>

//                 <button
//                   className="flex items-center cursor-pointer hover:bg-gray-50 gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
//                   onClick={() => handleBadge(u.id)}
//                 >
//                   <FiAward /> Give Badge
//                 </button>

//                 <button
//                   className="flex items-center cursor-pointer hover:bg-gray-50 gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//                   onClick={() => handleDelete(u.id)}
//                 >
//                   <RiDeleteBinLine /> Delete
//                 </button>
//               </div>
//             )}
//           </div>
//         );
//       },
//     },
//   ];

//   // ---------- Table Setup ----------
//   const table = useReactTable({
//     data: filteredData,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     initialState: { pagination: { pageSize: 7 } },
//   });

//   if (isLoading) return <PageLoader />;
//   if (isError)
//     return (
//       <div className="text-center text-red-500 py-10">Failed to load users</div>
//     );

//   return (
//     <div>
//       {/* Header & Search */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
//         <Title title="All Users" />
//         <div className="relative w-full sm:w-72">
//           <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           <input
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={(e) => dispatch(setSearchTerm(e.target.value))}
//             className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-blue-500 focus:ring"
//           />
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               {table.getHeaderGroups().map((hg) => (
//                 <TableRow key={hg.id}>
//                   {hg.headers.map((h) => (
//                     <TableHead className="py-4 bg-gray-200" key={h.id}>
//                       {flexRender(h.column.columnDef.header, h.getContext())}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>

//             <TableBody>
//               {table.getRowModel().rows.length ? (
//                 table.getRowModel().rows.map((row) => (
//                   <TableRow key={row.id}>
//                     {row.getVisibleCells().map((c) => (
//                       <TableCell key={c.id}>
//                         {flexRender(c.column.columnDef.cell, c.getContext())}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="text-center py-6"
//                   >
//                     No users found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         {/* Pagination */}
//         <div className="flex justify-between items-center px-6 py-4 border-t">
//           <p className="text-sm text-gray-600">
//             Showing{" "}
//             <span className="font-medium">
//               {table.getState().pagination.pageIndex *
//                 table.getState().pagination.pageSize +
//                 1}
//             </span>{" "}
//             to{" "}
//             <span className="font-medium">
//               {Math.min(
//                 (table.getState().pagination.pageIndex + 1) *
//                   table.getState().pagination.pageSize,
//                 filteredData.length
//               )}
//             </span>{" "}
//             of <span className="font-medium">{filteredData.length}</span> users
//           </p>
//           <div className="flex gap-2">
//             <Button
//               onClick={() => table.previousPage()}
//               disabled={!table.getCanPreviousPage()}
//               variant="outline"
//               size="sm"
//             >
//               Previous
//             </Button>
//             <Button
//               onClick={() => table.nextPage()}
//               disabled={!table.getCanNextPage()}
//               variant="outline"
//               size="sm"
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Delete Dialog */}
//       <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Delete</DialogTitle>
//             <DialogDescription>
//               This action cannot be undone. Are you sure?
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setOpenDeleteDialog(false)}
//             >
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={confirmDelete}>
//               {isDeleting ? "Deleting..." : "Delete"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Badge Dialog */}
//       <Dialog open={openBadgeDialog} onOpenChange={setOpenBadgeDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Give Badge</DialogTitle>
//             <DialogDescription>Select a badge for the user.</DialogDescription>
//           </DialogHeader>

//           <select
//             className="w-full border rounded-lg px-3 py-2"
//             value={selectedBadge}
//             onChange={(e) => setSelectedBadge(e.target.value as BadgeType)}
//           >
//             {Object.values(BadgeType).map((b) => (
//               <option key={b} value={b}>
//                 {b.replace(/_/g, " ")}
//               </option>
//             ))}
//           </select>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpenBadgeDialog(false)}>
//               Cancel
//             </Button>
//             <Button onClick={confirmBadge}>Give Badge</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* View User Dialog */}
//       <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
//         <DialogContent className="max-w-7xl w-full">
//           <DialogHeader>
//             <DialogTitle>User Details</DialogTitle>
//           </DialogHeader>

//           {isUserLoading ? (
//             <div className="py-4 text-center">Loading...</div>
//           ) : singleUser ? (
//             <div className="space-y-6">
//               {/* Profile Section */}
//               <div className="flex  justify-baseline items-center gap-4">
//                 <div>
//                   <Image
//                     src={singleUser.photo || defaultUserPhoto}
//                     width={80}
//                     height={80}
//                     alt="User"
//                     className="rounded-full border object-cover"
//                   />
//                 </div>

//                 <div>
//                   <h2 className="text-xl font-bold mt-2">
//                     Name: {singleUser.fullName}
//                   </h2>
//                   <p className="text-gray-600">
//                     {" "}
//                     <span className=" font-semibold mr-1">Email:</span>
//                     {singleUser.email}
//                   </p>
//                   <p className="text-gray-600">
//                     <span className=" font-semibold mr-1">Phone: </span>{" "}
//                     {singleUser.phoneNumber || "N/A"}
//                   </p>
//                   <p className="text-gray-600">
//                     {" "}
//                     <span className=" font-semibold mr-1"> City: </span>{" "}
//                     {singleUser.city || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-600">
//                     <span className=" font-semibold mr-1">Language:</span>
//                     {singleUser.languagePreference || "N/A"}
//                   </p>
//                   <p className="text-gray-600">
//                     <span className=" font-semibold mr-1">Age:</span>
//                     {singleUser.age || "N/A"}
//                   </p>
//                   <p className="text-gray-600">
//                     <span className=" font-semibold mr-1">Date:</span>
//                     {singleUser.dateOfBirth || "N/A"}
//                   </p>
//                   <p className="text-gray-600">
//                     <span className=" font-semibold mr-1">Identity:</span>
//                     {singleUser.identification || "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <hr />
//               {/* Role & Subscription */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-white  text-sm">
//                 <div className="flex flex-col gap-1">
//                   <p className="font-semibold">
//                     Role:{" "}
//                     <span className=" text-blue-400">{singleUser.role}</span>
//                   </p>
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <p className="font-semibold">
//                     Subscription:{" "}
//                     <span
//                       className={`font-normal ${
//                         singleUser.isSubscribed
//                           ? "text-green-500"
//                           : "text-red-500"
//                       }`}
//                     >
//                       {singleUser.isSubscribed ? "Subscribe" : "UnSubscribe"}
//                     </span>
//                   </p>
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <p className="font-semibold ">
//                     Balance
//                     <span className="  ml-1">€ {singleUser.balance ?? 0}</span>
//                   </p>
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <p className="font-semibold ">
//                     Total Referrals
//                     <span className="  ml-1">
//                       {singleUser.totalReferrals ?? 0}
//                     </span>
//                   </p>
//                 </div>
//               </div>

//               {/* Onboarding / Travel Info */}
//               {singleUser.onboarding && (
//                 <div className="border-t pt-4 space-y-2">
//                   <h3 className="font-semibold text-lg">Onboarding Details</h3>
//                   <div className="flex gap-2 mt-2 flex-wrap">
//                     {singleUser.onboarding.homeImages?.map((img, idx) => (
//                       <Image
//                         key={idx}
//                         src={img}
//                         alt="Home"
//                         width={80}
//                         height={80}
//                         className="rounded-full justify-center border object-cover"
//                       />
//                     ))}
//                   </div>

//                   <p>
//                     <span className="font-semibold">Home Address:</span>{" "}
//                     {singleUser.onboarding.homeAddress || "N/A"}
//                   </p>
//                   <p>
//                     <span className="font-semibold">Destination:</span>{" "}
//                     {singleUser.onboarding.destination || "N/A"}
//                   </p>
//                   <div className=" grid grid-cols-2 gap-1 ">
//                     <p>
//                       <span className="font-semibold">Travel Type:</span>{" "}
//                       {singleUser.onboarding.travelType?.join(", ") || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-semibold">Travel Mostly With:</span>{" "}
//                       {singleUser.onboarding.travelMostlyWith || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-semibold">Property Type:</span>{" "}
//                       {singleUser.onboarding.propertyType || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-semibold">Home Name:</span>{" "}
//                       {singleUser.onboarding.homeName || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-semibold">About Neighborhood:</span>{" "}
//                       {singleUser.onboarding.aboutNeighborhood || "N/A"}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Badges */}
//               {(singleUser.achievementBadges ?? []).length > 0 && (
//                 <div className="border-t pt-4 space-y-2">
//                   <h3 className="font-semibold text-lg">Achievement Badges</h3>
//                   <div className="flex flex-wrap gap-3 mt-1">
//                     {(singleUser.achievementBadges ?? []).map((b) => (
//                       <div
//                         key={b.id}
//                         className="flex items-center gap-2 border px-3 py-1 rounded-lg"
//                       >
//                         {b.icon && (
//                           <Image
//                             src={b.icon}
//                             alt={b.displayName}
//                             width={24}
//                             height={24}
//                             className="rounded-full"
//                           />
//                         )}
//                         <div>
//                           <p className="text-sm font-medium">{b.displayName}</p>
//                           {b.description && (
//                             <p className="text-xs text-gray-500">
//                               {b.description}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <p className="text-center text-gray-500">No Data Found</p>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
