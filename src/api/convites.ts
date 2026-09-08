import { api } from "./client";
import {
  RegisterRequest,
  AuthResponse,
  ConviteCadastroDetalhe,
  GerarConviteCadastroPayload,
  ConviteCadastroCriadoResponse,
  ConviteCadastroPaginadoResponse,
  ListarCadastrosParams,
} from "./types";

export const conviteApi = {

  aceitarCadastro: (token: string, data: RegisterRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>(
      `/convites/aceitar/cadastro/${encodeURIComponent(token)}`,
      data
    );
  },

  listarCadastros: (
    params?: ListarCadastrosParams
  ): Promise<ConviteCadastroPaginadoResponse> => {
    return api.get<ConviteCadastroPaginadoResponse>("/convites/cadastro", {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 5,
        email: params?.email || undefined,
        status: params?.status ?? "ativos",
      },
    });
  },

  gerarCadastro: (
    data: GerarConviteCadastroPayload
  ): Promise<ConviteCadastroCriadoResponse> => {
    return api.post<ConviteCadastroCriadoResponse>("/convites/cadastro", data);
  },

  revogarCadastro: (id: number): Promise<void> => {
    return api.delete<void>(`/convites/cadastro/${id}`);
  },
};
