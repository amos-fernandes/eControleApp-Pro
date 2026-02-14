import { Linking } from "react-native";
import { retrieveDomain } from "./retrieveUserSession";
import { getCredentials, insertMTR, updateMTRStatus, getMTRById } from "../databases/database";

interface MtrRequest {
  service_order_id: string;
}

interface MtrResponse {
  mtr_id: string;
  status: string;
  message: string;
}

/**
 * Emite uma MTR para uma ordem de serviço específica
 */
export const emitMTR = async (serviceOrderId: string): Promise<MtrResponse> => {
  try {
    // Usando a URL do servidor remoto conforme solicitado
    const baseURL = "http://159.89.191.25:8000";

    const credentials: any = getCredentials();
    if (!credentials || !credentials.accessToken) {
      console.warn("emitMTR: No credentials found in local DB");
      throw new Error("NO_CREDENTIALS");
    }

    // Dados para a requisição
    const requestData: MtrRequest = {
      service_order_id: serviceOrderId
    };

    // Configurar cabeçalhos da requisição
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${credentials.accessToken}`, // Assumindo que a API remota use Bearer token
    };

    // Fazer a requisição para a API remota
    const response = await fetch(`${baseURL}/docs/swagger/mtr/emit`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const result: MtrResponse = await response.json();
    
    // Persistir a informação da MTR emitida no banco de dados local
    try {
      insertMTR(parseInt(serviceOrderId), result.mtr_id, result.status);
    } catch (dbError) {
      console.error("Erro ao persistir MTR no banco de dados local:", dbError);
      // Não lançar erro aqui para não interromper o processo principal
    }
    
    return result;

  } catch (error: any) {
    console.error("Erro ao emitir MTR:", error);
    throw error;
  }
};

/**
 * Faz o download do PDF da MTR
 */
export const downloadMTR = async (mtrId: string): Promise<Blob> => {
  try {
    // Usando a URL do servidor remoto conforme solicitado
    const baseURL = "http://159.89.191.25:8000";

    const credentials: any = getCredentials();
    if (!credentials || !credentials.accessToken) {
      console.warn("downloadMTR: No credentials found in local DB");
      throw new Error("NO_CREDENTIALS");
    }

    // Configurar cabeçalhos da requisição
    const headers: HeadersInit = {
      "Authorization": `Bearer ${credentials.accessToken}`, // Assumindo que a API remota use Bearer token
    };

    // Fazer a requisição para baixar o PDF
    const response = await fetch(`${baseURL}/docs/swagger/mtr/${mtrId}/download`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erro ao baixar MTR: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    return blob;

  } catch (error: any) {
    console.error("Erro ao baixar MTR:", error);
    throw error;
  }
};

/**
 * Retorna a URL para download do PDF da MTR
 */
export const getMTRDownloadUrl = (mtrId: string): string => {
  // Usando a URL do servidor remoto conforme solicitado
  const baseURL = "http://159.89.191.25:8000";

  // Construir a URL diretamente para o endpoint de download
  return `${baseURL}/docs/swagger/mtr/${mtrId}/download`;
};