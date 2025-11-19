"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { MdDelete } from "react-icons/md";
import { IoSearch, IoChevronDown } from "react-icons/io5";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
} from "@/redux/features/auth/userApi";
import { setSearchTerm, setRoleFilter } from "@/redux/features/auth/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";

import defaultUserPhoto from "@/assets/images/profile.png";
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
import Title from "@/components/reuseabelComponents/Title";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// -------------------- Types --------------------
interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  photo: string | null;
  role: "USER" | "ADMIN";
  isSubscribed: boolean;
  createdAt: string;
  updatedAt: string;
}

// -------------------- Badge Components --------------------
const SubscriptionBadge = ({ isSubscribed }: { isSubscribed: boolean }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
      isSubscribed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
    }`}
  >
    {isSubscribed ? "Subscribed" : "Not Subscribed"}
  </span>
);

const RoleBadge = ({ role }: { role: User["role"] }) => {
  const roleStyles = {
    USER: "bg-blue-100 text-blue-800",
    ADMIN: "bg-purple-100 text-purple-800",
  };
  const roleText = { USER: "User", ADMIN: "Admin" };
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

// -------------------- Role Filter --------------------
const RoleFilter = () => {
  const [open, setOpen] = useState(false);
  const roleFilter = useAppSelector((state) => state.user.roleFilter);
  const dispatch = useAppDispatch();

  const options = [
    { label: "All Members", value: null },
    { label: "User", value: "USER" },
    { label: "Admin", value: "ADMIN" },
  ];

  return (
    <div className="relative w-full sm:w-auto">
      <Button
        variant="ghost"
        size="sm"
        className="w-full flex items-center justify-between text-gray-700 border border-gray-300 px-4 py-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm hover:border-blue-400 transition-all duration-200"
        onClick={() => setOpen(!open)}
      >
        <span>
          {options.find((opt) => opt.value === roleFilter)?.label ||
            "All Roles"}
        </span>
        <IoChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <div className="absolute left-0 mt-1 rounded-lg bg-white shadow-lg border border-gray-200 z-10">
          {options.map((option) => (
            <button
              key={option.label}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
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

// -------------------- Main Component --------------------
export function UserListTable() {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.user.searchTerm);
  const roleFilter = useAppSelector((state) => state.user.roleFilter);

  const { data: users = [], isLoading, isError } = useGetUsersQuery(undefined);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // -------------------- Handlers --------------------
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id).unwrap();
      setOpenDialog(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (user: User, newRole: User["role"]) => {
    try {
      await updateUserRole({ id: user.id, role: newRole }).unwrap();
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  // -------------------- Filtered Data --------------------
  const filteredData = useMemo(() => {
    let result = users;
    if (roleFilter) result = result.filter((u: User) => u.role === roleFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u: User) =>
          u.fullName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.phoneNumber?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [users, roleFilter, searchTerm]);

  // -------------------- Table Columns --------------------
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src={user.photo || defaultUserPhoto}
                alt={user.fullName}
                fill
                className="rounded-full object-cover border border-gray-200"
                sizes="40px"
              />
            </div>
            <div>
              <div className="font-medium">{user.fullName}</div>
              <div className="text-gray-500 text-sm">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => row.getValue("phoneNumber") || "N/A",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <select
            value={user.role}
            onChange={(e) =>
              handleRoleChange(user, e.target.value as User["role"])
            }
            className="appearance-none border-none rounded-md px-4 py-2 text-sm text-gray-700 bg-white shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        );
      },
    },
    {
      accessorKey: "isSubscribed",
      header: "Subscription",
      cell: ({ row }) => (
        <SubscriptionBadge isSubscribed={row.getValue("isSubscribed")} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined Date",
      cell: ({ row }) =>
        new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) =>
        new Date(row.getValue("updatedAt")).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => handleDeleteClick(row.original)}
          disabled={isDeleting}
          className="p-2 rounded-md cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 transition-colors"
        >
          <MdDelete className="w-5 h-5" />
        </button>
      ),
    },
  ];

  // -------------------- Table Setup --------------------
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 6 } },
  });

  if (isLoading) return <PageLoader />;
  if (isError)
    return (
      <div className="text-red-500 text-center py-8">Error loading users</div>
    );

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
        <Title title="All Users" />
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="border border-gray-300 pl-10 pr-4 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            />
          </div>
          <RoleFilter />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider border-gray-300"
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

        {/* Pagination */}
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
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedUser?.fullName}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently remove{" "}
              <span className="font-semibold">{selectedUser?.fullName}</span>{" "}
              from your records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className=" cursor-pointer"
              variant="outline"
              onClick={() => setOpenDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className=" cursor-pointer"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// import React, { useState, useMemo } from "react";
// import Image from "next/image";
// import { IoChevronDown, IoSearch } from "react-icons/io5";
// import { MdDelete } from "react-icons/md";
// import {
//   useReactTable,
//   ColumnDef,
//   getCoreRowModel,
//   flexRender,
//   getPaginationRowModel,
// } from "@tanstack/react-table";

// import {
//   useGetUsersQuery,
//   useDeleteUserMutation,
//   useUpdateUserRoleMutation,
// } from "@/redux/features/auth/userApi";

// import { setSearchTerm, setRoleFilter } from "@/redux/features/auth/userSlice";
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
//   phoneNumber: string;
//   photo: string | null;
//   role: "USER" | "ADMIN";
//   isSubscribed: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// // -------------------- Badge Components --------------------
// const StatusBadge = ({ status }: { status: boolean }) => (
//   <span
//     className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//       status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
//     }`}
//   >
//     <span
//       className={`w-2 h-2 rounded-full mr-1.5 ${
//         status ? "bg-green-500" : "bg-gray-500"
//       }`}
//     />
//     {status ? "Active" : "Inactive"}
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

// // -------------------- Role Filter --------------------
// const RoleFilter = () => {
//   const [open, setOpen] = React.useState(false);
//   const roleFilter = useAppSelector((state) => state.user.roleFilter);
//   const dispatch = useAppDispatch();

//   const options = [
//     { label: "All Members", value: null },
//     { label: "User", value: "USER" },
//     { label: "Admin", value: "ADMIN" },
//   ];

//   return (
//     <div className="relative">
//       <Button
//         variant="ghost"
//         size="sm"
//         className="w-full flex items-center justify-between text-gray-700 border border-gray-300 px-4 py-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm hover:border-blue-400 transition-all duration-200"
//         onClick={() => setOpen(!open)}
//       >
//         <span className="truncate">
//           {options.find((opt) => opt.value === roleFilter)?.label ||
//             "All Roles"}
//         </span>
//         <IoChevronDown
//           className={`h-4 w-4 transition-transform duration-200 ${
//             open ? "rotate-180" : ""
//           }`}
//         />
//       </Button>

//       {open && (
//         <div className="absolute left-0 right-0 sm:right-auto mt-1 rounded-lg bg-white shadow-lg border border-gray-200 z-10">
//           {options.map((option) => (
//             <button
//               key={option.label}
//               className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
//                 roleFilter === option.value ? "bg-gray-100 font-medium" : ""
//               }`}
//               onClick={() => {
//                 dispatch(setRoleFilter(option.value));
//                 setOpen(false);
//               }}
//             >
//               {option.label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // -------------------- Main Component --------------------
// export function UserListTable() {
//   const dispatch = useAppDispatch();
//   const searchTerm = useAppSelector((state) => state.user.searchTerm);
//   const roleFilter = useAppSelector((state) => state.user.roleFilter);

//   const { data: users = [], isLoading, isError } = useGetUsersQuery(undefined);

//   console.log("User rooe:", users);
//   const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
//   const [updateUserRole] = useUpdateUserRoleMutation();

//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);

//   // -------------------- Handlers --------------------
//   const handleDeleteClick = (user: User) => {
//     setSelectedUser(user);
//     setOpenDialog(true);
//   };

//   const confirmDelete = async () => {
//     if (!selectedUser) return;
//     try {
//       await deleteUser(selectedUser.id).unwrap();
//       setOpenDialog(false);
//       setSelectedUser(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleRoleChange = async (user: User, newRole: User["role"]) => {
//     try {
//       await updateUserRole({ id: user.id, role: newRole }).unwrap();
//     } catch (err) {
//       console.error("Failed to update role:", err);
//     }
//   };

//   // -------------------- Filtered Data --------------------
//   const filteredData = useMemo(() => {
//     let result = users;
//     if (roleFilter)
//       result = result.filter((u: { role: string }) => u.role === roleFilter);
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(
//         (u: { fullName: string; email: string; phoneNumber: string }) =>
//           u.fullName.toLowerCase().includes(term) ||
//           u.email.toLowerCase().includes(term) ||
//           u.phoneNumber?.toLowerCase().includes(term)
//       );
//     }
//     return result;
//   }, [users, roleFilter, searchTerm]);

//   // -------------------- Columns --------------------
//   const columns: ColumnDef<User>[] = [
//     {
//       accessorKey: "fullName",
//       header: "User",
//       cell: ({ row }) => {
//         const user = row.original;
//         return (
//           <div className="flex items-center gap-3">
//             <div className="relative h-10 w-10 flex-shrink-0">
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
//       cell: ({ row }) => <div>{row.getValue("phoneNumber") || "N/A"}</div>,
//     },
//     {
//       accessorKey: "role",
//       header: "Role",
//       cell: ({ row }) => {
//         const user = row.original;
//         return (
//           <select
//             value={user.role}
//             onChange={(e) =>
//               handleRoleChange(user, e.target.value as User["role"])
//             }
//             className="appearance-none border-none rounded-md px-4 py-2 text-sm text-gray-700 bg-white shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="USER" className="border-none bg-white">
//               User
//             </option>
//             <option value="ADMIN" className="border-none bg-white">
//               Admin
//             </option>
//           </select>
//         );
//       },
//     },
//     {
//       accessorKey: "isSubscribed",
//       header: "Status",
//       cell: ({ row }) => <StatusBadge status={row.getValue("isSubscribed")} />,
//     },

//     {
//       accessorKey: "createdAt",
//       header: "Joined Date",
//       cell: ({ row }) => (
//         <div className="text-gray-700">
//           {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           })}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "updatedAt",
//       header: "Last Updated",
//       cell: ({ row }) => (
//         <div className="text-gray-700">
//           {new Date(row.getValue("updatedAt")).toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           })}
//         </div>
//       ),
//     },

//     {
//       id: "actions",
//       header: "Actions",
//       cell: ({ row }) => {
//         const user = row.original;
//         return (
//           <button
//             onClick={() => handleDeleteClick(user)}
//             disabled={isDeleting}
//             className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer"
//           >
//             <MdDelete className="w-5 h-5" />
//           </button>
//         );
//       },
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
//         <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//           {/* Search */}
//           <div className="relative w-full sm:w-64">
//             <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search users..."
//               className="border border-gray-300 pl-10 pr-4 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={searchTerm}
//               onChange={(e) => dispatch(setSearchTerm(e.target.value))}
//             />
//           </div>
//           {/* Role Filter */}
//           <RoleFilter />
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
//                       className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider  border-gray-300 "
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
//               size="sm"
//               onClick={() => table.previousPage()}
//               disabled={!table.getCanPreviousPage()}
//               className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
//               style={{
//                 backgroundColor: "white",
//                 color: "#2D0954",
//                 borderColor: "#2D0954",
//               }}
//             >
//               Previous
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => table.nextPage()}
//               disabled={!table.getCanNextPage()}
//               className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
//               style={{
//                 backgroundColor: "white",
//                 color: "#2D0954",
//                 borderColor: "#2D0954",
//               }}
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Delete Dialog */}
//       <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
//             <Button variant="outline" onClick={() => setOpenDialog(false)}>
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
//     </div>
//   );
// }
