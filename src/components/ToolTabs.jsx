"use client";

import React from "react";

// Segmented control that switches between the two AI tools under the shared
// GREAT NOTICING heading. Styled as a glass pill to match the header buttons.
const TOOLS = [
  { key: "noticing", label: "Life Impact" },
  { key: "figures", label: "Public Figure" },
];

const ToolTabs = ({ activeTool, onChange }) => {
  return (
    <div className="mt-[26px] w-full flex p-[5px] rounded-[30px] bg-[#ffffff2e] backdrop-blur-[4px]">
      {TOOLS.map((tool) => {
        const active = activeTool === tool.key;
        return (
          <button
            key={tool.key}
            type="button"
            onClick={() => onChange(tool.key)}
            aria-pressed={active}
            className={`flex-1 h-[44px] rounded-[26px] text-[16px] font-black tracking-[0.04em] uppercase transition-all ${
              active
                ? "bg-white text-[#243344] shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
                : "text-[#ffffffcc] hover:text-white"
            }`}
          >
            {tool.label}
          </button>
        );
      })}
    </div>
  );
};

export default ToolTabs;
