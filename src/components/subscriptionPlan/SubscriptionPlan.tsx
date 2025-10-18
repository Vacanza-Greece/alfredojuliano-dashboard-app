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
    is_populer: false,
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
      is_populer: false,
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
      is_populer: plan.is_populer || false,
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center cursor-pointer"
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
                  className={`flex items-center gap-2 rounded-none border-b-2 cursor-pointer ${
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
                      className=" cursor-pointer"
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
                            className="text-red-500 hover:text-red-700 cursor-pointer"
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
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className=" cursor-pointer" value="ACTIVE">
                        Active
                      </SelectItem>
                      <SelectItem className=" cursor-pointer" value="INACTIVE">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Popular */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Popular Plan</label>
                  <div className="col-span-3 flex items-center">
                    <input
                      type="checkbox"
                      name="is_populer"
                      checked={newPlan.is_populer}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
                className=" cursor-pointer"
                variant="outline"
                onClick={() => (setIsDialogOpen(false), resetForm())}
              >
                Cancel
              </Button>
              <Button
                onClick={editingPlan ? handleUpdatePlan : handleAddPlan}
                className=" cursor-pointer"
              >
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
              <TableHead className="py-4 text-base">
                Plan Name (EN/EL)
              </TableHead>
              <TableHead className="py-4 text-base">Type</TableHead>
              <TableHead className="py-4 text-base">Price</TableHead>
              <TableHead className="py-4 text-base">Features</TableHead>
              <TableHead className="py-4 text-base">Duration</TableHead>
              <TableHead className="py-4 text-base">Price ID</TableHead>
              <TableHead className="py-4 text-base">Status</TableHead>
              <TableHead className="py-4 text-base">Actions</TableHead>
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
                    {plan.is_populer && (
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        Popular
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        className=" cursor-pointer"
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
                        className="text-red-600 hover:text-red-700 cursor-pointer"
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
            <AlertDialogCancel
              disabled={isDeletingPlan}
              className=" cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              disabled={isDeletingPlan}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
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
