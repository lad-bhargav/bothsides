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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const handleOnSubmit = async (data: FormValues) => {
    const file = data.file?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 70MB limit.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    formData.append('description', data.description ?? '');
    formData.append('originalSize', file.size.toString());

    try {
      const res = await fetch('/api/video-upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push('/myvideos');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 mt-5">Upload Video</h1>

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
          />
          {errors.file && (
            <span className="text-error text-sm">Please choose a video</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className="btn btn-primary mt-4"
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
