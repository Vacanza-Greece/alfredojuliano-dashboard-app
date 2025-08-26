"use client";

import React from "react";

import {
  setSelectedRequest,
  setStatusFilter,
  setSearchFilter,
  openChat,
  closeChat,
} from "@/redux/features/auth/exchangeSlice";

import { useGetExchangeRequestsQuery } from "@/redux/features/auth/exchangeApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import { ExchangeRequest } from "@/redux/types/auth.type";
import ExchangeTable from "./ExchangeTable";
import ExchangeDetailsModal from "./ExchangeDetailsModal";
import ChatModal from "./ChatModal";
import PageLoader from "../Shared/PageLoader";
import Title from "@/components/reuseabelComponents/Title";

const HomeExchange: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters, selectedRequest, isChatOpen } = useAppSelector(
    (state) => state.exchange
  );

  const {
    data: exchangeRequests = [],
    isLoading,
    error,
  } = useGetExchangeRequestsQuery();

  const filteredRequests = exchangeRequests.filter((request) => {
    const matchesStatus =
      filters.status === "ALL" || request.status === filters.status;

    const matchesSearch =
      filters.search === "" ||
      request.fromUser.fullName
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      request.toUser.fullName
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      request.fromProperty.title
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      request.toProperty.title
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleRowClick = (request: ExchangeRequest) => {
    dispatch(setSelectedRequest(request));
  };

  const handleStatusChange = (status: string) => {
    dispatch(setStatusFilter(status));
  };

  const handleSearchChange = (search: string) => {
    dispatch(setSearchFilter(search));
  };

  const handleOpenChat = (request: ExchangeRequest) => {
    dispatch(setSelectedRequest(request));
    dispatch(openChat());
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">
          Error loading exchange requests
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-7">
      <Title title="Home Exchange" />
      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search Box */}
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search by name or property..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
            />
          </svg>
        </div>

        {/* Status Filter Dropdown */}
        <select
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
          value={filters.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <ExchangeTable
        requests={filteredRequests}
        onRowClick={handleRowClick}
        onChatClick={handleOpenChat}
      />

      {/* Modals */}
      {selectedRequest && (
        <>
          <ExchangeDetailsModal
            request={selectedRequest}
            onClose={() => dispatch(setSelectedRequest(null))}
          />
          <ChatModal
            isOpen={isChatOpen}
            onClose={() => dispatch(closeChat())}
            request={selectedRequest}
          />
        </>
      )}
    </div>
  );
};

export default HomeExchange;

// "use client";

// import React, { useState } from "react";

// import {
//   setSelectedRequest,
//   setStatusFilter,
//   setSearchFilter,
//   openChat,
//   closeChat,
// } from "@/redux/features/auth/exchangeSlice";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import { useGetExchangeRequestsQuery } from "@/redux/features/auth/exchangeApi";
// import { ExchangeRequest } from "@/redux/types/auth.type";
// import ExchangeTable from "./ExchangeTable";
// import ExchangeDetailsModal from "./ExchangeDetailsModal";
// import ChatModal from "./ChatModal";

// const HomeExchange: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const { filters, selectedRequest, isChatOpen } = useAppSelector((state) => state.exchange);

//   const { data: exchangeRequests = [], isLoading, error } = useGetExchangeRequestsQuery();

//   const filteredRequests = exchangeRequests.filter((request) => {
//     const matchesStatus = filters.status === "ALL" || request.status === filters.status;
//     const matchesSearch = filters.search === "" ||
//       request.fromUser.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
//       request.toUser.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
//       request.fromProperty.title.toLowerCase().includes(filters.search.toLowerCase()) ||
//       request.toProperty.title.toLowerCase().includes(filters.search.toLowerCase());

//     return matchesStatus && matchesSearch;
//   });

//   const handleRowClick = (request: ExchangeRequest) => {
//     dispatch(setSelectedRequest(request));
//   };

//   const handleStatusChange = (status: string) => {
//     dispatch(setStatusFilter(status));
//   };

//   const handleSearchChange = (search: string) => {
//     dispatch(setSearchFilter(search));
//   };

//   const handleOpenChat = (request: ExchangeRequest) => {
//     dispatch(setSelectedRequest(request));
//     dispatch(openChat());
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-red-600 text-xl">Error loading exchange requests</div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">Home Exchange Requests</h1>

//         {/* Filters */}
//         <div className="flex flex-col md:flex-row gap-4 mb-6">
//           <div className="flex-1">
//             <input
//               type="text"
//               placeholder="Search by name or property..."
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={filters.search}
//               onChange={(e) => handleSearchChange(e.target.value)}
//             />
//           </div>
//           <select
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             value={filters.status}
//             onChange={(e) => handleStatusChange(e.target.value)}
//           >
//             <option value="ALL">All Status</option>
//             <option value="PENDING">Pending</option>
//             <option value="ACCEPTED">Accepted</option>
//             <option value="REJECTED">Rejected</option>
//             <option value="COMPLETED">Completed</option>
//             <option value="CANCELLED">Cancelled</option>
//           </select>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-2xl font-bold text-blue-600">{exchangeRequests.length}</div>
//             <div className="text-sm text-gray-600">Total</div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-2xl font-bold text-yellow-600">
//               {exchangeRequests.filter(r => r.status === 'PENDING').length}
//             </div>
//             <div className="text-sm text-gray-600">Pending</div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-2xl font-bold text-green-600">
//               {exchangeRequests.filter(r => r.status === 'ACCEPTED').length}
//             </div>
//             <div className="text-sm text-gray-600">Accepted</div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-2xl font-bold text-red-600">
//               {exchangeRequests.filter(r => r.status === 'REJECTED').length}
//             </div>
//             <div className="text-sm text-gray-600">Rejected</div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-2xl font-bold text-purple-600">
//               {exchangeRequests.filter(r => r.status === 'COMPLETED').length}
//             </div>
//             <div className="text-sm text-gray-600">Completed</div>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <ExchangeTable
//         requests={filteredRequests}
//         onRowClick={handleRowClick}
//         onChatClick={handleOpenChat}
//       />

//       {/* Modals */}
//       {selectedRequest && (
//         <>
//           <ExchangeDetailsModal
//             request={selectedRequest}
//             onClose={() => dispatch(setSelectedRequest(null))}
//           />
//           <ChatModal
//             isOpen={isChatOpen}
//             onClose={() => dispatch(closeChat())}
//             request={selectedRequest}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default HomeExchange;
