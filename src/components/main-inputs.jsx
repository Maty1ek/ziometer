"use client";

import React from "react";
import { X } from "lucide-react";

const MainInputs = ({ countries, setCountries }) => {
  // Add a new empty row
  const addCountryRow = () => {
    setCountries((prev) => [...prev, { country: "", years: "" }]);
  };

  // Update a specific field in a specific row
  const updateRow = (index, field, value) => {
    setCountries((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Remove a row (never allow the last row to be removed)
  const removeRow = (index) => {
    if (countries.length === 1) return; // keep at least one row
    setCountries((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="main_input_con mb-[10px] py-[16px] px-[20px] mt-[30px] w-full bg-[#fafafa3a] rounded-[15px]">
      <div className="text-[#414141]">
        <h1 className="font-extrabold text-[24px]">Countries and Years</h1>
        <p className="mt-[5px] ml-[1px] text-[15px]">
          Enter the countries you've lived in and the number of years you
          resided in each.
        </p>
      </div>

      <div className="flex flex-col justify-center">
        {/* Header */}
        <div className="flex mt-[25px]">
          <div className="w-[45%] font-bold text-[18px] text-[#414141]">
            <h3>Countries</h3>
          </div>
          <div className="w-[45%] font-bold text-[18px] text-[#414141]">
            <h3>Years</h3>
          </div>
          <div className="w-[10%]"></div>
        </div>

        {/* Dynamic rows */}
        {countries.map((row, index) => (
          <div key={index} className="flex items-center my-[10px]">
            {/* Country input */}
            <div className="w-[45%]">
              <input
                type="text"
                placeholder="Country"
                value={row.country}
                onChange={(e) => updateRow(index, "country", e.target.value)}
                className="bg-white p-[5px] w-full max-w-[120px] h-[23px] rounded-[5px] outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Years input */}
            <div className="w-[45%]">
              <input
                type="text"
                placeholder="Years"
                value={row.years}
                onChange={(e) => updateRow(index, "years", e.target.value)}
                className="bg-white p-[5px] w-full max-w-[120px] h-[23px] rounded-[5px] outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Delete button (X) */}
            <div className="w-[10%] flex justify-center">
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={countries.length === 1}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Remove row"
              >
                <X size={16} className="text-[#2a2a2a]" />
              </button>
            </div>
          </div>
        ))}

        {/* Add button */}
        <button
          onClick={addCountryRow}
          className="bg-[#fff] rounded-[6px] h-[30px] w-[135px] font-bold text-[15px] mt-[20px] hover:bg-gray-100 transition-colors"
        >
          Add country +
        </button>
      </div>
    </div>
  );
};

export default MainInputs;