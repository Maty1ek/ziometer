import React from 'react'

const MainInputs = () => {
  return (
    <div className="main_input_con py-[22px] px-[20px] mt-[30px] w-full bg-[#fafafa3a] rounded-[15px]">
            <div className=" text-[#414141]">
              <h1 className="font-extrabold text-[24px]">
                Countries and Years
              </h1>
              <p className="mt-[5px] ml-[1px] text-[15px]">
                Enter the countries you've lived in and the number of years you
                resided in each.
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex mt-[25px]">
                <div className="w-[50%] font-bold text-[18px] text-[#414141]">
                  <h3>Countries</h3>
                </div>
                <div className="w-[50%] font-bold text-[18px] text-[#414141]">
                  <h3>Years</h3>
                </div>
              </div>

              <div className="flex my-[10px]">
                <div className="w-[50%]">
                  <input
                    type="text"
                    className="bg-white w-[120px] h-[23px] rounded-[5px]"
                  />
                </div>
                <div className="w-[50%]">
                  <input
                    type="text"
                    className="bg-white w-[120px] h-[23px] rounded-[5px]"
                  />
                </div>
              </div>

              <button className="bg-[#fff] rounded-[6px] h-[30px] w-[135px] font-bold text-[15px] mt-[20px]">
                Add country +
              </button>
            </div>
          </div>
  )
}

export default MainInputs