"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Loader2,
  Plus,
  X,
  Trash2,
  Check,
  ChevronDown,
  Edit,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} from "@/redux/features/auth/planApi";
import { toast } from "sonner";
import { Plan, PlanFormData } from "@/redux/types/venue.type";

import PageLoader from "../AdminPage/Shared/PageLoader";
import Title from "../reuseabelComponents/Title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

// Extended type for form state that allows empty price string
type PlanFormState = Omit<PlanFormData, "price"> & {
  price: number | "";
};

export default function SubscriptionPlanControl() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newFeature, setNewFeature] = useState("");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  // RTK Query hooks
  const { data: plans = [], isLoading, isError, refetch } = useGetPlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();

  const [newPlan, setNewPlan] = useState<PlanFormState>({
    name: "",
    description: "",
    price: "", // Initialize as empty string
    features: [],
    planType: "MONTHLY",
    status: "ACTIVE",
    isPopular: false,
  });

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    price: "",
  });

  const validateForm = useCallback(() => {
    const errors = {
      name: "",
      price: "",
    };
    let isValid = true;

    if (!newPlan.name.trim()) {
      errors.name = "Plan name is required";
      isValid = false;
    }

    if (newPlan.price === "" || Number(newPlan.price) <= 0) {
      errors.price = "Price must be greater than 0";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [newPlan.name, newPlan.price]);

  const resetForm = useCallback(() => {
    setNewPlan({
      name: "",
      description: "",
      price: "", // Reset to empty string
      features: [],
      planType: "MONTHLY",
      status: "ACTIVE",
      isPopular: false,
    });
    setEditingPlan(null);
    setNewFeature("");
    setValidationErrors({
      name: "",
      price: "",
    });
  }, []);

  const handleAddPlan = useCallback(async () => {
    if (!validateForm()) return;

    try {
      // Convert form data to API payload
      const planPayload: PlanFormData = {
        ...newPlan,
        price: Number(newPlan.price), // Convert to number
        features: newPlan.features.filter((f) => f.trim() !== ""),
      };

      await createPlan(planPayload).unwrap();
      toast.success("Plan created successfully");
      resetForm();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Error creating plan:", err);
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Failed to create plan. Please try again."
      );
    }
  }, [createPlan, newPlan, validateForm, resetForm]);

  const handleUpdatePlan = useCallback(async () => {
    if (!editingPlan || !validateForm()) return;

    try {
      const fullPayload: PlanFormData = {
        name: newPlan.name,
        description: newPlan.description,
        price: Number(newPlan.price),
        features: newPlan.features.filter((f) => f.trim() !== ""),
        planType: newPlan.planType,
        status: newPlan.status,
        // remove isPopular if backend doesn't support it
      };

      await updatePlan({ id: editingPlan.id, data: fullPayload }).unwrap();

      toast.success("Plan updated successfully");
      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Update error:", err);
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Failed to update plan. Please try again."
      );
    }
  }, [editingPlan, newPlan, updatePlan, validateForm, resetForm]);

  // const handleUpdatePlan = useCallback(async () => {
  //   if (!editingPlan || !validateForm()) return;

  //   try {
  //     const updateData: Partial<PlanFormData> = {};

  //     if (newPlan.name !== editingPlan.name) updateData.name = newPlan.name;
  //     if (newPlan.description !== editingPlan.description)
  //       updateData.description = newPlan.description;
  //     if (Number(newPlan.price) !== editingPlan.price)
  //       updateData.price = Number(newPlan.price);
  //     if (
  //       JSON.stringify(newPlan.features) !==
  //       JSON.stringify(editingPlan.features)
  //     ) {
  //       updateData.features = newPlan.features.filter((f) => f.trim() !== "");
  //     }
  //     if (newPlan.planType !== editingPlan.planType)
  //       updateData.planType = newPlan.planType;
  //     if (newPlan.status !== editingPlan.status)
  //       updateData.status = newPlan.status;
  //     if (newPlan.isPopular !== editingPlan.isPopular)
  //       updateData.isPopular = newPlan.isPopular;

  //     await updatePlan({
  //       id: editingPlan.id,
  //       data: updateData,
  //     }).unwrap();

  //     toast.success("Plan updated successfully");
  //     setIsDialogOpen(false);
  //     resetForm();
  //   } catch (error: unknown) {
  //     const err = error as ApiError;
  //     console.error("Update error:", err);
  //     toast.error(
  //       err?.data?.message ||
  //         err?.message ||
  //         "Failed to update plan. Please try again."
  //     );
  //   }
  // }, [editingPlan, newPlan, updatePlan, validateForm, resetForm]);

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      // Special handling for price input
      if (name === "price") {
        setNewPlan((prev) => ({
          ...prev,
          // Allow empty string or numeric values
          [name]: value === "" ? "" : Number(value),
        }));
      } else {
        setNewPlan((prev) => ({ ...prev, [name]: value }));
      }

      // Clear validation error if present
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

  const addFeature = useCallback(() => {
    if (newFeature.trim()) {
      setNewPlan((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  }, [newFeature]);

  const removeFeature = useCallback((index: number) => {
    setNewPlan((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }, []);

  const openEditDialog = useCallback((plan: Plan) => {
    setEditingPlan(plan);
    setNewPlan({
      name: plan.name,
      description: plan.description || "",
      price: plan.price, // This will be a number from the API
      features: [...plan.features],
      planType: plan.planType,
      status: plan.status,
      isPopular: plan.isPopular || false,
    });
    setIsDialogOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <PageLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading plans.{" "}
        <Button variant="link" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full font-Robot">
      <div className="flex justify-between items-center mb-8">
        <Title title="Subscription Plan" />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-DM-sans">
                {editingPlan ? "Edit Plan" : "Add New Plan"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? "Update the plan details"
                  : "Fill in the details for the new plan"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Plan Name
                </label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="name"
                    name="name"
                    value={newPlan.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Premium Monthly"
                    required
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-500">
                      {validationErrors.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">
                  Description
                </label>
                <Input
                  id="description"
                  name="description"
                  value={newPlan.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Plan description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="price" className="text-right">
                  Price
                </label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={newPlan.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 19.99"
                    min="0"
                    step="0.01"
                    required
                  />
                  {validationErrors.price && (
                    <p className="text-sm text-red-500">
                      {validationErrors.price}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 py-4">
                <label
                  htmlFor="planType"
                  className="text-sm font-medium text-gray-800 text-right"
                >
                  Plan Type
                </label>
                <div className="col-span-3">
                  <Select
                    value={newPlan.planType}
                    onValueChange={(value) =>
                      setNewPlan((prev) => ({
                        ...prev,
                        planType: value as "MONTHLY" | "YEARLY",
                      }))
                    }
                  >
                    <SelectTrigger id="planType" className="w-full">
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4 py-4">
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700 text-right"
                >
                  Status
                </label>
                <div className="col-span-3">
                  <Select
                    value={newPlan.status}
                    onValueChange={(value) =>
                      setNewPlan((prev) => ({
                        ...prev,
                        status: value as "ACTIVE" | "INACTIVE",
                      }))
                    }
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="isPopular" className="text-right">
                  Popular Plan
                </label>
                <input
                  id="isPopular"
                  name="isPopular"
                  type="checkbox"
                  checked={newPlan.isPopular}
                  onChange={handleCheckboxChange}
                  className="col-span-3 h-4 w-4 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="features" className="text-right mt-2">
                  Features
                </label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add feature (e.g. 'Ad-free experience')"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                    />
                    <Button
                      className="cursor-pointer"
                      type="button"
                      onClick={addFeature}
                      variant="outline"
                      disabled={!newFeature.trim()}
                    >
                      <Plus className="h-4 w-4 cursor-pointer" />
                    </Button>
                  </div>
                  <div className="border rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
                    {newPlan.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span>{feature}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {newPlan.features.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No features added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={editingPlan ? handleUpdatePlan : handleAddPlan}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                disabled={
                  !newPlan.name ||
                  newPlan.price === "" ||
                  Number(newPlan.price) <= 0 ||
                  (editingPlan ? isUpdating : isCreating)
                }
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

      <div className="mb-12 rounded-lg border border-gray-200 bg-white shadow-sm ">
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100 border-b border-gray-300 mt-2 rounded-t-md">
              <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
                <TableHead className="w-[100px] px-4 py-5">Plan Name</TableHead>
                <TableHead className="px-4 py-5">Type</TableHead>
                <TableHead className="px-4 py-5">Price</TableHead>
                <TableHead className="px-4 py-5">Features</TableHead>
                <TableHead className="px-4 py-5">Status</TableHead>
                <TableHead className="px-4 py-5 text-right pl-10">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        plan.planType === "MONTHLY" ? "default" : "secondary"
                      }
                    >
                      {plan.planType.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>eur {plan.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 px-2">
                          {plan.features.length} features{" "}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {plan.features.map((feature, index) => (
                          <DropdownMenuItem key={index} className="max-w-xs">
                            {feature}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                  <TableCell className="text-right p-4 pr-8">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Edit"
                        className="text-blue-500 hover:bg-blue-100 cursor-pointer"
                        onClick={() => openEditDialog(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Delete"
                        className="text-red-500 hover:bg-red-100 cursor-pointer"
                        onClick={() => handleDeletePlan(plan.id)}
                        disabled={isDeletingPlan}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="text-xl mb-4">Plans Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative eur {
                plan.isPopular ? "border-2 border-blue-600 shadow-lg" : ""
              } transition-all hover:shadow-md`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1 rounded-full">
                    Best Value
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-xl font-bold">{plan.name}</div>
                  <div className="text-3xl font-bold mt-2">
                    eur {plan.price.toFixed(2)}/{plan.planType.toLowerCase()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {/* <CardFooter className="mt-2">
                <Button
                  className={`w-full eur {
                    plan.isPopular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-800 hover:bg-gray-900"
                  }`}
                >
                  {plan.isPopular ? "Get Started" : "Choose Plan"}
                </Button>
              </CardFooter> */}
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription plan. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              disabled={isDeletingPlan}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              disabled={isDeletingPlan}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive cursor-pointer"
            >
              {isDeletingPlan ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Plan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
