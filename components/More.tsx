import React, { useState } from 'react'
import {Edit2Icon, MoreVertical, Trash } from "lucide-react";

const More = () => {
    const [open,setOpen] = useState(false);

  return (
    <div className='relative' onClick={()=>setOpen(!open)}>
        <MoreVertical size={16} onClick={()=>setOpen(!open)}/>
        {
            open && (
                <div className='mt-2' onClick={()=>setOpen(!open)}>
                    <div className='text-sm flex gap-1 content-center'><Edit2Icon size={15}/>Edit</div>
                    <div className='text-sm mt-2 flex gap-1 content-center text-red-600/90'><Trash size={15}/>Delete</div>
                </div>
            )
        }
    </div>
  )
}

export default More