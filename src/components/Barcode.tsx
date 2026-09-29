"use client";

import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export function Barcode({
  value,
  width = 2,
  height = 50,
  displayValue = false,
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width,
          height,
          displayValue,
          margin: 0,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (err) {
        console.error("Barcode generation error:", err);
      }
    }
  }, [value, width, height, displayValue]);

  return <svg ref={svgRef} className="max-w-full h-auto" />;
}