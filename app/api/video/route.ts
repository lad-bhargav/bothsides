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