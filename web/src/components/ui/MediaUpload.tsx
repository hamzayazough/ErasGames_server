import { useState, useRef } from 'react';
import { mediaUploadService, MediaUploadResponse } from '@/lib/services/media-upload.service';

interface MediaUploadProps {
  type: 'image' | 'audio';
  onUploadSuccess: (result: MediaUploadResponse['data']) => void;
  onError: (error: string) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export default function MediaUpload({
  type,
  onUploadSuccess,
  onError,
  accept,
  maxSize,
  className = '',
  multiple = false,
  disabled = false
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAccept = type === 'image' 
    ? 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
    : 'audio/mpeg,audio/mp3,audio/wav,audio/ogg';

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file
        const validation = type === 'image' 
          ? mediaUploadService.validateImageFile(file)
          : mediaUploadService.validateAudioFile(file);

        if (!validation.valid) {
          onError(validation.error || 'Invalid file');
          continue;
        }

        // Upload file
        const result = await mediaUploadService.uploadFile(file, type);
        onUploadSuccess(result.data);

        if (!multiple) break; // Only upload one file if not multiple
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept || defaultAccept}
        onChange={handleFileSelect}
        multiple={multiple}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={!disabled && !isUploading ? openFileDialog : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {type === 'image' ? (
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            )}
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {type === 'image' 
                ? 'PNG, JPG, GIF up to 10MB'
                : 'MP3, WAV, OGG up to 50MB'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}