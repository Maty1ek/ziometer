"use client";

import React from "react";

// Single purple-bordered name input — matches the second folder's design.
const FigureInput = ({ personName, setPersonName }) => {
  return (
    <div className="flex w-full flex-col items-center gap-[14px] mt-[30px]">
      <input
        type="text"
        placeholder="Enter the person's name"
        value={personName || ""}
        onChange={(e) => setPersonName(e.target.value)}
        className="w-full rounded-[14px] border-[2px] border-[#c000ff] bg-white px-[16px] py-[12px] text-[16px] font-medium text-[#2a2a2a] shadow-[0_2px_12px_rgba(0,0,0,0.12)] outline-none placeholder-[#aaa] focus:border-[#9000cc] focus:shadow-[0_2px_16px_rgba(192,0,255,0.15)] transition-all"
      />
    </div>
  );
};

export default FigureInput;
