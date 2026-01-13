'use client'

import VideoCard from '@/components/VideoCard';
import { Video } from '@/types';
import React, { useCallback, useEffect, useState } from 'react'

const myVideos = () => {
  const [myVideos,setMyVideos] = useState<Video[]>([]);
  const [isLoading,setIsLoading] = useState(true);
  const [error,setError] = useState<string | null>(null);

  const fetchMyVideos = useCallback(async()=>{
        try {
             const res = await fetch('api/myvideos',{
                  method:"POST",
             });
             if(!res.ok){
                throw new Error('Failed to fetch videos');
             }
             const data = await res.json();
             if(Array.isArray(data)){
                 setMyVideos(data);
             }else{
                  throw new Error("unexpected response format");
             }
        } catch (error) {
           console.log(error);
           setError("failed to load videos");
        }finally{
          setIsLoading(false);
        }
  },[]);

  useEffect(()=>{
    fetchMyVideos();
  },[fetchMyVideos]);

  const handleDownload = useCallback((url : string,title:string)=>{
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute("download",`${title}.mp4`);
        link.setAttribute("target","_blank");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },[]);

    if(isLoading){
       return <span className="loading loading-spinner loading-xl"></span>
    }

  return (
    <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Your Videos</h1>
          {myVideos.length === 0 ? (
            <div className="text-center text-lg text-gray-500">
              No videos available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {
                myVideos.map((video) => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        onDownload={handleDownload}
                        like={video.likesCount}
                        dislike={video.dislikesCount}
                        onReact={fetchMyVideos}
                        onDelete={fetchMyVideos}
                    />
                ))
              }
            </div>
          )}
        </div>
  )
}

export default myVideos