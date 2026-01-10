export interface Video {
    id: string
    title: string
    description: string
    publicId: string
    originalSize: number
    compressedSize: number
    duration: number
    createdAt: Date
    updatedAt: Date
    likesCount: number
    dislikesCount: number
    reaction?: 1 | -1 | 0;
}