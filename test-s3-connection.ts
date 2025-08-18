import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Simple script to test AWS S3 connection and bucket access
 */
async function testS3Connection() {
  console.log('🚀 Testing AWS S3 Connection...\n');

  // Validate environment variables
  const requiredEnvs = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_NAME'];
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  
  if (missingEnvs.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvs.join(', '));
    process.exit(1);
  }

  // Initialize S3 client
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    ...(process.env.S3_ENDPOINT && {
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
    }),
  });

  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  try {
    // Test 1: List bucket contents
    console.log('📋 Test 1: Listing bucket contents...');
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 5,
    });
    
    const listResult = await s3Client.send(listCommand);
    console.log(`✅ Successfully connected to bucket: ${bucketName}`);
    console.log(`📁 Found ${listResult.KeyCount || 0} objects in bucket`);
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log('📄 Sample files:');
      listResult.Contents.slice(0, 3).forEach((obj, index) => {
        console.log(`   ${index + 1}. ${obj.Key} (${(obj.Size! / 1024).toFixed(2)} KB)`);
      });
    }

    // Test 2: Upload a test file
    console.log('\n📤 Test 2: Uploading test file...');
    const testContent = 'This is a test file created at ' + new Date().toISOString();
    const testKey = 'test/connection-test.txt';
    
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      ACL: 'public-read',
    });

    await s3Client.send(uploadCommand);
    console.log('✅ Test file uploaded successfully');
    
    // Generate URL
    const url = process.env.S3_ENDPOINT 
      ? `${process.env.S3_ENDPOINT}/${bucketName}/${testKey}`
      : `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${testKey}`;
    
    console.log(`🔗 File URL: ${url}`);

    console.log('\n🎉 All tests passed! Your S3 setup is working correctly.');
    console.log('\n📝 Configuration Summary:');
    console.log(`   Region: ${process.env.AWS_REGION}`);
    console.log(`   Bucket: ${bucketName}`);
    console.log(`   Endpoint: ${process.env.S3_ENDPOINT || 'AWS S3 (default)'}`);

  } catch (error: any) {
    console.error('\n❌ S3 connection test failed:');
    
    if (error.name === 'NoSuchBucket') {
      console.error(`   Bucket "${bucketName}" does not exist or you don't have access`);
    } else if (error.name === 'InvalidAccessKeyId') {
      console.error('   Invalid AWS Access Key ID');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('   Invalid AWS Secret Access Key');
    } else if (error.name === 'AccessDenied') {
      console.error('   Access denied - check IAM permissions');
    } else {
      console.error(`   ${error.name}: ${error.message}`);
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Verify your AWS credentials are correct');
    console.log('   2. Check if the bucket exists and is in the correct region');
    console.log('   3. Ensure your IAM user has the necessary permissions');
    console.log('   4. Check the AWS_S3_SETUP_GUIDE.md for detailed setup instructions');
    
    process.exit(1);
  }
}

// Run the test
testS3Connection().catch(console.error);
