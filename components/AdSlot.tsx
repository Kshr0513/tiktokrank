"use client";

interface AdSlotProps {
  position: "header" | "infeed" | "footer";
}

export function AdSlot({ position }: AdSlotProps) {
  const adCode = process.env.NEXT_PUBLIC_AD_CODE;
  if (adCode) {
    // Operator inserts actual ad network tag via NEXT_PUBLIC_AD_CODE env var
    return (
      <div
        className="my-4"
        data-ad-position={position}
        dangerouslySetInnerHTML={{ __html: adCode }}
      />
    );
  }
  // Placeholder with fixed dimensions to prevent CLS
  return (
    <div
      className="my-4 bg-gray-100 border border-dashed border-gray-300 rounded flex items-center justify-center text-xs text-gray-400"
      data-ad-position={position}
      style={{ height: position === "infeed" ? 90 : 60 }}
    >
      広告枠 ({position})
    </div>
  );
}
