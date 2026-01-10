'use client'

import React, {useState, useEffect, useCallback} from 'react'
import {getCldImageUrl, getCldVideoUrl} from "next-cloudinary"
import { Download, Clock, FileDown, FileUp, Share, Share2 } from "lucide-react";
import dayjs from 'dayjs';
import realtiveTime from "dayjs/plugin/relativeTime"
import { Video } from '@/types';
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useUser } from '@clerk/nextjs';
import ShareBtn from './Share';

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
    const [isLiked,setIsliked] = useState<boolean>(false);
    const [isDisliked,setIsDisliked] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState(like);
    const [dislikesCount, setDislikesCount] = useState(dislike);

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

    useEffect(() => {
        const fetchReactionStatus = async () => {
            try {
                const response = await fetch(`/api/video/react?videoId=${video.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setLikesCount(data.likesCount);
                    setDislikesCount(data.dislikesCount);
                    if (data.userReaction === 1) {
                        setIsliked(true);
                        setIsDisliked(false);
                    } else if (data.userReaction === -1) {
                        setIsliked(false);
                        setIsDisliked(true);
                    } else {
                        setIsliked(false);
                        setIsDisliked(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching reaction status:', error);
            }
        };

        if (isLoaded && user) {
            fetchReactionStatus();
        }
    }, [video.id, isLoaded, user]);

    const handleLike = async() => {
        if (!user) return;

        try {
            const response = await fetch('/api/video/react', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoId: video.id,
                    value: 1
                })
            });

            if (response.ok) {
                const data = await response.json();
                setLikesCount(data.likesCount);
                setDislikesCount(data.dislikesCount);
                
                if (data.userReaction === 1) {
                    setIsliked(true);
                    setIsDisliked(false);
                } else {
                    setIsliked(false);
                    setIsDisliked(false);
                }
                
                onReact();
            }
        } catch (error) {
            console.error('Error handling like:', error);
        }
    }

    const handleDislike = async() => {
        if (!user) return;

        try {
            const response = await fetch('/api/video/react', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoId: video.id,
                    value: -1
                })
            });

            if (response.ok) {
                const data = await response.json();
                setLikesCount(data.likesCount);
                setDislikesCount(data.dislikesCount);
                
                if (data.userReaction === -1) {
                    setIsDisliked(true);
                    setIsliked(false);
                } else {
                    setIsDisliked(false);
                    setIsliked(false);
                }
                
                onReact();
            }
        } catch (error) {
            console.error('Error handling dislike:', error);
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
      className="card bg-base-100 p-2 shadow-xl h-125 w-75 flex flex-col hover:shadow-2xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* VIDEO — 80% */}
      <figure className="relative flex-8">
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

      {/* CONTENT — 20% */}
      <div className="card-body p-3 flex flex-col justify-between flex-2 overflow-hidden">
        <div>
          <h2 className="text-sm font-bold line-clamp-1">
            {video.title}
          </h2>

          <p className="text-xs text-base-content opacity-70 line-clamp-2">
            {video.description}
          </p>

          <p className="text-xs text-base-content opacity-60 mt-1">
            {dayjs(video.createdAt).fromNow()}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <div
                onClick={handleLike}
                className="flex cursor-pointer h-8 w-8 hover:bg-gray-200/20 rounded-full items-center justify-center"
              >
                <ThumbsUp
                  size={16}
                  fill={isLiked ? "currentColor" : "none"}
                  stroke={isLiked ? "none" : "currentColor"}
                />
              </div>
              <span className="text-sm">{likesCount}</span>
            </div>

            <div className="flex items-center gap-1">
              <div
                onClick={handleDislike}
                className="flex cursor-pointer h-8 w-8 hover:bg-gray-200/20 rounded-full items-center justify-center"
              >
                <ThumbsDown
                  size={16}
                  fill={isDisliked ? "currentColor" : "none"}
                  stroke={isDisliked ? "none" : "currentColor"}
                />
              </div>
              <span className="text-sm">{dislikesCount}</span>
            </div>
          </div>

          <button
            className="btn btn-primary btn-xs ml-5"
            onClick={() =>
              onDownload(getFullVideoUrl(video.publicId), video.title)
            }
          >
            <Download size={14} />
          </button>
          <ShareBtn/>
        </div>
      </div>
    </div>    
  )
}

export default VideoCard