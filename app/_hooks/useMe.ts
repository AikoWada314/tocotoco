import useSWR from "swr";
import { MeResponse } from "@/app/api/me/route";
import { useSupabaseSession } from "./useSupabaseSession";

export const useMe = () => {
  const { session } = useSupabaseSession();
  const fetcher = async (url: string) => {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (resp.status !== 200) {
      const errorData = await resp.json();
      throw new Error(errorData.message);
    }
    return resp.json();
  };

  const { data: me, isLoading } = useSWR<MeResponse>(
    session ? "/api/me" : null,
    fetcher,
  );
  return { me, isLoading };
};
