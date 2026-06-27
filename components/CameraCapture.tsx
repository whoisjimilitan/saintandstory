"use client";

import { useRef, useState } from "react";
import { Camera, RotateCw, Check } from "lucide-react";

interface CameraCaptureProps {
  photoType: "verification" | "pickup" | "delivery";
  jobId?: string;
  onSuccess: (url: string) => void;
  onError: (error: string) => void;
  label: string;
}

export default function CameraCapture({
  photoType,
  jobId,
  onSuccess,
  onError,
  label,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"preview" | "capture" | "review">("preview");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Start camera (with fallback to file input)
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setMode("capture");
      }
    } catch (err) {
      // Fallback to file input if camera unavailable
      console.log("Camera unavailable, using file picker:", err);
      fileInputRef.current?.click();
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(imageData);
    setMode("review");

    // Stop video stream
    if (video.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setMode("preview");
    startCamera();
  };

  // Upload photo
  const uploadPhoto = async () => {
    if (!capturedImage) return;

    setUploading(true);
    try {
      const blob = await fetch(capturedImage).then((r) => r.blob());
      const formData = new FormData();
      formData.append("file", blob, `photo-${Date.now()}.jpg`);
      formData.append("type", photoType);
      if (jobId) formData.append("jobId", jobId);

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        onError(error.error || "Upload failed");
        setUploading(false);
        return;
      }

      const data = await response.json();
      onSuccess(data.url);
      setCapturedImage(null);
      setMode("preview");
    } catch (err) {
      onError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Preview mode: Show single photo button with fallback */}
      {mode === "preview" && !capturedImage && (
        <>
          <button
            onClick={startCamera}
            className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3.5 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            Take Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                setCapturedImage(event.target?.result as string);
                setMode("review");
              };
              reader.readAsDataURL(file);
            }}
          />
        </>
      )}

      {/* Capture mode: Show video stream */}
      {mode === "capture" && (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-2xl bg-black"
          />
          <button
            onClick={capturePhoto}
            className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3.5 rounded-full text-sm transition-colors"
          >
            Take Photo
          </button>
        </div>
      )}

      {/* Review mode: Show captured image */}
      {mode === "review" && capturedImage && (
        <div className="space-y-3">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full rounded-2xl"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={retakePhoto}
              disabled={uploading}
              className="bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#0D0D0D] font-semibold py-3.5 rounded-full text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RotateCw size={18} />
              Retake
            </button>
            <button
              onClick={uploadPhoto}
              disabled={uploading}
              className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3.5 rounded-full text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              {uploading ? "Uploading..." : "Confirm"}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} hidden />
    </div>
  );
}
