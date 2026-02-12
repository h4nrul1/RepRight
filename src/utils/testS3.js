import { uploadVideoToS3 } from "./s3Uploads";
import RNFS from "react-native-fs";

export async function testUpload() {
    try {
        // Create a small test file in the app's temporary directory
        const testFilePath = `${RNFS.TemporaryDirectoryPath}/test-video.mp4`;
        await RNFS.writeFile(testFilePath, 'fake-video-content', 'utf8');

        console.log('📝 Test file created at:', testFilePath);

        const videoUrl = await uploadVideoToS3(
            testFilePath,
            'test-user-123',
            'bench-press'
        );

        console.log('✅ Test passed! Video URL:', videoUrl);
        return videoUrl;
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}