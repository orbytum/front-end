export interface RegisterRequest {
  nome: string;
  senha: string;
  telefone: string;
  titulo: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface ConviteCadastroDetalhe {
  id: number;
  email: string;
  token: string;
  urlConvite: string;
  dthRegistro: string;
  dthExpiracao: string;
  ativo: boolean;
}

export interface GerarConviteCadastroPayload {
  email: string;
  diasValidade?: number;
}

export interface ConviteCadastroCriadoResponse {
  idConvite: number;
  token: string;
  urlConvite: string;
  dthExpiracao: string;
}
