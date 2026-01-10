import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface Video {
  id: string;
  likesCount: number;
  dislikesCount: number;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Get video with reaction counts
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        likesCount: true,
        dislikesCount: true,
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Get current user's reaction
    const userReaction = await prisma.videoReaction.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId,
        },
      },
      select: {
        value: true,
      },
    });

    return NextResponse.json({
      videoId: video.id,
      likesCount: video.likesCount,
      dislikesCount: video.dislikesCount,
      userReaction: userReaction?.value || null,
    });
  } catch (error) {
    console.error("Error fetching reaction status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Add or update a reaction
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { videoId, value } = body;

    // Validate input
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: "Value must be 1 (like) or -1 (dislike)" },
        { status: 400 }
      );
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Check for existing reaction
    const existingReaction = await prisma.videoReaction.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId,
        },
      },
    });

    let updatedVideo: Video; // Declare at the function scope

    if (existingReaction) {
      // User is changing their reaction
      if (existingReaction.value === value) {
        // Same reaction - remove it (toggle off)
        updatedVideo = await prisma.$transaction(async (tx) => {
          // Delete the reaction
          await tx.videoReaction.delete({
            where: {
              videoId_userId: {
                videoId,
                userId,
              },
            },
          });

          // Update counts and return
          return await tx.video.update({
            where: { id: videoId },
            data: {
              likesCount: value === 1 ? { decrement: 1 } : undefined,
              dislikesCount: value === -1 ? { decrement: 1 } : undefined,
            },
            select: {
              id: true,
              likesCount: true,
              dislikesCount: true,
            },
          });
        });

        return NextResponse.json({
          message: "Reaction removed",
          videoId: updatedVideo.id,
          likesCount: updatedVideo.likesCount,
          dislikesCount: updatedVideo.dislikesCount,
          userReaction: null,
        });
      } else {
        // Different reaction - update it
        updatedVideo = await prisma.$transaction(async (tx) => {
          // Update the reaction
          await tx.videoReaction.update({
            where: {
              videoId_userId: {
                videoId,
                userId,
              },
            },
            data: { value },
          });

          // Update counts (remove old, add new)
          const oldValue = existingReaction.value;
          return await tx.video.update({
            where: { id: videoId },
            data: {
              likesCount: oldValue === 1 
                ? { decrement: 1 } 
                : value === 1 
                ? { increment: 1 } 
                : undefined,
              dislikesCount: oldValue === -1 
                ? { decrement: 1 } 
                : value === -1 
                ? { increment: 1 } 
                : undefined,
            },
            select: {
              id: true,
              likesCount: true,
              dislikesCount: true,
            },
          });
        });

        return NextResponse.json({
          message: "Reaction updated",
          videoId: updatedVideo.id,
          likesCount: updatedVideo.likesCount,
          dislikesCount: updatedVideo.dislikesCount,
          userReaction: value,
        });
      }
    } else {
      // New reaction
      updatedVideo = await prisma.$transaction(async (tx) => {
        // Create the reaction
        await tx.videoReaction.create({
          data: {
            videoId,
            userId,
            value,
          },
        });

        // Update counts and return
        return await tx.video.update({
          where: { id: videoId },
          data: {
            likesCount: value === 1 ? { increment: 1 } : undefined,
            dislikesCount: value === -1 ? { increment: 1 } : undefined,
          },
          select: {
            id: true,
            likesCount: true,
            dislikesCount: true,
          },
        });
      });

      return NextResponse.json({
        message: "Reaction added",
        videoId: updatedVideo.id,
        likesCount: updatedVideo.likesCount,
        dislikesCount: updatedVideo.dislikesCount,
        userReaction: value,
      });
    }
  } catch (error) {
    console.error("Error handling reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}