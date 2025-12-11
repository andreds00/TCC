// app/_layout.tsx
import React, { useEffect, useRef } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";

import { AuthProvider, useAuth } from "../contextos/AuthContext";
import { supabase } from "@/lib/supabase";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, 
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Poppins_400Regular });
  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider style={styles.root}>
            <MainLayout />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </AuthProvider>
    </>
  );
}

function MainLayout() {
  
  return (
    <>
      <AuthObserver />
      <Stack screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}


function AuthObserver() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const currentPath = "/" + (segments.length ? segments.join("/") : "");

  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  const handlingRef = useRef(false);
  const lastNavAtRef = useRef<number>(0);

  useEffect(() => {
    
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      
      if (handlingRef.current) return;
      handlingRef.current = true;

      try {
        const newUserId = session?.user?.id ?? null;

        
        if (prevUserIdRef.current === newUserId) {
          handlingRef.current = false;
          return;
        }

        
        prevUserIdRef.current = newUserId;

        
        const now = Date.now();
        if (now - lastNavAtRef.current < 500) {
          handlingRef.current = false;
          return;
        }
        lastNavAtRef.current = now;

       
        const targetLogged = "/pages/(logado)/home/page";
        const targetLoggedOut = "/pages/(deslogado)/inicial/page";

        if (session?.user) {
          setAuth(session.user);
          
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
      
      try {
        if (data?.subscription?.unsubscribe) data.subscription.unsubscribe();
        else if (typeof (data as any)?.unsubscribe === "function") (data as any).unsubscribe();
      } catch (e) {
        console.warn("Erro ao desinscrever auth listener:", e);
      }
    };
    
  }, [setAuth, router]);

  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1, fontFamily: 'Poppins_400Regular' },
});
