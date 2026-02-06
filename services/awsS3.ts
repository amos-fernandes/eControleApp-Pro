import AWS from 'aws-sdk';

// Configurações do AWS S3
// Bucket: s3://bkt-econtrole/imagens-econtole/
const AWS_CONFIG = {
  accessKeyId: 'AKIA6AYP5D5ZAQ7K5NGO', 
  secretAccessKey: '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', 
  region: 'us-east-2', // Região do bucket (Ohio) - conforme URL do teste
  bucketName: 'bkt-econtrole', // Nome do bucket
  folderName: 'imagens-econtole', // Pasta para armazenar as imagens
};

// Inicializar o AWS S3
AWS.config.update({
  accessKeyId: AWS_CONFIG.accessKeyId,
  secretAccessKey: AWS_CONFIG.secretAccessKey,
  region: AWS_CONFIG.region,
});

const s3 = new AWS.S3();

/**
 * Faz upload de uma imagem para o AWS S3
 * @param imageUri URI da imagem a ser uploadada
 * @param serviceOrderId ID da ordem de serviço
 * @returns URL pública da imagem no S3
 */
const uploadImageToS3 = async (imageUri: string, serviceOrderId: number): Promise<string> => {
  try {
    // Gerar nome único para o arquivo
    const fileName = `service_order_${serviceOrderId}_${Date.now()}.jpg`;
    const fullPath = `${AWS_CONFIG.folderName}/${fileName}`;
    
    // Ler o arquivo da imagem
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parâmetros do upload para o S3
    const params = {
      Bucket: AWS_CONFIG.bucketName,
      Key: fullPath,
      Body: buffer,
      ContentType: 'image/jpeg',
    };

    // Fazer upload para o S3
    const uploadResult = await s3.upload(params).promise();

    console.log('Upload para S3 concluído:', uploadResult.Location);
    return uploadResult.Location; // URL pública da imagem
  } catch (error) {
    console.error('Erro ao fazer upload para o S3:', error);
    throw new Error('Falha ao enviar imagem para o armazenamento');
  }
};

/**
 * Deleta uma imagem do AWS S3
 * @param imageUrl URL da imagem a ser deletada
 * @returns Promise<void>
 */
const deleteImageFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    // Extrair o caminho completo do arquivo da URL
    // Exemplo de URL: https://bkt-econtrole.s3.sa-east-1.amazonaws.com/imagens-econtole/nome-do-arquivo.jpg
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      throw new Error('URL de imagem inválida');
    }

    const fullPath = `${AWS_CONFIG.folderName}/${fileName}`;

    const params = {
      Bucket: AWS_CONFIG.bucketName,
      Key: fullPath,
    };

    await s3.deleteObject(params).promise();
    console.log('Imagem deletada do S3:', fileName);
  } catch (error) {
    console.error('Erro ao deletar imagem do S3:', error);
    throw new Error('Falha ao deletar imagem do armazenamento');
  }
};

export { uploadImageToS3, deleteImageFromS3 };
export default { uploadImageToS3, deleteImageFromS3 };
