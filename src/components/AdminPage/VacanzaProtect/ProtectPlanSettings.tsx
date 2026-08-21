"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useGetProtectPlansQuery,
  useUpdateProtectPlanMutation,
} from "@/redux/features/auth/vacanzaProtectApi";
import { ProtectPlan } from "@/redux/types/protect.type";

const PLAN_LABEL: Record<string, string> = {
  YEARLY: "Annual home cover",
  PER_TRIP: "Single trip cover",
};

/**
 * Lets the admin change what Vacanza Protect costs without a deploy. Leaving the
 * Stripe price id empty makes the checkout build the price from the amount below.
 */
const ProtectPlanCard = ({ plan }: { plan: ProtectPlan }) => {
  const [price, setPrice] = React.useState(String(plan.price));
  const [coverAmount, setCoverAmount] = React.useState(String(plan.coverAmount));
  const [priceId, setPriceId] = React.useState(plan.priceId ?? "");
  const [updatePlan, { isLoading }] = useUpdateProtectPlanMutation();

  const handleSave = async () => {
    const parsedPrice = Number(price);
    const parsedCover = Number(coverAmount);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid price");
      return;
    }

    try {
      await updatePlan({
        id: plan.id,
        data: {
          price: parsedPrice,
          coverAmount: Number.isNaN(parsedCover) ? 0 : parsedCover,
          priceId: priceId.trim(),
        },
      }).unwrap();
      toast.success(`${PLAN_LABEL[plan.type]} updated`);
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        "Could not update the plan";
      toast.error(message);
    }
  };

  return (
    <div className="rounded-[16px] border border-[#E0E0E0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {PLAN_LABEL[plan.type] ?? plan.type}
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            plan.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {plan.isActive ? "On sale" : "Hidden"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm text-gray-600">
          Price ({plan.currency})
          <input
            type="number"
            min={0}
            step="0.5"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#3174CD]"
          />
        </label>

        <label className="text-sm text-gray-600">
          Cover limit ({plan.currency})
          <input
            type="number"
            min={0}
            step="100"
            value={coverAmount}
            onChange={(e) => setCoverAmount(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#3174CD]"
          />
        </label>
      </div>

      <label className="mt-3 block text-sm text-gray-600">
        Stripe price id (optional)
        <input
          type="text"
          value={priceId}
          onChange={(e) => setPriceId(e.target.value)}
          placeholder="price_..."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#3174CD]"
        />
      </label>

      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="mt-4 w-full cursor-pointer bg-[#3174CD] text-white hover:bg-[#25569E]"
      >
        {isLoading ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
};

const ProtectPlanSettings = () => {
  const { data: plans, isLoading } = useGetProtectPlansQuery();

  if (isLoading || !plans?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {plans.map((plan) => (
        <ProtectPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
};

export default ProtectPlanSettings;
