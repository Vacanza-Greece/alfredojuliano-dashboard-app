import { baseApi } from "../../hooks/baseApi";

export const featuredPropertiesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFeaturedProperties: builder.query<any, void>({
            query: () => "/featured-property",
            providesTags: ["Property"],
        }),
        getAdminFeaturedProperties: builder.query<any, void>({
            query: () => "/featured-property/admin",
            providesTags: ["Property"],
        }),
        addFeaturedProperty: builder.mutation<any, { propertyId: string }>({
            query: (data) => ({
                url: "/featured-property",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Property"],
        }),
        removeFeaturedProperty: builder.mutation<any, string>({
            query: (propertyId) => ({
                url: `/featured-property/${propertyId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Property"],
        }),
        updateFeaturedOrder: builder.mutation<any, { propertyId: string; order: number }>({
            query: ({ propertyId, order }) => ({
                url: `/featured-property/${propertyId}/order`,
                method: "PATCH",
                body: { order },
            }),
            invalidatesTags: ["Property"],
        }),
    }),
});

export const {
    useGetFeaturedPropertiesQuery,
    useGetAdminFeaturedPropertiesQuery,
    useAddFeaturedPropertyMutation,
    useRemoveFeaturedPropertyMutation,
    useUpdateFeaturedOrderMutation,
} = featuredPropertiesApi;
