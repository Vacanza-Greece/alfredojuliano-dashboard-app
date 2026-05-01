"use client";

import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { TfiPencilAlt } from "react-icons/tfi";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

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

  // Open details modal
  const openDetailsModal = (property: Property) => {
    setPropertyDetails(property);
    setIsDetailsModalOpen(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setPropertyDetails(null);
    setIsDetailsModalOpen(false);
  };

  // Open full screen image
  const openFullScreen = (index: number) => {
    setCurrentImageIndex(index);
    setIsFullScreenOpen(true);
  };

  // Close full screen image
  const closeFullScreen = () => {
    setCurrentImageIndex(0);
    setIsFullScreenOpen(false);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!propertyDetails) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? propertyDetails.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!propertyDetails) return;
    setCurrentImageIndex((prev) =>
      prev === propertyDetails.images.length - 1 ? 0 : prev + 1
    );
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
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${property.isAvailable
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openDetailsModal(property)}
                      className="p-2 rounded-md cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      aria-label="View Details"
                    >
                      <TfiPencilAlt className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(property)}
                      className="p-2 rounded-md cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                      aria-label="Delete Property"
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredProperties.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {Math.min(indexOfFirstItem + 1, filteredProperties.length)}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredProperties.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">{filteredProperties.length}</span>{" "}
              properties
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border cursor-pointer rounded-lg text-sm ${currentPage === 1
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
              className={`px-3 py-1.5 border cursor-pointer rounded-lg text-sm ${currentPage === totalPages
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg transform transition-all">
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

      {/* Property Details Modal */}
      {isDetailsModalOpen && propertyDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold text-gray-900 truncate pr-4">
                {propertyDetails.title}
              </h2>
              <button
                onClick={closeDetailsModal}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Images and Description */}
                <div className="space-y-6">
                  {/* Image Gallery */}
                  <div className="space-y-4">
                    <div
                      className="rounded-xl overflow-hidden aspect-16/10 bg-gray-100 cursor-zoom-in"
                      onClick={() => openFullScreen(0)}
                    >
                      <img
                        src={propertyDetails.images[0]?.url}
                        alt="Property Main"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {propertyDetails.images.length > 1 && (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {propertyDetails.images.slice(1).map((img, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg overflow-hidden aspect-square bg-gray-100 border cursor-zoom-in group"
                            onClick={() => openFullScreen(idx + 1)}
                          >
                            <img
                              src={img.url}
                              alt={`Property ${idx + 2}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {propertyDetails.description}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Amenities
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {propertyDetails.amenities.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <img src={item.icon} alt="" className="w-5 h-5" />
                          <span className="text-sm text-gray-700">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Property Details, Location & Owner */}
                <div className="space-y-8">
                  {/* Property Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-sm text-blue-600 font-medium">Price</p>
                      <p className="text-xl font-bold text-blue-900">
                        €{propertyDetails.price}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                      <p className="text-sm text-purple-600 font-medium">Type</p>
                      <p className="text-xl font-bold text-purple-900 capitalize">
                        {propertyDetails.propertyType.toLowerCase()}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <p className="text-sm text-green-600 font-medium">Size</p>
                      <p className="text-xl font-bold text-green-900">
                        {propertyDetails.size} m²
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <p className="text-sm text-orange-600 font-medium">
                        Capacity
                      </p>
                      <p className="text-xl font-bold text-orange-900">
                        {propertyDetails.maxPeople} Guest(s)
                      </p>
                    </div>
                  </div>

                  {/* Rooms Info */}
                  <div className="flex bg-gray-50 rounded-xl p-4 border justify-between">
                    <div className="text-center flex-1 border-r border-gray-200">
                      <p className="text-2xl font-bold text-gray-800">
                        {propertyDetails.bedrooms}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Bedrooms
                      </p>
                    </div>
                    <div className="text-center flex-1 border-r border-gray-200">
                      <p className="text-2xl font-bold text-gray-800">
                        {propertyDetails.bathrooms}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Bathrooms
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold text-gray-800">
                        {propertyDetails.averageRating}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Rating
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Location
                    </h3>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border">
                      <div className="mt-1">
                        <span className="text-xl font-bold">📍</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {propertyDetails.location}
                        </p>
                        <p className="text-gray-500">{propertyDetails.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Owner Details
                    </h3>
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-4">
                      <img
                        src={propertyDetails.owner.photo}
                        alt={propertyDetails.owner.fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">
                          {propertyDetails.owner.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {propertyDetails.owner.email}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${propertyDetails.owner.isSuspended
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                              }`}
                          >
                            {propertyDetails.owner.isSuspended ? "Suspended" : "Active"}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] bg-gray-200 text-gray-700 font-bold rounded uppercase tracking-wider">
                            {propertyDetails.owner.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {propertyDetails.isTravelWithPets && (
                      <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-sm font-medium">
                        🐾 Pets Allowed
                      </span>
                    )}
                    {propertyDetails.isExchanged && (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-sm font-medium">
                        🔄 Exchange Available
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Extras Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-8 border-t">
                {/* Transport */}
                {propertyDetails.transports.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Transports
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {propertyDetails.transports.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 px-3 rounded-full bg-orange-50 border border-orange-100"
                        >
                          <img src={item.icon} alt="" className="w-4 h-4" />
                          <span className="text-sm text-orange-800">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Surroundings */}
                {propertyDetails.surroundings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Surroundings
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {propertyDetails.surroundings.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 px-3 rounded-full bg-emerald-50 border border-emerald-100"
                        >
                          <img src={item.icon} alt="" className="w-4 h-4" />
                          <span className="text-sm text-emerald-800">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Full Screen Image Viewer */}
      {isFullScreenOpen && propertyDetails && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 group"
          onClick={closeFullScreen}
        >
          {/* Close Button */}
          <button
            onClick={closeFullScreen}
            className="absolute top-6 right-6 text-white text-5xl hover:text-gray-300 cursor-pointer z-[70] p-2 leading-none"
          >
            &times;
          </button>

          {/* Navigation Arrows */}
          {propertyDetails.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 lg:left-10 text-white/50 hover:text-white transition-colors cursor-pointer z-[70] p-4 rounded-full hover:bg-white/10"
              >
                <HiChevronLeft className="w-12 h-12" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 lg:right-10 text-white/50 hover:text-white transition-colors cursor-pointer z-[70] p-4 rounded-full hover:bg-white/10"
              >
                <HiChevronRight className="w-12 h-12" />
              </button>
            </>
          )}

          {/* Image Container */}
          <div
            className="relative w-full h-full flex flex-col items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={propertyDetails.images[currentImageIndex]?.url}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl animate-in zoom-in duration-300"
              alt="Full Size"
            />

            {/* Image Counter */}
            <div className="text-white/70 font-medium text-sm bg-white/10 px-4 py-1.5 rounded-full">
              {currentImageIndex + 1} / {propertyDetails.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesTable;
