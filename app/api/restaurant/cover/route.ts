import { getServerSupabase, getServerUser } from "@/lib/server/auth";
import { ApiError, apiErrorResponse } from "@/lib/server/errors";
import { requireUserRestaurant } from "@/lib/server/restaurant";
import {
  buildCoverStoragePath,
  validateCoverFile,
} from "@/lib/server/upload-cover";

export const runtime = "nodejs";
export const maxDuration = 30;

const BUCKET = "restaurant-covers";

function mapDbError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("cover_image") && lower.includes("column")) {
    return "Faltan columnas en Supabase. Ejecuta las migraciones 0004 y 0006 en el SQL Editor.";
  }
  if (lower.includes("set_restaurant_cover") || lower.includes("function")) {
    return "Falta la función set_restaurant_cover. Ejecuta supabase/migrations/0006_fix_cover_upload.sql en Supabase.";
  }
  if (lower.includes("restaurant-covers") || lower.includes("bucket")) {
    return "Crea el bucket «restaurant-covers» en Supabase → Storage (público) o ejecuta la migración 0005.";
  }
  if (lower.includes("no tienes un restaurante")) {
    return "Primero vincula un restaurante en el onboarding.";
  }
  return message.length < 200 ? message : "No se pudo actualizar la imagen del restaurante.";
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    await requireUserRestaurant(user.id);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(400, "Selecciona una imagen de tu dispositivo.");
    }

    const validation = validateCoverFile(file);
    if ("error" in validation) {
      throw new ApiError(400, validation.error);
    }

    const path = buildCoverStoragePath(user.id, validation.ext);
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = await getServerSupabase();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.warn("[cover-upload] storage:", uploadError.message);
      throw new ApiError(
        500,
        mapDbError(uploadError.message) ||
          "No se pudo guardar la imagen en Storage. Crea el bucket «restaurant-covers» en Supabase.",
      );
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    // RPC con SECURITY DEFINER — evita bloqueos del trigger antiguo
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "set_restaurant_cover",
      { p_url: publicUrl },
    );

    if (rpcError) {
      console.warn("[cover-upload] rpc:", rpcError.message);
      throw new ApiError(500, mapDbError(rpcError.message));
    }

    const payload = rpcData as {
      cover_image_url?: string;
      cover_image_source?: string;
      cover_image_updated_at?: string;
    } | null;

    if (!payload?.cover_image_url) {
      // Fallback si la RPC no existe aún: update directo
      const now = new Date().toISOString();
      const { data: updated, error: dbError } = await supabase
        .from("user_restaurants")
        .update({
          cover_image_url: publicUrl,
          cover_image_source: "upload",
          cover_image_updated_at: now,
        })
        .eq("user_id", user.id)
        .select("cover_image_url, cover_image_source, cover_image_updated_at")
        .maybeSingle();

      if (dbError || !updated) {
        console.warn("[cover-upload] db:", dbError?.message);
        throw new ApiError(
          500,
          mapDbError(dbError?.message ?? "Sin filas actualizadas"),
        );
      }

      return Response.json(updated);
    }

    return Response.json(payload);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
