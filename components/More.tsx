'use client'
import React, { useState } from 'react'
import {Edit2Icon, MoreVertical, Trash } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MoreProps{
    videoId:string | null;
    onDelete?: () => void; 
}

const More:React.FC<MoreProps> = ({videoId,onDelete}) => {
    const [isDeleted,setIsDeleted] = useState<boolean>(false);
    const [open,setOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async() => {
        try {
            const res = await fetch("/api/checkvideo",{
                method:"DELETE",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({videoId}),
            });
            if(!res.ok){
                setIsDeleted(false);
                return;
            };
            const data = await res.json();
            setIsDeleted(Boolean(data.success));

            if(onDelete){
                onDelete();
            }
            router.push("/myvideos");
        } catch (error) {
            console.log(error);
            throw new Error("failed to delete video");
        }
    }

  return (
    <div className='relative' onClick={()=>setOpen(!open)}>
        <MoreVertical size={16} onClick={()=>setOpen(!open)}/>
        {
            open && (
                <div className='mt-2' onClick={()=>setOpen(!open)}>
                    <div><Link className='text-sm flex gap-1 content-center' href={`video/edit/${videoId}`}><Edit2Icon size={15}/>Edit</Link></div>
                    <div><p onClick={handleDelete} className='text-sm mt-2 flex gap-1 content-center text-red-600/90'>
                        <Trash size={15}/>Delete
                        </p></div>
                </div>
            )
        }
    </div>
  )
}

export default More