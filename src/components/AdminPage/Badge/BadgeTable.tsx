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

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;

  // Use the current origin if we're on localhost, otherwise fallback to production
  const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
  const baseUrl = isLocal ? window.location.origin : "https://vacanzagreece.gr";

  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

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
    icon: File | null;
    iconUrl: string;
  }>({
    type: "",
    badge_type: "",
    displayName: "",
    greek_displayName: "",
    description: "",
    greek_discription: "",
    icon: null,
    iconUrl: "",
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust as needed

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, icon: file });
      setPreview(URL.createObjectURL(file));
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
        // If updating and icon is null, we might want to keep the old icon.
        // Backend service already handles this if we don't send icon iconPublicId.
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
      id: undefined,
      type: "",
      badge_type: "",
      displayName: "",
      greek_displayName: "",
      description: "",
      greek_discription: "",
      icon: null,
      iconUrl: "",
    });
    setPreview(null);
  };

  const currentIcon = preview || getImageUrl(form.iconUrl);

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
      iconUrl: badge.icon || "",
    });
    setPreview(null);
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

  // Pagination logic
  const totalItems = badges?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = badges?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

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

        <div className="overflow-x-auto rounded-xl border border-gray-100 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Badge Info</th>
                <th className="px-6 py-4 text-left">Internal Status</th>
                <th className="px-6 py-4 text-left">Descriptions</th>
                <th className="px-6 py-4 text-center">Icon</th>
                <th className="px-6 py-4 text-right sticky right-0 bg-gray-50 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.1)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {currentItems?.map((badge) => (
                <tr key={badge.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{badge.displayName}</div>
                    <div className="text-xs text-gray-500 italic">{badge.greek_displayName || "—"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded w-fit mb-1">{badge.type}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{badge.badge_type || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 max-w-xs transition-all">
                    <div className="text-xs text-gray-600 line-clamp-1 mb-1" title={badge.description}>
                      {badge.description}
                    </div>
                    <div className="text-[11px] text-gray-400 italic line-clamp-1" title={badge.greek_discription}>
                      {badge.greek_discription || "—"}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {badge.icon ? (
                      <div className="relative group mx-auto w-10 h-10">
                        <img
                          src={getImageUrl(badge.icon)}
                          alt="icon"
                          className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-100 shadow-sm transition-transform group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center mx-auto">
                        <span className="text-[9px] text-gray-400">None</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 sticky right-0 bg-white shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        title="Edit Badge"
                        onClick={() => handleEdit(badge)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer"
                      >
                        <LiaEdit className="w-5 h-5" />
                      </button>

                      <button
                        title="Delete Badge"
                        onClick={() => confirmDelete(badge.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 cursor-pointer"
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

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-gray-600 font-medium">
              Showing <span className="text-blue-600">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="text-blue-600">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of {totalItems}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === 1
                    ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300 active:scale-95 cursor-pointer"
                }`}
              >
                Previous
              </button>
              <div className="flex items-center mx-2 space-x-1">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === idx + 1
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-white text-gray-600 hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300 active:scale-95 cursor-pointer"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

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

                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Icon (SVG Preferred)
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
                    {(preview || form.iconUrl) && (
                      <div className="shrink-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preview
                        </label>
                        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 p-1 flex items-center justify-center bg-gray-50">
                          <img
                            src={currentIcon}
                            alt="preview"
                            className="w-full h-full object-contain rounded-md"
                          />
                        </div>
                      </div>
                    )}
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
