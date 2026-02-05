"use client";

import React, { useState } from "react";
import { MdDelete, MdStar, MdStarOutline, MdDragHandle } from "react-icons/md";
import {
    useGetAdminFeaturedPropertiesQuery,
    useAddFeaturedPropertyMutation,
    useRemoveFeaturedPropertyMutation,
    useUpdateFeaturedOrderMutation,
} from "@/redux/features/auth/featuredPropertiesApi";
import { useGetPropertiesQuery } from "@/redux/features/auth/propertiesApi";
import { Property } from "@/redux/types/property";
import { toast } from "sonner";

const FeaturedPropertiesTable: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"all" | "featured">("featured");

    const {
        data: allPropertiesResponse,
        isLoading: isLoadingAll,
        error: errorAll,
    } = useGetPropertiesQuery();

    const {
        data: featuredPropertiesResponse,
        isLoading: isLoadingFeatured,
        error: errorFeatured,
    } = useGetAdminFeaturedPropertiesQuery();

    const [addFeatured] = useAddFeaturedPropertyMutation();
    const [removeFeatured] = useRemoveFeaturedPropertyMutation();
    const [updateOrder] = useUpdateFeaturedOrderMutation();

    const handleAddFeatured = async (propertyId: string) => {
        try {
            await addFeatured({ propertyId }).unwrap();
            toast.success("Property added to featured list");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to add to featured");
        }
    };

    const handleRemoveFeatured = async (propertyId: string) => {
        try {
            await removeFeatured(propertyId).unwrap();
            toast.success("Property removed from featured list");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to remove from featured");
        }
    };

    const handleUpdateOrder = async (propertyId: string, order: number) => {
        try {
            await updateOrder({ propertyId, order }).unwrap();
            toast.success("Order updated");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update order");
        }
    };

    const isFeatured = (propertyId: string) => {
        return featuredPropertiesResponse?.data?.some(
            (fp: any) => fp.propertyId === propertyId
        );
    };

    if (isLoadingAll || isLoadingFeatured) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Featured Properties</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("featured")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "featured"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        Featured List
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "all"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        All Properties
                    </button>
                </div>
            </div>

            {activeTab === "featured" ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {featuredPropertiesResponse?.data?.length > 0 ? (
                                featuredPropertiesResponse.data.map((fp: any) => (
                                    <tr key={fp.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                className="w-16 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                defaultValue={fp.order}
                                                onBlur={(e) => handleUpdateOrder(fp.propertyId, parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    src={fp.property?.images?.[0]?.url || ""}
                                                    alt=""
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{fp.property?.title}</div>
                                                    <div className="text-sm text-gray-500">{fp.property?.propertyType}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {fp.property?.location}, {fp.property?.country}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleRemoveFeatured(fp.propertyId)}
                                                className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                                                title="Remove from featured"
                                            >
                                                <MdDelete className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                        No featured properties yet. Add some from the "All Properties" tab.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allPropertiesResponse?.data?.map((property: Property) => {
                                const featured = isFeatured(property.id);
                                return (
                                    <tr key={property.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    src={property.images?.[0]?.url || ""}
                                                    alt=""
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{property.title}</div>
                                                    <div className="text-sm text-gray-500">{property.propertyType}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {property.location}, {property.country}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${property.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }`}>
                                                {property.isAvailable ? "Available" : "Unavailable"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {featured ? (
                                                <button
                                                    onClick={() => handleRemoveFeatured(property.id)}
                                                    className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 font-bold"
                                                >
                                                    <MdStar className="w-6 h-6" />
                                                    <span>Featured</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddFeatured(property.id)}
                                                    className="flex items-center gap-1 text-gray-400 hover:text-blue-600"
                                                >
                                                    <MdStarOutline className="w-6 h-6" />
                                                    <span>Make Featured</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FeaturedPropertiesTable;
