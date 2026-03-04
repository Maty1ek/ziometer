"use client";

export default function DonateWindow({ onClose }) {
  const igLink = process.env.NEXT_PUBLIC_SOCIAL_INSTA_LINK;
  const twitterLink = process.env.NEXT_PUBLIC_SOCIAL_X_LINK;
  const paypalLink = process.env.NEXT_PUBLIC_PAYPAL_LINK;
  return (
    <div
  className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-5 z-50"
  onClick={onClose}
>
  <div
    className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
    onClick={e => e.stopPropagation()}
  >
    {/* Header with more emotional / clear framing */}
    <div className="px-6 pt-7 pb-4 border-b border-gray-100">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
        Support the project
      </h2>
      <p className="mt-3 text-gray-600 leading-relaxed font-medium">
        This is a non-profit passion project that costs real money to keep running.
        Any help is deeply appreciated — thank you ❤️
      </p>
    </div>

    {/* Donation destination – most important part – make it visually prominent */}
    <div className="px-6 py-1 bg-gradient-to-br from-rose-50 to-rose-100/40">
      <div className="flex items-center gap-3">
        <div className="text-3xl">🇵🇸</div>
        <p className="text-lg font-semibold text-gray-800">
          <strong className="text-rose-700">50% of every donation</strong> goes
          to humanitarian aid for Palestinians.
        </p>
      </div>
    </div>

    {/* Proof / transparency section */}
    <div className="px-6 py-4 text-sm text-gray-600 border-t border-gray-100">
      <p className="font-medium">
        <a
          href={igLink}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1.5 text-blue-600 hover:text-blue-800 font-semibold underline-offset-2 hover:underline"
        >
          Donation proofs on Instagram →
        </a>
      </p>
    </div>

    

    {/* Action area */}
    <div className="px-6 pb-7 pt-2 flex flex-col gap-4">
      <a
        href={paypalLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          flex items-center justify-center gap-2
          bg-gradient-to-r from-blue-600 to-indigo-600
          hover:from-blue-700 hover:to-indigo-700
          text-white font-semibold text-lg
          h-14 rounded-xl shadow-md hover:shadow-lg
          transition-all duration-200 active:scale-[0.98]
        `}
      >
        <span>Donate</span>
      </a>

      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-800 text-sm font-medium underline underline-offset-4 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
</div>
  );
}
