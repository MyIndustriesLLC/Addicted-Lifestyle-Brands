import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { Card } from "@/components/ui/card";

interface BarcodeDisplayProps {
  value: string;
  className?: string;
}

export function BarcodeDisplay({ value, className = "" }: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      JsBarcode(canvasRef.current, value, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 12,
        margin: 10,
        background: "transparent",
      });
    }
  }, [value]);

  return (
    <Card className={`p-4 bg-card/50 ${className}`}>
      <canvas ref={canvasRef} data-testid="canvas-barcode" />
    </Card>
  );
}
