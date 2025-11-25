// app/_layout.tsx
import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";

import { AuthProvider, useAuth } from "../contextos/AuthContext";
import { supabase } from "@/lib/supabase";

/**
 * Layout com Stack (mantém design em pilha) e AuthObserver seguro.
 * Substitua seu app/_layout.tsx por este arquivo.
 */

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Poppins_400Regular });
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider style={styles.root}>
          <MainLayout />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

function MainLayout() {
  // Stack visual — você pode adicionar configurações globais aqui
  return (
    <>
      <AuthObserver />
      <Stack screenOptions={{ headerShown: false }}>
        {/* O expo-router vai mapear automaticamente as screens dentro de /app */}
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}

/**
 * AuthObserver: observa mudanças de auth e navega com proteções contra loops.
 * - Só navega se o userId mudou de fato.
 * - Só navega se a rota atual for diferente da rota alvo.
 * - Debounce mínimo entre duas navegações (500ms).
 */
function AuthObserver() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const currentPath = "/" + (segments.length ? segments.join("/") : "");

  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  const handlingRef = useRef(false);
  const lastNavAtRef = useRef<number>(0);

  useEffect(() => {
    // registra listener do supabase
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // proteção contra reentrância
      if (handlingRef.current) return;
      handlingRef.current = true;

      try {
        const newUserId = session?.user?.id ?? null;

        // se não mudou, ignora (evita loops quando supabase emite eventos redundantes)
        if (prevUserIdRef.current === newUserId) {
          handlingRef.current = false;
          return;
        }

        // atualiza prev
        prevUserIdRef.current = newUserId;

        // debounce entre navegações
        const now = Date.now();
        if (now - lastNavAtRef.current < 500) {
          handlingRef.current = false;
          return;
        }
        lastNavAtRef.current = now;

        // decide rota alvo
        const targetLogged = "/pages/(logado)/home/page";
        const targetLoggedOut = "/pages/(deslogado)/inicial/page";

        if (session?.user) {
          setAuth(session.user);
          // só navega se não estivermos já na rota desejada
          if (!currentPath.includes("/(logado)/home")) {
            router.replace(targetLogged);
          }
        } else {
          setAuth(null);
          if (!currentPath.includes("/(deslogado)/inicial")) {
            router.replace(targetLoggedOut);
          }
        }
      } catch (err) {
        console.warn("AuthObserver error:", err);
      } finally {
        handlingRef.current = false;
      }
    });

    return () => {
      // cleanup defensivo do listener
      try {
        if (data?.subscription?.unsubscribe) data.subscription.unsubscribe();
        else if (typeof (data as any)?.unsubscribe === "function") (data as any).unsubscribe();
      } catch (e) {
        console.warn("Erro ao desinscrever auth listener:", e);
      }
    };
    // deliberadamente deixamos dependências mínimas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAuth, router]);

  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
