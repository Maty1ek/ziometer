"use client";

export default function SubmitDonate({ onClose }) {
  const igLink = process.env.NEXT_PUBLIC_SOCIAL_INSTA_LINK;
  const twitterLink = process.env.NEXT_PUBLIC_SOCIAL_X_LINK;
  const paypalLink = process.env.NEXT_PUBLIC_PAYPAL_LINK;
  return (
    <div
      className="flex fixed inset-0 bg-[#c7c7c723] backdrop-blur-[3px] bg-opacity-80 items-center justify-center p-[20px] z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[15px] max-w-[400px] w-full px-[20px] p-[15px] min-h-[200px] box-border flex flex-col justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[22px] font-black">
          Donate to support the project
        </h3>
        <p className="font-semibold mt-[10px]  bg-[#fedaffa7] rounded-[10px] px-[5px] py-[2px]">
          50% of the donations will be sent to{" "}
          <span className="font-bold">Palestinians</span> 🇵🇸
        </p>
        <div className="pl-[5px]">
          <p className="text-[#767676]  mb-[5px] font-medium mt-[15px]">
            Proof of the donation to Palestinians will be shared on Instagram:{" "}
            <br />
          </p>
          <a
            className="text-[#405dff] text-[18px]  font-bold ml-[4px]"
            href={igLink}
          >
            instagram.com
          </a>
          <p className="text-[#767676]  mb-[5px] font-medium mt-[10px]">
            Follow on X if I get banned:
            <br />
          </p>
          <a
            className="text-[#405dff] text-[18px] font-bold ml-[4px]"
            href={twitterLink}
          >
            x.com
          </a>
        </div>
        <a href={paypalLink} target="_blank" className="flex items-center justify-center  text-[#f0f0f0] text-[24px] font-bold w-full rounded-[20px] mt-[20px] bg-[#0f0f0f] h-[45px]">Donate</a>
        <button
          type="button"
          onClick={onClose}
          className="text-[#414141] text-[15px] underline hover:text-black mt-[10px]"
          aria-label="Close"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
