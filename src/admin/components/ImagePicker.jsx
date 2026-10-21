import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "react-toastify";
import { uploadImage } from "../../services/storage/adminDataService";
import { resolveMediaUrl } from "../../utils/mediaUrl";

export default function ImagePicker({
  value,
  onChange,
  label = "Select image",
  changeLabel = "Change image",
  previewClassName = "aspect-square w-full object-cover",
  emptyClassName = "aspect-square",
  rounded = "rounded-2xl",
  maxEdge,
}) {
  const inputRef = useRef(null);
  const [reading, setReading] = useState(false);
  const kind = maxEdge && maxEdge <= 400 ? "avatar" : "product";
  const previewSrc = resolveMediaUrl(value);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setReading(true);
    try {
      const result = await uploadImage(file, kind);
      onChange(result.url);
      toast.success("Image uploaded.");
    } catch (error) {
      toast.error(error.message || "Could not use that image.");
    } finally {
      setReading(false);
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={reading}
        className={`relative block w-full overflow-hidden border border-dashed border-slate-300 bg-slate-50 text-left disabled:opacity-60 ${rounded}`}
      >
        {previewSrc ? (
          <img src={previewSrc} alt="" className={previewClassName} />
        ) : (
          <span className={`grid place-items-center text-center ${emptyClassName}`}>
            <span className="flex flex-col items-center gap-2 px-4 py-6 text-sm text-slate-500">
              <ImagePlus size={28} className="text-brand-500" />
              {reading ? "Uploading image..." : label}
            </span>
          </span>
        )}
        {previewSrc ? (
          <span className="absolute inset-x-0 bottom-0 bg-slate-900/60 py-2 text-center text-xs font-semibold text-white">
            {reading ? "Uploading image..." : changeLabel}
          </span>
        ) : null}
      </button>
    </div>
  );
}
