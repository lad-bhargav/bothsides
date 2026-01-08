'use client'

import React, {useState, useEffect, useCallback} from 'react'
import {getCldImageUrl, getCldVideoUrl} from "next-cloudinary"
import { Download, Clock, FileDown, FileUp } from "lucide-react";
import dayjs from 'dayjs';
import realtiveTime from "dayjs/plugin/relativeTime"
import { Video } from '@/types';
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useUser } from '@clerk/nextjs';

dayjs.extend(realtiveTime)

interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string) => void;
    like:number;
    dislike:number;
    onReact: () => void;
}

const VideoCard:React.FC<VideoCardProps> = ({video,onDownload,like,dislike,onReact}) => {
    const [isHovered,setIsHovered] = useState(false);
    const [previewError,setPreviewError] = useState(false);
    const {user,isLoaded} = useUser();

    const getThumbnailUrl = useCallback((publicId:string)=>{
        return getCldImageUrl({
            src:publicId,
            width:400,
            height:225,
            crop:"fill",
            gravity:"auto",
            format:"jpg",
            quality:"auto",
            assetType:"video"
        })
    },[]);

    const getFullVideoUrl = useCallback((publicId:string)=>{
        return getCldVideoUrl({
            src:publicId,
            width:1920,
            height:1080,
        })
    },[]);

    const getPreviewVideoUrl = useCallback((publicId:string)=>{
        return getCldVideoUrl({
            src:publicId,
            width:400,
            height:225,
            rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"]
        })
    },[]);

    const handleLike = async() => {
        if (!isLoaded || !user) return;
        const res = await fetch(`/api/video/react`,{
            method:"POST",
            headers:{ "Content-Type": "application/json" },
            body:JSON.stringify({
                videoId:video.id,
                value:1,
            })
        })
        if(res.ok){
           onReact();
        }
    }

    const handleDislike = async() => {
        if (!isLoaded || !user) return;
        const res = await fetch(`api/video/react`,{
          method:"POST",
          headers:{ "Content-Type": "application/json" },
          body:JSON.stringify({
              videoId:video.id,
              value:-1,
          })
        })
        if(res.ok){
           onReact();
        }
    }

    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
      }, []);

      useEffect(() => {
        setPreviewError(false);
      }, [isHovered]);

      const handlePreviewError = () => {
        setPreviewError(true);
      };

  return (
    <div
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <figure className="aspect-video relative">
            {isHovered ? (
              previewError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <p className="text-red-500">Preview not available</p>
                </div>
              ) : (
                <video
                  src={getPreviewVideoUrl(video.publicId)}
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                  onError={handlePreviewError}
                />
              )
            ) : (
              <img
                src={getThumbnailUrl(video.publicId)}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
              <Clock size={16} className="mr-1" />
              {formatDuration(video.duration)}
            </div>
          </figure>
          <div className="card-body p-4">
            <h2 className="card-title text-lg font-bold">{video.title}</h2>
            <p className="text-sm text-base-content opacity-70 mb-4">
              {video.description}
            </p>
            <p className="text-sm text-base-content opacity-70 mb-4">
              Uploaded {dayjs(video.createdAt).fromNow()}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-1">
                  <div onClick={handleLike} className='flex cursor-pointer h-10 w-10 hover:bg-gray-200/20 rounded-full items-center justify-center'>
                      <ThumbsUp size={20} className="mr-1" />
                  </div>
                  <div>
                    <p className='text-lg'>{like}</p>
                  </div>
              </div>
              <div className="flex items-center gap-1">
                <div onClick={handleDislike} className='flex cursor-pointer h-10 w-10 hover:bg-gray-200/20 rounded-full items-center justify-center'>
                      <ThumbsDown size={20} className="mr-1" />
                  </div>
                  <div>
                    <p className='text-lg'>{dislike}</p>
                  </div>
              </div>
            </div>
            <div className="card-actions justify-end mt-4">
              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  onDownload(getFullVideoUrl(video.publicId), video.title)
                }
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
  )
}

export default VideoCard
