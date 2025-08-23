"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUserCheck } from "react-icons/fa6";
import { TbLogout } from "react-icons/tb";
import profile from "../../../assets/images/profile.png";
import { useAppDispatch } from "@/redux/hooks/redux-hook";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import cookies from "js-cookie";
import { logOut } from "@/redux/features/auth/authSlice";

const AdminNavBar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    cookies.remove("token");
    dispatch(logOut());
    toast.success("Admin Logged out successfully!");
    router.push("/");
  };

  return (
    <div className="w-full px-4 md:px-10 py-4 mx-auto h-full bg-[#3174CD] pt-2">
      <div className="w-full mt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          {/* Notification & Profile */}
          <div className="flex items-center justify-center gap-4 relative ml-auto">
            <div
              className="h-10 w-10 rounded-full overflow-hidden cursor-pointer"
              onClick={toggleDropdown}
            >
              <Image src={profile} alt="Profile" height={40} width={40} />
            </div>
            {isDropdownOpen && (
              <div className="absolute top-14 right-0 w-56 bg-white border  shadow-lg rounded-md z-50 py-2 transition-all duration-200 ease-in-out">
                <Link
                  href="/admin/admin-profile"
                  className="flex items-center gap-3 px-5 py-2 text-sm text-[#1A4A9B] hover:bg-[#F0F8FF] transition-colors duration-150"
                >
                  <FaUserCheck className="text-[#1A4A9B] text-lg" />
                  <span>Profile</span>
                </Link>

                <Link
                  onClick={() => {
                    handleLogout();
                  }}
                  href="#"
                  className="flex items-center gap-3 px-5 py-2 text-sm text-[#1A4A9B] hover:bg-[#F0F8FF] transition-colors duration-150"
                >
                  <TbLogout className="text-red-500 text-lg" />
                  <span>Log Out</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavBar;
