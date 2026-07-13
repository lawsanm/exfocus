"use server";

import { requireUserId } from "@/lib/auth/require-user";
import { search, type SearchResult } from "@/infrastructure/repositories/search-repository";

export async function searchAction(query: string): Promise<SearchResult[]> {
  const userId = await requireUserId();
  return search(userId, query);
}
