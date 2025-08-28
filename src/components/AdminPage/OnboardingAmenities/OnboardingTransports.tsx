"use client";

import React, { useState } from "react";
import {
  useGetTransportsQuery,
  useCreateTransportMutation,
  useUpdateTransportMutation,
  useDeleteTransportMutation,
} from "@/redux/features/auth/transportsApi";

import {
  setSelectedTransport,
  clearError,
} from "@/redux/features/auth/transportsSlice";

import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import { Transport } from "@/redux/types/transport";
import Title from "@/components/reuseabelComponents/Title";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const OnboardingTransports = () => {
  const dispatch = useAppDispatch();
  const { selectedTransport } = useAppSelector((state) => state.transports);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: null as File | null,
  });
  const [error, setError] = useState("");

  // RTK Query hooks
  const {
    data: transports = [],
    isLoading,
    error: fetchError,
  } = useGetTransportsQuery();
  const [createTransport, { isLoading: isCreating }] =
    useCreateTransportMutation();
  const [updateTransport, { isLoading: isUpdating }] =
    useUpdateTransportMutation();
  const [deleteTransport, { isLoading: isDeleting }] =
    useDeleteTransportMutation();

  const handleOpenModal = (transport?: Transport) => {
    if (transport) {
      setIsEditMode(true);
      dispatch(setSelectedTransport(transport));
      setFormData({ name: transport.name, icon: null });
    } else {
      setIsEditMode(false);
      dispatch(setSelectedTransport(null));
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
    if (file) {
      setFormData((prev) => ({ ...prev, icon: file }));
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
      if (isEditMode && selectedTransport) {
        const updateData: any = { name: formData.name };
        if (formData.icon) updateData.icon = formData.icon;

        await updateTransport({
          id: selectedTransport.id,
          data: updateData,
        }).unwrap();
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        if (formData.icon) formDataToSend.append("icon", formData.icon);

        await createTransport(formDataToSend).unwrap();
      }

      handleCloseModal();
    } catch (err: any) {
      setError(err.data?.message || "Something went wrong");
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteTransport(deleteId).unwrap();
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      setError(err.data?.message || "Failed to delete transport");
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title title="Transports" />
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg flex items-center cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Transport
        </Button>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Failed to fetch transports
        </div>
      )}

      {/* Transport Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {transports.map((transport) => (
          <div
            key={transport.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <img
                src={transport.icon}
                alt={transport.name}
                className="w-12 h-12 object-contain"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(transport)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  disabled={isUpdating || isDeleting}
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(transport.id)}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {transport.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? "Edit Transport" : "Add New Transport"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter transport name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Icon {!isEditMode && "(Required)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {isEditMode && selectedTransport?.icon && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Current icon:</p>
                    <img
                      src={selectedTransport.icon}
                      alt="Current icon"
                      className="w-12 h-12 object-contain mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-4 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all duration-300 cursor-pointer
                    ${
                      isCreating || isUpdating
                        ? "bg-blue-400"
                        : "bg-blue-600 hover:bg-blue-700"
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3">
          <div className="bg-white rounded-lg p-5 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this transport?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className={`px-6 py-2 rounded-lg text-white cursor-pointer ${
                  isDeleting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete Transports"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingTransports;

// "use client";

// import React, { useState } from "react";
// import {
//   useGetTransportsQuery,
//   useCreateTransportMutation,
//   useUpdateTransportMutation,
//   useDeleteTransportMutation,
// } from "@/redux/features/auth/transportsApi";

// import {
//   setSelectedTransport,
//   clearError,
// } from "@/redux/features/auth/transportsSlice";

// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import { Transport } from "@/redux/types/transport";
// import Title from "@/components/reuseabelComponents/Title";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";

// const OnboardingTransports = () => {
//   const dispatch = useAppDispatch();
//   const { selectedTransport } = useAppSelector((state) => state.transports);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     icon: null as File | null,
//   });
//   const [error, setError] = useState("");

//   // RTK Query hooks
//   const {
//     data: transports = [],
//     isLoading,
//     error: fetchError,
//   } = useGetTransportsQuery();
//   const [createTransport, { isLoading: isCreating }] =
//     useCreateTransportMutation();
//   const [updateTransport, { isLoading: isUpdating }] =
//     useUpdateTransportMutation();
//   const [deleteTransport, { isLoading: isDeleting }] =
//     useDeleteTransportMutation();

//   const handleOpenModal = (transport?: Transport) => {
//     if (transport) {
//       setIsEditMode(true);
//       dispatch(setSelectedTransport(transport));
//       setFormData({
//         name: transport.name,
//         icon: null,
//       });
//     } else {
//       setIsEditMode(false);
//       dispatch(setSelectedTransport(null));
//       setFormData({
//         name: "",
//         icon: null,
//       });
//     }
//     setIsModalOpen(true);
//     setError("");
//     dispatch(clearError());
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setFormData({
//       name: "",
//       icon: null,
//     });
//     setError("");
//     dispatch(clearError());
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setFormData((prev) => ({
//         ...prev,
//         icon: file,
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim()) {
//       setError("Name is required");
//       return;
//     }

//     if (!isEditMode && !formData.icon) {
//       setError("Icon is required");
//       return;
//     }

//     try {
//       if (isEditMode && selectedTransport) {
//         // Update existing transport
//         const updateData: any = { name: formData.name };
//         if (formData.icon) {
//           updateData.icon = formData.icon;
//         }

//         await updateTransport({
//           id: selectedTransport.id,
//           data: updateData,
//         }).unwrap();
//       } else {
//         // Create new transport
//         const formDataToSend = new FormData();
//         formDataToSend.append("name", formData.name);
//         if (formData.icon) {
//           formDataToSend.append("icon", formData.icon);
//         }

//         await createTransport(formDataToSend).unwrap();
//       }

//       handleCloseModal();
//     } catch (err: any) {
//       setError(err.data?.message || "Something went wrong");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (window.confirm("Are you sure you want to delete this transport?")) {
//       try {
//         await deleteTransport(id).unwrap();
//       } catch (err: any) {
//         setError(err.data?.message || "Failed to delete transport");
//       }
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       <div className="flex justify-between items-center mb-6">
//         <Title title="Transports" />
//         <Button
//           onClick={() => handleOpenModal()}
//           className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Add New Transport
//         </Button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {fetchError && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           Failed to fetch transports
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
//         {transports.map((transport) => (
//           <div
//             key={transport.id}
//             className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <img
//                 src={transport.icon}
//                 alt={transport.name}
//                 className="w-12 h-12 object-contain"
//               />
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => handleOpenModal(transport)}
//                   className="text-blue-600 hover:text-blue-800 cursor-pointer"
//                   disabled={isUpdating || isDeleting}
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(transport.id)}
//                   className="text-red-600 hover:text-red-800 cursor-pointer"
//                   disabled={isDeleting}
//                 >
//                   {isDeleting ? "Deleting..." : "Delete"}
//                 </button>
//               </div>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-800">
//               {transport.name}
//             </h3>
//           </div>
//         ))}
//       </div>

//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-[0.2px] flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h2 className="text-xl font-semibold mb-4">
//               {isEditMode ? "Edit Transport" : "Add New Transport"}
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter transport name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Icon {!isEditMode && "(Required)"}
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                 />
//                 {isEditMode && selectedTransport?.icon && (
//                   <div className="mt-2">
//                     <p className="text-sm text-gray-600">Current icon:</p>
//                     <img
//                       src={selectedTransport.icon}
//                       alt="Current icon"
//                       className="w-12 h-12 object-contain mt-1"
//                     />
//                   </div>
//                 )}
//               </div>

//               <div className="flex space-x-4 pt-4 justify-end">
//                 <button
//                   type="button"
//                   onClick={handleCloseModal}
//                   className="border border-blue-600 text-blue-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={isCreating || isUpdating}
//                   className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all duration-300 cursor-pointer
//       ${
//         isCreating || isUpdating
//           ? "bg-blue-400 cursor-not-allowed"
//           : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
//       }`}
//                 >
//                   {isCreating || isUpdating
//                     ? "Processing..."
//                     : isEditMode
//                     ? "Update"
//                     : "Create"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OnboardingTransports;
