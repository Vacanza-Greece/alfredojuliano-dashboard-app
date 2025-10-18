// src/components/Badge/BadgeTable.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  useGetBadgesQuery,
  useCreateBadgeMutation,
  useUpdateBadgeMutation,
  useDeleteBadgeMutation,
} from "@/redux/features/auth/badgeApi";
import { Badge } from "@/redux/types/badge.type";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LiaEdit } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import PageLoader from "../Shared/PageLoader";

const BadgeTable = () => {
  const { data: badges, isLoading, refetch } = useGetBadgesQuery();
  const [createBadge] = useCreateBadgeMutation();
  const [updateBadge] = useUpdateBadgeMutation();
  const [deleteBadge] = useDeleteBadgeMutation();

  const [form, setForm] = useState<{
    id?: string;
    type: string;
    displayName: string;
    description: string;
    icon?: File | null;
  }>({
    type: "GOLDEN_HOST",
    displayName: "",
    description: "",
    icon: null,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, icon: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("type", form.type);
    formData.append("displayName", form.displayName);
    formData.append("description", form.description);
    if (form.icon) formData.append("icon", form.icon);

    try {
      if (form.id) {
        await updateBadge({ id: form.id, data: formData }).unwrap();
        toast.success("Badge updated successfully");
      } else {
        await createBadge(formData).unwrap();
        toast.success("Badge created successfully");
      }
      setForm({
        type: "GOLDEN_HOST",
        displayName: "",
        description: "",
        icon: null,
      });
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (badge: Badge) => {
    setForm({
      id: badge.id,
      type: badge.type,
      displayName: badge.displayName,
      description: badge.description,
      icon: null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this badge?")) return;
    try {
      await deleteBadge(id).unwrap();
      toast.success("Badge deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  if (isLoading)
    return (
      <p className="text-center py-4">
        <PageLoader />
      </p>
    );

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          🎖️ Manage Badges
        </h2>

        <Button
          onClick={() => {
            setForm({
              type: "GOLDEN_HOST",
              displayName: "",
              description: "",
              icon: null,
            });
            setIsDialogOpen(true);
          }}
          className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Badge
        </Button>
      </div>

      {/* Badge Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Display Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-center">Icon</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {badges?.map((badge) => (
              <tr key={badge.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  {badge.displayName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap ">
                  {badge.description
                    ? badge.description.split(" ").slice(0, 6).join(" ") +
                      (badge.description.split(" ").length > 6 ? "..." : "")
                    : "No description"}
                </td>

                <td className="px-4 py-3 text-sm text-gray-700">
                  {badge.type}
                </td>

                <td className="px-4 py-3">
                  {badge.icon && (
                    <img
                      src={badge.icon}
                      alt="icon"
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 mx-auto"
                    />
                  )}
                </td>
                <td className=" flex justify-end text-center px-4 py-3 space-x-2">
                  <button
                    onClick={() => handleEdit(badge)}
                    // disabled={isUpdating || isDeleting}
                    className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition disabled:opacity-50 cursor-pointer"
                  >
                    <LiaEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(badge.id)}
                    // disabled={isDeleting}
                    className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 transition disabled:opacity-50 cursor-pointer"
                  >
                    <MdDelete className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsDialogOpen(false)}
          ></div>

          {/* Modal Box */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all scale-100 animate-fadeIn z-10">
            <h3 className="text-2xl font-semibold text-gray-800 mb-5">
              {form.id ? "Edit Badge" : "Create New Badge"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="GOLDEN_HOST">GOLDEN_HOST</option>
                  <option value="REVIEW_BADGE">REVIEW_BADGE</option>
                  <option value="REGION_BADGE">REGION_BADGE</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="LOYALTY_BADGE">LOYALTY_BADGE</option>
                  <option value="TOP_SUPPORTER">TOP_SUPPORTER</option>
                  <option value="DIAMOND_VIP">DIAMOND_VIP</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={form.displayName}
                  onChange={handleInputChange}
                  placeholder="e.g. Golden Host"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Short description about this badge"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Icon (optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:border-0 file:rounded-md file:text-sm file:font-semibold file:bg-blue-100 hover:file:bg-blue-200"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className=" cursor-pointer px-5 py-2 bg-gradient-to-r from-[#156EF0] to-[#0D74FF] text-white  rounded-md hover:opacity-90 transition"
                >
                  {form.id ? "Update Badge" : "Create Badge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeTable;
