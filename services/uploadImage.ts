import { uploadImageToS3 } from "./awsS3"
import { ResponseInterface } from "../interfaces/Response"

const uploadImage = async (imageUri: string, serviceOrderId: number): Promise<ResponseInterface | undefined> => {
  try {
    const imageUrl = await uploadImageToS3(imageUri, serviceOrderId)
    
    return { 
      status: 200, 
      data: { 
        image_url: imageUrl,
        message: 'Upload de imagem concluído com sucesso'
      } 
    }
  } catch (error: any) {
    console.log("Erro no upload de imagem:", error)
    
    return { 
      status: 500, 
      data: error.message || "Erro ao fazer upload da imagem" 
    }
  }
}

export default uploadImage
