// src/components/UserListTable.tsx
"use client";

import React from "react";
import Image from "next/image";
import { IoChevronDown, IoSearch } from "react-icons/io5";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useGetUsersQuery } from "@/redux/features/auth/userApi";

import { setSearchTerm, setRoleFilter } from "@/redux/features/auth/userSlice";

import defaultUserPhoto from "@/assets/images/profile.png";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import PageLoader from "../Shared/PageLoader";

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  photo: string | null;
  role: "USER" | "ADMIN";
  isSubscribed: boolean;
  createdAt: string;
  updatedAt: string;
}

const StatusBadge = ({ status }: { status: boolean }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
    }`}
  >
    <span
      className={`w-2 h-2 rounded-full mr-1.5 ${
        status ? "bg-green-500" : "bg-gray-500"
      }`}
    />
    {status ? "Active" : "Inactive"}
  </span>
);

const RoleBadge = ({ role }: { role: User["role"] }) => {
  const roleStyles = {
    USER: "bg-blue-100 text-blue-800",
    ADMIN: "bg-purple-100 text-purple-800",
    // SUPER_ADMIN: "bg-indigo-100 text-indigo-800",
  };

  const roleText = {
    USER: "User",
    ADMIN: "Admin",
    // SUPER_ADMIN: "Super Admin",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        roleStyles[role] || "bg-gray-100 text-gray-800"
      }`}
    >
      {roleText[role] || role}
    </span>
  );
};

const RoleFilter = () => {
  const [open, setOpen] = React.useState(false);
  const roleFilter = useAppSelector((state) => state.user.roleFilter);
  const dispatch = useAppDispatch();

  const options = [
    { label: "All", value: null },
    { label: "User", value: "USER" },
    { label: "Admin", value: "ADMIN" },
    // { label: "Super Admin", value: "SUPER_ADMIN" },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-gray-700 hover:bg-gray-100 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span>
          {options.find((opt) => opt.value === roleFilter)?.label ||
            "All Roles"}
        </span>
        <IoChevronDown className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute z-10 mt-1 w-40 rounded-md bg-white shadow-lg border border-gray-200">
          {options.map((option) => (
            <button
              key={option.label}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                roleFilter === option.value ? "bg-gray-100 font-medium" : ""
              }`}
              onClick={() => {
                dispatch(setRoleFilter(option.value));
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "fullName",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image
              src={user.photo || defaultUserPhoto}
              alt={user.fullName}
              fill
              className="rounded-full object-cover border border-gray-200"
              sizes="40px"
            />
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => (
      <div className="text-gray-700">
        {row.getValue("phoneNumber") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: () => <div className="text-left">Role</div>,
    cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
  },
  {
    accessorKey: "isSubscribed",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("isSubscribed")} />,
  },
  {
    accessorKey: "createdAt",
    header: "Joined Date",
    cell: ({ row }) => (
      <div className="text-gray-700">
        {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
    ),
  },
];

export function UserListTable() {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.user.searchTerm);
  const roleFilter = useAppSelector((state) => state.user.roleFilter);

  // Fetch users from API
  const { data: users = [], isLoading, isError } = useGetUsersQuery(undefined);

  console.log("Users data:", users);

  const filteredData = React.useMemo(() => {
    let result = users;
    if (roleFilter) {
      result = result.filter((user: User) => user.role === roleFilter);
    }
    if (searchTerm) {
      const lowerFilter = searchTerm.toLowerCase();
      result = result.filter(
        (user: User) =>
          user.fullName.toLowerCase().includes(lowerFilter) ||
          user.email.toLowerCase().includes(lowerFilter) ||
          (user.phoneNumber &&
            user.phoneNumber.toLowerCase().includes(lowerFilter))
      );
    }
    return result;
  }, [users, roleFilter, searchTerm]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: (value) => dispatch(setSearchTerm(value)),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <PageLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">Error loading users</div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearch className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="Search users..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            />
          </div>
          <RoleFilter />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
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
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
            style={{
              backgroundColor: !table.getCanPreviousPage() ? "white" : "white",
              color: "#2D0954",
              borderColor: "#2D0954",
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
            style={{
              backgroundColor: !table.getCanNextPage() ? "white" : "white",
              color: "#2D0954",
              borderColor: "#2D0954",
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
