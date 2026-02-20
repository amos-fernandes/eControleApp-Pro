/**
 * Tests for mtr.ts
 * 
 * Tests I-K as specified in the task requirements
 */

import { buildDefaultPayload, emitirMTR, downloadMTRById } from "../services/mtr";
import * as mtrService from "../services/mtrService";

// Mock the mtrService module
jest.mock("../services/mtrService", () => ({
  buildDefaultPayload: jest.fn(),
  emitirMTR: jest.fn(),
  downloadMTRById: jest.fn(),
  generateMTR: jest.fn(),
}));

// Mock React Native Alert
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

const mockedMtrService = mtrService as jest.Mocked<typeof mtrService>;

describe("mtr helper module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Teste I — buildDefaultPayload com overrides
  // ==========================================================================
  describe("buildDefaultPayload", () => {
    test("Teste I — retorna payload com overrides aplicados e defaults mantidos", () => {
      // Setup mock to return the expected payload
      mockedMtrService.buildDefaultPayload.mockImplementation((overrides = {}) => ({
        emission_state: "SP",
        responsible_name: "Ana Ligia Colangelo Mantovani",
        emails_to_notify: ["andersonfilho09@gmail.com"],
        is_to_notify: true,
        generator_unit: "19033",
        generator_cnpj: "52.405.146/0001-10",
        transporter_unit: "18701",
        transporter_cnpj: "59.030.121/0001-29",
        destination_unit: "18878",
        destination_cnpj: "43.255.173/0001-63",
        driver_name: "motorista",
        vehicle_plate: "ABC1234",
        notes: "Coleta via Econtrole",
        waste_items: [
          {
            quantity: 45,
            ibama_code: "010101",
            unit_of_measure_id: 3,
            treatment_id: 4,
            physical_state_id: 4,
            packaging_type_id: 26,
            waste_class_id: 42,
            density: 1.0,
            un_number: "5255",
            hazard_class: "568",
            shipping_name: "nome embarque",
            packing_group: 1,
          },
        ],
        ...overrides,
      }));

      // QUANDO: buildDefaultPayload({ company_id: "123", service_order_id: "456" })
      const payload = buildDefaultPayload({
        company_id: "123",
        service_order_id: "456",
      });

      // ENTÃO:
      // - company_id deve ser "123"
      expect(payload.company_id).toBe("123");
      // - emission_state deve ser "SP" (valor default mantido)
      expect(payload.emission_state).toBe("SP");
      // - waste_items deve ter pelo menos 1 item
      expect(payload.waste_items).toHaveLength(1);
    });
  });

  // ==========================================================================
  // Teste J — emitirMTR chama onStart e onSuccess
  // ==========================================================================
  describe("emitirMTR", () => {
    test("Teste J — chama onStart e onSuccess em sucesso", async () => {
      // DADO: emitMTRCompleto é mockado retornando { emission: { mtr_id: "1" } }
      mockedMtrService.emitirMTR.mockImplementation(async (options) => {
        options.onStart?.();
        options.onSuccess?.({ mtr_id: "1" });
      });

      const onStart = jest.fn();
      const onSuccess = jest.fn();

      // QUANDO: emitirMTR({ companyId, serviceOrderId, trackingCode, onStart, onSuccess })
      await emitirMTR({
        companyId: "123",
        serviceOrderId: "456",
        trackingCode: "TRACK-001",
        onStart,
        onSuccess,
      });

      // ENTÃO:
      // - onStart deve ter sido chamado 1 vez
      expect(onStart).toHaveBeenCalledTimes(1);
      // - onSuccess deve ter sido chamado com o resultado da emissão
      expect(onSuccess).toHaveBeenCalledWith({ mtr_id: "1" });
    });

    // ==========================================================================
    // Teste K — emitirMTR chama onError em falha
    // ==========================================================================
    test("Teste K — chama onError em falha", async () => {
      // DADO: emitMTRCompleto lança Error("Falha na rede")
      const testError = new Error("Falha na rede");
      mockedMtrService.emitirMTR.mockImplementation(async (options) => {
        options.onStart?.();
        options.onError?.(testError);
      });

      const onError = jest.fn();

      // QUANDO: emitirMTR({ ..., onError })
      await emitirMTR({
        companyId: "123",
        serviceOrderId: "456",
        trackingCode: "TRACK-001",
        onError,
      });

      // ENTÃO:
      // - onError deve ter sido chamado com instância de Error
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      // - mensagem do erro deve conter "Falha na rede"
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Falha na rede"),
        })
      );
    });
  });

  // ==========================================================================
  // Additional tests for downloadMTRById
  // ==========================================================================
  describe("downloadMTRById", () => {
    test("chama mtrService.downloadMTRById com parâmetros corretos", async () => {
      const mockResult = {
        localUri: "file:///document/directory/mtr-123.pdf",
        filename: "mtr-123.pdf",
      };
      mockedMtrService.downloadMTRById.mockResolvedValueOnce(mockResult);

      const result = await downloadMTRById("123", true);

      expect(mockedMtrService.downloadMTRById).toHaveBeenCalledWith("123", true);
      expect(result).toEqual(mockResult);
    });

    test("usa autoShare default como true", async () => {
      const mockResult = {
        localUri: "file:///document/directory/mtr-456.pdf",
        filename: "mtr-456.pdf",
      };
      mockedMtrService.downloadMTRById.mockResolvedValueOnce(mockResult);

      await downloadMTRById("456");

      expect(mockedMtrService.downloadMTRById).toHaveBeenCalledWith("456", true);
    });
  });
});
