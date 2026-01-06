import { PrismaClient } from '@prisma/client';

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { NextRequest,NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});

export async function GET(request:NextRequest){
    try {
        const videos = await prisma.video.findMany({
            orderBy:{
                createdAt:'desc'
            }
        });
        return NextResponse.json(videos);
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:"Error fetching videos"},{status:500});
    }finally{
        await prisma.$disconnect();
    }
}