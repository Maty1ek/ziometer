"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toPng } from "html-to-image";
import {
  Copy,
  Download,
  Instagram,
  MessageCircle,
  Send,
  X as XIcon,
} from "lucide-react";
import twitterIcon from "../../public/twitter_icon.webp";
import tiktokIcon from "../../public/tiktok_icon.svg";

function buildShareUrl(percentage) {
  if (typeof window === "undefined") return "";
  const origin = (
    process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  ).replace(/\/+$/, "");
  const value = Number(percentage);
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  const clamped = Math.max(0, Math.min(100, safe));
  return `${origin}/s/${clamped}`;
}

export default function ShareResultsModal({
  open,
  onClose,
  percentage,
  onSupport,
}) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const shareUrl = useMemo(() => buildShareUrl(percentage), [percentage]);

  const close = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const handleCopy = useCallback(async () => {
    try {
      if (!shareUrl) return;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [shareUrl]);

  const getExportFile = useCallback(async () => {
    const node = document.getElementById("share-export-card");
    if (!node) throw new Error("Missing export node");
    const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], "ziometer-share.png", {
      type: blob.type || "image/png",
    });
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      const node = document.getElementById("share-export-card");
      if (!node) return;
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "ziometer-share.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      // ignore
    }
  }, []);

  const encodedText = useMemo(() => {
    const text = `My life has been affected by ISRAEL for ${Math.round(
      Number(percentage) || 0,
    )}%. Try it: ${shareUrl}`;
    return encodeURIComponent(text);
  }, [percentage, shareUrl]);

  const telegramHref = useMemo(
    () => `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodedText}`,
    [encodedText, shareUrl],
  );

  const whatsappHref = useMemo(
    () => `https://wa.me/?text=${encodedText}`,
    [encodedText],
  );

  const xHref = useMemo(
    () =>
      `https://twitter.com/intent/tweet?text=${encodedText}`,
    [encodedText],
  );

  const instagramHref = "https://www.instagram.com/";
  const tiktokHref = "https://www.tiktok.com/";

  const rounded = Math.round(Number(percentage) || 0);

  const tryNativeShareImage = useCallback(
    async (fallbackHref) => {
      if (isSharing) return;
      try {
        if (!navigator.share || !navigator.canShare) return false;
        setIsSharing(true);
        const file = await getExportFile();
        if (!navigator.canShare({ files: [file] })) return false;
        await navigator.share({
          title: "Ziometer",
          text: `My life has been affected by ISRAEL for ${rounded}%.`,
          files: [file],
        });
        return true;
      } catch {
        return false;
      } finally {
        setIsSharing(false);
      }
    },
    [getExportFile, isSharing, rounded],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[20px] bg-black/30 backdrop-blur-[3px]"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Share results"
    >
      <div
        className="w-full max-w-[420px] rounded-[24px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.35)] border border-white/70 px-[18px] py-[16px] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="self-end text-[#64748b] hover:text-black"
          aria-label="Close"
        >
          <XIcon size={20} />
        </button>

        <div
          id="share-export-card"
          className="mt-[4px] w-full max-w-[340px] rounded-[20px] bg-[#f8fafc] border border-[#e2e8f0] flex flex-col items-center justify-center text-center px-[20px] py-[18px]"
          style={{ aspectRatio: "4 / 3" }}
        >
          <p className="text-[20px] font-semibold text-[#475569]">
            My life has been affected by{" "}
            <span className="font-black text-[#13a9ff]">ISRAEL</span> for:
          </p>
          <div className="flex-1 w-full flex items-center justify-center">
            <p className="text-[34px] leading-none font-black text-[#0f172a]">
              {rounded}%
            </p>
          </div>
          <p className="mt-auto text-[11px] font-semibold text-[#94a3b8]">
            ziometer.com
          </p>
        </div>

        <div className="mt-[18px] flex flex-wrap items-center justify-center gap-[10px]">
          <button
            type="button"
            onClick={handleCopy}
            className="h-[40px] w-[40px] rounded-full bg-[#0f172a] text-white flex items-center justify-center hover:scale-105 transition shadow-[0_0px_15px_rgba(15,23,42,0.35)]"
            aria-label="Copy link"
          >
            <Copy size={18} />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="h-[40px] w-[40px] rounded-full bg-[#e11d48] text-white flex items-center justify-center hover:scale-105 transition shadow-[0_0px_15px_rgba(15,23,42,0.35)]"
            aria-label="Download image"
          >
            <Download size={18} />
          </button>

          <a
            href={xHref}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[40px] w-[40px] rounded-full bg-[#ebebeb] flex items-center justify-center hover:scale-105 transition shadow-[0_0px_15px_rgba(15,23,42,0.35)]"
            aria-label="Share on X"
            onClick={async (e) => {
              const shared = await tryNativeShareImage(xHref);
              if (shared) e.preventDefault();
            }}
          >
            <Image
              src={twitterIcon}
              alt="X"
              width={22}
              height={22}
              className="rounded-full"
            />
          </a>

          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[40px] w-[40px] rounded-full bg-gradient-to-tr from-[#f97316] via-[#ec4899] to-[#6366f1] text-white flex items-center justify-center hover:scale-105 transition shadow-[0_0px_15px_rgba(15,23,42,0.35)]"
            aria-label="Open Instagram"
            onClick={async (e) => {
              const shared = await tryNativeShareImage(instagramHref);
              if (shared) e.preventDefault();
            }}
          >
            <Instagram size={20} />
          </a>

          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[40px] w-[40px] rounded-full bg-[#0ea5e9] text-white flex items-center justify-center hover:scale-105 transition shadow-[0_0px_15px_rgba(15,23,42,0.35)]"
            aria-label="Share on Telegram"
            onClick={async (e) => {
              const shared = await tryNativeShareImage(telegramHref);
              if (shared) e.preventDefault();
            }}
          >
            <Send size={20} />
          </a>

          <a
            href={tiktokHref}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[40px] w-[40px] rounded-full bg-[#f0f0f0] flex items-center justify-center hover:scale-105 transition shadow-[0_0px_15px_rgba(15,23,42,0.35)]"
            aria-label="Open TikTok"
            onClick={async (e) => {
              const shared = await tryNativeShareImage(tiktokHref);
              if (shared) e.preventDefault();
            }}
          >
            <Image
              src={tiktokIcon}
              alt="TikTok"
              width={18}
              height={18}
            />
          </a>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[40px] w-[40px] rounded-full bg-[#22c55e] text-white flex items-center justify-center hover:scale-105 transition shadow-[0_0px_15px_rgba(15,23,42,0.35)]"
            aria-label="Share on WhatsApp"
            onClick={async (e) => {
              const shared = await tryNativeShareImage(whatsappHref);
              if (shared) e.preventDefault();
            }}
          >
            <MessageCircle size={20} />
          </a>
        </div>

        {copied && (
          <p className="mt-[8px] text-[11px] font-semibold text-[#16a34a]">
            Link copied
          </p>
        )}

        <button
          type="button"
          onClick={onSupport}
          className="submit_button mt-[20px] w-full h-[50px] rounded-[14px] bg-[#ffffff] text-[#222] font-black text-[18px]"
        >
          Support the project (50% to 🇵🇸)
        </button>
      </div>
    </div>
  );
}
