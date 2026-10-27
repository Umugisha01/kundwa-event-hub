import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";
import { apiUrl } from "@/config/api";

interface FileUploadProps {
  onUpload: (url: string) => void;
  label?: string;
  accept?: string;
}

// Helper to compress image client-side to an efficient WebP/JPEG data URL
async function compressImageToDataUrl(file: File, maxWidth = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpData = canvas.toDataURL("image/webp", quality);
          if (webpData.startsWith("data:image/webp")) {
            resolve(webpData);
            return;
          }
        } catch {
          // fallback
        }

        const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
        resolve(canvas.toDataURL(mime, quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FileUpload({ onUpload, label = "Upload", accept = "image/*" }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let finalUrl: string | null = null;

      // 1. Attempt upload to the backend API
      try {
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("django_access_token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl("/api/upload/"), {
          method: "POST",
          headers,
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            finalUrl = data.url;
          }
        }
      } catch (backendErr) {
        console.warn("Backend upload failed, switching to optimized client storage:", backendErr);
      }

      // 2. Resilient fallback: compress and encode directly if backend couldn't accept
      if (!finalUrl) {
        finalUrl = await compressImageToDataUrl(file);
      }

      if (finalUrl) {
        onUpload(finalUrl);
        toast({
          title: "Image uploaded successfully",
          description: "Ready to save.",
        });
      } else {
        throw new Error("Unable to process the image file.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({
        title: "Upload failed",
        description: err.message || "Failed to process image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="inline-block">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="gap-1.5 h-10 px-3 py-2"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4" />
        )}
        {isUploading ? "Uploading..." : label}
      </Button>
    </div>
  );
}
