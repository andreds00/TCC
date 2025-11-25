import { User } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface UserData {
    id: string;
    name: string;
    email: string;

    age?: number;
    weight?: number | null;
    height?: number | null;
    gender?: string | null;

    modality_practiced?: string | null;
    training_days?: number | null;

    health_issues?: string | null;
    additional_info?: string | null;

    updated_at?: string | null;
}

interface AuthContextProps {
    user: User | null;
    userData: UserData | null;
    setAuth: (authUser: User | null) => void;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);

    // BUSCA OS DADOS DO USER NO BANCO
    async function fetchUserData(authUser: User | null) {
        if (!authUser) {
            setUserData(null);
            return;
        }

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();

        if (error) {
            console.log("Erro ao carregar dados do usuário:", error);
            setUserData(null);
            return;
        }

        setUserData(data);
    }

    //ATUALIZA APENAS OS DADOS DO USUÁRIO JÁ LOGADO
    async function refreshUserData() {
        if (!user) return;
        await fetchUserData(user);
    }

    //SALVA O USER E CARREGA OS DADOS DO BANCO
    function setAuth(authUser: User | null) {
        setUser(authUser);
        fetchUserData(authUser);
    }

    // CARREGA SESSÃO AO ABRIR O APP
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session?.user) {
                setAuth(data.session.user);
            }
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, setAuth, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
