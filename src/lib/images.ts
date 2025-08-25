import { THUMB_MAX_DIM, THUMB_QUALITY } from "./constants";

export async function fileToThumbDataURL(file: File, maxDim = THUMB_MAX_DIM, quality = THUMB_QUALITY): Promise<string> {
  const img = new Image();
  const dataURL = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  return await new Promise<string>((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const { width, height } = img;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const thumb = canvas.toDataURL("image/jpeg", quality);
      resolve(thumb);
    };
    img.src = dataURL;
  });
}

export async function fileToPreviewDataURL(file: File, maxDim = 1280, quality = 0.85): Promise<string> {
  const img = new Image();
  const dataURL = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  return await new Promise<string>((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const { width, height } = img;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const preview = canvas.toDataURL("image/jpeg", quality);
      resolve(preview);
    };
    img.src = dataURL;
  });
}