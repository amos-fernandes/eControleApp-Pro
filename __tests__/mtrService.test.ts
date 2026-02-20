/**
 * Tests for mtrService.ts
 * 
 * Tests A-H as specified in the task requirements
 */

// Mock expo-sharing first with inline mock definitions
jest.mock("expo-sharing", () => {
  const mockIsAvailableAsync = jest.fn().mockResolvedValue(true);
  const mockShareAsync = jest.fn().mockResolvedValue(undefined);
  return {
    isAvailableAsync: mockIsAvailableAsync,
    shareAsync: mockShareAsync,
  };
});

// Mock expo-file-system
jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///document/directory/",
  downloadAsync: jest.fn().mockResolvedValue({
    uri: "file:///document/directory/mtr-default.pdf",
    status: 200,
  }),
}));

// Mock axios
jest.mock("axios");

// Mock React Native Alert
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock database
jest.mock("../databases/database", () => ({
  getCredentials: jest.fn().mockReturnValue({
    accessToken: "mock-access-token",
    client: "mock-client",
    uid: "mock-uid",
  }),
  insertMTR: jest.fn(),
  updateMTRStatus: jest.fn(),
  getMTRById: jest.fn(),
}));

// Mock retrieveUserSession
jest.mock("../services/retrieveUserSession", () => ({
  retrieveDomain: jest.fn().mockResolvedValue({ data: "http://mock-domain.com" }),
}));

// Mock connection service
jest.mock("../services/connection", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

// Imports after mocks
import axios from "axios";
import {
  getTokenCetesb,
  emitMTRWebhook,
  downloadMTR,
  emitMTRCompleto,
  buildDefaultPayload,
  downloadMTRById,
  CetesbTokenRequest,
  EmitMTRPayload,
} from "../services/mtrService";

const mockedAxios = axios as jest.Mocked<typeof axios>;
const FileSystem = require("expo-file-system");
const Sharing = require("expo-sharing");

describe("mtrService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default mock implementations
    FileSystem.downloadAsync.mockResolvedValue({
      uri: "file:///document/directory/mtr-default.pdf",
      status: 200,
    });
    Sharing.isAvailableAsync.mockResolvedValue(true);
    Sharing.shareAsync.mockResolvedValue(undefined);
  });

  // ==========================================================================
  // Test A — getTokenCetesb sucesso
  // ==========================================================================
  describe("getTokenCetesb", () => {
    test("Teste A — retorna token quando access_token presente", async () => {
      // DADO: axios retorna { access_token: "TOKEN_XYZ" }
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: "TOKEN_XYZ" },
        status: 200,
      });

      // QUANDO: getTokenCetesb é chamado
      const credentials: CetesbTokenRequest = {
        cpfCnpj: "01442881178",
        senha: "devtesteeco",
        unidade: "19033",
      };
      const result = await getTokenCetesb(credentials);

      // ENTÃO: deve retornar a string "TOKEN_XYZ"
      expect(result).toBe("TOKEN_XYZ");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://mtrr-hom.cetesb.sp.gov.br/apiws/rest/gettoken",
        credentials,
        expect.objectContaining({
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        })
      );
    });

    // ==========================================================================
    // Teste B — getTokenCetesb campo alternativo
    // ==========================================================================
    test("Teste B — retorna token quando campo 'token' presente (sem access_token)", async () => {
      // DADO: axios retorna { token: "TOKEN_ALT" } (sem access_token)
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: "TOKEN_ALT" },
        status: 200,
      });

      // QUANDO: getTokenCetesb é chamado
      const credentials: CetesbTokenRequest = {
        cpfCnpj: "01442881178",
        senha: "devtesteeco",
        unidade: "19033",
      };
      const result = await getTokenCetesb(credentials);

      // ENTÃO: deve retornar "TOKEN_ALT"
      expect(result).toBe("TOKEN_ALT");
    });

    // ==========================================================================
    // Teste C — getTokenCetesb falha
    // ==========================================================================
    test("Teste C — lança Error com mensagem contendo 'getTokenCetesb →'", async () => {
      // DADO: axios lança erro com response.data = { message: "Credenciais inválidas" }
      const errorResponse = {
        response: {
          data: { message: "Credenciais inválidas" },
          status: 401,
        },
      };
      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      // QUANDO: getTokenCetesb é chamado
      const credentials: CetesbTokenRequest = {
        cpfCnpj: "01442881178",
        senha: "wrong-password",
        unidade: "19033",
      };

      // ENTÃO: deve lançar Error com mensagem contendo "getTokenCetesb →"
      await expect(getTokenCetesb(credentials)).rejects.toThrow("getTokenCetesb →");
    });
  });

  // ==========================================================================
  // Teste D — emitMTRWebhook URL correta
  // ==========================================================================
  describe("emitMTRWebhook", () => {
    test("Teste D — URL contém token e retorna mtr_id", async () => {
      // DADO: axios.post é mockado com sucesso retornando { mtr_id: "42" }
      mockedAxios.post.mockResolvedValueOnce({
        data: { mtr_id: "42", status: "success" },
        status: 200,
      });

      // QUANDO: emitMTRWebhook(payload, "MEU_TOKEN") é chamado
      const payload: EmitMTRPayload = {
        emission_state: "SP",
        generator_unit: "19033",
      };
      const result = await emitMTRWebhook(payload, "MEU_TOKEN");

      // ENTÃO:
      // - axios.post deve ter sido chamado com URL contendo "/emit/MEU_TOKEN"
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/emit/MEU_TOKEN"),
        payload,
        expect.objectContaining({
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        })
      );
      // - deve retornar objeto com mtr_id === "42"
      expect(result.mtr_id).toBe("42");
    });
  });

  // ==========================================================================
  // Teste E — downloadMTR caminho local correto
  // ==========================================================================
  describe("downloadMTR", () => {
    test("Teste E — FileSystem.downloadAsync chamado com URL correta", async () => {
      // DADO: FileSystem.downloadAsync é mockado retornando { status: 200, uri: "/local/mtr-42.pdf" }
      //       Sharing.isAvailableAsync retorna false
      FileSystem.downloadAsync.mockResolvedValueOnce({
        uri: "file:///document/directory/mtr-42.pdf",
        status: 200,
      });
      Sharing.isAvailableAsync.mockResolvedValueOnce(false);

      // QUANDO: downloadMTR("42") é chamado
      const result = await downloadMTR("42", undefined, false);

      // ENTÃO:
      // - FileSystem.downloadAsync deve ter sido chamado com URL contendo "/42/download"
      expect(FileSystem.downloadAsync).toHaveBeenCalledWith(
        expect.stringContaining("/42/download"),
        expect.stringContaining("mtr-42.pdf")
      );
      // - deve retornar { localUri: "/local/mtr-42.pdf", filename: "mtr-42.pdf" }
      expect(result.filename).toBe("mtr-42.pdf");
      expect(result.localUri).toContain("mtr-42.pdf");
    });

    // ==========================================================================
    // Teste F — downloadMTR com autoShare
    // ==========================================================================
    test("Teste F — Sharing.shareAsync chamado quando autoShare=true", async () => {
      // DADO: FileSystem.downloadAsync retorna { status: 200, uri: "/local/mtr-99.pdf" }
      //       Sharing.isAvailableAsync retorna true
      FileSystem.downloadAsync.mockResolvedValueOnce({
        uri: "file:///document/directory/mtr-99.pdf",
        status: 200,
      });
      Sharing.isAvailableAsync.mockResolvedValueOnce(true);
      Sharing.shareAsync.mockResolvedValueOnce(undefined);

      // QUANDO: downloadMTR("99", "mtr-99.pdf", true) é chamado
      const result = await downloadMTR("99", "mtr-99.pdf", true);

      // ENTÃO:
      // - Sharing.isAvailableAsync deve ter sido chamado
      expect(Sharing.isAvailableAsync).toHaveBeenCalled();
      // - Sharing.shareAsync deve ter sido chamado com uri contendo "mtr-99.pdf"
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        "file:///document/directory/mtr-99.pdf",
        expect.objectContaining({
          mimeType: "application/pdf",
        })
      );
      expect(result.filename).toBe("mtr-99.pdf");
    });
  });

  // ==========================================================================
  // Teste G — emitMTRCompleto fluxo completo
  // ==========================================================================
  describe("emitMTRCompleto", () => {
    test("Teste G — fluxo completo sem autoDownload", async () => {
      // DADO: getTokenCetesb retorna "TOKEN_OK"
      //       emitMTRWebhook retorna { mtr_id: "7", status: "success" }
      mockedAxios.post
        .mockResolvedValueOnce({
          data: { access_token: "TOKEN_OK" },
          status: 200,
        })
        .mockResolvedValueOnce({
          data: { mtr_id: "7", status: "success" },
          status: 200,
        });

      // QUANDO: emitMTRCompleto(payload, credentials, false) é chamado
      const payload: EmitMTRPayload = { emission_state: "SP" };
      const credentials: CetesbTokenRequest = {
        cpfCnpj: "01442881178",
        senha: "devtesteeco",
        unidade: "19033",
      };
      const result = await emitMTRCompleto(payload, credentials, false);

      // ENTÃO:
      // - resultado.emission.mtr_id deve ser "7"
      expect(result.emission.mtr_id).toBe("7");
      // - downloadMTR NÃO deve ter sido chamado (autoDownload=false)
      expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
      expect(result.download).toBeUndefined();
    });

    // ==========================================================================
    // Teste H — emitMTRCompleto com autoDownload
    // ==========================================================================
    test("Teste H — fluxo completo com autoDownload=true", async () => {
      // DADO: emitMTRWebhook retorna { mtr_id: "7" }
      //       downloadMTR é mockado retornando { localUri: "/local/mtr-7.pdf", filename: "mtr-7.pdf" }
      mockedAxios.post
        .mockResolvedValueOnce({
          data: { access_token: "TOKEN_OK" },
          status: 200,
        })
        .mockResolvedValueOnce({
          data: { mtr_id: "7", status: "success" },
          status: 200,
        });

      FileSystem.downloadAsync.mockResolvedValueOnce({
        uri: "file:///document/directory/mtr-7.pdf",
        status: 200,
      });
      Sharing.isAvailableAsync.mockResolvedValueOnce(false);

      // QUANDO: emitMTRCompleto(payload, credentials, true) é chamado
      const payload: EmitMTRPayload = { emission_state: "SP" };
      const credentials: CetesbTokenRequest = {
        cpfCnpj: "01442881178",
        senha: "devtesteeco",
        unidade: "19033",
      };
      const result = await emitMTRCompleto(payload, credentials, true);

      // ENTÃO:
      // - resultado.download deve existir e conter localUri
      expect(result.download).toBeDefined();
      expect(result.download?.localUri).toContain("mtr-7.pdf");
      // - downloadMTR deve ter sido chamado com mtrId "7"
      expect(FileSystem.downloadAsync).toHaveBeenCalledWith(
        expect.stringContaining("/7/download"),
        expect.any(String)
      );
    });
  });

  // ==========================================================================
  // Additional tests for buildDefaultPayload
  // ==========================================================================
  describe("buildDefaultPayload", () => {
    test("retorna payload com valores padrão", () => {
      const payload = buildDefaultPayload();

      expect(payload.emission_state).toBe("SP");
      expect(payload.responsible_name).toBe("Ana Ligia Colangelo Mantovani");
      expect(payload.generator_unit).toBe("19033");
      expect(payload.waste_items).toHaveLength(1);
    });

    test("permite overrides parciais", () => {
      const payload = buildDefaultPayload({
        company_id: "123",
        service_order_id: "456",
        driver_name: "João Silva",
      });

      expect(payload.company_id).toBe("123");
      expect(payload.service_order_id).toBe("456");
      expect(payload.driver_name).toBe("João Silva");
      // Valores padrão mantidos
      expect(payload.emission_state).toBe("SP");
      expect(payload.waste_items).toHaveLength(1);
    });
  });

  // ==========================================================================
  // Additional tests for downloadMTRById
  // ==========================================================================
  describe("downloadMTRById", () => {
    test("chama downloadMTR com parâmetros corretos", async () => {
      FileSystem.downloadAsync.mockResolvedValueOnce({
        uri: "file:///document/directory/mtr-123.pdf",
        status: 200,
      });
      Sharing.isAvailableAsync.mockResolvedValueOnce(false);

      const result = await downloadMTRById("123", false);

      expect(result.filename).toBe("mtr-123.pdf");
      expect(FileSystem.downloadAsync).toHaveBeenCalledWith(
        expect.stringContaining("/123/download"),
        expect.any(String)
      );
    });
  });
});
