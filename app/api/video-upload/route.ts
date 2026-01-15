import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// This endpoint generates upload credentials (replaces the signature endpoint)
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Validate Cloudinary credentials
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            console.error('Missing Cloudinary credentials');
            return NextResponse.json(
                { error: "Cloudinary credentials not configured" },
                { status: 500 }
            );
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp: timestamp,
                folder: 'video-uploads-bothsides',
            },
            process.env.CLOUDINARY_API_SECRET
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
        });
    } catch (error) {
        console.error('Credentials generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload credentials' },
            { status: 500 }
        );
    }
}

// This endpoint saves video metadata to database
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, publicId, originalSize, compressedSize, duration } = body;

        if (!title || !publicId) {
            return NextResponse.json(
                { error: "Title and publicId are required" },
                { status: 400 }
            );
        }

        const video = await prisma.video.create({
            data: {
                title,
                description: description || '',
                publicId,
                originalSize,
                compressedSize,
                duration: duration || 0,
                userId,
            }
        });

        console.log('Video saved to database:', video.id);

        return NextResponse.json(video);
    } catch (error) {
        console.error('Save video error:', error);
        return NextResponse.json(
            { error: 'Failed to save video: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}