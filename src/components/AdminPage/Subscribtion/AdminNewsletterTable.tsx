"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/redux/hooks/redux-hook";
import Title from "@/components/reuseabelComponents/Title";
import PageLoader from "../Shared/PageLoader";
import {
  useDeleteNewsletterMutation,
  useGetAllNewslettersQuery,
  useUpdateNewsletterMutation,
  useSendPromotionalMailMutation,
} from "@/redux/features/auth/newsLetterApi";
import { clearSelectedNewsletter } from "@/redux/features/auth/newsLetterSlice";
import { toast } from "sonner";

const AdminNewsletterTable: React.FC = () => {
  const {
    data: newsletters = [],
    isLoading,
    isFetching,
  } = useGetAllNewslettersQuery();

  const [deleteNewsletter] = useDeleteNewsletterMutation();
  const [updateNewsletter, { isLoading: isUpdating }] =
    useUpdateNewsletterMutation();
  const [sendPromotionalMail, { isLoading: isSending }] =
    useSendPromotionalMailMutation();

  const dispatch = useAppDispatch();

  // Promotional Mail Modal State
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // 🧩 Handle Delete
  const handleDelete = (nl: { id: string; email: string }) => {
    if (!confirm(`Are you sure you want to delete ${nl.email}?`)) return;

    deleteNewsletter(nl.id)
      .unwrap()
      .then(() => {
        dispatch(clearSelectedNewsletter());
        toast.success("Subscriber deleted successfully!");
      })
      .catch(() => toast.error("Failed to delete subscriber."));
  };

  // ✏️ Handle Edit
  const handleEditOpen = (nl: {
    id: string;
    name?: string;
    email: string;
  }) => {
    setEditId(nl.id);
    setEditName(nl.name || "");
    setEditEmail(nl.email);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editEmail.trim()) {
      toast.error("Email is required.");
      return;
    }
    try {
      await updateNewsletter({
        id: editId,
        name: editName.trim() || undefined,
        email: editEmail.trim(),
      }).unwrap();
      toast.success("Subscriber updated successfully!");
      setShowEditModal(false);
    } catch {
      toast.error("Failed to update subscriber.");
    }
  };

  // ✉️ Handle Send Promotional Mail
  const handleSendPromotional = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Both subject and message are required.");
      toast.error("Please fill in both subject and message.");
      return;
    }
    try {
      await sendPromotionalMail({ subject, message }).unwrap();
      toast.success("Promotional mail sent successfully!");
      setShowModal(false);
      setSubject("");
      setMessage("");
      setError("");
    } catch {
      toast.error("Failed to send promotional mail.");
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Title title="Newsletter Subscribers" />
        <button
          onClick={() => setShowModal(true)}
          className="cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white"
        >
          Send Promotional Mail
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#DBE0E5] bg-white">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b-2 border-[#DBE0E5] bg-gray-50">
              <tr>
                <th className="px-6 py-5 text-left text-base font-medium text-gray-700">
                  No
                </th>
                <th className="px-6 py-5 text-left text-base font-medium text-gray-700">
                  Name
                </th>
                <th className="px-6 py-5 text-left text-base font-medium text-gray-700">
                  Email
                </th>
                <th className="px-6 py-5 text-right text-base font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-sm">
                    <PageLoader />
                  </td>
                </tr>
              ) : newsletters.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-sm text-gray-600"
                  >
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                newsletters.map((nl, index) => (
                  <tr
                    key={nl.id ?? nl.email}
                    className="border-b-2 border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {nl.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {nl.email}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditOpen(nl)}
                          className="cursor-pointer rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(nl)}
                          className="cursor-pointer rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Subscriber Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Edit Subscriber
            </h2>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Name
            </label>
            <input
              type="text"
              placeholder="Name (optional)"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={isUpdating}
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Promotional Mail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Send Promotional Mail
            </h2>
            {error && (
              <div className="mb-2 rounded bg-red-100 p-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendPromotional}
                disabled={isSending}
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsletterTable;
