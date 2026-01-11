import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST() {
    try {
        const {userId} = await auth();
        if(!userId){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }
        const res  = await prisma.video.findMany({
            where:{userId},
            orderBy:{createdAt:"desc"}
        });
        if(!res){
            return NextResponse.json({error:"No videos found"},{status:404});
        }
        return NextResponse.json(res,{status:200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:"error fetching your videos"});
    }finally{
        await prisma.$disconnect();
    }
}