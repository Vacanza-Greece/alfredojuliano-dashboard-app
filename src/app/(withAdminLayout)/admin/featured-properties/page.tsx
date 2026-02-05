import FeaturedPropertiesTable from "@/components/AdminPage/FeaturedProperties/FeaturedPropertiesTable";
import React from "react";

const FeaturedPropertiesPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8">
                <FeaturedPropertiesTable />
            </div>
        </div>
    );
};

export default FeaturedPropertiesPage;
