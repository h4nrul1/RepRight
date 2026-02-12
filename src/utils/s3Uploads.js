import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME } from '@env';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

const s3Client = new S3Client ({
    region: AWS_REGION,
    credentials: { 
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
})

export async function uploadVideoToS3(fileUri, userId, exerciseName) {
    try {
        console.log('📤 Starting upload for: ', exerciseName);

        // Generate unique file name
        const timestamp = Date.now();
        const fileName = `${userId}/${exerciseName}/${timestamp}.mp4`;

        // Read file as base64
        const fileData = await RNFS.readFile(fileUri, 'base64');
        const buffer = Buffer.from(fileData, 'base64');

        const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: 'video/mp4',
        });

        await s3Client.send(command);
        
        const videoUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
        console.log('✅ Upload complete:', videoUrl);
        
        return videoUrl;
    } catch (error) {
        console.error('❌ Upload error: ', error);
        throw error; 
    }
}