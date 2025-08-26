"use client";

import { ExchangeRequest } from "@/redux/types/auth.type";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface ExchangeTableProps {
  requests: ExchangeRequest[];
  onRowClick: (request: ExchangeRequest) => void;
  onChatClick: (request: ExchangeRequest) => void;
}

const ExchangeTable: React.FC<ExchangeTableProps> = ({
  requests,
  onRowClick,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 5;

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return requests.slice(start, end);
  }, [pageIndex, requests]);

  const totalPages = Math.ceil(requests.length / pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
                      {request.fromUser.photo ? (
                        <img
                          src={request.fromUser.photo}
                          alt={request.fromUser.fullName}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {request.fromUser.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.fromUser.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.fromUser.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
                      {request.toUser.photo ? (
                        <img
                          src={request.toUser.photo}
                          alt={request.toUser.fullName}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {request.toUser.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.toUser.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.toUser.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.fromProperty.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.fromProperty.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.toProperty.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.toProperty.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onRowClick(request)}
                    className="text-[#3174CD] hover:text-[#004fb6] cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No exchange requests found</div>
        </div>
      )}

      {/* Pagination */}
      {requests.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">{pageIndex * pageSize + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min((pageIndex + 1) * pageSize, requests.length)}
            </span>{" "}
            of <span className="font-medium">{requests.length}</span> users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
              className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
              style={{
                backgroundColor: pageIndex === 0 ? "white" : "white",
                color: "#2D0954",
                borderColor: "#2D0954",
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={pageIndex === totalPages - 1}
              className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
              style={{
                backgroundColor:
                  pageIndex === totalPages - 1 ? "white" : "white",
                color: "#2D0954",
                borderColor: "#2D0954",
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeTable;

// "use client";

// import { ExchangeRequest } from "@/redux/types/auth.type";
// import React from "react";

// interface ExchangeTableProps {
//   requests: ExchangeRequest[];
//   onRowClick: (request: ExchangeRequest) => void;
//   onChatClick: (request: ExchangeRequest) => void;
// }

// const ExchangeTable: React.FC<ExchangeTableProps> = ({
//   requests,
//   onRowClick,
// }) => {
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-800";
//       case "ACCEPTED":
//         return "bg-green-100 text-green-800";
//       case "REJECTED":
//         return "bg-red-100 text-red-800";
//       case "COMPLETED":
//         return "bg-purple-100 text-purple-800";
//       case "CANCELLED":
//         return "bg-gray-100 text-gray-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <div className="bg-white shadow-lg rounded-lg overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 From User
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 To User
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 From Property
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 To Property
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Date
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {requests.map((request) => (
//               <tr
//                 key={request.id}
//                 className="hover:bg-gray-50 cursor-pointer transition-colors"
//               >
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className="h-10 w-10 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
//                       {request.fromUser.photo ? (
//                         <img
//                           src={request.fromUser.photo}
//                           alt={request.fromUser.fullName}
//                           className="h-10 w-10 rounded-full"
//                         />
//                       ) : (
//                         <span className="text-sm font-medium text-gray-600">
//                           {request.fromUser.fullName.charAt(0).toUpperCase()}
//                         </span>
//                       )}
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {request.fromUser.fullName}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {request.fromUser.email}
//                       </div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className="h-10 w-10 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
//                       {request.toUser.photo ? (
//                         <img
//                           src={request.toUser.photo}
//                           alt={request.toUser.fullName}
//                           className="h-10 w-10 rounded-full"
//                         />
//                       ) : (
//                         <span className="text-sm font-medium text-gray-600">
//                           {request.toUser.fullName.charAt(0).toUpperCase()}
//                         </span>
//                       )}
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {request.toUser.fullName}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {request.toUser.email}
//                       </div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm text-gray-900">
//                     {request.fromProperty.title}
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     {request.fromProperty.location}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm text-gray-900">
//                     {request.toProperty.title}
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     {request.toProperty.location}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span
//                     className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
//                       request.status
//                     )}`}
//                   >
//                     {request.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {new Date(request.createdAt).toLocaleDateString()}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   <button
//                     onClick={() => onRowClick(request)}
//                     className="text-[#3174CD] hover:text-[#004fb6] cursor-pointer"
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {requests.length === 0 && (
//         <div className="text-center py-12">
//           <div className="text-gray-500">No exchange requests found</div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ExchangeTable;
