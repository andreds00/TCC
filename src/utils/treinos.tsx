// src/services/treinos.ts
import { supabase } from "@/lib/supabase";

/**
 * Busca todos os treinos do usuário e retorna os dados brutos.
 * Não faz parsing pesado — apenas retorna o array ou lança erro.
 */
export async function listTreinosByUser(userId: string) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("treinos")
    .select("id, user_id, data, horario, esporte, created_at")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Retorna o último treino passado (data+horario < now) ou null.
 * Faz parsing defensivo de data + horario.
 */
export async function fetchLastWorkout(userId: string) {
  const rows = await listTreinosByUser(userId);
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const now = new Date();

  const parsed = rows
    .map((t: any) => {
      let fullDate: Date | null = null;
      try {
        const datePart = t.data ? String(t.data) : null;
        const timePart = t.horario ? String(t.horario).trim() : null;

        if (datePart && timePart) {
          const timeNormalized = timePart.length === 5 ? `${timePart}:00` : timePart;
          fullDate = new Date(`${datePart}T${timeNormalized}`);
        } else if (datePart) {
          fullDate = new Date(datePart);
        } else if (timePart) {
          const [hh, mm] = timePart.split(":").map((s: string) => Number(s));
          if (!Number.isNaN(hh)) {
            fullDate = new Date();
            fullDate.setHours(hh, mm || 0, 0, 0);
          }
        }
        if (fullDate && isNaN(fullDate.getTime())) fullDate = null;
      } catch (e) {
        fullDate = null;
      }
      return { original: t, fullDate };
    })
    .filter((p: any) => p.fullDate && p.fullDate.getTime() < now.getTime());

  if (parsed.length === 0) return null;

  parsed.sort((a: any, b: any) => b.fullDate.getTime() - a.fullDate.getTime());
  const chosen = parsed[0];
  if (!chosen || !chosen.fullDate) return null;
  const last = chosen.original;
  const lastDate = chosen.fullDate;

  return {
    ...last,
    _scheduledDateObj: lastDate,
    _scheduledFormatted: lastDate.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
