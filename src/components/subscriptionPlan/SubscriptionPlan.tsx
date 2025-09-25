"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  X,
  Trash2,
  Check,
  ChevronDown,
  Edit,
  Loader2,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import PageLoader from "../AdminPage/Shared/PageLoader";
import Title from "../reuseabelComponents/Title";
import {
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} from "@/redux/features/auth/planApi";
import { Plan, PlanFormData, PlanTranslation } from "@/redux/types/venue.type";

interface ApiError {
  data?: { message?: string };
  message?: string;
}

// Language configuration
const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
];

export default function SubscriptionPlanControl() {
  // -----------------------------
  // State
  // -----------------------------
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newFeature, setNewFeature] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "el">("en");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  const { data: plans = [], isLoading, isError, refetch } = useGetPlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();

  const emptyTranslation: PlanTranslation[] = [
    {
      language: "en",
      name: "",
      description: "",
      features: [],
      planDuration: "",
      planType: "Premium",
    },
    {
      language: "el",
      name: "",
      description: "",
      features: [],
      planDuration: "",
      planType: "Premium",
    },
  ];

  const [newPlan, setNewPlan] = useState<PlanFormData>({
    price: 0,
    priceId: "",
    status: "ACTIVE",
    isPopular: false,
    translations: emptyTranslation,
  });

  const [validationErrors, setValidationErrors] = useState<{
    name: string;
    price: string;
  }>({
    name: "",
    price: "",
  });

  // -----------------------------
  // Helper Functions
  // -----------------------------
  const getCurrentTranslation = () => {
    return (
      newPlan.translations.find((t) => t.language === currentLanguage) ||
      emptyTranslation[0]
    );
  };

  const updateCurrentTranslation = (
    field: keyof PlanTranslation,
    value: string | string[]
  ) => {
    setNewPlan((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.language === currentLanguage ? { ...t, [field]: value } : t
      ),
    }));
  };

  // -----------------------------
  // Form Validation
  // -----------------------------
  const validateForm = useCallback(() => {
    const errors = { name: "", price: "" };
    let isValid = true;

    // Validate all languages have names
    newPlan.translations.forEach((translation) => {
      if (!translation.name.trim()) {
        errors.name = `Plan name is required for ${translation.language.toUpperCase()}`;
        isValid = false;
      }
    });

    if (newPlan.price <= 0) {
      errors.price = "Price must be greater than 0";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [newPlan]);

  const resetForm = useCallback(() => {
    setNewPlan({
      price: 0,
      priceId: "",
      status: "ACTIVE",
      isPopular: false,
      translations: emptyTranslation,
    });
    setEditingPlan(null);
    setNewFeature("");
    setCurrentLanguage("en");
    setValidationErrors({ name: "", price: "" });
  }, []);

  // -----------------------------
  // Input Handlers
  // -----------------------------
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setNewPlan((prev) => ({
        ...prev,
        [name]: name === "price" ? Number(value) || 0 : value,
      }));

      if (validationErrors[name as keyof typeof validationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [validationErrors]
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setNewPlan((prev) => ({ ...prev, [name]: checked }));
    },
    []
  );

  // -----------------------------
  // Feature Management
  // -----------------------------
  const addFeature = useCallback(() => {
    if (newFeature.trim()) {
      updateCurrentTranslation("features", [
        ...getCurrentTranslation().features,
        newFeature.trim(),
      ]);
      setNewFeature("");
    }
  }, [newFeature, currentLanguage]);

  const removeFeature = useCallback(
    (index: number) => {
      const currentFeatures = getCurrentTranslation().features;
      updateCurrentTranslation(
        "features",
        currentFeatures.filter((_, i) => i !== index)
      );
    },
    [currentLanguage]
  );

  // -----------------------------
  // API Handlers
  // -----------------------------
  const handleAddPlan = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const payload: PlanFormData = {
        ...newPlan,
        price: Number(newPlan.price),
        translations: newPlan.translations.map((t) => ({
          ...t,
          features: t.features.filter((f) => f.trim() !== ""),
        })),
      };
      await createPlan(payload).unwrap();
      toast.success("Plan created successfully");
      resetForm();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(
        err?.data?.message || err?.message || "Failed to create plan."
      );
    }
  }, [createPlan, newPlan, resetForm, validateForm]);

  const handleUpdatePlan = useCallback(async () => {
    if (!editingPlan || !validateForm()) return;

    try {
      const payload: PlanFormData = {
        ...newPlan,
        price: Number(newPlan.price),
        translations: newPlan.translations.map((t) => ({
          ...t,
          features: t.features.filter((f) => f.trim() !== ""),
        })),
      };
      await updatePlan({ id: editingPlan.id, data: payload }).unwrap();
      toast.success("Plan updated successfully");
      resetForm();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(
        err?.data?.message || err?.message || "Failed to update plan."
      );
    }
  }, [editingPlan, newPlan, updatePlan, resetForm, validateForm]);

  // -----------------------------
  // Delete Plan
  // -----------------------------
  const handleDeletePlan = useCallback((id: string) => {
    setPlanToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDeletePlan = useCallback(async () => {
    if (!planToDelete) return;
    setIsDeletingPlan(true);
    try {
      await deletePlan(planToDelete).unwrap();
      toast.success("Plan deleted successfully");
      refetch();
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(
        err?.data?.message || err?.message || "Failed to delete plan"
      );
    } finally {
      setIsDeletingPlan(false);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  }, [planToDelete, deletePlan, refetch]);

  // -----------------------------
  // Open Edit Dialog
  // -----------------------------
  const openEditDialog = useCallback((plan: Plan) => {
    setEditingPlan(plan);
    setNewPlan({
      price: plan.price,
      priceId: plan.priceId,
      status: plan.status,
      isPopular: plan.isPopular || false,
      translations: plan.translations.map((t) => ({ ...t })), // Copy translations
    });
    setIsDialogOpen(true);
  }, []);

  // -----------------------------
  // Render
  // -----------------------------
  if (isLoading) return <PageLoader />;
  if (isError)
    return (
      <div className="text-center py-8 text-red-500">
        Error loading plans.{" "}
        <Button variant="link" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );

  const currentTranslation = getCurrentTranslation();

  return (
    <div className="mx-auto w-full font-Robot">
      {/* Title + Add Plan Button */}
      <div className="flex justify-between items-center mb-8">
        <Title title="Subscription Plan" />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" /> Add New Plan
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Plan" : "Add New Plan"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? "Update the plan details"
                  : "Fill in the details for the new plan"}
              </DialogDescription>
            </DialogHeader>

            {/* Language Tabs */}
            <div className="flex border-b mb-4">
              {LANGUAGES.map((lang) => (
                <Button
                  key={lang.code}
                  variant="ghost"
                  className={`flex items-center gap-2 rounded-none border-b-2 ${
                    currentLanguage === lang.code
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent"
                  }`}
                  onClick={() => setCurrentLanguage(lang.code as "en" | "el")}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </Button>
              ))}
            </div>

            <div className="grid gap-4 py-4">
              {/* Plan Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">
                  Plan Name ({currentLanguage.toUpperCase()})
                </label>
                <div className="col-span-3">
                  <Input
                    value={currentTranslation.name}
                    onChange={(e) =>
                      updateCurrentTranslation("name", e.target.value)
                    }
                    placeholder={`e.g. Premium Traveler (${currentLanguage.toUpperCase()})`}
                  />
                  {validationErrors.name && currentLanguage === "en" && (
                    <p className="text-sm text-red-500">
                      {validationErrors.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">
                  Description ({currentLanguage.toUpperCase()})
                </label>
                <Input
                  value={currentTranslation.description}
                  onChange={(e) =>
                    updateCurrentTranslation("description", e.target.value)
                  }
                  className="col-span-3"
                  placeholder={`Plan description (${currentLanguage.toUpperCase()})`}
                />
              </div>

              {/* Plan Duration */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">
                  Plan Duration ({currentLanguage.toUpperCase()})
                </label>
                <Input
                  value={currentTranslation.planDuration}
                  onChange={(e) =>
                    updateCurrentTranslation("planDuration", e.target.value)
                  }
                  placeholder={`e.g. 1 Year Subscription (${currentLanguage.toUpperCase()})`}
                  className="col-span-3"
                />
              </div>

              {/* Plan Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Plan Type</label>
                <Select
                  value={currentTranslation.planType}
                  onValueChange={(value) =>
                    updateCurrentTranslation("planType", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                    <SelectItem value="TWO_YEARLY">Two Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Features Section - Only show for current language */}
              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right mt-2">
                  Features ({currentLanguage.toUpperCase()})
                </label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder={`Add feature (${currentLanguage.toUpperCase()})`}
                      className="flex-1"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addFeature())
                      }
                    />
                    <Button
                      type="button"
                      onClick={addFeature}
                      variant="outline"
                      disabled={!newFeature.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                    {currentTranslation.features.length > 0 ? (
                      currentTranslation.features.map((f, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded mb-1"
                        >
                          <span className="flex-1">{f}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(i)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No features added for {currentLanguage.toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Common Fields (Not language specific) */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Common Settings
                </h4>

                {/* Price ID */}
                <div className="grid grid-cols-4 items-center gap-4 mb-3">
                  <label className="text-right">Price ID</label>
                  <Input
                    value={newPlan.priceId}
                    name="priceId"
                    onChange={handleInputChange}
                    placeholder="e.g. price_1ABC123"
                    className="col-span-3"
                  />
                </div>

                {/* Price */}
                <div className="grid grid-cols-4 items-center gap-4 mb-3">
                  <label className="text-right">Price (€)</label>
                  <div className="col-span-3">
                    <Input
                      value={newPlan.price}
                      name="price"
                      type="number"
                      onChange={handleInputChange}
                      placeholder="e.g. 89"
                      className="col-span-3"
                    />
                    {validationErrors.price && (
                      <p className="text-sm text-red-500">
                        {validationErrors.price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-4 items-center gap-4 mb-3">
                  <label className="text-right">Status</label>
                  <Select
                    value={newPlan.status}
                    onValueChange={(v) =>
                      setNewPlan((prev) => ({
                        ...prev,
                        status: v as "ACTIVE" | "INACTIVE",
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Popular */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Popular Plan</label>
                  <div className="col-span-3 flex items-center">
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={newPlan.isPopular}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Mark as popular plan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => (setIsDialogOpen(false), resetForm())}
              >
                Cancel
              </Button>
              <Button onClick={editingPlan ? handleUpdatePlan : handleAddPlan}>
                {editingPlan
                  ? isUpdating
                    ? "Updating..."
                    : "Update Plan"
                  : isCreating
                  ? "Creating..."
                  : "Add Plan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Table */}
      <div className="mb-12 rounded-lg border bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name (EN/EL)</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => {
              const enTranslation = plan.translations.find(
                (t) => t.language === "en"
              );
              const elTranslation = plan.translations.find(
                (t) => t.language === "el"
              );

              return (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        EN: {enTranslation?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        EL: {elTranslation?.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {enTranslation?.planType.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>€ {plan.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          {enTranslation?.features.length || 0} features{" "}
                          <ChevronDown className="ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <div className="font-medium mb-2">
                            English Features:
                          </div>
                          {enTranslation?.features.map((f, i) => (
                            <DropdownMenuItem
                              key={`en-${i}`}
                              className="text-xs"
                            >
                              {f}
                            </DropdownMenuItem>
                          ))}

                          <div className="font-medium mb-2 mt-3">
                            Greek Features:
                          </div>
                          {elTranslation?.features.map((f, i) => (
                            <DropdownMenuItem
                              key={`el-${i}`}
                              className="text-xs"
                            >
                              {f}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>EN: {enTranslation?.planDuration}</div>
                      <div className="text-sm text-gray-600">
                        EL: {elTranslation?.planDuration}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {plan.priceId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={plan.status === "ACTIVE" ? "default" : "outline"}
                    >
                      {plan.status.toLowerCase()}
                    </Badge>
                    {plan.isPopular && (
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        Popular
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        disabled={isDeletingPlan}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription plan and all its
              translations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPlan}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              disabled={isDeletingPlan}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingPlan ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* Part-2 */

// "use client";

// import { useState, useCallback } from "react";
// import { toast } from "sonner";
// import {
//   Plus,
//   X,
//   Trash2,
//   Check,
//   ChevronDown,
//   Edit,
//   Loader2,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import PageLoader from "../AdminPage/Shared/PageLoader";
// import Title from "../reuseabelComponents/Title";

// import {
//   useGetPlansQuery,
//   useCreatePlanMutation,
//   useUpdatePlanMutation,
//   useDeletePlanMutation,
// } from "@/redux/features/auth/planApi";

// import { Plan, PlanFormData, PlanTranslation } from "@/redux/types/venue.type";

// interface ApiError {
//   data?: { message?: string };
//   message?: string;
// }

// // -----------------------------
// // Main Component
// // -----------------------------
// export default function SubscriptionPlanControl() {
//   // -----------------------------
//   // State
//   // -----------------------------
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
//   const [newFeature, setNewFeature] = useState("");

//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [planToDelete, setPlanToDelete] = useState<string | null>(null);
//   const [isDeletingPlan, setIsDeletingPlan] = useState(false);

//   const { data: plans = [], isLoading, isError, refetch } = useGetPlansQuery();
//   const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
//   const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
//   const [deletePlan] = useDeletePlanMutation();

//   const emptyTranslation: PlanTranslation[] = [
//     {
//       language: "en",
//       name: "",
//       description: "",
//       features: [],
//       planDuration: "",
//       planType: "YEARLY",
//     },
//     {
//       language: "el",
//       name: "",
//       description: "",
//       features: [],
//       planDuration: "",
//       planType: "YEARLY",
//     },
//   ];

//   // const [newPlan, setNewPlan] = useState<PlanFormData>({
//   //   price: "",
//   //   priceId: "",
//   //   status: "ACTIVE",
//   //   isPopular: false,
//   //   translations: emptyTranslation,
//   // });

//   const [newPlan, setNewPlan] = useState<PlanFormData>({
//     price: 0, // must be number
//     priceId: "",
//     status: "ACTIVE",
//     isPopular: false,
//     translations: emptyTranslation,
//   });

//   const [validationErrors, setValidationErrors] = useState<{
//     name: string;
//     price: string;
//   }>({
//     name: "",
//     price: "",
//   });

//   // -----------------------------
//   // Form Validation
//   // -----------------------------
//   const validateForm = useCallback(() => {
//     const errors = { name: "", price: "" };
//     let isValid = true;

//     // Validate English translation as default
//     const english = newPlan.translations.find((t) => t.language === "en");
//     if (!english || !english.name.trim()) {
//       errors.name = "Plan name is required";
//       isValid = false;
//     }

//     if (newPlan.price <= 0) {
//       errors.price = "Price must be greater than 0";
//       isValid = false;
//     }

//     setValidationErrors(errors);
//     return isValid;
//   }, [newPlan]);

//   const resetForm = useCallback(() => {
//     setNewPlan({
//       price: 0,
//       priceId: "",
//       status: "ACTIVE",
//       isPopular: false,
//       translations: emptyTranslation,
//     });
//     setEditingPlan(null);
//     setNewFeature("");
//     setValidationErrors({ name: "", price: "" });
//   }, []);

//   // -----------------------------
//   // Translation Change Handler
//   // -----------------------------
//   const handleTranslationChange = useCallback(
//     (lang: string, field: keyof PlanTranslation, value: string | string[]) => {
//       setNewPlan((prev) => ({
//         ...prev,
//         translations: prev.translations.map((t) =>
//           t.language === lang ? { ...t, [field]: value } : t
//         ),
//       }));
//     },
//     []
//   );

//   // -----------------------------
//   // Input Handlers
//   // -----------------------------
//   // const handleInputChange = useCallback(
//   //   (e: React.ChangeEvent<HTMLInputElement>) => {
//   //     const { name, value } = e.target;
//   //     if (name === "price") {
//   //       setNewPlan((prev) => ({
//   //         ...prev,
//   //         [name]: value === "" ? "" : Number(value),
//   //       }));
//   //     } else {
//   //       setNewPlan((prev) => ({ ...prev, [name]: value }));
//   //     }
//   //     if (validationErrors[name as keyof typeof validationErrors]) {
//   //       setValidationErrors((prev) => ({ ...prev, [name]: "" }));
//   //     }
//   //   },
//   //   [validationErrors]
//   // );

//   const handleInputChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const { name, value } = e.target;

//       setNewPlan((prev) => ({
//         ...prev,
//         [name]: name === "price" ? Number(value) || 0 : value, // convert to number
//       }));

//       if (validationErrors[name as keyof typeof validationErrors]) {
//         setValidationErrors((prev) => ({ ...prev, [name]: "" }));
//       }
//     },
//     [validationErrors]
//   );

//   const handleCheckboxChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const { name, checked } = e.target;
//       setNewPlan((prev) => ({ ...prev, [name]: checked }));
//     },
//     []
//   );

//   const addFeature = useCallback(() => {
//     if (newFeature.trim()) {
//       setNewPlan((prev) => ({
//         ...prev,
//         translations: prev.translations.map((t) =>
//           t.language === "en"
//             ? { ...t, features: [...t.features, newFeature.trim()] }
//             : t
//         ),
//       }));
//       setNewFeature("");
//     }
//   }, [newFeature]);

//   const removeFeature = useCallback((index: number) => {
//     setNewPlan((prev) => ({
//       ...prev,
//       translations: prev.translations.map((t) =>
//         t.language === "en"
//           ? { ...t, features: t.features.filter((_, i) => i !== index) }
//           : t
//       ),
//     }));
//   }, []);

//   // -----------------------------
//   // Create & Update Plan
//   // -----------------------------
//   const handleAddPlan = useCallback(async () => {
//     if (!validateForm()) return;

//     try {
//       const payload: PlanFormData = {
//         ...newPlan,
//         price: Number(newPlan.price),
//         translations: newPlan.translations.map((t) => ({
//           ...t,
//           features: t.features.filter((f) => f.trim() !== ""),
//         })),
//       };
//       await createPlan(payload).unwrap();
//       toast.success("Plan created successfully");
//       resetForm();
//       setIsDialogOpen(false);
//     } catch (error: unknown) {
//       const err = error as ApiError;
//       toast.error(
//         err?.data?.message || err?.message || "Failed to create plan."
//       );
//     }
//   }, [createPlan, newPlan, resetForm, validateForm]);

//   const handleUpdatePlan = useCallback(async () => {
//     if (!editingPlan || !validateForm()) return;

//     try {
//       const payload: PlanFormData = {
//         ...newPlan,
//         price: Number(newPlan.price),
//         translations: newPlan.translations.map((t) => ({
//           ...t,
//           features: t.features.filter((f) => f.trim() !== ""),
//         })),
//       };
//       await updatePlan({ id: editingPlan.id, data: payload }).unwrap();
//       toast.success("Plan updated successfully");
//       resetForm();
//       setIsDialogOpen(false);
//     } catch (error: unknown) {
//       const err = error as ApiError;
//       toast.error(
//         err?.data?.message || err?.message || "Failed to update plan."
//       );
//     }
//   }, [editingPlan, newPlan, updatePlan, resetForm, validateForm]);

//   // -----------------------------
//   // Delete Plan
//   // -----------------------------
//   const handleDeletePlan = useCallback((id: string) => {
//     setPlanToDelete(id);
//     setDeleteDialogOpen(true);
//   }, []);

//   const confirmDeletePlan = useCallback(async () => {
//     if (!planToDelete) return;
//     setIsDeletingPlan(true);
//     try {
//       await deletePlan(planToDelete).unwrap();
//       toast.success("Plan deleted successfully");
//       refetch();
//     } catch (error: unknown) {
//       const err = error as ApiError;
//       toast.error(
//         err?.data?.message || err?.message || "Failed to delete plan"
//       );
//     } finally {
//       setIsDeletingPlan(false);
//       setDeleteDialogOpen(false);
//       setPlanToDelete(null);
//     }
//   }, [planToDelete, deletePlan, refetch]);

//   // -----------------------------
//   // Open Edit Dialog
//   // -----------------------------
//   const openEditDialog = useCallback((plan: Plan) => {
//     setEditingPlan(plan);
//     setNewPlan({
//       price: plan.price,
//       priceId: plan.priceId,
//       status: plan.status,
//       isPopular: plan.isPopular || false,
//       translations: plan.translations.map((t) => ({ ...t })), // Copy translations
//     });
//     setIsDialogOpen(true);
//   }, []);

//   // -----------------------------
//   // Render
//   // -----------------------------
//   if (isLoading) return <PageLoader />;
//   if (isError)
//     return (
//       <div className="text-center py-8 text-red-500">
//         Error loading plans.{" "}
//         <Button variant="link" onClick={() => refetch()}>
//           Try again
//         </Button>
//       </div>
//     );

//   return (
//     <div className="mx-auto w-full font-Robot">
//       {/* Title + Add Plan Button */}
//       <div className="flex justify-between items-center mb-8">
//         <Title title="Subscription Plan" />
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button
//               onClick={resetForm}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center"
//             >
//               <Plus className="h-4 w-4 mr-2" /> Add New Plan
//             </Button>
//           </DialogTrigger>

//           <DialogContent className="sm:max-w-[600px]">
//             <DialogHeader>
//               <DialogTitle>
//                 {editingPlan ? "Edit Plan" : "Add New Plan"}
//               </DialogTitle>
//               <DialogDescription>
//                 {editingPlan
//                   ? "Update the plan details"
//                   : "Fill in the details for the new plan"}
//               </DialogDescription>
//             </DialogHeader>

//             <div className="grid gap-4 py-4">
//               {/* English Name */}
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">Plan Name (EN)</label>
//                 <div className="col-span-3">
//                   <Input
//                     value={
//                       newPlan.translations.find((t) => t.language === "en")
//                         ?.name || ""
//                     }
//                     onChange={(e) =>
//                       handleTranslationChange("en", "name", e.target.value)
//                     }
//                     placeholder="e.g. Premium YEARLY"
//                   />
//                   {validationErrors.name && (
//                     <p className="text-sm text-red-500">
//                       {validationErrors.name}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* English Description */}
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">Description (EN)</label>
//                 <Input
//                   value={
//                     newPlan.translations.find((t) => t.language === "en")
//                       ?.description || ""
//                   }
//                   onChange={(e) =>
//                     handleTranslationChange("en", "description", e.target.value)
//                   }
//                   className="col-span-3"
//                   placeholder="Plan description"
//                 />
//               </div>

//               {/* Plan Duration */}
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">Plan Duration</label>
//                 <Input
//                   value={
//                     newPlan.translations.find((t) => t.language === "en")
//                       ?.planDuration || ""
//                   }
//                   onChange={(e) =>
//                     handleTranslationChange(
//                       "en",
//                       "planDuration",
//                       e.target.value
//                     )
//                   }
//                   placeholder="e.g. 1 Month, 1 Year"
//                   className="col-span-3"
//                 />
//               </div>

//               {/* Price ID */}
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">Price ID</label>
//                 <Input
//                   value={newPlan.priceId}
//                   name="priceId"
//                   onChange={handleInputChange}
//                   placeholder="e.g. price_1ABC123"
//                   className="col-span-3"
//                 />
//               </div>

//               {/* Price */}
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">Price</label>
//                 <Input
//                   value={newPlan.price}
//                   name="price"
//                   type="number"
//                   onChange={handleInputChange}
//                   placeholder="e.g. 19.99"
//                   className="col-span-3"
//                 />
//                 {validationErrors.price && (
//                   <p className="text-sm text-red-500">
//                     {validationErrors.price}
//                   </p>
//                 )}
//               </div>

//               {/* Features */}
//               <div className="grid grid-cols-4 items-start gap-4">
//                 <label className="text-right mt-2">Features</label>
//                 <div className="col-span-3 space-y-2">
//                   <div className="flex gap-2">
//                     <Input
//                       value={newFeature}
//                       onChange={(e) => setNewFeature(e.target.value)}
//                       placeholder="Add feature"
//                       className="flex-1"
//                       onKeyPress={(e) =>
//                         e.key === "Enter" && (e.preventDefault(), addFeature())
//                       }
//                     />
//                     <Button
//                       type="button"
//                       onClick={addFeature}
//                       variant="outline"
//                       disabled={!newFeature.trim()}
//                     >
//                       <Plus className="h-4 w-4" />
//                     </Button>
//                   </div>
//                   <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
//                     {newPlan.translations
//                       .find((t) => t.language === "en")
//                       ?.features.map((f, i) => (
//                         <div
//                           key={i}
//                           className="flex justify-between p-2 bg-gray-50 rounded"
//                         >
//                           <span>{f}</span>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => removeFeature(i)}
//                             className="text-red-500"
//                           >
//                             <X className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       )) || (
//                       <p className="text-sm text-gray-500 text-center py-2">
//                         No features added
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Status */}
//               <div className="grid grid-cols-4 items-center gap-4 py-2">
//                 <label className="text-right">Status</label>
//                 <Select
//                   value={newPlan.status}
//                   onValueChange={(v) =>
//                     setNewPlan((prev) => ({
//                       ...prev,
//                       status: v as "ACTIVE" | "INACTIVE",
//                     }))
//                   }
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="ACTIVE">Active</SelectItem>
//                     <SelectItem value="INACTIVE">Inactive</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Popular */}
//               <div className="grid grid-cols-4 items-center gap-4 py-2">
//                 <label className="text-right">Popular Plan</label>
//                 <input
//                   type="checkbox"
//                   name="isPopular"
//                   checked={newPlan.isPopular}
//                   onChange={handleCheckboxChange}
//                   className="col-span-3 h-4 w-4"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => (setIsDialogOpen(false), resetForm())}
//               >
//                 Cancel
//               </Button>
//               <Button onClick={editingPlan ? handleUpdatePlan : handleAddPlan}>
//                 {editingPlan
//                   ? isUpdating
//                     ? "Updating..."
//                     : "Update Plan"
//                   : isCreating
//                   ? "Creating..."
//                   : "Add Plan"}
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* -----------------------------
//            Table of Plans
//       ----------------------------- */}
//       <div className="mb-12 rounded-lg border bg-white shadow-sm overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Plan Name</TableHead>
//               <TableHead>Type</TableHead>
//               <TableHead>Price</TableHead>
//               <TableHead>Features</TableHead>
//               <TableHead>Duration</TableHead>
//               <TableHead>Price ID</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {plans.map((plan) => (
//               <TableRow key={plan.id}>
//                 <TableCell>
//                   {plan.translations.find((t) => t.language === "en")?.name}
//                 </TableCell>
//                 <TableCell>
//                   <Badge
//                     variant={
//                       plan.translations[0].planType === "YEARLY"
//                         ? "default"
//                         : "secondary"
//                     }
//                   >
//                     {plan.translations[0].planType.toLowerCase()}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>€ {plan.price.toFixed(2)}</TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost">
//                         {plan.translations[0].features.length} features{" "}
//                         <ChevronDown />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent>
//                       {plan.translations[0].features.map((f, i) => (
//                         <DropdownMenuItem key={i}>{f}</DropdownMenuItem>
//                       ))}
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//                 <TableCell>{plan.translations[0].planDuration}</TableCell>
//                 <TableCell>{plan.priceId}</TableCell>
//                 <TableCell>
//                   <Badge
//                     variant={plan.status === "ACTIVE" ? "default" : "outline"}
//                   >
//                     {plan.status.toLowerCase()}
//                   </Badge>
//                   {plan.isPopular && (
//                     <Badge className="ml-2 bg-green-100 text-green-800">
//                       Popular
//                     </Badge>
//                   )}
//                 </TableCell>
//                 <TableCell className="flex gap-2 justify-end">
//                   <Button onClick={() => openEditDialog(plan)}>
//                     <Edit />
//                   </Button>
//                   <Button
//                     onClick={() => handleDeletePlan(plan.id)}
//                     disabled={isDeletingPlan}
//                   >
//                     <Trash2 />
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       {/* -----------------------------
//            Delete Confirmation
//       ----------------------------- */}
//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete the subscription plan.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isDeletingPlan}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={confirmDeletePlan}
//               disabled={isDeletingPlan}
//             >
//               {isDeletingPlan ? (
//                 <Loader2 className="animate-spin h-4 w-4 mr-2" />
//               ) : (
//                 "Delete Plan"
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

/* Part-1 */

// "use client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//   Loader2,
//   Plus,
//   X,
//   Trash2,
//   Check,
//   ChevronDown,
//   Edit,
// } from "lucide-react";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import { useState, useCallback } from "react";
// import { Dialog } from "@/components/ui/dialog";
// import {
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Badge } from "@/components/ui/badge";
// import {
//   useGetPlansQuery,
//   useCreatePlanMutation,
//   useUpdatePlanMutation,
//   useDeletePlanMutation,
// } from "@/redux/features/auth/planApi";
// import { toast } from "sonner";
// import { Plan, PlanFormData } from "@/redux/types/venue.type";

// import PageLoader from "../AdminPage/Shared/PageLoader";
// import Title from "../reuseabelComponents/Title";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";

// interface ApiError {
//   data?: {
//     message?: string;
//   };
//   message?: string;
// }

// // Extended type for form state that allows empty price string
// type PlanFormState = Omit<PlanFormData, "price"> & {
//   price: number | "";
//   plan_duration: string; // new
//   priceId: string; // new
// };

// export default function SubscriptionPlanControl() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
//   const [newFeature, setNewFeature] = useState("");

//   // Delete dialog state
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [planToDelete, setPlanToDelete] = useState<string | null>(null);
//   const [isDeletingPlan, setIsDeletingPlan] = useState(false);

//   // RTK Query hooks
//   const { data: plans = [], isLoading, isError, refetch } = useGetPlansQuery();
//   const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
//   const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
//   const [deletePlan] = useDeletePlanMutation();

//   const [newPlan, setNewPlan] = useState<PlanFormState>({
//     name: "",
//     description: "",
//     price: "", // number or ""
//     features: [],
//     planType: "YEARLY",
//     status: "ACTIVE",
//     isPopular: false,
//     plan_duration: "", // <-- new field
//     priceId: "", // <-- new field
//   });

//   const [validationErrors, setValidationErrors] = useState({
//     name: "",
//     price: "",
//   });

//   const validateForm = useCallback(() => {
//     const errors = {
//       name: "",
//       price: "",
//     };
//     let isValid = true;

//     if (!newPlan.name.trim()) {
//       errors.name = "Plan name is required";
//       isValid = false;
//     }

//     if (newPlan.price === "" || Number(newPlan.price) <= 0) {
//       errors.price = "Price must be greater than 0";
//       isValid = false;
//     }

//     setValidationErrors(errors);
//     return isValid;
//   }, [newPlan.name, newPlan.price]);

//   const resetForm = useCallback(() => {
//     setNewPlan({
//       name: "",
//       description: "",
//       price: "", // Reset to empty string
//       features: [],
//       planType: "YEARLY",
//       status: "ACTIVE",
//       isPopular: false,
//       plan_duration: "", // <-- new field
//       priceId: "", // <-- new field
//     });
//     setEditingPlan(null);
//     setNewFeature("");
//     setValidationErrors({
//       name: "",
//       price: "",
//     });
//   }, []);

//   const handleAddPlan = useCallback(async () => {
//     if (!validateForm()) return;

//     try {
//       // Convert form data to API payload
//       const planPayload: PlanFormData = {
//         ...newPlan,
//         price: Number(newPlan.price),
//         features: newPlan.features.filter((f) => f.trim() !== ""),
//         plan_duration: newPlan.plan_duration,
//         priceId: newPlan.priceId,
//       };

//       await createPlan(planPayload).unwrap();
//       toast.success("Plan created successfully");
//       resetForm();
//       setIsDialogOpen(false);
//     } catch (error: unknown) {
//       const err = error as ApiError;
//       console.error("Error creating plan:", err);
//       toast.error(
//         err?.data?.message ||
//           err?.message ||
//           "Failed to create plan. Please try again."
//       );
//     }
//   }, [createPlan, newPlan, validateForm, resetForm]);

//   const handleUpdatePlan = useCallback(async () => {
//     if (!editingPlan || !validateForm()) return;

//     try {
//       const fullPayload: PlanFormData = {
//         name: newPlan.name,
//         description: newPlan.description,
//         price: Number(newPlan.price),
//         features: newPlan.features.filter((f) => f.trim() !== ""),
//         planType: newPlan.planType,
//         status: newPlan.status,
//         plan_duration: newPlan.plan_duration,
//         priceId: newPlan.priceId,
//       };

//       await updatePlan({ id: editingPlan.id, data: fullPayload }).unwrap();

//       toast.success("Plan updated successfully");
//       setIsDialogOpen(false);
//       resetForm();
//     } catch (error: unknown) {
//       const err = error as ApiError;
//       console.error("Update error:", err);
//       toast.error(
//         err?.data?.message ||
//           err?.message ||
//           "Failed to update plan. Please try again."
//       );
//     }
//   }, [editingPlan, newPlan, updatePlan, validateForm, resetForm]);

//   const handleDeletePlan = useCallback((id: string) => {
//     setPlanToDelete(id);
//     setDeleteDialogOpen(true);
//   }, []);

//   const confirmDeletePlan = useCallback(async () => {
//     if (!planToDelete) return;

//     setIsDeletingPlan(true);
//     try {
//       await deletePlan(planToDelete).unwrap();
//       toast.success("Plan deleted successfully");
//       refetch();
//     } catch (error: unknown) {
//       const err = error as ApiError;
//       toast.error(
//         err?.data?.message || err?.message || "Failed to delete plan"
//       );
//     } finally {
//       setIsDeletingPlan(false);
//       setDeleteDialogOpen(false);
//       setPlanToDelete(null);
//     }
//   }, [planToDelete, deletePlan, refetch]);

//   const handleInputChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const { name, value } = e.target;

//       // Special handling for price input
//       if (name === "price") {
//         setNewPlan((prev) => ({
//           ...prev,
//           // Allow empty string or numeric values
//           [name]: value === "" ? "" : Number(value),
//         }));
//       } else {
//         setNewPlan((prev) => ({ ...prev, [name]: value }));
//       }

//       // Clear validation error if present
//       if (validationErrors[name as keyof typeof validationErrors]) {
//         setValidationErrors((prev) => ({ ...prev, [name]: "" }));
//       }
//     },
//     [validationErrors]
//   );

//   const handleCheckboxChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const { name, checked } = e.target;
//       setNewPlan((prev) => ({ ...prev, [name]: checked }));
//     },
//     []
//   );

//   const addFeature = useCallback(() => {
//     if (newFeature.trim()) {
//       setNewPlan((prev) => ({
//         ...prev,
//         features: [...prev.features, newFeature.trim()],
//       }));
//       setNewFeature("");
//     }
//   }, [newFeature]);

//   const removeFeature = useCallback((index: number) => {
//     setNewPlan((prev) => ({
//       ...prev,
//       features: prev.features.filter((_, i) => i !== index),
//     }));
//   }, []);

//   const openEditDialog = useCallback((plan: Plan) => {
//     setEditingPlan(plan);
//     setNewPlan({
//       name: plan.name,
//       description: plan.description || "",
//       price: plan.price, // number from API
//       features: [...plan.features],
//       planType: plan.planType,
//       status: plan.status,
//       isPopular: plan.isPopular || false,
//       plan_duration: plan.plan_duration || "", // new field
//       priceId: plan.priceId || "", // new field
//     });
//     setIsDialogOpen(true);
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="text-center py-8">
//         <PageLoader />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="text-center py-8 text-red-500">
//         Error loading plans.{" "}
//         <Button variant="link" onClick={() => refetch()}>
//           Try again
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto w-full font-Robot">
//       <div className="flex justify-between items-center mb-8">
//         <Title title="Subscription Plan" />
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button
//               onClick={() => {
//                 resetForm();
//                 setIsDialogOpen(true);
//               }}
//               className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Add New Plan
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[600px]">
//             <DialogHeader>
//               <DialogTitle className="text-2xl font-bold font-DM-sans">
//                 {editingPlan ? "Edit Plan" : "Add New Plan"}
//               </DialogTitle>
//               <DialogDescription>
//                 {editingPlan
//                   ? "Update the plan details"
//                   : "Fill in the details for the new plan"}
//               </DialogDescription>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label htmlFor="name" className="text-right">
//                   Plan Name
//                 </label>
//                 <div className="col-span-3 space-y-1">
//                   <Input
//                     id="name"
//                     name="name"
//                     value={newPlan.name}
//                     onChange={handleInputChange}
//                     placeholder="e.g. Premium YEARLY"
//                     required
//                   />
//                   {validationErrors.name && (
//                     <p className="text-sm text-red-500">
//                       {validationErrors.name}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label htmlFor="description" className="text-right">
//                   Description
//                 </label>
//                 <Input
//                   id="description"
//                   name="description"
//                   value={newPlan.description}
//                   onChange={handleInputChange}
//                   className="col-span-3"
//                   placeholder="Plan description"
//                 />
//               </div>
//               {/* add 2 */}
//               {/* Plan Duration */}
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label htmlFor="plan_duration" className="text-right">
//                   Plan Duration
//                 </label>
//                 <div className="col-span-3">
//                   <Input
//                     id="plan_duration"
//                     name="plan_duration"
//                     value={newPlan.plan_duration}
//                     onChange={handleInputChange}
//                     placeholder="e.g. 1 Month, 1 Year, 2 Years"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Price ID */}
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label htmlFor="priceId" className="text-right">
//                   Price ID
//                 </label>
//                 <div className="col-span-3">
//                   <Input
//                     id="priceId"
//                     name="priceId"
//                     value={newPlan.priceId}
//                     onChange={handleInputChange}
//                     placeholder="e.g. price_1ABC123xyy"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label htmlFor="price" className="text-right">
//                   Price
//                 </label>
//                 <div className="col-span-3 space-y-1">
//                   <Input
//                     id="price"
//                     name="price"
//                     type="number"
//                     value={newPlan.price}
//                     onChange={handleInputChange}
//                     placeholder="e.g. 19.99"
//                     min="0"
//                     step="0.01"
//                     required
//                   />
//                   {validationErrors.price && (
//                     <p className="text-sm text-red-500">
//                       {validationErrors.price}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4 py-4">
//                 <label
//                   htmlFor="planType"
//                   className="text-sm font-medium text-gray-800 text-right"
//                 >
//                   Plan Type
//                 </label>
//                 <div className="col-span-3">
//                   <Select
//                     value={newPlan.planType}
//                     onValueChange={(value) =>
//                       setNewPlan((prev) => ({
//                         ...prev,
//                         planType: value as "YEARLY" | "TWO_YEARLY",
//                       }))
//                     }
//                   >
//                     <SelectTrigger id="planType" className="w-full">
//                       <SelectValue placeholder="Select plan type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="YEARLY">YEARLY</SelectItem>
//                       <SelectItem value="TWO_YEARLY"> TWO YEARLY</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-4 items-center gap-4 py-4">
//                 <label
//                   htmlFor="status"
//                   className="text-sm font-medium text-gray-700 text-right"
//                 >
//                   Status
//                 </label>
//                 <div className="col-span-3">
//                   <Select
//                     value={newPlan.status}
//                     onValueChange={(value) =>
//                       setNewPlan((prev) => ({
//                         ...prev,
//                         status: value as "ACTIVE" | "INACTIVE",
//                       }))
//                     }
//                   >
//                     <SelectTrigger id="status" className="w-full">
//                       <SelectValue placeholder="Select status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="ACTIVE">Active</SelectItem>
//                       <SelectItem value="INACTIVE">Inactive</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label htmlFor="isPopular" className="text-right">
//                   Popular Plan
//                 </label>
//                 <input
//                   id="isPopular"
//                   name="isPopular"
//                   type="checkbox"
//                   checked={newPlan.isPopular}
//                   onChange={handleCheckboxChange}
//                   className="col-span-3 h-4 w-4 cursor-pointer"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-start gap-4">
//                 <label htmlFor="features" className="text-right mt-2">
//                   Features
//                 </label>
//                 <div className="col-span-3 space-y-2">
//                   <div className="flex gap-2">
//                     <Input
//                       value={newFeature}
//                       onChange={(e) => setNewFeature(e.target.value)}
//                       placeholder="Add feature (e.g. 'Ad-free experience')"
//                       className="flex-1"
//                       onKeyPress={(e) => {
//                         if (e.key === "Enter") {
//                           e.preventDefault();
//                           addFeature();
//                         }
//                       }}
//                     />
//                     <Button
//                       className="cursor-pointer"
//                       type="button"
//                       onClick={addFeature}
//                       variant="outline"
//                       disabled={!newFeature.trim()}
//                     >
//                       <Plus className="h-4 w-4 cursor-pointer" />
//                     </Button>
//                   </div>
//                   <div className="border rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
//                     {newPlan.features.map((feature, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between bg-gray-50 p-2 rounded"
//                       >
//                         <span>{feature}</span>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => removeFeature(index)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <X className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ))}
//                     {newPlan.features.length === 0 && (
//                       <p className="text-sm text-gray-500 text-center py-2">
//                         No features added yet
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button
//                 className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
//                 variant="outline"
//                 onClick={() => {
//                   setIsDialogOpen(false);
//                   resetForm();
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="button"
//                 onClick={editingPlan ? handleUpdatePlan : handleAddPlan}
//                 className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
//                 disabled={
//                   !newPlan.name ||
//                   newPlan.price === "" ||
//                   Number(newPlan.price) <= 0 ||
//                   (editingPlan ? isUpdating : isCreating)
//                 }
//               >
//                 {editingPlan
//                   ? isUpdating
//                     ? "Updating..."
//                     : "Update Plan"
//                   : isCreating
//                   ? "Creating..."
//                   : "Add Plan"}
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="mb-12 rounded-lg border border-gray-200 bg-white shadow-sm ">
//         <div className="overflow-hidden">
//           <Table>
//             <TableHeader className="bg-gray-100 border-b border-gray-300 mt-2 rounded-t-md">
//               <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
//                 <TableHead className="w-[100px] px-4 py-5">Plan Name</TableHead>
//                 <TableHead className="px-4 py-5">Type</TableHead>
//                 <TableHead className="px-4 py-5">Price</TableHead>
//                 <TableHead className="px-4 py-5">Features</TableHead>
//                 <TableHead className="px-4 py-5">Plan Duration</TableHead>
//                 <TableHead className="px-4 py-5">Price ID</TableHead>
//                 <TableHead className="px-4 py-5">Status</TableHead>
//                 <TableHead className="px-4 py-5 text-right pl-10">
//                   Actions
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {plans.map((plan) => (
//                 <TableRow key={plan.id}>
//                   <TableCell className="font-medium">{plan.name}</TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={
//                         plan.planType === "YEARLY" ? "default" : "secondary"
//                       }
//                     >
//                       {plan.planType.toLowerCase()}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>eur {plan.price.toFixed(2)}</TableCell>
//                   <TableCell>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" className="h-8 px-2">
//                           {plan.features.length} features{" "}
//                           <ChevronDown className="ml-2 h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         {plan.features.map((feature, index) => (
//                           <DropdownMenuItem key={index} className="max-w-xs">
//                             {feature}
//                           </DropdownMenuItem>
//                         ))}
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                   <TableCell> {plan.plan_duration}</TableCell>
//                   <TableCell> {plan.priceId}</TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={plan.status === "ACTIVE" ? "default" : "outline"}
//                     >
//                       {plan.status.toLowerCase()}
//                     </Badge>
//                     {plan.isPopular && (
//                       <Badge className="ml-2 bg-green-100 text-green-800">
//                         Popular
//                       </Badge>
//                     )}
//                   </TableCell>
//                   <TableCell className="text-right p-4 pr-8">
//                     <div className="flex justify-end gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         title="Edit"
//                         className="text-blue-500 hover:bg-blue-100 cursor-pointer"
//                         onClick={() => openEditDialog(plan)}
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         title="Delete"
//                         className="text-red-500 hover:bg-red-100 cursor-pointer"
//                         onClick={() => handleDeletePlan(plan.id)}
//                         disabled={isDeletingPlan}
//                       >
//                         <Trash2 className="h-4 w-4 text-destructive" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-xl mb-4">Plans Preview</h2>
//         <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//           {plans.map((plan) => (
//             <Card
//               key={plan.id}
//               className={`relative eur {
//                 plan.isPopular ? "border-2 border-blue-600 shadow-lg" : ""
//               } transition-all hover:shadow-md`}
//             >
//               {plan.isPopular && (
//                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
//                   <Badge className="bg-blue-600 text-white px-3 py-1 rounded-full">
//                     Best Value
//                   </Badge>
//                 </div>
//               )}
//               <CardHeader>
//                 <CardTitle className="text-center">
//                   <div className="text-lg font-bold">{plan.name}</div>
//                   <div className="text-3xl font-bold mt-2">
//                     eur {plan.price.toFixed(2)}/{plan.planType.toLowerCase()}
//                   </div>
//                   <div className="text-lg font-sans text-gray-600 mt-2">
//                     {plan.plan_duration}
//                   </div>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ul className="space-y-3">
//                   {plan.features.map((feature, index) => (
//                     <li key={index} className="flex items-start">
//                       <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                       <span>{feature}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>
//               <CardFooter className="mt-2">
//                 <Button
//                   className={`w-full eur {
//                     plan.isPopular
//                       ? "bg-blue-600 hover:bg-blue-700"
//                       : "bg-gray-800 hover:bg-gray-900"
//                   }`}
//                 >
//                   {plan.isPopular ? "Get Started" : "Choose Plan"}
//                 </Button>
//               </CardFooter>
//             </Card>
//           ))}
//         </div>
//       </div>

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete the subscription plan. This action
//               cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel
//               className="cursor-pointer"
//               disabled={isDeletingPlan}
//             >
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={confirmDeletePlan}
//               disabled={isDeletingPlan}
//               className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive cursor-pointer"
//             >
//               {isDeletingPlan ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 "Delete Plan"
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }
