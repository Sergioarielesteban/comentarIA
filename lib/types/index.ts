export type Alineacion = "alta" | "media" | "baja";
export type Tendencia = "up" | "stable" | "down";
export type Impacto = "alto" | "medio" | "bajo";

export interface Resena {
  autor: string;
  nota: number | null;
  texto: string;
  hace: string;
  tiempo?: number | string;
}

export interface Place {
  place_id?: string | null;
  nombre: string;
  direccion?: string;
  rating?: number | null;
  total?: number | null;
}

export interface TemaPositivo {
  tema: string;
  menciones: number;
  ejemplo: string;
  tendencia: Tendencia;
  porQue: string;
  accion: string;
}

export interface TemaNegativo {
  tema: string;
  menciones: number;
  ejemplo: string;
  impacto: Impacto;
  tendencia: Tendencia;
  porQue: string;
  accion: string;
}

export interface EspejoItem {
  tema: string;
  dueno: string;
  clientes: string;
  menciones: number;
  alineacion: Alineacion;
  consejo: string;
}

export interface DistribucionEstrellas {
  estrellas: 1 | 2 | 3 | 4 | 5;
  total: number;
  porcentaje: number;
}

export interface Analysis {
  temasPositivos: TemaPositivo[];
  temasNegativos: TemaNegativo[];
  espejo: EspejoItem[];
  briefing: string;
  datoPositivo: string;
  distribucion: DistribucionEstrellas[];
}

export interface RestauranteRow {
  id: string;
  user_id: string;
  place_id: string | null;
  nombre: string;
  direccion: string | null;
  rating: number | null;
  total_resenas: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
}
