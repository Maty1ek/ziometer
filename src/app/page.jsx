import Image from "next/image";
import bgCircles from "../../public/bg_circles.svg";
import { CircleUserRound, Menu } from "lucide-react";

export default function Home() {
  return (
    <div className="overflow-hidden">
      <div className="flex flex-col justify-center pt-[18px] items-center   relative">
        <div className="absolute flex justify-center top-[-18px] w-full overflow-hidden">
          <div className="  min-w-[760px] z-0">
          <Image src={bgCircles} width={760} height={2000} className=" " />
        </div>
        </div>

        <div className="mainCon z-10 flex flex-col px-[20px] items-center w-full min-w-[308px] max-w-[500px] pt-[15px] h-[100vh]">
          <div className="heading_buttons w-full px-[0px] flex justify-between text-white ">
            <div className="burger_button">
              <Menu size={36} />
            </div>
            <div className="account_button">
              <CircleUserRound size={36} />
            </div>
          </div>

          <div className="headings mt-[40px] flex flex-col justify-center items-center text-white">
            <div className="heading_title flex flex-col items-center ">
              <h1 className="font-black text-[96px]">GREAT</h1>
              <h2 className="font-black text-[64px]">NOTICING</h2>
            </div>
            <p className="heading_text text-center text-[18px] w-[300px] mt-[25px]">
              Find out how much of your life has been affected by Israel
            </p>
          </div>

          <div className="main_input_con py-[22px] px-[20px] mt-[40px] w-full bg-[#fafafa3a] rounded-[15px]">
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

          <button className="submit_button mt-[40px] color-[#0f0f0f] text-[26px] font-bold w-full rounded-[14px] bg-white h-[50px]">
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
}
