import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/adminApi";
import { resolveImage } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  round?: boolean;
}

export function ImageField({ value, onChange, round }: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-4">
      <div
        className={cn(
          "h-20 w-28 flex-shrink-0 border border-white/10 bg-black/20 bg-cover bg-center",
          round ? "h-20 w-20 rounded-full" : "rounded-lg"
        )}
        style={value ? { backgroundImage: `url("${resolveImage(value)}")` } : undefined}
      />
      <div className="min-w-0 flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="rounded-lg border-white/10 bg-black/20 text-white placeholder:text-slate-500"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="mt-2 rounded-lg border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-white"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading…" : "Upload file"}
        </Button>
      </div>
    </div>
  );
}
