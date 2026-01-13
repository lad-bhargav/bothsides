'use client'
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

interface FormValues{
  title:string;
  description?:string;
}

const EditPage = () => {
    const [title,setTitle] = useState<string>("");
    const [description,setDescription] = useState<string>("");

  const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
    } = useForm<FormValues>();
    
    const params = useParams();
    const videoId = params.id;

    useEffect(()=>{
      videoDetails();
    },[videoId,setValue]);

  const videoDetails = async()=>{
        try {
            const video = await fetch(`/api/video?videoId=${videoId}`);
            if(!video.ok){
                throw new Error("failed to load details");
            }
            const data = await video.json();
            setTitle(data.title);
            setDescription(data.description);
            setValue('title', data.title);
            setValue('description', data.description);
        } catch (error) {
            console.log(error);
        }
  }

  const handleOnSubmit = async()=>{
        
  }

  return (
    <div>
        <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            placeholder="Enter video title"
            value={title}
            {...register('title', { 
              required: true, 
              onChange: (e) => setTitle(e.target.value) 
            })}
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
            value={description}
            {...register('description',{
                onChange: (e) => setDescription(e.target.value)
            })}
            className="textarea textarea-bordered w-full"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary mt-4"
        >Edit
        </button>
      </form>
    </div>
  )
}

export default EditPage