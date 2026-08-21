"use client";

import { FaCircleDollarToSlot } from "react-icons/fa6";
import { MdOutlineCalendarMonth, MdOutlineFlight } from "react-icons/md";
import { FiShield } from "react-icons/fi";
import { ProtectSummary } from "@/redux/types/protect.type";

const bgColors = ["#E0F7FA", "#E8F5E9", "#FFF3E0", "#F3E5F5"];
const colors = ["#00ACC1", "#43A047", "#FB8C00", "#8E24AA"];

const ProtectSummaryCards = ({ summary }: { summary?: ProtectSummary }) => {
  const cards = [
    {
      title: "Protect Revenue",
      value: `€${(summary?.totalRevenue ?? 0).toFixed(2)}`,
      note: `${summary?.totalPurchases ?? 0} checkouts started`,
      icon: <FaCircleDollarToSlot />,
    },
    {
      title: "Active Covers",
      value: `${summary?.activeCovers ?? 0}`,
      note: "paid and active",
      icon: <FiShield />,
    },
    {
      title: "Annual Home Cover",
      value: `${summary?.yearlyCovers ?? 0}`,
      note: "properties covered for 12 months",
      icon: <MdOutlineCalendarMonth />,
    },
    {
      title: "Single Trip Cover",
      value: `${summary?.perTripCovers ?? 0}`,
      note: "one-off travel covers",
      icon: <MdOutlineFlight />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="w-full p-5 sm:p-6 bg-white rounded-[16px] border border-[#E0E0E0] flex flex-col gap-4 shadow-sm"
        >
          <div className="flex items-center justify-start gap-4">
            <div
              className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center border border-[#C7CACF]"
              style={{ backgroundColor: bgColors[index] }}
            >
              <span className="text-xl" style={{ color: colors[index] }}>
                {card.icon}
              </span>
            </div>
            <h2 className="text-[#484848] text-[16px] font-normal">
              {card.title}
            </h2>
          </div>

          <div>
            <p className="text-2xl md:text-3xl font-semibold tracking-[-0.68px]">
              {card.value}
            </p>
            <p className="text-sm text-[#666666] mt-1">{card.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProtectSummaryCards;
