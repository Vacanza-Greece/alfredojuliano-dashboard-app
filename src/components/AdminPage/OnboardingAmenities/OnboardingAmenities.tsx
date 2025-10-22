"use client";

import React, { useState } from "react";
import {
  useGetAmenitiesQuery,
  useCreateAmenityMutation,
  useUpdateAmenityMutation,
  useDeleteAmenityMutation,
} from "@/redux/features/auth/amenitiesApi";
import {
  setSelectedAmenity,
  clearError,
} from "@/redux/features/auth/amenitiesSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import { Amenity } from "@/redux/types/amenity";
import Title from "@/components/reuseabelComponents/Title";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LiaEdit } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import { toast } from "sonner";

const OnboardingAmenities = () => {
  const dispatch = useAppDispatch();
  const { selectedAmenity } = useAppSelector((state) => state.amenities);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    greek_name: "",
    icon: null as File | null,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data: amenities = [],
    isLoading,
    error: fetchError,
  } = useGetAmenitiesQuery();

  const [createAmenity, { isLoading: isCreating }] = useCreateAmenityMutation();
  const [updateAmenity, { isLoading: isUpdating }] = useUpdateAmenityMutation();
  const [deleteAmenity, { isLoading: isDeleting }] = useDeleteAmenityMutation();

  const handleOpenModal = (amenity?: Amenity) => {
    if (amenity) {
      setIsEditMode(true);
      dispatch(setSelectedAmenity(amenity));
      setFormData({
        name: amenity.name,
        greek_name: amenity.greek_name,
        icon: null,
      });
    } else {
      setIsEditMode(false);
      dispatch(setSelectedAmenity(null));
      setFormData({ name: "", greek_name: "", icon: null });
    }
    setIsModalOpen(true);
    dispatch(clearError());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", greek_name: "", icon: null });
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

    if (!formData.name.trim() || !formData.greek_name.trim()) {
      toast.error("Both English and Greek names are required");
      return;
    }

    if (!isEditMode && !formData.icon) {
      toast.error("Icon is required for new amenities");
      return;
    }

    try {
      if (isEditMode && selectedAmenity) {
        const updateData: any = {
          name: formData.name,
          greek_name: formData.greek_name,
        };
        if (formData.icon) updateData.icon = formData.icon;

        await updateAmenity({
          id: selectedAmenity.id,
          data: updateData,
        }).unwrap();
        toast.success("Amenity updated successfully");
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("greek_name", formData.greek_name);
        if (formData.icon) formDataToSend.append("icon", formData.icon);

        await createAmenity(formDataToSend).unwrap();
        toast.success("Amenity created successfully");
      }

      handleCloseModal();
    } catch (err: any) {
      toast.error(err.data?.message || "Something went wrong");
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAmenity(deleteId).unwrap();
      toast.success("Amenity deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to delete amenity");
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
        <Title title="Amenities" />
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg flex items-center cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Amenity
        </Button>
      </div>

      {fetchError && toast.error("Failed to fetch amenities")}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {amenities.map((amenity) => (
          <div
            key={amenity.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-4">
              <img
                src={amenity.icon}
                alt={amenity.name}
                className="w-12 h-12 object-contain"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(amenity)}
                  disabled={isUpdating}
                  className=" cursor-pointer p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                >
                  <LiaEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openDeleteModal(amenity.id)}
                  disabled={isDeleting}
                  className="cursor-pointer p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {amenity.name}
            </h3>
            <p className="text-sm text-gray-500 italic">{amenity.greek_name}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {isEditMode ? "Edit Amenity" : "Add Amenity"}
              </h2>
              <button onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Greek Name
                </label>
                <input
                  type="text"
                  name="greek_name"
                  value={formData.greek_name}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Enter Greek name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Icon {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border rounded-lg px-4 py-2"
                />
                {isEditMode && selectedAmenity?.icon && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Current icon:</p>
                    <img
                      src={selectedAmenity.icon}
                      alt="Current icon"
                      className="w-14 h-14 object-contain mt-2 border rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 border rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
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

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm text-center">
            <h3 className="text-xl font-semibold mb-3">
              Confirm Amenity Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this amenity?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2 border rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingAmenities;

// "use client";

// import React, { useState } from "react";
// import {
//   useGetAmenitiesQuery,
//   useCreateAmenityMutation,
//   useUpdateAmenityMutation,
//   useDeleteAmenityMutation,
// } from "@/redux/features/auth/amenitiesApi";
// import {
//   setSelectedAmenity,
//   clearError,
// } from "@/redux/features/auth/amenitiesSlice";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import { Amenity } from "@/redux/types/amenity";
// import Title from "@/components/reuseabelComponents/Title";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { LiaEdit } from "react-icons/lia";
// import { MdDelete } from "react-icons/md";

// const OnboardingAmenities = () => {
//   const dispatch = useAppDispatch();
//   const { selectedAmenity } = useAppSelector((state) => state.amenities);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     greek_name: "",
//     icon: null as File | null,
//   });
//   const [error, setError] = useState("");

//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   const {
//     data: amenities = [],
//     isLoading,
//     error: fetchError,
//   } = useGetAmenitiesQuery();

//   const [createAmenity, { isLoading: isCreating }] = useCreateAmenityMutation();
//   const [updateAmenity, { isLoading: isUpdating }] = useUpdateAmenityMutation();
//   const [deleteAmenity, { isLoading: isDeleting }] = useDeleteAmenityMutation();

//   const handleOpenModal = (amenity?: Amenity) => {
//     if (amenity) {
//       setIsEditMode(true);
//       dispatch(setSelectedAmenity(amenity));
//       setFormData({
//         name: amenity.name,
//         greek_name: amenity.greek_name,
//         icon: null,
//       });
//     } else {
//       setIsEditMode(false);
//       dispatch(setSelectedAmenity(null));
//       setFormData({ name: "", greek_name: "", icon: null });
//     }
//     setIsModalOpen(true);
//     setError("");
//     dispatch(clearError());
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setFormData({ name: "", greek_name: "", icon: null });
//     setError("");
//     dispatch(clearError());
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) setFormData((prev) => ({ ...prev, icon: file }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim() || !formData.greek_name.trim()) {
//       setError("Both English and Greek names are required");
//       return;
//     }

//     if (!isEditMode && !formData.icon) {
//       setError("Icon is required for new amenities");
//       return;
//     }

//     try {
//       if (isEditMode && selectedAmenity) {
//         const updateData: any = {
//           name: formData.name,
//           greek_name: formData.greek_name,
//         };
//         if (formData.icon) updateData.icon = formData.icon;

//         await updateAmenity({ id: selectedAmenity.id, data: updateData }).unwrap();
//       } else {
//         const formDataToSend = new FormData();
//         formDataToSend.append("name", formData.name);
//         formDataToSend.append("greek_name", formData.greek_name);
//         if (formData.icon) formDataToSend.append("icon", formData.icon);

//         await createAmenity(formDataToSend).unwrap();
//       }

//       handleCloseModal();
//     } catch (err: any) {
//       setError(err.data?.message || "Something went wrong");
//     }
//   };

//   const openDeleteModal = (id: string) => {
//     setDeleteId(id);
//     setIsDeleteModalOpen(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (!deleteId) return;
//     try {
//       await deleteAmenity(deleteId).unwrap();
//       setIsDeleteModalOpen(false);
//       setDeleteId(null);
//     } catch (err: any) {
//       setError(err.data?.message || "Failed to delete amenity");
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
//         <Title title="Amenities" />
//         <Button
//           onClick={() => handleOpenModal()}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center"
//         >
//           <Plus className="h-4 w-4 mr-2" /> Add Amenity
//         </Button>
//       </div>

//       {(error || fetchError) && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error || "Failed to fetch amenities"}
//         </div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
//         {amenities.map((amenity) => (
//           <div
//             key={amenity.id}
//             className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
//           >
//             <div className="flex justify-between items-center mb-4">
//               <img
//                 src={amenity.icon}
//                 alt={amenity.name}
//                 className="w-12 h-12 object-contain"
//               />
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => handleOpenModal(amenity)}
//                   disabled={isUpdating}
//                   className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
//                 >
//                   <LiaEdit className="w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => openDeleteModal(amenity.id)}
//                   disabled={isDeleting}
//                   className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
//                 >
//                   <MdDelete className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-800">
//               {amenity.name}
//             </h3>
//             <p className="text-sm text-gray-500 italic">{amenity.greek_name}</p>
//           </div>
//         ))}
//       </div>

//       {/* Add/Edit Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-semibold">
//                 {isEditMode ? "Edit Amenity" : "Add Amenity"}
//               </h2>
//               <button onClick={handleCloseModal}>✕</button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="w-full border rounded-lg px-4 py-2"
//                   placeholder="Enter name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Greek Name
//                 </label>
//                 <input
//                   type="text"
//                   name="greek_name"
//                   value={formData.greek_name}
//                   onChange={handleInputChange}
//                   className="w-full border rounded-lg px-4 py-2"
//                   placeholder="Enter Greek name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Icon {!isEditMode && <span className="text-red-500">*</span>}
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="w-full border rounded-lg px-4 py-2"
//                 />
//                 {isEditMode && selectedAmenity?.icon && (
//                   <div className="mt-3">
//                     <p className="text-xs text-gray-500">Current icon:</p>
//                     <img
//                       src={selectedAmenity.icon}
//                       alt="Current icon"
//                       className="w-14 h-14 object-contain mt-2 border rounded-lg"
//                     />
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={handleCloseModal}
//                   className="px-5 py-2 border rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isCreating || isUpdating}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg"
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

//       {/* Delete Modal */}
//       {isDeleteModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
//           <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm text-center">
//             <h3 className="text-xl font-semibold mb-3">
//               Confirm Amenity Deletion
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to delete this amenity?
//             </p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={() => setIsDeleteModalOpen(false)}
//                 className="px-6 py-2 border rounded-lg"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmDelete}
//                 disabled={isDeleting}
//                 className="px-6 py-2 bg-red-600 text-white rounded-lg"
//               >
//                 {isDeleting ? "Deleting..." : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OnboardingAmenities;

// "use client";

// import React, { useState } from "react";
// import {
//   useGetAmenitiesQuery,
//   useCreateAmenityMutation,
//   useUpdateAmenityMutation,
//   useDeleteAmenityMutation,
// } from "@/redux/features/auth/amenitiesApi";

// import {
//   setSelectedAmenity,
//   clearError,
// } from "@/redux/features/auth/amenitiesSlice";

// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import { Amenity } from "@/redux/types/amenity";
// import Title from "@/components/reuseabelComponents/Title";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { LiaEdit } from "react-icons/lia";
// import { MdDelete } from "react-icons/md";

// const OnboardingAmenities = () => {
//   const dispatch = useAppDispatch();
//   const { selectedAmenity } = useAppSelector((state) => state.amenities);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     icon: null as File | null,
//   });
//   const [error, setError] = useState("");

//   // Delete confirmation modal state
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   // RTK Query hooks
//   const {
//     data: amenities = [],
//     isLoading,
//     error: fetchError,
//   } = useGetAmenitiesQuery();
//   const [createAmenity, { isLoading: isCreating }] = useCreateAmenityMutation();
//   const [updateAmenity, { isLoading: isUpdating }] = useUpdateAmenityMutation();
//   const [deleteAmenity, { isLoading: isDeleting }] = useDeleteAmenityMutation();

//   const handleOpenModal = (amenity?: Amenity) => {
//     if (amenity) {
//       setIsEditMode(true);
//       dispatch(setSelectedAmenity(amenity));
//       setFormData({
//         name: amenity.name,
//         icon: null,
//       });
//     } else {
//       setIsEditMode(false);
//       dispatch(setSelectedAmenity(null));
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
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, icon: file }));
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
//       if (isEditMode && selectedAmenity) {
//         const updateData: any = { name: formData.name };
//         if (formData.icon) updateData.icon = formData.icon;

//         await updateAmenity({
//           id: selectedAmenity.id,
//           data: updateData,
//         }).unwrap();
//       } else {
//         const formDataToSend = new FormData();
//         formDataToSend.append("name", formData.name);
//         if (formData.icon) formDataToSend.append("icon", formData.icon);

//         await createAmenity(formDataToSend).unwrap();
//       }

//       handleCloseModal();
//     } catch (err: any) {
//       setError(err.data?.message || "Something went wrong");
//     }
//   };

//   const openDeleteModal = (id: string) => {
//     setDeleteId(id);
//     setIsDeleteModalOpen(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (!deleteId) return;
//     try {
//       await deleteAmenity(deleteId).unwrap();
//       setIsDeleteModalOpen(false);
//       setDeleteId(null);
//     } catch (err: any) {
//       setError(err.data?.message || "Failed to delete amenity");
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
//         <Title title="Amenities" />
//         <Button
//           onClick={() => handleOpenModal()}
//           className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//         >
//           <Plus className="h-4 w-4 mr-2" /> Add Amenity
//         </Button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {fetchError && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           Failed to fetch amenities
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
//         {amenities.map((amenity) => (
//           <div
//             key={amenity.id}
//             className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <img
//                 src={amenity.icon}
//                 alt={amenity.name}
//                 className="w-12 h-12 object-contain"
//               />
//               <div className="flex space-x-2">
//                 {/* Edit Button */}
//                 <button
//                   onClick={() => handleOpenModal(amenity)}
//                   disabled={isUpdating || isDeleting}
//                   className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition disabled:opacity-50 cursor-pointer"
//                 >
//                   <LiaEdit className="w-5 h-5" />
//                 </button>

//                 {/* Delete Button */}
//                 <button
//                   onClick={() => openDeleteModal(amenity.id)}
//                   disabled={isDeleting}
//                   className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 transition disabled:opacity-50 cursor-pointer"
//                 >
//                   <MdDelete className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-800">
//               {amenity.name}
//             </h3>
//           </div>
//         ))}
//       </div>

//       {/* Add/Edit Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-0.4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-semibold text-gray-800">
//                 {isEditMode ? "Edit Amenity" : "Add Amenity"}
//               </h2>
//               <button
//                 type="button"
//                 onClick={handleCloseModal}
//                 className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Form */}
//             <form onSubmit={handleSubmit} className="space-y-5">
//               {/* Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                   placeholder="Enter amenity name"
//                 />
//               </div>

//               {/* Icon */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Icon {!isEditMode && <span className="text-red-500">*</span>}
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
//                 />
//                 {isEditMode && selectedAmenity?.icon && (
//                   <div className="mt-3">
//                     <p className="text-xs text-gray-500">Current icon:</p>
//                     <img
//                       src={selectedAmenity.icon}
//                       alt="Current icon"
//                       className="w-14 h-14 object-contain mt-2 border rounded-lg shadow-sm"
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Actions */}
//               <div className="flex justify-end space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={handleCloseModal}
//                   className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isCreating || isUpdating}
//                   className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all duration-300 cursor-pointer ${
//                     isCreating || isUpdating
//                       ? "bg-blue-400 cursor-not-allowed"
//                       : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
//                   }`}
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

//       {/* Delete Amenity Modal */}
//       {isDeleteModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-0.4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fadeIn">
//             {/* Header */}
//             <h3 className="text-2xl font-semibold text-gray-800 mb-3">
//               Confirm Deletion
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to delete this amenity?
//             </p>

//             {/* Actions */}
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={() => setIsDeleteModalOpen(false)}
//                 className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors cursor-pointer"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmDelete}
//                 disabled={isDeleting}
//                 className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all duration-300 cursor-pointer ${
//                   isDeleting
//                     ? "bg-red-400 cursor-not-allowed"
//                     : "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
//                 }`}
//               >
//                 {isDeleting ? "Deleting..." : "Delete Amenity"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OnboardingAmenities;
