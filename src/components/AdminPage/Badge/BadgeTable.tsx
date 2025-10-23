"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  useGetBadgesQuery,
  useCreateBadgeMutation,
  useUpdateBadgeMutation,
  useDeleteBadgeMutation,
} from "@/redux/features/auth/badgeApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LiaEdit } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import PageLoader from "../Shared/PageLoader";

export type BadgeType =
  | "REVIEW_BADGE"
  | "REGION_BADGE"
  | "SUSTAINABILITY_BADGE"
  | "SEASONAL_BADGE"
  | "EXCHANGE_BADGE"
  | "REFERRAL_BADGE"
  | "VERIFICATION_BADGE"
  | "LOYALTY_BADGE"
  | "EARLY_ADOPTER"
  | "PREMIUM_TRAVELER"
  | "TOP_SUPPORTER"
  | "ONE_YEAR_TRAVELER"
  | "SUPPORTER"
  | "GOLDEN_HOST"
  | "VERIFIED"
  | "DUO"
  | "LOTS_OF_FRIENDS"
  | "PURE_CHARISMA"
  | "VIP"
  | "DIAMOND_VIP"
  | "THE_FIRST_TRADE"
  | "EXPERIENCED"
  | "VETERAN"
  | "PHILOXENIA"
  | "IT_MY_TOWN"
  | "EMPIRE"
  | "EXPLORER"
  | "AUTUMN_TRAVELER"
  | "AUTUMN_EXPERT_TRAVELER"
  | "WINTER_TRAVELER"
  | "WINTER_EXPERT_TRAVELER"
  | "SPRING_TRAVELER"
  | "SPRING_EXPERT_TRAVELER"
  | "SUMMER_TRAVELER"
  | "SUMMER_EXPERT_TRAVELER"
  | "ECO_CONSCIOUS_HOST"
  | "EVERY_EURO_COUNTS"
  | "ATTICA"
  | "ATTICA_EXPERT"
  | "CENTRAL_GREECE"
  | "CENTRAL_GREECE_EXPERT"
  | "SPORADES"
  | "SPORADES_EXPERT"
  | "THRACE"
  | "THRACE_EXPERT"
  | "IONIAN"
  | "IONIAN_EXPERT"
  | "SARONIC"
  | "SARONIC_EXPERT"
  | "CRETE"
  | "CRETE_EXPERT"
  | "EPIRUS"
  | "EPIRUS_EXPERT"
  | "CYCLADES"
  | "CYCLADES_EXPERT"
  | "DODECANESE"
  | "DODECANESE_EXPERT"
  | "GREECE_TROTTER"
  | "PELOPONNESE"
  | "PELOPONNESE_EXPERT"
  | "NORTH_AEGEAN"
  | "NORTH_AEGEAN_EXPERT"
  | "MACEDONIA"
  | "MACEDONIA_EXPERT";

const BadgeTable = () => {
  const { data: badges, isLoading, refetch } = useGetBadgesQuery();
  const [createBadge] = useCreateBadgeMutation();
  const [updateBadge] = useUpdateBadgeMutation();
  const [deleteBadge] = useDeleteBadgeMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id?: string;
  }>({ open: false });

  const [form, setForm] = useState<{
    id?: string;
    type: BadgeType | "";
    badge_type: string;
    displayName: string;
    greek_displayName: string;
    description: string;
    greek_discription: string;
    icon?: File | null;
  }>({
    type: "",
    badge_type: "",
    displayName: "",
    greek_displayName: "",
    description: "",
    greek_discription: "",
    icon: null,
  });

  const badgeTypes: BadgeType[] = [
    "REVIEW_BADGE",
    "REGION_BADGE",
    "SUSTAINABILITY_BADGE",
    "SEASONAL_BADGE",
    "EXCHANGE_BADGE",
    "REFERRAL_BADGE",
    "VERIFICATION_BADGE",
    "LOYALTY_BADGE",
    "EARLY_ADOPTER",
    "PREMIUM_TRAVELER",
    "TOP_SUPPORTER",
    "ONE_YEAR_TRAVELER",
    "SUPPORTER",
    "GOLDEN_HOST",
    "VERIFIED",
    "DUO",
    "LOTS_OF_FRIENDS",
    "PURE_CHARISMA",
    "VIP",
    "DIAMOND_VIP",
    "THE_FIRST_TRADE",
    "EXPERIENCED",
    "VETERAN",
    "PHILOXENIA",
    "IT_MY_TOWN",
    "EMPIRE",
    "EXPLORER",
    "AUTUMN_TRAVELER",
    "AUTUMN_EXPERT_TRAVELER",
    "WINTER_TRAVELER",
    "WINTER_EXPERT_TRAVELER",
    "SPRING_TRAVELER",
    "SPRING_EXPERT_TRAVELER",
    "SUMMER_TRAVELER",
    "SUMMER_EXPERT_TRAVELER",
    "ECO_CONSCIOUS_HOST",
    "EVERY_EURO_COUNTS",
    "ATTICA",
    "ATTICA_EXPERT",
    "CENTRAL_GREECE",
    "CENTRAL_GREECE_EXPERT",
    "SPORADES",
    "SPORADES_EXPERT",
    "THRACE",
    "THRACE_EXPERT",
    "IONIAN",
    "IONIAN_EXPERT",
    "SARONIC",
    "SARONIC_EXPERT",
    "CRETE",
    "CRETE_EXPERT",
    "EPIRUS",
    "EPIRUS_EXPERT",
    "CYCLADES",
    "CYCLADES_EXPERT",
    "DODECANESE",
    "DODECANESE_EXPERT",
    "GREECE_TROTTER",
    "PELOPONNESE",
    "PELOPONNESE_EXPERT",
    "NORTH_AEGEAN",
    "NORTH_AEGEAN_EXPERT",
    "MACEDONIA",
    "MACEDONIA_EXPERT",
  ];

  // handle input change
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // handle file upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, icon: e.target.files[0] });
    }
  };

  // handle submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("type", form.type);
    formData.append("badge_type", form.badge_type);
    formData.append("displayName", form.displayName);
    formData.append("greek_displayName", form.greek_displayName);
    formData.append("description", form.description);
    formData.append("greek_discription", form.greek_discription);
    if (form.icon) formData.append("icon", form.icon);

    try {
      if (form.id) {
        await updateBadge({ id: form.id, data: formData }).unwrap();
        toast.success("Badge updated successfully");
      } else {
        await createBadge(formData).unwrap();
        toast.success("Badge created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const resetForm = () => {
    setForm({
      type: "",
      badge_type: "",
      displayName: "",
      greek_displayName: "",
      description: "",
      greek_discription: "",
      icon: null,
    });
  };

  // handle edit
  const handleEdit = (badge: any) => {
    setForm({
      id: badge.id,
      type: badge.type,
      badge_type: badge.badge_type || "",
      displayName: badge.displayName,
      greek_displayName: badge.greek_displayName || "",
      description: badge.description,
      greek_discription: badge.greek_discription || "",
      icon: null,
    });
    setIsDialogOpen(true);
  };



  const confirmDelete = (id: string) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteBadge(deleteDialog.id).unwrap();
      toast.success("Badge deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    } finally {
      setDeleteDialog({ open: false });
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight text-start sm:text-left">
          Manage Badges
        </h2>

        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="w-full cursor-pointer sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Badge
        </Button>
      </div>
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Header */}
        {/* <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            🎖️ Manage Badges
          </h2>

          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className=" cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Badge
          </Button>
        </div> */}

        {/* Badge Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-medium">
              <tr>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Display Name
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Greek Name
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Type</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Badge Type
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Description
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Greek Description
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  Icon
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {badges?.map((badge) => (
                <tr key={badge.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {badge.displayName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {badge.greek_displayName || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {badge.type}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {badge.badge_type || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {badge.description?.split(" ").slice(0, 4).join(" ")}
                    {badge.description?.split(" ").length > 4 && " ..."}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {badge.greek_discription?.split(" ").slice(0, 4).join(" ")}
                    {badge.greek_discription?.split(" ").length > 4 && " ..."}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {badge.icon && (
                      <img
                        src={badge.icon}
                        alt="icon"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 mx-auto"
                      />
                    )}
                  </td>
                  <td className="flex justify-end text-center px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleEdit(badge)}
                      className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition cursor-pointer"
                    >
                      <LiaEdit className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => confirmDelete(badge.id)}
                      className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 transition cursor-pointer"
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
              className="absolute inset-0 bg-black/50 backdrop-blur-[0.2px] bg-opacity-50"
              onClick={() => setIsDialogOpen(false)}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 z-10">
              <h3 className="text-2xl font-semibold text-gray-800 mb-5">
                {form.id ? "Edit Badge" : "Create New Badge"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ✅ Type Dropdown (Enum style) */}
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
                        {badgeTypes.map((badge) => (
                          <option key={badge} value={badge}>
                            {badge.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Badge Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Badge Type
                      </label>
                      <input
                        type="text"
                        name="badge_type"
                        value={form.badge_type}
                        onChange={handleInputChange}
                        placeholder="e.g. review, verified"
                        className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Display Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        value={form.displayName}
                        onChange={handleInputChange}
                        placeholder="e.g. Review Badge"
                        className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Greek Display Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Greek Display Name
                      </label>
                      <input
                        type="text"
                        name="greek_displayName"
                        value={form.greek_displayName}
                        onChange={handleInputChange}
                        placeholder="πράσινο όνομα εδώ"
                        className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      placeholder="Awarded to users when their property receives 100 reviews."
                      className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Greek Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Greek Description
                    </label>
                    <textarea
                      name="greek_discription"
                      value={form.greek_discription}
                      onChange={handleInputChange}
                      placeholder="εδώ θα συνεχιστεί η ελληνική περιγραφή"
                      className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Icon (SVG)
                    </label>
                    <input
                      type="file"
                      id="iconUpload"
                      onChange={handleFileChange}
                      accept="image/svg+xml,image/*"
                      className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Please upload an SVG or image file (max 2MB).
                    </p>
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition cursor-pointer"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
                  >
                    {form.id ? "Update Badge" : "Create Badge"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteDialog.open && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-[0.2px]"
              onClick={() => setDeleteDialog({ open: false })}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this badge? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteDialog({ open: false })}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeTable;
