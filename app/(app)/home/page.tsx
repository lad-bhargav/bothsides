"use client"

import VideoCard from '@/components/VideoCard';
import { Video } from '@/types'
import React, { useCallback, useEffect, useState } from 'react'

const Home = () => {
  const [videos,setVideos] = useState<Video[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async ()=>{
        try {
          const res = await fetch('api/videos');
          if(!res.ok){
            throw new Error('Failed to fetch videos');
          }

          const data = await res.json();

          if(Array.isArray(data)){
            setVideos(data);
          }else{
            throw new Error("unexpected response format");
          }
          
        } catch (error) {
            console.log(error);
            setError("failed to fetch videos");
        }finally{
          setLoading(false);
        }
  },[]);

  useEffect(()=>{
    fetchVideos();
  },[fetchVideos]);

  const handleDownload = useCallback((url : string,title:string)=>{
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute("download",`${title}.mp4`);
      link.setAttribute("target","_blank");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  },[]);

  if(loading){
    return <div>Loading...</div>
  }
  return (
    <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Videos</h1>
          {videos.length === 0 ? (
            <div className="text-center text-lg text-gray-500">
              No videos available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {
                videos.map((video) => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        onDownload={handleDownload}
                        like={video.likesCount}
                        dislike={video.dislikesCount}
                        onReact={fetchVideos}
                    />
                ))
              }
            </div>
          )}
        </div>
  )
}

export default Home