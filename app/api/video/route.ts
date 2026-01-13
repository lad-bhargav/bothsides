import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const videoId = searchParams.get("videoId");
        if(!videoId)return NextResponse.json({error:"videoId is undefined"},{status:404});

        const video = await prisma.video.findFirst({
            where:{id:videoId}
        })

        if(!video)return NextResponse.json({error:"video not found"},{status:404});

        return NextResponse.json({
            title:video.title,
            description:video.description,
        },{status:200});
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:"failed to fetch video"},{status:404}
        )
    }finally{
        await prisma.$disconnect();
    }
}

export async function PUT(req:NextRequest) {
    try {
        const { title, description } = await req.json();
        const {searchParams} = new URL(req.url);
        const videoId = searchParams.get("videoId");

        if(!videoId)return NextResponse.json({error:"videoId is undefined"},{status:404});

        if(!title) return NextResponse.json({error:"title is required"},{status:400});

        const updatedVideo = await prisma.video.update({
            where:{id:videoId},
            data:{
                title,
                description,
            }
        })

        return NextResponse.json({
            message:"Video updated successfully",
            video: updatedVideo
        },{status:200});

    } catch (error) {
        console.log(error);
        return NextResponse.json({error:"failed to updated"});
    }finally{
        await prisma.$disconnect();
    }
}