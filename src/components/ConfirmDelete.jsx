import React from "react";

const ConfirmDelete = ({ onAccDelete, onClose }) => {
  return (
    <div className="flex flex-col gap-6 fixed inset-0 bg-[#c7c7c723] backdrop-blur-[3px] bg-opacity-80 items-center justify-center p-[20px] z-50">
      <div className="bg-white rounded-[15px] max-w-[350px] w-full p-[20px] space-y-[15px] text-[#414141] flex flex-col items-center">
        <h1 className="font-black text-[24px] mb-[24px] text-[#0f0f0f]">
          Are you sure dude?
        </h1>
        <button
          onClick={onAccDelete}
          className="mt-[5px] text-[#fff] text-[20px] font-bold w-[300px] rounded-[14px] bg-[#ff5555] h-[40px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete account
        </button>
        <button className="w-full text-[#414141] text-[15px] underline hover:text-black mt-2" onClick={() => onClose()}>Cancel</button>

      </div>
    </div>
  );
};

export default ConfirmDelete;
