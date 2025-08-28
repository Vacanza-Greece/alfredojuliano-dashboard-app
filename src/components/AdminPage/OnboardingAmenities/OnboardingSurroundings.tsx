"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import Title from "@/components/reuseabelComponents/Title";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  clearError,
  setSelectedSurrounding,
} from "@/redux/features/auth/surroundingsSlice";
import { Surrounding } from "@/redux/types/surrounding";
import {
  useCreateSurroundingMutation,
  useDeleteSurroundingMutation,
  useGetSurroundingsQuery,
  useUpdateSurroundingMutation,
} from "@/redux/features/auth/surroundingsApi";
import { LiaEdit } from "react-icons/lia";
import { MdDelete } from "react-icons/md";

const OnboardingSurroundings = () => {
  const dispatch = useAppDispatch();
  const { selectedSurrounding } = useAppSelector((state) => state.surroundings);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: null as File | null,
  });
  const [error, setError] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [surroundingToDelete, setSurroundingToDelete] =
    useState<Surrounding | null>(null);

  // RTK Query hooks
  const {
    data: surroundings = [],
    isLoading,
    error: fetchError,
  } = useGetSurroundingsQuery();
  const [createSurrounding, { isLoading: isCreating }] =
    useCreateSurroundingMutation();
  const [updateSurrounding, { isLoading: isUpdating }] =
    useUpdateSurroundingMutation();
  const [deleteSurrounding, { isLoading: isDeleting }] =
    useDeleteSurroundingMutation();

  // Open add/edit modal
  const handleOpenModal = (surrounding?: Surrounding) => {
    if (surrounding) {
      setIsEditMode(true);
      dispatch(setSelectedSurrounding(surrounding));
      setFormData({ name: surrounding.name, icon: null });
    } else {
      setIsEditMode(false);
      dispatch(setSelectedSurrounding(null));
      setFormData({ name: "", icon: null });
    }
    setIsModalOpen(true);
    setError("");
    dispatch(clearError());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", icon: null });
    setError("");
    dispatch(clearError());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, icon: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError("Name is required");
    if (!isEditMode && !formData.icon) return setError("Icon is required");

    try {
      if (isEditMode && selectedSurrounding) {
        const updateData: any = { name: formData.name };
        if (formData.icon) updateData.icon = formData.icon;
        await updateSurrounding({
          id: selectedSurrounding.id,
          data: updateData,
        }).unwrap();
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        if (formData.icon) formDataToSend.append("icon", formData.icon);
        await createSurrounding(formDataToSend).unwrap();
      }
      handleCloseModal();
    } catch (err: any) {
      setError(err.data?.message || "Something went wrong");
    }
  };

  // Open delete modal
  const handleDeleteClick = (surrounding: Surrounding) => {
    setSurroundingToDelete(surrounding);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!surroundingToDelete) return;
    try {
      await deleteSurrounding(surroundingToDelete.id).unwrap();
      setDeleteModalOpen(false);
      setSurroundingToDelete(null);
    } catch (err: any) {
      setError(err.data?.message || "Failed to delete surrounding");
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSurroundingToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title title="Surroundings" />
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Surrounding
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Failed to fetch surroundings
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {surroundings.map((surrounding) => (
          <div
            key={surrounding.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <img
                src={surrounding.icon}
                alt={surrounding.name}
                className="w-12 h-12 object-contain"
              />
              <div className="flex space-x-2">
                {/* Edit Button */}
                <button
                  onClick={() => handleOpenModal(surrounding)}
                  disabled={isUpdating || isDeleting}
                  className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition disabled:opacity-50 cursor-pointer"
                >
                  <LiaEdit className="w-5 h-5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick(surrounding)}
                  disabled={isDeleting}
                  className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 transition disabled:opacity-50 cursor-pointer"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {surrounding.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-0.4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditMode ? "Edit Surrounding" : "Add New Surrounding"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter surrounding name"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                />
                {isEditMode && selectedSurrounding?.icon && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Current icon:</p>
                    <img
                      src={selectedSurrounding.icon}
                      alt="Current icon"
                      className="w-14 h-14 object-contain mt-2 border rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all duration-300 cursor-pointer ${
                    isCreating || isUpdating
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                  }`}
                >
                  {isCreating || isUpdating
                    ? "Processing..."
                    : isEditMode
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Surroundings Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-0.4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fadeIn">
            {/* Header */}
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this Surrounding?
            </p>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelDelete}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all duration-300 cursor-pointer ${
                  isDeleting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete Surrounding"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingSurroundings;
