"use client";

import Title from "@/components/reuseabelComponents/Title";
import Wrapper from "@/components/wrapper/wrapper";
import ProtectPurchases from "@/components/AdminPage/VacanzaProtect/ProtectPurchases";
import ProtectPlanSettings from "@/components/AdminPage/VacanzaProtect/ProtectPlanSettings";
import ProtectSummaryCards from "@/components/AdminPage/VacanzaProtect/ProtectSummaryCards";
import { useGetProtectPurchasesQuery } from "@/redux/features/auth/vacanzaProtectApi";

const VacanzaProtectPage = () => {
  const { data } = useGetProtectPurchasesQuery();

  return (
    <Wrapper>
      <div className="space-y-[28px]">
        <div>
          <Title title="Vacanza Protect" />
          <p className="mt-1 text-sm text-gray-500">
            Everyone who bought home cover, from the landing page or the
            dashboard.
          </p>
        </div>

        <ProtectSummaryCards summary={data?.summary} />

        <ProtectPurchases />

        <div>
          <Title title="Plan pricing" />
          <p className="mt-1 mb-4 text-sm text-gray-500">
            These prices are used by the landing page, the dashboard widget and
            Stripe checkout.
          </p>
          <ProtectPlanSettings />
        </div>
      </div>
    </Wrapper>
  );
};

export default VacanzaProtectPage;
