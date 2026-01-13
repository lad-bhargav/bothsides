import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req:NextRequest) {
    try {
        const {userId} = await auth();
        if (!userId) {
            return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
        }

        const {searchParams} = new URL(req.url); 
        const videoId = searchParams.get("videoId");

        if(!videoId)return NextResponse.json({error:"videoId is missing"},{status:404});

        const video = await prisma.video.findFirst({
            where :{
                id:videoId,
                userId:userId
            },
        });

        if(!video)return NextResponse.json({error : "this is not your video"},{status:403});

        return NextResponse.json(
        {success:true},
        {status:200}
        )
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:"This is not your video"});
    }finally{
        await prisma.$disconnect();
    }
}

export async function DELETE(req:NextRequest) {
    try {
        const {videoId} = await req.json();
        const {userId} = await auth();

        if(!userId)return NextResponse.json({error:"unauthorized"},{status:401});

        const deletedVideo = await prisma.video.delete({
            where:{id:videoId},
        });

        return NextResponse.json({success:true});
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:"error in deleting video"},{status:401});
    }finally{
        await prisma.$disconnect();
    }
}