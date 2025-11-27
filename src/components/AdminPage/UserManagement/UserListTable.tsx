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
} from "@tanstack/react-table";

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

// ---------- Badge Components ----------
const SubscriptionBadge = ({ isSubscribed }: { isSubscribed: boolean }) => (
  <span
    className={`px-3 py-1 text-xs rounded-full font-medium ${
      isSubscribed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
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
      className={`px-3 py-1 text-xs rounded-full font-medium ${
        variants[role] || "bg-gray-100 text-gray-700"
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
      header: "Subscription",
      cell: ({ row }) => (
        <SubscriptionBadge isSubscribed={row.original.isSubscribed} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
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
                  className="flex items-center cursor-pointer hover:bg-gray-50 gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                  onClick={() => handleView(u.id)}
                >
                  <FaEye /> View
                </button>

                <button
                  className="flex items-center cursor-pointer hover:bg-gray-50 gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                  onClick={() => handleBadge(u.id)}
                >
                  <FiAward /> Give Badge
                </button>

                <button
                  className="flex items-center cursor-pointer hover:bg-gray-50 gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
        <div className="flex justify-between items-center px-6 py-4 border-t">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
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
        <DialogContent className="max-w-7xl w-full">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {isUserLoading ? (
            <div className="py-4 text-center">Loading...</div>
          ) : singleUser ? (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex  justify-baseline items-center gap-4">
                <div>
                  <Image
                    src={singleUser.photo || defaultUserPhoto}
                    width={80}
                    height={80}
                    alt="User"
                    className="rounded-full border object-cover"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold mt-2">
                    Name: {singleUser.fullName}
                  </h2>
                  <p className="text-gray-600">
                    {" "}
                    <span className=" font-semibold mr-1">Email:</span>
                    {singleUser.email}
                  </p>
                  <p className="text-gray-600">
                    <span className=" font-semibold mr-1">Phone: </span>{" "}
                    {singleUser.phoneNumber || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    {" "}
                    <span className=" font-semibold mr-1"> City: </span>{" "}
                    {singleUser.city || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className=" font-semibold mr-1">Language:</span>
                    {singleUser.languagePreference || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className=" font-semibold mr-1">Age:</span>
                    {singleUser.age || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className=" font-semibold mr-1">Date:</span>
                    {singleUser.dateOfBirth || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className=" font-semibold mr-1">Identity:</span>
                    {singleUser.identification || "N/A"}
                  </p>
                </div>
              </div>
              <hr />
              {/* Role & Subscription */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-white  text-sm">
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">
                    Role:{" "}
                    <span className=" text-blue-400">{singleUser.role}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="font-semibold">
                    Subscription:{" "}
                    <span
                      className={`font-normal ${
                        singleUser.isSubscribed
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {singleUser.isSubscribed ? "Subscribe" : "UnSubscribe"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="font-semibold ">
                    Balance
                    <span className="  ml-1">€ {singleUser.balance ?? 0}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold ">
                    Total Referrals
                    <span className="  ml-1">
                      {singleUser.totalReferrals ?? 0}
                    </span>
                  </p>
                </div>
              </div>

              {/* Onboarding / Travel Info */}
              {singleUser.onboarding && (
                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-semibold text-lg">Onboarding Details</h3>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {singleUser.onboarding.homeImages?.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        alt="Home"
                        width={80}
                        height={80}
                        className="rounded-full justify-center border object-cover"
                      />
                    ))}
                  </div>

                  <p>
                    <span className="font-semibold">Home Address:</span>{" "}
                    {singleUser.onboarding.homeAddress || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Destination:</span>{" "}
                    {singleUser.onboarding.destination || "N/A"}
                  </p>
                  <div className=" grid grid-cols-2 gap-1 ">
                    <p>
                      <span className="font-semibold">Travel Type:</span>{" "}
                      {singleUser.onboarding.travelType?.join(", ") || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Travel Mostly With:</span>{" "}
                      {singleUser.onboarding.travelMostlyWith || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Property Type:</span>{" "}
                      {singleUser.onboarding.propertyType || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Home Name:</span>{" "}
                      {singleUser.onboarding.homeName || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">About Neighborhood:</span>{" "}
                      {singleUser.onboarding.aboutNeighborhood || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* Badges */}
              {(singleUser.achievementBadges ?? []).length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-semibold text-lg">Achievement Badges</h3>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {(singleUser.achievementBadges ?? []).map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-2 border px-3 py-1 rounded-lg"
                      >
                        {b.icon && (
                          <Image
                            src={b.icon}
                            alt={b.displayName}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">{b.displayName}</p>
                          {b.description && (
                            <p className="text-xs text-gray-500">
                              {b.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">No Data Found</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// "use client";

// import React, { useState, useMemo } from "react";
// import Image from "next/image";
// import { MdDelete } from "react-icons/md";
// import { IoSearch, IoChevronDown } from "react-icons/io5";
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
//   BadgeType,
//   useGetUsersQuery,
// } from "@/redux/features/auth/userApi";
// import { setSearchTerm } from "@/redux/features/auth/userSlice";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";

// import defaultUserPhoto from "@/assets/images/profile.png";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import PageLoader from "../Shared/PageLoader";
// import Title from "@/components/reuseabelComponents/Title";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// // -------------------- Types --------------------
// interface User {
//   id: string;
//   fullName: string;
//   email: string;
//   phoneNumber: string | null;
//   photo: string | null;
//   role: "USER" | "ADMIN";
//   isSubscribed: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// // -------------------- Badge Components --------------------
// const SubscriptionBadge = ({ isSubscribed }: { isSubscribed: boolean }) => (
//   <span
//     className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
//       isSubscribed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
//     }`}
//   >
//     {isSubscribed ? "Subscribed" : "Not Subscribed"}
//   </span>
// );

// const RoleBadge = ({ role }: { role: User["role"] }) => {
//   const roleStyles = {
//     USER: "bg-blue-100 text-blue-800",
//     ADMIN: "bg-purple-100 text-purple-800",
//   };
//   const roleText = { USER: "User", ADMIN: "Admin" };
//   return (
//     <span
//       className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
//         roleStyles[role] || "bg-gray-100 text-gray-800"
//       }`}
//     >
//       {roleText[role] || role}
//     </span>
//   );
// };

// // -------------------- Main Component --------------------
// export function UserListTable() {
//   const dispatch = useAppDispatch();
//   const searchTerm = useAppSelector((state) => state.user.searchTerm);

//   const { data: users = [], isLoading, isError } = useGetUsersQuery({});
//   const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
//   const [giveBadge] = useGiveBadgeMutation();

//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [openBadgeDialog, setOpenBadgeDialog] = useState(false);
//   const [selectedBadge, setSelectedBadge] = useState<BadgeType>(
//     BadgeType.VERIFIED
//   );

//   // -------------------- Handlers --------------------
//   const handleDeleteClick = (user: User) => {
//     setSelectedUser(user);
//     setOpenDeleteDialog(true);
//   };

//   const confirmDelete = async () => {
//     if (!selectedUser) return;
//     try {
//       await deleteUser(selectedUser.id).unwrap();
//       setOpenDeleteDialog(false);
//       setSelectedUser(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleBadgeClick = (user: User) => {
//     setSelectedUser(user);
//     setOpenBadgeDialog(true);
//   };

//   const confirmGiveBadge = async () => {
//     if (!selectedUser) return;
//     try {
//       await giveBadge({
//         id: selectedUser.id,
//         badgetype: selectedBadge,
//       }).unwrap();
//       setOpenBadgeDialog(false);
//       setSelectedUser(null);
//     } catch (err: any) {
//       console.error("Failed to give badge:", err?.data?.message || err);
//     }
//   };

//   // -------------------- Filtered Data --------------------
//   const filteredData = useMemo(() => {
//     if (!users) return [];
//     let result = users;
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(
//         (u: User) =>
//           u.fullName.toLowerCase().includes(term) ||
//           u.email.toLowerCase().includes(term) ||
//           u.phoneNumber?.toLowerCase().includes(term)
//       );
//     }
//     return result;
//   }, [users, searchTerm]);

//   // -------------------- Table Columns --------------------
//   const columns: ColumnDef<User>[] = [
//     {
//       accessorKey: "fullName",
//       header: "User",
//       cell: ({ row }) => {
//         const user = row.original;
//         return (
//           <div className="flex items-center gap-3">
//             <div className="relative h-10 w-10 shrink-0">
//               <Image
//                 src={user.photo || defaultUserPhoto}
//                 alt={user.fullName}
//                 fill
//                 className="rounded-full object-cover border border-gray-200"
//                 sizes="40px"
//               />
//             </div>
//             <div>
//               <div className="font-medium">{user.fullName}</div>
//               <div className="text-gray-500 text-sm">{user.email}</div>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "phoneNumber",
//       header: "Phone",
//       cell: ({ row }) => row.getValue("phoneNumber") || "N/A",
//     },
//     {
//       accessorKey: "role",
//       header: "Role",
//       cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
//     },
//     {
//       accessorKey: "isSubscribed",
//       header: "Subscription",
//       cell: ({ row }) => (
//         <SubscriptionBadge isSubscribed={row.getValue("isSubscribed")} />
//       ),
//     },
//     {
//       accessorKey: "createdAt",
//       header: "Joined Date",
//       cell: ({ row }) =>
//         new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         }),
//     },
//     {
//       id: "actions",
//       header: "Actions",
//       cell: ({ row }) => (
//         <div className="flex gap-2">
//           <Button
//             onClick={() => handleDeleteClick(row.original)}
//             variant="destructive"
//             size="sm"
//             className=" cursor-pointer"
//           >
//             <MdDelete className="w-5 h-5" />
//           </Button>
//           <Button
//             className=" cursor-pointer"
//             onClick={() => handleBadgeClick(row.original)}
//             variant="outline"
//             size="sm"
//           >
//             Add Badge
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   // -------------------- Table Setup --------------------
//   const table = useReactTable({
//     data: filteredData,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     initialState: { pagination: { pageSize: 6 } },
//   });

//   if (isLoading) return <PageLoader />;
//   if (isError)
//     return (
//       <div className="text-red-500 text-center py-8">Error loading users</div>
//     );

//   return (
//     <div>
//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
//         <Title title="All Users" />
//         <div className="relative w-full sm:w-64">
//           <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search users..."
//             className="border border-gray-300 pl-10 pr-4 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={searchTerm}
//             onChange={(e) => dispatch(setSearchTerm(e.target.value))}
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <TableRow key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <TableHead
//                       key={header.id}
//                       className="px-6 py-3 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider border-gray-300"
//                     >
//                       {flexRender(
//                         header.column.columnDef.header,
//                         header.getContext()
//                       )}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>
//             <TableBody>
//               {table.getRowModel().rows.length ? (
//                 table.getRowModel().rows.map((row) => (
//                   <TableRow key={row.id} className="hover:bg-gray-50">
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id} className="px-6 py-4">
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="px-6 py-4 text-center text-gray-500"
//                   >
//                     No users found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         {/* Pagination */}
//         <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//           <div className="text-sm text-gray-700">
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
//           </div>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               className=" cursor-pointer"
//               size="sm"
//               onClick={() => table.previousPage()}
//               disabled={!table.getCanPreviousPage()}
//             >
//               Previous
//             </Button>
//             <Button
//               className=" cursor-pointer"
//               variant="outline"
//               size="sm"
//               onClick={() => table.nextPage()}
//               disabled={!table.getCanNextPage()}
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
//             <DialogTitle>Delete {selectedUser?.fullName}?</DialogTitle>
//             <DialogDescription>
//               This action cannot be undone. This will permanently remove{" "}
//               <span className="font-semibold">{selectedUser?.fullName}</span>{" "}
//               from your records.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setOpenDeleteDialog(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={confirmDelete}
//               disabled={isDeleting}
//             >
//               {isDeleting ? "Deleting..." : "Confirm Delete"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Badge Dialog */}
//       <Dialog open={openBadgeDialog} onOpenChange={setOpenBadgeDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Give Badge to {selectedUser?.fullName}</DialogTitle>
//             <DialogDescription>Select a badge to award:</DialogDescription>
//           </DialogHeader>

//           <select
//             value={selectedBadge}
//             onChange={(e) => setSelectedBadge(e.target.value as BadgeType)}
//             className="border border-gray-300 rounded-lg px-4 py-2 mt-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             {Object.values(BadgeType).map((badge) => (
//               <option key={badge} value={badge}>
//                 {badge.replace(/_/g, " ")}
//               </option>
//             ))}
//           </select>

//           <DialogFooter>
//             <Button
//               className=" cursor-pointer"
//               variant="outline"
//               onClick={() => setOpenBadgeDialog(false)}
//             >
//               Cancel
//             </Button>
//             <Button className=" cursor-pointer" onClick={confirmGiveBadge}>
//               Give Badge
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
