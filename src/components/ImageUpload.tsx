import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  onImageSelected: (base64Image: string) => void;
}

export default function ImageUpload({ onImageSelected }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    setError(null);

    // Validate that it's an image
    if (!file.type.startsWith("image/")) {
      setError("Пожалуйста, выберите файл изображения (JPEG, PNG, WebP).");
      return;
    }

    // Check size (limit to 10MB to avoid high bandwidth usage)
    if (file.size > 10 * 1024 * 1024) {
      setError("Размер файла превышает 10 МБ. Пожалуйста, загрузите меньшее изображение.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        onImageSelected(base64);
      } else {
        setError("Не удалось прочитать файл.");
      }
    };
    reader.onerror = () => {
      setError("Ошибка при чтении файла.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
            : "border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-stone-500 hover:border-emerald-500 hover:bg-stone-50 dark:hover:bg-stone-900"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${
          isDragging 
            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 scale-110" 
            : "bg-stone-100 dark:bg-stone-800 text-stone-400"
        }`}>
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-base mb-1">
          Перетащите фото еды сюда
        </h3>
        <p className="text-xs text-stone-400 dark:text-stone-500 max-w-sm mb-2">
          или <span className="text-emerald-600 dark:text-emerald-400 font-medium">выберите файл</span> на вашем устройстве
        </p>
        <p className="text-[10px] text-stone-400/80 dark:text-stone-500/80">
          Поддерживаются форматы: PNG, JPEG, WebP (до 10 МБ)
        </p>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2 border border-red-100 dark:border-red-950/35">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
