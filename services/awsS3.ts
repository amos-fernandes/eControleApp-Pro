// AWS S3 Service using crypto-js for V4 signature (React Native compatible)
import axios from 'axios';
import CryptoJS from 'crypto-js';

const AWS_CONFIG = {
  accessKeyId: 'AKIA6AYP5D5ZAQ7K5NGO', 
  secretAccessKey: '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', 
  region: 'us-east-2',
  bucketName: 'bkt-econtrole', 
  folderName: 'imagens-econtole',
};

// AWS Signature V4 Helper Functions
const getSignatureKey = (key: string, dateStamp: string, regionName: string, serviceName: string): CryptoJS.lib.WordArray => {
  const kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
  const kRegion = CryptoJS.HmacSHA256(regionName, kDate);
  const kService = CryptoJS.HmacSHA256(serviceName, kRegion);
  const kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
  return kSigning;
};

const signRequest = (
  method: string,
  path: string,
  host: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  payload: string | ArrayBuffer,
  additionalHeaders: Record<string, string> = {}
): Record<string, string> => {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substr(0, 8);
  
  // Calculate payload hash
  const payloadHash = CryptoJS.SHA256(
    typeof payload === 'string' ? payload : CryptoJS.lib.WordArray.create(payload as any)
  ).toString();
  
  // Headers
  const headers: Record<string, string> = {
    'host': host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    ...additionalHeaders,
  };
  
  // Create canonical headers
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
    .join('\n') + '\n';
  
  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';');
  
  // Create canonical request
  const canonicalRequest = [
    method,
    path,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    CryptoJS.SHA256(canonicalRequest).toString(),
  ].join('\n');
  
  // Calculate signature
  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, 's3');
  const signature = CryptoJS.HmacSHA256(stringToSign, signingKey).toString();
  
  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return {
    ...headers,
    'Authorization': authorizationHeader,
  };
};

export const uploadImageToS3 = async (imageUri: string, serviceOrderId: number): Promise<string> => {
  try {
    const fileName = `service_order_${serviceOrderId}_${Date.now()}.jpg`;
    const fullPath = `${AWS_CONFIG.folderName}/${fileName}`;
    
    // Fetch image data
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    
    const host = `${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com`;
    const path = `/${fullPath}`;
    const url = `https://${host}${path}`;
    
    // Sign the request
    const signedHeaders = signRequest(
      'PUT',
      path,
      host,
      AWS_CONFIG.region,
      AWS_CONFIG.accessKeyId,
      AWS_CONFIG.secretAccessKey,
      arrayBuffer,
      {
        'Content-Type': 'image/jpeg',
      }
    );
    
    // Upload to S3
    const uploadResponse = await axios.put(url, arrayBuffer, {
      headers: signedHeaders,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    
    console.log('✅ Upload to S3 successful!', uploadResponse.status, uploadResponse.statusText);
    
    return url;
  } catch (error: any) {
    console.error('❌ Error uploading to S3:', error.response?.data || error.message);
    throw new Error('Falha ao enviar imagem para o armazenamento');
  }
};

export const deleteImageFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    const fileName = imageUrl.split('/').pop() || '';
    const fullPath = `${AWS_CONFIG.folderName}/${fileName}`;
    
    const host = `${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com`;
    const path = `/${fullPath}`;
    const url = `https://${host}${path}`;
    
    // Sign the request (empty payload for DELETE)
    const signedHeaders = signRequest(
      'DELETE',
      path,
      host,
      AWS_CONFIG.region,
      AWS_CONFIG.accessKeyId,
      AWS_CONFIG.secretAccessKey,
      ''
    );
    
    const deleteResponse = await axios.delete(url, {
      headers: signedHeaders,
    });
    
    console.log('✅ Delete from S3 successful!', deleteResponse.status, deleteResponse.statusText);
  } catch (error: any) {
    console.error('❌ Error deleting from S3:', error.response?.data || error.message);
    throw new Error('Falha ao deletar imagem do armazenamento');
  }
};

export default { uploadImageToS3, deleteImageFromS3 };
