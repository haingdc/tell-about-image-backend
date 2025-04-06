import { port } from "../../main.ts";

async function createImageFile(imagePath: string, fileName?: string) {
  try {
    const imageData = await Deno.readFile(imagePath);
    const mimeType = getMimeType(imagePath);

    return new File([imageData], fileName || getFileName(imagePath), {
      type: mimeType,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error reading image file: ${error.message}`);
    }
    throw new Error("Error reading image file: unknown error");
  }
}

function getMimeType(filePath: string): string {
  const extension = filePath.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "bmp": "image/bmp",
  };

  return mimeTypes[extension || ""] || "application/octet-stream";
}

function getFileName(filePath: string): string {
  return filePath.split("/").pop() || "unknown";
}

function getUrl(endpoint: string) {
  return new URL(endpoint, "http://localhost:" + port).toString();
}

export default { createImageFile, getUrl };
