"use client";

import OnboardingAmenities from "@/components/AdminPage/OnboardingAmenities/OnboardingAmenities";
// import OnboardingSurroundings from "@/components/AdminPage/OnboardingAmenities/OnboardingSurroundings";
import OnboardingTransports from "@/components/AdminPage/OnboardingAmenities/OnboardingTransports";

const OnboardingAmenitiesPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <OnboardingAmenities />
      </div>
      <div>
        <OnboardingTransports />
      </div>
      {/* <div>
        <OnboardingSurroundings />
      </div> */}
    </div>
  );
};

export default OnboardingAmenitiesPage;
