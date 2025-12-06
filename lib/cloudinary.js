import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file, folder = "school") {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: "auto",
    })
    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw error
  }
}

export async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    throw error
  }
}

export default cloudinary
