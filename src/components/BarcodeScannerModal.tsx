"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Camera, X, Flashlight, AlertCircle } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: (scannedText: string) => void;
  onScan?: (scannedText: string) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onScanSuccess, onScan }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext unavailable
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (controlsRef.current) {
        try { controlsRef.current.stop(); } catch {}
        controlsRef.current = null;
      }
      return;
    }

    const codeReader = new BrowserMultiFormatReader();
    let isSubscribed = true;

    async function startScanner() {
      setErrorMessage(null);
      setHasPermission(null);

      try {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const controls = await codeReader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoElement,
          (result) => {
            if (!isSubscribed) return;
            if (result) {
              const text = result.getText().trim();
              if (text) {
                playBeep();
                (onScanSuccess || onScan)?.(text);
              }
            }
          }
        );

        if (isSubscribed) {
          controlsRef.current = controls as any;
          setHasPermission(true);

          const stream = videoElement.srcObject as MediaStream;
          const track = stream?.getVideoTracks()[0];
          const capabilities = (track as any)?.getCapabilities?.();
          if (capabilities && "torch" in capabilities) {
            setHasTorch(true);
          }
        } else {
          try { (controls as any)?.stop?.(); } catch {}
        }
      } catch (err: any) {
        if (isSubscribed) {
          setHasPermission(false);
          setErrorMessage(
            err.name === "NotAllowedError"
              ? "Camera permission was dismissed or blocked. Please allow camera access in browser settings."
              : err.message || "Failed to initialize camera stream"
          );
        }
      }
    }

    startScanner();

    return () => {
      isSubscribed = false;
      if (controlsRef.current) {
        try { controlsRef.current.stop(); } catch {}
        controlsRef.current = null;
      }
    };
  }, [isOpen, onScanSuccess]);

  const toggleTorch = async () => {
    if (!videoRef.current) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream?.getVideoTracks()[0];
    if (track && hasTorch) {
      const nextTorch = !torchOn;
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } catch (e) {
        console.error("Torch error:", e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between">
      <div className="p-4 flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight">Shipment Barcode Scanner</h3>
            <p className="text-[11px] text-slate-300">Align waybill barcode or QR inside reticle</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={"p-2 rounded-full transition " + (torchOn ? "bg-amber-400 text-black" : "bg-white/20 text-white hover:bg-white/30")}
              title="Toggle Flashlight"
            >
              <Flashlight className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        <div className="relative w-72 h-72 border-2 border-white/60 rounded-3xl z-10 flex flex-col items-center justify-between p-4 shadow-2xl">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500/80 shadow-[0_0_8px_#ef4444] animate-pulse pointer-events-none" />

          <div className="w-full flex justify-between">
            <div className="w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
            <div className="w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
          </div>

          <span className="text-[11px] font-mono font-bold tracking-wider text-white bg-black/60 px-3 py-1 rounded-full uppercase">
            LB-2026-XXXXXX
          </span>

          <div className="w-full flex justify-between">
            <div className="w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
            <div className="w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
          </div>
        </div>

        {hasPermission === false && (
          <div className="absolute inset-0 z-20 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <h4 className="text-base font-bold">Camera Access Required</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              {errorMessage}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 text-center text-xs text-slate-400 z-10">
        Supports Code 128, Code 39, EAN, UPC, and QR Codes
      </div>
    </div>
  );
}
export default BarcodeScannerModal;
