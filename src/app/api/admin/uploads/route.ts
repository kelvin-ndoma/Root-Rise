import { requireAdmin } from "@/lib/auth/permissions";
import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { handleRouteError, jsonError, jsonOk } from "@/lib/utils/api";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    if (!isCloudinaryConfigured()) {
      return jsonError("Cloudinary is not configured.", 400);
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Choose an image to upload.", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const cloudinary = getCloudinary();
    const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "root-and-rise", resource_type: "image" }, (error, result) => {
          if (error || !result) reject(error ?? new Error("Upload failed."));
          else resolve({ secure_url: result.secure_url, public_id: result.public_id });
        })
        .end(buffer);
    });

    return jsonOk({ url: uploaded.secure_url, publicId: uploaded.public_id });
  } catch (error) {
    return handleRouteError(error);
  }
}
