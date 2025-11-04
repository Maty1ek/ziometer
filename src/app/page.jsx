import Image from "next/image";
import bgCircles from "../../public/bg_circles.svg";
import { CircleUserRound, Menu } from "lucide-react";
import MainInputs from "@/components/main-inputs";

export default function Home() {
  return (
    <div className="relative ">
       <div className="bg_circles absolute flex justify-center top-[-10px]  w-full overflow-hidden">
          <div className="  min-w-[760px] ">
            <Image src={bgCircles} width={760} height={2000} className=" " />
          </div>
        </div>
      <div className="flex flex-col justify-center items-center  relative ">
        <div className="mainCon z-10 flex flex-col px-[20px] items-center w-full min-w-[308px] max-w-[500px] pt-[15px] h-full pb-[40px]">
          <div className="heading_buttons w-full px-[0px] flex justify-between text-white ">
            <div className="burger_button">
              <Menu size={36} />
            </div>
            <div className="account_button">
              <CircleUserRound size={36} />
            </div>
          </div>

          <div className="headings mt-[30px] flex flex-col justify-center items-center text-white">
            <div className="heading_title flex flex-col items-center ">
              <h1 className="font-black text-[92px]">GREAT</h1>
              <h2 className="font-black text-[61px]">NOTICING</h2>
            </div>
            <p className="heading_text text-center text-[18px] w-[300px] mt-[25px]">
              Find out how much of your life has been affected by Israel
            </p>
          </div>

          <MainInputs />

          <button className="submit_button mt-[40px] color-[#0f0f0f] text-[26px] font-bold w-full rounded-[14px] bg-white h-[50px]">
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
}
