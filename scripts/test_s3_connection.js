// Script de teste para verificar conexão e upload para o AWS S3
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configurações do AWS S3 (copiadas do projeto)
const AWS_CONFIG = {
  accessKeyId: 'AKIA6AYP5D5ZAQ7K5NGO', 
  secretAccessKey: '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', 
  region: 'us-east-2', // Ohio - região do bucket
  bucketName: 'bkt-econtrole',
  folderName: 'imagens-econtole',
};

// Inicializar o AWS S3
AWS.config.update({
  accessKeyId: AWS_CONFIG.accessKeyId,
  secretAccessKey: AWS_CONFIG.secretAccessKey,
  region: AWS_CONFIG.region,
});

const s3 = new AWS.S3();

// Testar conexão com o S3
console.log('Testando conexão com o AWS S3...');

// Listar buckets para verificar a conexão
s3.listBuckets(function(err, data) {
  if (err) {
    console.error('Erro ao conectar ao AWS S3:', err);
    process.exit(1);
  } else {
    console.log('✅ Conexão com AWS S3 estabelecida com sucesso!');
    console.log('Buckets disponíveis:', data.Buckets.map(bucket => bucket.Name));
    
    // Verificar se o bucket bkt-econtrole existe
    const bucketExists = data.Buckets.some(bucket => bucket.Name === AWS_CONFIG.bucketName);
    if (bucketExists) {
      console.log(`✅ Bucket ${AWS_CONFIG.bucketName} encontrado!`);
      
      // Testar upload de um arquivo de teste
      testUpload();
    } else {
      console.error(`❌ Bucket ${AWS_CONFIG.bucketName} não encontrado`);
      process.exit(1);
    }
  }
});

// Função para testar o upload
async function testUpload() {
  try {
    console.log('Testando upload de arquivo para o S3...');
    
    // Criar um arquivo de teste
    const testFileName = `test_connection_${Date.now()}.txt`;
    const testFileContent = 'Arquivo de teste para verificar a conexão com o AWS S3';
    fs.writeFileSync(testFileName, testFileContent);
    
    // Parâmetros do upload
    const params = {
      Bucket: AWS_CONFIG.bucketName,
      Key: `${AWS_CONFIG.folderName}/${testFileName}`,
      Body: fs.createReadStream(testFileName),
      ContentType: 'text/plain',
    };
    
    // Fazer upload
    const uploadResult = await s3.upload(params).promise();
    
    console.log(`✅ Upload realizado com sucesso!`);
    console.log(`URL da arquivo: ${uploadResult.Location}`);
    
    // Testar download para verificar a integridade
    console.log('Testando download do arquivo...');
    const downloadParams = {
      Bucket: AWS_CONFIG.bucketName,
      Key: `${AWS_CONFIG.folderName}/${testFileName}`,
    };
    
    const downloadResult = await s3.getObject(downloadParams).promise();
    console.log(`✅ Download concluído com sucesso!`);
    console.log(`Conteúdo do arquivo: ${downloadResult.Body.toString()}`);
    
    // Limpar arquivo local e remover do S3
    fs.unlinkSync(testFileName);
    await s3.deleteObject(downloadParams).promise();
    console.log(`✅ Arquivo removido do S3 e do sistema local.`);
    
    console.log('\n🎉 Todos os testes concluídos com sucesso!');
    console.log('A configuração do AWS S3 está funcionando corretamente.');
    console.log(`O bucket ${AWS_CONFIG.bucketName} e a pasta ${AWS_CONFIG.folderName} estão prontos para uso.`);
    
  } catch (error) {
    console.error('❌ Erro no teste de upload:', error);
    process.exit(1);
  }
}

// Tratar erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
