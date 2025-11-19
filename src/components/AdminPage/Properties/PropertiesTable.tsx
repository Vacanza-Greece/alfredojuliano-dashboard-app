"use client";

import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import {
  useDeletePropertyMutation,
  useGetPropertiesQuery,
} from "@/redux/features/auth/propertiesApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import {
  clearFilters,
  setFilters,
} from "@/redux/features/auth/propertiesSlice";
import { Property } from "@/redux/types/property";

const PropertiesTable: React.FC = () => {
  const {
    data: propertiesResponse,
    isLoading,
    error,
  } = useGetPropertiesQuery();
  const [deleteProperty] = useDeletePropertyMutation();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.properties.filters);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Open delete modal
  const openDeleteModal = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeleteModalOpen(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setPropertyToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Confirm delete
  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    try {
      await deleteProperty(propertyToDelete.id).unwrap();
      alert("Property deleted successfully");
    } catch (error) {
      alert("Error deleting property");
      console.error("Delete error:", error);
    } finally {
      closeDeleteModal();
    }
  };

  // Filtered properties
  const filteredProperties =
    propertiesResponse?.data.filter((property: Property) => {
      const matchesCountry = filters.country
        ? property.country.toLowerCase().includes(filters.country.toLowerCase())
        : true;
      const matchesType = filters.propertyType
        ? property.propertyType === filters.propertyType
        : true;
      const matchesAvailability =
        filters.isAvailable !== null
          ? property.isAvailable === filters.isAvailable
          : true;
      return matchesCountry && matchesType && matchesAvailability;
    }) || [];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = filteredProperties.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading properties. Please try again later.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
      {/* Filters */}
      <div className="bg-white mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Filter Properties
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div>
            <input
              type="text"
              placeholder="Filter by country..."
              value={filters.country}
              onChange={(e) =>
                dispatch(setFilters({ country: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm placeholder-gray-400 transition"
            />
          </div>

          <div>
            <select
              value={filters.propertyType}
              onChange={(e) =>
                dispatch(setFilters({ propertyType: e.target.value }))
              }
              className="w-full px-4 py-2 cursor-pointer border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
            >
              <option value="">All Types</option>
              <option value="HOME">Home</option>
              <option value="APARTMENT">Apartment</option>
              <option value="VILLA">Villa</option>
              <option value="CONDO">Condo</option>
            </select>
          </div>

          <div>
            <select
              value={
                filters.isAvailable === null
                  ? ""
                  : filters.isAvailable.toString()
              }
              onChange={(e) => {
                const value =
                  e.target.value === "" ? null : e.target.value === "true";
                dispatch(setFilters({ isAvailable: value }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
            >
              <option value="">All</option>
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => dispatch(clearFilters())}
              className="w-full px-4 cursor-pointer py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-3 rounded-2xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProperties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10">
                      {property.images.length > 0 ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={property.images[0].url}
                          alt={property.title}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {property.title}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {property.propertyType.toLowerCase()}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {property.location}
                  </div>
                  <div className="text-sm text-gray-500">
                    {property.country}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {property.bedrooms} beds • {property.bathrooms} baths
                  </div>
                  <div className="text-sm text-gray-500">
                    {property.size} sq ft • {property.maxPeople} people
                  </div>
                  <div className="text-sm text-gray-500">
                    Rating: {property.averageRating} ({property.reviewCount}{" "}
                    reviews)
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-8 w-8">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={property.owner.photo}
                        alt={property.owner.fullName}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {property.owner.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.owner.isSuspended ? (
                          <span className="text-red-600">Suspended</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      property.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {property.isAvailable ? "Available" : "Not Available"}
                  </span>
                  {property.isExchanged && (
                    <span className="ml-1 inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      Exchanged
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => openDeleteModal(property)}
                    className="p-2 rounded-md cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                    aria-label="Delete Property"
                  >
                    <MdDelete className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredProperties.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{currentProperties.length}</span> of{" "}
            <span className="font-medium">{filteredProperties.length}</span>{" "}
            properties
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border cursor-pointer rounded-lg text-sm ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Prev
            </button>
            <div className="min-w-[50px] text-center border px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 bg-gray-50">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 border cursor-pointer rounded-lg text-sm ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No properties found</div>
          <div className="text-gray-500 mt-2">
            Try adjusting your filters or check back later.
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && propertyToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delete Property
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{propertyToDelete.title}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 cursor-pointer border rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProperty}
                className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesTable;

// "use client";

// import React, { useState } from "react";
// import { MdDelete } from "react-icons/md";
// import {
//   useDeletePropertyMutation,
//   useGetPropertiesQuery,
// } from "@/redux/features/auth/propertiesApi";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import {
//   clearFilters,
//   setFilters,
// } from "@/redux/features/auth/propertiesSlice";
// import { Property } from "@/redux/types/property";

// const PropertiesTable: React.FC = () => {
//   const {
//     data: propertiesResponse,
//     isLoading,
//     error,
//   } = useGetPropertiesQuery();
//   const [deleteProperty] = useDeletePropertyMutation();
//   const dispatch = useAppDispatch();
//   const filters = useAppSelector((state) => state.properties.filters);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(6);

//   // Delete property
//   const handleDeleteProperty = async (id: string) => {
//     if (window.confirm("Are you sure you want to delete this property?")) {
//       try {
//         await deleteProperty(id).unwrap();
//         alert("Property deleted successfully");
//       } catch (error) {
//         alert("Error deleting property");
//         console.error("Delete error:", error);
//       }
//     }
//   };

//   // Filtered properties
//   const filteredProperties =
//     propertiesResponse?.data.filter((property: Property) => {
//       const matchesCountry = filters.country
//         ? property.country.toLowerCase().includes(filters.country.toLowerCase())
//         : true;
//       const matchesType = filters.propertyType
//         ? property.propertyType === filters.propertyType
//         : true;
//       const matchesAvailability =
//         filters.isAvailable !== null
//           ? property.isAvailable === filters.isAvailable
//           : true;
//       return matchesCountry && matchesType && matchesAvailability;
//     }) || [];

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentProperties = filteredProperties.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

//   const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
//   const handleNext = () =>
//     setCurrentPage((prev) => Math.min(prev + 1, totalPages));

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//         Error loading properties. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
//       {/* Filters */}
//       <div className=" bg-white">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">
//           Filter Properties
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {/* Country */}
//           <div>
//             <input
//               type="text"
//               placeholder="Filter by country..."
//               value={filters.country}
//               onChange={(e) =>
//                 dispatch(setFilters({ country: e.target.value }))
//               }
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm placeholder-gray-400 transition"
//             />
//           </div>

//           {/* Property Type */}
//           <div>
//             <select
//               value={filters.propertyType}
//               onChange={(e) =>
//                 dispatch(setFilters({ propertyType: e.target.value }))
//               }
//               className="w-full px-4 py-2 cursor-pointer border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
//             >
//               <option className="cursor-pointer" value="">
//                 All Types
//               </option>
//               <option className="cursor-pointer" value="HOME">
//                 Home
//               </option>
//               <option className="cursor-pointer" value="APARTMENT">
//                 Apartment
//               </option>
//               <option className="cursor-pointer" value="VILLA">
//                 Villa
//               </option>
//               <option className="cursor-pointer" value="CONDO">
//                 Condo
//               </option>
//             </select>
//           </div>

//           {/* Availability */}
//           <div>
//             <select
//               value={
//                 filters.isAvailable === null
//                   ? ""
//                   : filters.isAvailable.toString()
//               }
//               onChange={(e) => {
//                 const value =
//                   e.target.value === "" ? null : e.target.value === "true";
//                 dispatch(setFilters({ isAvailable: value }));
//               }}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
//             >
//               <option className="cursor-pointer" value="">
//                 All
//               </option>
//               <option className="cursor-pointer" value="true">
//                 Available
//               </option>
//               <option className="cursor-pointer" value="false">
//                 Not Available
//               </option>
//             </select>
//           </div>

//           {/* Clear Filters */}
//           <div className="flex items-end">
//             <button
//               onClick={() => dispatch(clearFilters())}
//               className="w-full cursor-pointer px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow transition"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto p-3 rounded-2xl">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
//                 Property
//               </th>
//               <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
//                 Location
//               </th>
//               <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
//                 Details
//               </th>
//               <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
//                 Owner
//               </th>
//               <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {currentProperties.map((property) => (
//               <tr key={property.id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className="shrink-0 h-10 w-10">
//                       {property.images.length > 0 ? (
//                         <img
//                           className="h-10 w-10 rounded-lg object-cover"
//                           src={property.images[0].url}
//                           alt={property.title}
//                         />
//                       ) : (
//                         <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
//                           <span className="text-gray-400 text-xs">
//                             No Image
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {property.title}
//                       </div>
//                       <div className="text-sm text-gray-500 capitalize">
//                         {property.propertyType.toLowerCase()}
//                       </div>
//                     </div>
//                   </div>
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm text-gray-900">
//                     {property.location}
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     {property.country}
//                   </div>
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm text-gray-900">
//                     {property.bedrooms} beds • {property.bathrooms} baths
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     {property.size} sq ft • {property.maxPeople} people
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     Rating: {property.averageRating} ({property.reviewCount}{" "}
//                     reviews)
//                   </div>
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className="shrink-0 h-8 w-8">
//                       <img
//                         className="h-8 w-8 rounded-full"
//                         src={property.owner.photo}
//                         alt={property.owner.fullName}
//                       />
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {property.owner.fullName}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {property.owner.isSuspended ? (
//                           <span className="text-red-600">Suspended</span>
//                         ) : (
//                           <span className="text-green-600">Active</span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span
//                     className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                       property.isAvailable
//                         ? "bg-green-100 text-green-800"
//                         : "bg-red-100 text-red-800"
//                     }`}
//                   >
//                     {property.isAvailable ? "Available" : "Not Available"}
//                   </span>
//                   {property.isExchanged && (
//                     <span className="ml-1 inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
//                       Exchanged
//                     </span>
//                   )}
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   <button
//                     type="button"
//                     onClick={() => handleDeleteProperty(property.id)}
//                     className="p-2 rounded-md cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 transition-colors"
//                     aria-label="Delete Property"
//                   >
//                     <MdDelete className="w-5 h-5" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {filteredProperties.length > 0 && (
//         <div className="mt-6 flex items-center justify-between">
//           <p className="text-sm text-gray-600">
//             Showing{" "}
//             <span className="font-medium">{currentProperties.length}</span> of{" "}
//             <span className="font-medium">{filteredProperties.length}</span>{" "}
//             properties
//           </p>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handlePrev}
//               disabled={currentPage === 1}
//               className={`px-3 py-1.5 border cursor-pointer rounded-lg text-sm ${
//                 currentPage === 1
//                   ? "opacity-50 cursor-not-allowed"
//                   : "hover:bg-gray-100"
//               }`}
//             >
//               Prev
//             </button>
//             <div className="min-w-[50px] text-center border px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 bg-gray-50">
//               {currentPage} / {totalPages}
//             </div>
//             <button
//               onClick={handleNext}
//               disabled={currentPage === totalPages}
//               className={`px-3 py-1.5 border cursor-pointer rounded-lg text-sm ${
//                 currentPage === totalPages
//                   ? "opacity-50 cursor-not-allowed"
//                   : "hover:bg-gray-100"
//               }`}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Empty State */}
//       {filteredProperties.length === 0 && (
//         <div className="text-center py-12">
//           <div className="text-gray-400 text-lg">No properties found</div>
//           <div className="text-gray-500 mt-2">
//             Try adjusting your filters or check back later.
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PropertiesTable;
