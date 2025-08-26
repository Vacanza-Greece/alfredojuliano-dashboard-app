"use client";

import { ExchangeRequest } from "@/redux/types/auth.type";
import React from "react";

interface ExchangeDetailsModalProps {
  request: ExchangeRequest;
  onClose: () => void;
}

const ExchangeDetailsModal: React.FC<ExchangeDetailsModalProps> = ({
  request,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[0.2px] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Exchange Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* From User */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">From User</h3>
            <div className="flex items-center mb-3">
              <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                {request.fromUser.photo ? (
                  <img
                    src={request.fromUser.photo}
                    alt={request.fromUser.fullName}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <span className="text-lg font-medium">
                    {request.fromUser.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="font-medium">{request.fromUser.fullName}</div>
                <div className="text-sm text-gray-600">
                  {request.fromUser.email}
                </div>
              </div>
            </div>
          </div>

          {/* To User */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">To User</h3>
            <div className="flex items-center mb-3">
              <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                {request.toUser.photo ? (
                  <img
                    src={request.toUser.photo}
                    alt={request.toUser.fullName}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <span className="text-lg font-medium">
                    {request.toUser.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="font-medium">{request.toUser.fullName}</div>
                <div className="text-sm text-gray-600">
                  {request.toUser.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* From Property */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Offering Property</h3>
            <div className="space-y-2">
              <div>
                <strong>Title:</strong> {request.fromProperty.title}
              </div>
              <div>
                <strong>Location:</strong> {request.fromProperty.location}
              </div>
              <div>
                <strong>Price:</strong> $
                {request.fromProperty.price.toLocaleString()}
              </div>
              <div>
                <strong>Size:</strong> {request.fromProperty.size} m²
              </div>
              <div>
                <strong>Bedrooms:</strong> {request.fromProperty.bedrooms}
              </div>
              <div>
                <strong>Bathrooms:</strong> {request.fromProperty.bathrooms}
              </div>
            </div>
          </div>

          {/* To Property */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Requested Property</h3>
            <div className="space-y-2">
              <div>
                <strong>Title:</strong> {request.toProperty.title}
              </div>
              <div>
                <strong>Location:</strong> {request.toProperty.location}
              </div>
              <div>
                <strong>Price:</strong> $
                {request.toProperty.price.toLocaleString()}
              </div>
              <div>
                <strong>Size:</strong> {request.toProperty.size} m²
              </div>
              <div>
                <strong>Bedrooms:</strong> {request.toProperty.bedrooms}
              </div>
              <div>
                <strong>Bathrooms:</strong> {request.toProperty.bathrooms}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">Message</h3>
          <p className="text-gray-700">{request.message}</p>
        </div>

        {/* Status and Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Status</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                request.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : request.status === "ACCEPTED"
                  ? "bg-green-100 text-green-800"
                  : request.status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : request.status === "COMPLETED"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {request.status}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Dates</h3>
            <div className="space-y-1">
              <div>
                <strong>Created:</strong>{" "}
                {new Date(request.createdAt).toLocaleString()}
              </div>
              <div>
                <strong>Updated:</strong>{" "}
                {new Date(request.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeDetailsModal;
