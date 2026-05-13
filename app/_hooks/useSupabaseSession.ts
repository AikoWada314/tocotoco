import { supabase } from "@/app/_libs/supabase";
import { Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export const useSupabaseSession = () => {
  // undefined: ログイン状態ロード中, null: ログインしていない, Session: ログインしている
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetcher = async () => {
      try {
        const {
          data: { session },
          //supabase.auth.getSession() でサーバーに「今ログインしてる？」と問い合わせる
        } = await supabase.auth.getSession();
        setSession(session);
        setToken(session?.access_token || null);
      } catch (error){
        setSession(null);
      }
    };
    fetcher();
    //pathnameが変わったら再ロード
  }, [pathname]);

  //sessionがundefinedの場合はロード中、nullの場合はログインしていない、Sessionの場合はログインしている
  return { session, isLoading: session === undefined, token };
};
