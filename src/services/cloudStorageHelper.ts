/**
 * Helper de Armazenamento na Nuvem para PDF Binário (pdfBuffer) e Dados Fiscais
 * Suporta Amazon S3, Google Cloud Storage, Supabase Storage e PostgreSQL (Bytea/Blob)
 */

export interface CloudUploadParams {
  pdfBuffer: Buffer;
  chaveAcesso: string;
  numeroNota: string;
  cnpjSistema: string;
}

/**
 * Exemplo 1: Upload para Amazon S3 (AWS SDK v3)
 * @example
 * const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
 * const s3 = new S3Client({ region: 'us-east-1' });
 */
export async function uploadToAmazonS3(params: CloudUploadParams, s3Client?: any, bucketName: string = 'meu-bucket-s3-nfe'): Promise<string> {
  const fileKey = `danfes/${params.cnpjSistema}/${params.chaveAcesso}.pdf`;

  if (s3Client && typeof s3Client.send === 'function') {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: params.pdfBuffer,
      ContentType: 'application/pdf',
      Metadata: {
        chaveAcesso: params.chaveAcesso,
        numeroNota: params.numeroNota,
        cnpjCliente: params.cnpjSistema
      }
    }));
    return `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
  }

  // URL simulada de retorno para homologação
  return `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
}

/**
 * Exemplo 2: Upload para Google Cloud Storage (GCS)
 */
export async function uploadToGoogleCloudStorage(params: CloudUploadParams, gcsStorageClient?: any, bucketName: string = 'meu-bucket-gcs-fiscais'): Promise<string> {
  const filePath = `danfes/${params.cnpjSistema}/${params.chaveAcesso}.pdf`;

  if (gcsStorageClient) {
    const file = gcsStorageClient.bucket(bucketName).file(filePath);
    await file.save(params.pdfBuffer, {
      contentType: 'application/pdf',
      metadata: {
        metadata: {
          chaveAcesso: params.chaveAcesso,
          numeroNota: params.numeroNota
        }
      }
    });
    return `https://storage.googleapis.com/${bucketName}/${filePath}`;
  }

  return `https://storage.googleapis.com/${bucketName}/${filePath}`;
}

/**
 * Exemplo 3: Upload para Supabase Storage
 */
export async function uploadToSupabaseStorage(params: CloudUploadParams, supabaseClient?: any, bucketName: string = 'documentos-fiscais'): Promise<string> {
  const filePath = `${params.cnpjSistema}/DANFE-${params.numeroNota}_${params.chaveAcesso}.pdf`;

  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .storage
      .from(bucketName)
      .upload(filePath, params.pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) throw new Error(`Erro Supabase Storage: ${error.message}`);
    
    const { data: publicUrlData } = supabaseClient.storage.from(bucketName).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }

  return `https://xyz.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;
}
