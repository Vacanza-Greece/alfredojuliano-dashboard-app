"use client";

import React, { useState } from "react";




import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import Title from "@/components/reuseabelComponents/Title";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { clearError, setSelectedSurrounding } from "@/redux/features/auth/surroundingsSlice";
import { Surrounding } from "@/redux/types/surrounding";
import { useCreateSurroundingMutation, useDeleteSurroundingMutation, useGetSurroundingsQuery, useUpdateSurroundingMutation } from "@/redux/features/auth/surroundingsApi";

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

  const handleOpenModal = (surrounding?: Surrounding) => {
    if (surrounding) {
      setIsEditMode(true);
      dispatch(setSelectedSurrounding(surrounding));
      setFormData({
        name: surrounding.name,
        icon: null,
      });
    } else {
      setIsEditMode(false);
      dispatch(setSelectedSurrounding(null));
      setFormData({
        name: "",
        icon: null,
      });
    }
    setIsModalOpen(true);
    setError("");
    dispatch(clearError());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      icon: null,
    });
    setError("");
    dispatch(clearError());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        icon: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!isEditMode && !formData.icon) {
      setError("Icon is required");
      return;
    }

    try {
      if (isEditMode && selectedSurrounding) {
        const updateData: any = { name: formData.name };
        if (formData.icon) {
          updateData.icon = formData.icon;
        }

        await updateSurrounding({
          id: selectedSurrounding.id,
          data: updateData,
        }).unwrap();
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        if (formData.icon) {
          formDataToSend.append("icon", formData.icon);
        }

        await createSurrounding(formDataToSend).unwrap();
      }

      handleCloseModal();
    } catch (err: any) {
      setError(err.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this surrounding?")) {
      try {
        await deleteSurrounding(id).unwrap();
      } catch (err: any) {
        setError(err.data?.message || "Failed to delete surrounding");
      }
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5 gap-6">
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
                <button
                  onClick={() => handleOpenModal(surrounding)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  disabled={isUpdating || isDeleting}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(surrounding.id)}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {surrounding.name}
            </h3>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[0.2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? "Edit Surrounding" : "Add New Surrounding"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter surrounding name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon {!isEditMode && "(Required)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {isEditMode && selectedSurrounding?.icon && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Current icon:</p>
                    <img
                      src={selectedSurrounding.icon}
                      alt="Current icon"
                      className="w-12 h-12 object-contain mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating || isUpdating
                    ? "Processing..."
                    : isEditMode
                    ? "Update"
                    : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingSurroundings;
