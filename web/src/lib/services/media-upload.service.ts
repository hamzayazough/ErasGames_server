import { auth } from "../firebase";

export interface MediaUploadResponse {
  success: boolean;
  data: {
    url: string;
    key: string;
    filename: string;
    size: number;
    type: "image" | "audio";
  };
}

export class MediaUploadService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    return await user.getIdToken();
  }

  async uploadImage(file: File): Promise<MediaUploadResponse> {
    const token = await this.getAuthToken();
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${this.baseURL}/admin/media/upload-image`, {
      method: "POST",
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload image");
    }

    return response.json();
  }

  async uploadAudio(file: File): Promise<MediaUploadResponse> {
    const token = await this.getAuthToken();
    const formData = new FormData();
    formData.append("audio", file);

    const response = await fetch(`${this.baseURL}/admin/media/upload-audio`, {
      method: "POST",
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload audio");
    }

    return response.json();
  }

  async uploadFile(
    file: File,
    type: "image" | "audio"
  ): Promise<MediaUploadResponse> {
    if (type === "image") {
      return this.uploadImage(file);
    } else {
      return this.uploadAudio(file);
    }
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid image format. Please use JPEG, PNG, GIF, or WebP.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "Image file too large. Maximum size is 10MB.",
      };
    }

    return { valid: true };
  }

  validateAudioFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid audio format. Please use MP3, WAV, or OGG.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "Audio file too large. Maximum size is 50MB.",
      };
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export const mediaUploadService = new MediaUploadService();
