import "server-only";

import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { RoommateListItem, RoommateNameMap } from "@/types/app";

const publicRoommateColumns = "id, group_id, name, login_id, phone, role, is_active, created_at, updated_at";

async function getRoommatesForGroupUncached(groupId: string): Promise<RoommateListItem[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("roommates")
    .select(publicRoommateColumns)
    .eq("group_id", groupId)
    .order("is_active", { ascending: false })
    .order("name");

  if (error) {
    throw new Error(`Could not load roommates: ${error.message}`);
  }

  return (data ?? []) as RoommateListItem[];
}

export const getRoommatesForGroup = cache(getRoommatesForGroupUncached);

export async function getActiveRoommatesForGroup(groupId: string): Promise<RoommateListItem[]> {
  const roommates = await getRoommatesForGroup(groupId);
  return roommates.filter((roommate) => roommate.is_active);
}

export function makeRoommateNameMap(roommates: RoommateListItem[]): RoommateNameMap {
  return roommates.reduce<RoommateNameMap>((map, roommate) => {
    map[roommate.id] = {
      id: roommate.id,
      name: roommate.name,
      phone: roommate.phone,
    };
    return map;
  }, {});
}
