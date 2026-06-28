import { useRef, useState, useEffect } from "react";
import { Camera, RotateCcw, X, AlertTriangle, SwitchCamera, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraView({ onCapture, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  // Start the video stream
  const startCamera = async (mode: "user" | "environment") => {
    setLoading(true);
    setError(null);
    
    // Stop any existing tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setLoading(false);
    } catch (err: any) {
      console.error("Error accessing camera: ", err);
      // Fallback if environment (back camera) is requested but unavailable
      if (mode === "environment") {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          setLoading(false);
          return;
        } catch (fbErr) {
          console.error("Fallback camera failed as well: ", fbErr);
        }
      }
      
      setError(
        "Не удалось получить доступ к камере. Пожалуйста, убедитесь, что вы предоставили разрешения на доступ к камере, или воспользуйтесь загрузкой файла."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      // Set canvas size to match the video element's actual dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw the current video frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas content to base64 jpeg
      const base64Data = canvas.toDataURL("image/jpeg", 0.85);
      onCapture(base64Data);
    }
  };

  return (
    <div className="relative w-full aspect-video md:aspect-[16/9] bg-stone-950 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center border border-stone-800">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-950 text-stone-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-sm font-medium">Запуск камеры...</span>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-stone-900 text-stone-200">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
          <p className="text-sm font-medium max-w-md">{error}</p>
          <button
            onClick={() => startCamera(facingMode)}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Попробовать снова
          </button>
        </div>
      ) : (
        <>
          {/* Video stream element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Visual Target Frame */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[60%] aspect-square border-2 border-dashed border-emerald-500/60 rounded-3xl relative flex items-center justify-center">
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-emerald-400 font-medium tracking-wide border border-emerald-500/20 uppercase">
                Поместите еду в рамку
              </span>
              
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-xl -mb-1 -mr-1"></div>
            </div>
          </div>

          {/* Top action buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={toggleCamera}
              className="p-2.5 bg-stone-900/80 hover:bg-stone-800 backdrop-blur-md text-stone-200 rounded-xl hover:text-white transition-colors cursor-pointer border border-stone-800"
              title="Переключить камеру"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-stone-900/80 hover:bg-stone-800 backdrop-blur-md text-stone-200 rounded-xl hover:text-white transition-colors cursor-pointer border border-stone-800"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Capture action button */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={capturePhoto}
              className="pointer-events-auto flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-full shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Сделать снимок</span>
            </motion.button>
          </div>
        </>
      )}

      {/* Hidden canvas for extracting the frame */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
