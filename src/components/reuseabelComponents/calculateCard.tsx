"use client";

import {
  FaArrowUp,
  FaCircleDollarToSlot,
  FaRegCircleCheck,
} from "react-icons/fa6";
import { useGetPaymentsQuery } from "@/redux/features/auth/paymentApi";
import { useGetPlansQuery } from "@/redux/features/auth/planApi";
import { useGetUsersQuery } from "@/redux/features/auth/userApi";
import { FaFileInvoiceDollar, FaUsers } from "react-icons/fa";
import { VscLayersActive } from "react-icons/vsc";

const CalculateCard = () => {
  const { data: users } = useGetUsersQuery(undefined);
  const { data: plans } = useGetPlansQuery(undefined);
  const { data: payments } = useGetPaymentsQuery();

  const userCount = users?.length ?? 0;
  const planCount = plans?.length ?? 0;
  const paymentCount = payments?.length ?? 0;

  const getLast30DaysData = <T extends { createdAt?: string }>(
    data: T[] | undefined
  ) => {
    if (!data) return [];
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    return data.filter((item) => {
      const createdDate = item.createdAt ? new Date(item.createdAt) : null;
      return createdDate && createdDate >= thirtyDaysAgo && createdDate <= now;
    });
  };

  const paymentsLast30 = getLast30DaysData(payments);
  const usersLast30 = getLast30DaysData(users);
  const plansLast30 = getLast30DaysData(plans);

  const totalRevenueAll =
    payments?.reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;
  const totalRevenue30 =
    paymentsLast30?.reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;

  const getChange = (current: number, total: number): string => {
    if (total === 0) return "No data";
    const previous = total - current;
    if (previous === 0) return current > 0 ? "100% increase" : "No change";
    const diffPercent = ((current - previous) / previous) * 100;
    const isIncrease = diffPercent > 0;
    const formattedPercent = Math.abs(diffPercent).toFixed(1);
    return isIncrease ? `↑ ${formattedPercent}%` : `↓ ${formattedPercent}%`;
  };

  const avgRevenueAll = userCount ? totalRevenueAll / userCount : 0;
  const avgRevenueRecent = usersLast30.length
    ? totalRevenue30 / usersLast30.length
    : 0;

  const statusData = [
    {
      title: "Total Revenue",
      amount: `$${totalRevenueAll.toFixed(2)} USD`,
      change: getChange(totalRevenue30, totalRevenueAll),
      unit: `(${paymentCount} transactions)`,
      icon: <FaCircleDollarToSlot />,
    },
    {
      title: "Registered Users",
      amount: `${userCount} total`,
      change: getChange(usersLast30.length, userCount),
      unit: `${usersLast30.length} new`,
      icon: <FaUsers />,
    },
    {
      title: "Active Courses",
      amount: `${planCount} courses`,
      change: getChange(plansLast30.length, planCount),
      unit: `${plansLast30.length} added`,
      icon: <VscLayersActive />,
    },
    {
      title: "Avg. Revenue",
      amount: `$${avgRevenueAll.toFixed(2)}`,
      change: getChange(avgRevenueRecent, avgRevenueAll),
      unit: "per recent user",
      icon: <FaFileInvoiceDollar />,
    },
  ];

  const bgColors = ["#E0F7FA", "#FFF3E0", "#E8F5E9", "#F3E5F5"];
  const colors = ["#00ACC1", "#FB8C00", "#43A047", "#8E24AA"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 place-items-start w-full">
      {statusData.map((single, index) => {
        const isNegative =
          single.change.includes("↓") || single.change.includes("-");
        const isNeutral = index === 3;

        const iconElement = isNeutral ? (
          <FaRegCircleCheck style={{ color: "#6B7280" }} />
        ) : (
          <FaArrowUp
            style={{
              color: isNegative ? "#E35A5F" : "#12CC1E",
              transform: isNegative ? "rotate(180deg)" : "none",
            }}
          />
        );

        const cleanChangeText = single.change.replace(/[↓↑]/g, "").trim();
        const changeColor = isNeutral
          ? "#6B7280"
          : isNegative
          ? "#E35A5F"
          : "#12CC1E";

        return (
          <div
            key={single.title}
            className="w-full h-[187px] p-5 sm:p-6 bg-white rounded-[16px] border border-[#E0E0E0] flex flex-col justify-between mx-auto shadow-sm"
          >
            {/* Top Row */}
            <div className="flex items-center justify-start gap-5">
              <div
                className="w-[48px] h-[48px] rounded-[12px] p-[12px] flex items-center justify-center border border-[#C7CACF]"
                style={{ backgroundColor: bgColors[index] }}
              >
                <div
                  key={index}
                  className="w-6 h-6 ml-1 mt-2"
                  style={{ color: colors[index] }}
                >
                  {single.icon}
                </div>
              </div>
              <h1 className="text-[#484848] text-[18px] leading-[160%] font-[400] font-poppins">
                {single.title}
              </h1>
            </div>

            {/* Centered Amount */}
            <div className="flex-1 flex flex-col items-start justify-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold font-Robot tracking-[-0.68px]">
                {single.amount}
              </h2>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-start gap-1 text-sm font-Robot">
              {iconElement}
              <span style={{ color: changeColor }}>{cleanChangeText}</span>
              <span className="text-[#666666]">{single.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalculateCard;

// "use client";

// import { useGetPaymentsQuery } from "@/redux/features/auth/paymentApi";
// import { useGetPlansQuery } from "@/redux/features/auth/planApi";
// import { useGetUsersQuery } from "@/redux/features/auth/userApi";

// const CalculateCard = () => {
//   const { data: users } = useGetUsersQuery(undefined);
//   const { data: plans } = useGetPlansQuery(undefined);
//   const { data: payments } = useGetPaymentsQuery();

//   const userCount = users?.length ?? 0;
//   const planCount = plans?.length ?? 0;
//   const paymentCount = payments?.length ?? 0;

//   // Filter data created in last 30 days
//   const getLast30DaysData = <T extends { createdAt?: string }>(
//     data: T[] | undefined
//   ) => {
//     if (!data) return [];
//     const now = new Date();
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(now.getDate() - 30);
//     return data.filter((item) => {
//       const createdDate = item.createdAt ? new Date(item.createdAt) : null;
//       return createdDate && createdDate >= thirtyDaysAgo && createdDate <= now;
//     });
//   };

//   const paymentsLast30 = getLast30DaysData(payments);
//   const usersLast30 = getLast30DaysData(users);
//   const plansLast30 = getLast30DaysData(plans);

//   const totalRevenueAll =
//     payments?.reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;
//   const totalRevenue30 =
//     paymentsLast30?.reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;

//   // Percentage change between current period and previous period
//   // Here current = last 30 days, total = all time, so previous = total - current
//   // Return a formatted string with "increase" or "decrease"
//   const getChange = (current: number, total: number): string => {
//     if (total === 0) return "No data";
//     const previous = total - current;

//     // Avoid division by zero or nonsensical values
//     if (previous === 0) return current > 0 ? "100% increase" : "No change";

//     const diffPercent = ((current - previous) / previous) * 100;
//     const isIncrease = diffPercent > 0;
//     const formattedPercent = Math.abs(diffPercent).toFixed(1);

//     return isIncrease
//       ? `+${formattedPercent}% increase`
//       : `-${formattedPercent}% decrease`;
//   };

//   // Average revenue per user all time and recent users
//   const avgRevenueAll = userCount ? totalRevenueAll / userCount : 0;
//   const avgRevenueRecent = usersLast30.length
//     ? totalRevenue30 / usersLast30.length
//     : 0;

//   const statusData = [
//     {
//       title: "Total Revenue",
//       amount: `$${totalRevenueAll.toFixed(2)} USD`,
//       change: getChange(totalRevenue30, totalRevenueAll),
//       unit: `(${paymentCount} transactions total)`,
//     },
//     {
//       title: "Registered Users",
//       amount: `${userCount} total`,
//       change: getChange(usersLast30.length, userCount),
//       unit: `${usersLast30.length} new this month`,
//     },
//     {
//       title: "Active Courses",
//       amount: `${planCount} courses`,
//       change: getChange(plansLast30.length, planCount),
//       unit: `${plansLast30.length} added recently`,
//     },
//     {
//       title: "Avg. Revenue",
//       amount: `$${avgRevenueAll.toFixed(2)}`,
//       change: getChange(avgRevenueRecent, avgRevenueAll),
//       unit: "based on recent activity",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//       {statusData.map((single) => (
//         <div
//           key={single.title}
//           className="p-5 sm:p-7 bg-white rounded-2xl shadow-md flex flex-col justify-between "
//         >
//           <div className="flex items-center justify-between mb-2">
//             <h1 className="text-base sm:text-lg text-[#484848] font-Robot">
//               {single.title}
//             </h1>
//           </div>
//           <div className="space-y-1">
//             <h2 className="text-xl sm:text-3xl font-semibold text-[var(--color-accent)] font-Robot tracking-[-0.68px]">
//               {single.amount}
//             </h2>
//             <p className="text-sm text-[var(--color-textRed)] font-Robot">
//               {single.change} {single.unit}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CalculateCard;
