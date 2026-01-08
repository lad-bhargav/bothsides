import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


export async function POST(req:Request){
    const authData = await auth(); 
    const userId = authData.userId;
    const {videoId,value} = await req.json();

    if(!userId){
        return NextResponse.json({error:"Unauthorized"}, {status:401});
    }
    
    const existing = await prisma.videoReaction.findUnique({
        where:{
            videoId_userId:{videoId,userId},
        }
    });

    //remove reaction (toggle value) if same reaction exists

    if(existing && existing.value === value){
        await prisma.videoReaction.delete({
            where:{
                id:existing.id,
            }
        })

        await prisma.video.update({
            where:{id:videoId},
            data:value === 1 ? {likesCount:{decrement : 1}}:
            {dislikesCount:{decrement:1}}
        });

        return NextResponse.json({status:"removed"});
    }

    //if reaction exist but opposite->update that

    if(existing){
        await prisma.videoReaction.update({
            where:{id:existing.id},
            data:{value}
        });

        const updatedVideo = await prisma.video.update({
            where:{id:videoId},
            data:value === 1?
            {
                likesCount:{increment : 1},
                dislikesCount:{decrement:1},
            }:{
                likesCount:{decrement:1},
                dislikesCount:{increment:1},
            }
        });
        return NextResponse.json({
             status: "updated",
             likesCount: updatedVideo.likesCount,
             dislikesCount: updatedVideo.dislikesCount,
        });
    }

    //new reaction

    await prisma.videoReaction.create({
        data:{videoId,userId,value},
    });

    await prisma.video.update({
        where:{id:videoId},
        data:
            value === 1
            ? { likesCount: { increment: 1 } }
            : { dislikesCount: { increment: 1 } },
    });

    return NextResponse.json({status:"created"});
}