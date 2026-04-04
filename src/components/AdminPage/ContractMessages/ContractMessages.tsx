// src/components/ContractMessages/ContractMessages.tsx
"use client";

import { useState } from "react";
import { FiMail, FiUser, FiClock, FiSearch, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { setSearchTerm } from "@/redux/features/auth/contactSlice";
import {
  useGetContactMessagesQuery,
  useDeleteContactMessageMutation,
} from "@/redux/features/auth/contactApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import PageLoader from "../Shared/PageLoader";
import { Button } from "@/components/ui/button";

import { Message } from "@/redux/types/venue.type";
import MessageDetailView from "./MessageDetailView";
import Title from "@/components/reuseabelComponents/Title";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ContractMessages = () => {
  const dispatch = useAppDispatch();
  const { searchTerm } = useAppSelector((state) => state.contact);
  const {
    data: messages = [],
    isLoading,
    isError,
    error,
  } = useGetContactMessagesQuery();
  const [deleteMessage] = useDeleteContactMessageMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openDeleteDialog = (id: string) => {
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMessage(messageToDelete).unwrap();
      toast.success("Message deleted successfully");
      if (selectedMessage?.id === messageToDelete) {
        setSelectedMessage(null);
      }
      if (filteredMessages.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const openMessageDetail = (message: Message) => {
    setSelectedMessage(message);
  };

  const closeMessageDetail = () => {
    setSelectedMessage(null);
  };

  const filteredMessages = messages.filter((message) => {
    return (
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.opinion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination logic
  const totalMessages = filteredMessages.length;
  const totalPages = Math.ceil(totalMessages / pageSize);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">
          {"message" in error ? error.message : "An error occurred"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Message Detail View */}
      {selectedMessage && (
        <MessageDetailView
          message={selectedMessage}
          onClose={closeMessageDetail}
          onDelete={openDeleteDialog}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the message. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                  Deleting...
                </>
              ) : (
                "Delete Message"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Title title="Contract Messages" />
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <FiMail className="text-gray-500" />
            <span className="font-medium text-gray-700">
              {totalMessages} Message{totalMessages !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              />
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiMail className="text-gray-400 w-10 h-10" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No messages found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "No messages match your search criteria."
                  : "You have no messages yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {paginatedMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <FiUser className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {message.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {message.email}
                          </p>
                          {message.targetEmail && (
                            <p className="text-[10px] text-blue-500 font-medium">
                              To: {message.targetEmail}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-4 h-4" />
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pl-14">
                      <p className="text-gray-700 line-clamp-2 mb-4">
                        {message.opinion}
                      </p>
                      <div className="pt-4 border-t border-gray-200 flex space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMessageDetail(message)}
                          className="cursor-pointer"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Delete"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          onClick={() => openDeleteDialog(message.id)}
                        >
                          <FiTrash2 className="h-4 w-4 text-destructive" />{" "}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalMessages > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalMessages)}
                    </span>{" "}
                    of <span className="font-medium">{totalMessages}</span>{" "}
                    messages
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
                      style={{
                        backgroundColor: currentPage === 1 ? "white" : "white",
                        color: "#2D0954",
                        borderColor: "#2D0954",
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
                      style={{
                        backgroundColor:
                          currentPage === totalPages ? "white" : "white",
                        color: "#2D0954",
                        borderColor: "#2D0954",
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractMessages;
