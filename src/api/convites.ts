import { api } from "./client";
import {
  RegisterRequest,
  AuthResponse,
  ConviteCadastroDetalhe,
  GerarConviteCadastroPayload,
  ConviteCadastroCriadoResponse,
} from "./types";

export const conviteApi = {
  /**
   * Aceita um convite de cadastro enviando as informações do usuário
   */
  aceitarCadastro: (token: string, data: RegisterRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>(
      `/convites/aceitar/cadastro/${encodeURIComponent(token)}`,
      data
    );
  },

  /**
   * Lista todos os convites de cadastro (apenas ADMIN e INITIAL_ADMIN)
   */
  listarCadastros: (): Promise<ConviteCadastroDetalhe[]> => {
    return api.get<ConviteCadastroDetalhe[]>("/convites/cadastro");
  },

  /**
   * Gera e envia um novo convite de cadastro por email
   */
  gerarCadastro: (
    data: GerarConviteCadastroPayload
  ): Promise<ConviteCadastroCriadoResponse> => {
    return api.post<ConviteCadastroCriadoResponse>("/convites/cadastro", data);
  },

  /**
   * Revoga/inativa um convite de cadastro pendente
   */
  revogarCadastro: (id: number): Promise<void> => {
    return api.delete<void>(`/convites/cadastro/${id}`);
  },
};
