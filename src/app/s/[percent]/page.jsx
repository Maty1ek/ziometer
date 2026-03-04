import Link from "next/link";
import Image from "next/image";
import bgCircles from "../../../../public/bg_circles.svg";

export default function SharedPercentPage({ params }) {
  const raw = params?.percent ?? "";
  const value = Number(raw);
  const safe = Number.isFinite(value) ? Math.round(value) : NaN;
  const clamped = Number.isNaN(safe)
    ? null
    : Math.max(0, Math.min(100, safe));

  if (clamped === null) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-[20px]">
        <div className="bg_circles absolute flex justify-center top-[-15px] w-full overflow-hidden">
          <div className="min-w-[760px]">
            <Image
              src={bgCircles}
              width={760}
              height={2000}
              alt="Background circles"
            />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[420px] rounded-[24px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.25)] border border-white/70 px-[18px] py-[22px] flex flex-col items-center">
          <h1 className="text-[22px] font-black mb-[8px] text-[#0f172a] text-center">
            Invalid result link
          </h1>
          <p className="text-[14px] text-[#475569] mb-[16px] font-semibold text-center">
            This link does not contain a valid percentage.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-[46px] px-[18px] rounded-[18px] bg-[#0f172a] text-white font-black text-[15px]"
          >
            Try it yourself
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-[20px]">
      <div className="bg_circles absolute flex justify-center top-[-15px] w-full overflow-hidden">
        <div className="min-w-[760px]">
          <Image
            src={bgCircles}
            width={760}
            height={2000}
            alt="Background circles"
          />
        </div>
      </div>

      <div className="fixed inset-0 bg-[#c7c7c723] backdrop-blur-[3px]" />
      <div className="relative z-10 w-full max-w-[420px] rounded-[24px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.35)] border border-white/70 px-[18px] py-[22px] flex flex-col items-center">
        <div
          className="w-full max-w-[340px] rounded-[20px] bg-[#f8fafc] border border-[#e2e8f0] flex flex-col items-center justify-center text-center px-[20px] py-[18px]"
          style={{ aspectRatio: "4 / 3" }}
        >
          <p className="text-[20px] font-semibold text-[#475569]">
            My life has been affected by{" "}
            <span className="font-black text-[#0091ff]">ISRAEL</span> for:
          </p>
          <div className="flex-1 w-full flex items-center justify-center">
            <p className="text-[34px] leading-none font-black text-[#0f172a]">
              {clamped}%
            </p>
          </div>
          <p className="mt-auto text-[11px] font-semibold text-[#94a3b8]">
            ziometer.com
          </p>
        </div>

        <Link
          href="/"
          className="mt-[18px] inline-flex items-center justify-center h-[46px] px-[18px] rounded-[18px] bg-[#0f172a] text-white font-black text-[15px]"
        >
          Try it yourself
        </Link>
      </div>
    </div>
  );
}

