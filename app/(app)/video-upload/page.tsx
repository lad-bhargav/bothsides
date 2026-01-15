// ============================================
// FILE 1: app/(app)/video-upload/page.tsx
// REPLACE YOUR ENTIRE FILE WITH THIS
// ============================================
'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormValues = {
  title: string;
  description?: string;
  file: FileList;
};

const MAX_FILE_SIZE = 70 * 1024 * 1024; // 70MB

const VideoUpload = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const handleOnSubmit = async (data: FormValues) => {
    const file = data.file?.[0];
    if (!file) {
      setError('Please select a video file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 70MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Get upload credentials from your API
      const credentialsRes = await fetch('/api/video-upload/credentials', {
        method: 'POST',
      });

      if (!credentialsRes.ok) {
        throw new Error('Failed to get upload credentials');
      }

      const { signature, timestamp, cloudName, apiKey } = await credentialsRes.json();

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('folder', 'video-uploads-bothsides');

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      // Upload to Cloudinary
      const cloudinaryUpload = new Promise<any>((resolve, reject) => {
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      const cloudinaryResult = await cloudinaryUpload;

      console.log('Cloudinary upload successful:', cloudinaryResult.public_id);

      // Step 3: Save video metadata to database
      const saveRes = await fetch('/api/video-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description ?? '',
          publicId: cloudinaryResult.public_id,
          originalSize: file.size.toString(),
          compressedSize: cloudinaryResult.bytes.toString(),
          duration: cloudinaryResult.duration,
        }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        throw new Error(errorData.error || 'Failed to save video metadata');
      }

      console.log('Video metadata saved successfully');

      // Redirect to videos page
      router.push('/myvideos');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 mt-5">Upload Video</h1>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            placeholder="Enter video title"
            {...register('title', { required: true })}
            className="input input-bordered w-full"
            disabled={isUploading}
          />
          {errors.title && (
            <span className="text-error text-sm">Title is required</span>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            placeholder="Enter description"
            {...register('description')}
            className="textarea textarea-bordered w-full"
            disabled={isUploading}
          />
        </div>

        {/* Video File */}
        <div>
          <label className="label">
            <span className="label-text">Video File</span>
          </label>
          <input
            type="file"
            accept="video/*"
            {...register('file', { required: true })}
            className="file-input file-input-bordered w-full"
            disabled={isUploading}
          />
          {errors.file && (
            <span className="text-error text-sm">Please choose a video</span>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-center">
              {uploadProgress < 100 
                ? `Uploading to Cloudinary... ${uploadProgress}%` 
                : 'Saving to database...'}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className="btn btn-primary mt-4"
        >
          {isUploading 
            ? (uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Saving...') 
            : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
