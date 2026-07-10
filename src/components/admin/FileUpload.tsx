import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUpload: (url: string) => void;
  label?: string;
  accept?: string;
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

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const token = localStorage.getItem("django_access_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/upload/", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.url) {
        onUpload(data.url);
        toast({
          title: "File uploaded successfully",
          description: `Saved to ${data.url}`,
        });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Upload failed",
        description: err.message,
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
