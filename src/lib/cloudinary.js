import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function uploadBufferToCloudinary(
  buffer,
  filename = "screenshot.png"
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `timestamp=${timestamp}${API_SECRET}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  const form = new FormData();
  form.set("file", new Blob([buffer]), filename);
  form.set("api_key", API_KEY);
  form.set("timestamp", timestamp);
  form.set("signature", signature);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const json = await res.json();
  return { url: json.secure_url, public_id: json.public_id };
}

export async function deleteFromCloudinary(public_id) {
  if (!public_id) return;
  const ts = Math.floor(Date.now() / 1000);
  const stringToSign = `public_id=${public_id}&timestamp=${ts}${API_SECRET}`;
  const signature = crypto
    .createHash("sha1")
    .update(stringToSign)
    .digest("hex");

  const form = new URLSearchParams();
  form.set("public_id", public_id);
  form.set("timestamp", ts);
  form.set("api_key", API_KEY);
  form.set("signature", signature);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`;
  await fetch(url, { method: "POST", body: form });
}
