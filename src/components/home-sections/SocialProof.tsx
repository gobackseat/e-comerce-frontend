"use client";
import { Award, ShieldCheck, Truck } from "lucide-react";
import React from "react";
import { socialProofIcons } from "./constants";

const iconMap = {
  ShieldCheck: ShieldCheck,
  Truck: Truck,
  Award: Award,
};

const SocialProof = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
      {socialProofIcons.map((item, index) => {
        const Icon = iconMap[item.icon];
        return (
          <div key={index} className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-green-500" />
            <p className="text-sm text-gray-600">{item.text}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SocialProof; 