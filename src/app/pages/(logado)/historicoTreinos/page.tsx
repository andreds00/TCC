import React, { useEffect, useState, useCallback } from 'react';
import colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/src/contextos/AuthContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

type Treino = {
    id: string;
    user_id: string;
    data: string;
    horario?: string;
    esporte?: string;
    created_at?: string;
};

export default function HistoricoTreinos() {
    const { user } = useAuth();

    const [treinos, setTreinos] = useState<Treino[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // seleção de intervalo com react-native-calendars
    const [startDate, setStartDate] = useState<string | null>(null); // YYYY-MM-DD
    const [endDate, setEndDate] = useState<string | null>(null);

    // seleção temporária enquanto o usuário escolhe
    const [selectingStart, setSelectingStart] = useState<boolean>(true);

    // -------- helpers (únicos, sem duplicatas) --------
    function hash(str: string) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        return Math.abs(h);
    }

    function gerarPlaceholder(id: string) {
        const x = hash(id);
        return {
            distancia: `${(3 + (x % 15)).toFixed(1)} km`,
            passos: (5000 + (x % 15000)).toLocaleString("pt-BR"),
            bpm: `${60 + (x % 90)} bpm`,
            velocidade: `${(6 + (x % 14)).toFixed(1)} Km/h`
        };
    }

    // ---------- utilitarios de data ----------
    const formatToYYYYMMDD = (d: Date) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatarDataCard = (dataStr: string) => {
        try {
            const [y, m, d] = dataStr.split('-');
            return `${d}/${m}/${String(y).slice(2)}`;
        } catch {
            return dataStr;
        }
    };

    // ---------- marcação para o react-native-calendars (period) ----------
    const buildMarkedDates = useCallback(() => {
        const marked: Record<string, any> = {};
        if (!startDate) return marked;
        if (!endDate) {
            marked[startDate] = { startingDay: true, endingDay: true, color: colors.darkBlue, textColor: 'white' };
            return marked;
        }

        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const key = formatToYYYYMMDD(new Date(d));
            const isStart = key === startDate;
            const isEnd = key === endDate;
            marked[key] = {
                color: colors.darkBlue,
                textColor: 'white',
                startingDay: isStart,
                endingDay: isEnd,
            };
        }
        return marked;
    }, [startDate, endDate]);

    // -------- busca no Supabase (com filtro opcional de datas) --------
    const fetchTreinos = async (opts?: { start?: string | null; end?: string | null }) => {
        if (!user?.id) {
            setTreinos([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            let query = supabase
                .from('treinos')
                .select('*')
                .eq('user_id', user.id)
                .order('data', { ascending: false })
                .order('horario', { ascending: false });

            // ---- NOVA LÓGICA: se apenas start definido -> busca exata por essa data (eq)
            if (opts?.start && !opts?.end) {
                console.warn('Filtrando apenas por data exata:', opts.start);
                query = query.eq('data', opts.start);
            } else {
                // se ambos definidos -> intervalo; se nenhum -> tudo
                if (opts?.start) {
                    console.warn('Aplicando filtro start >=', opts.start);
                    query = query.gte('data', opts.start);
                }
                if (opts?.end) {
                    console.warn('Aplicando filtro end <=', opts.end);
                    query = query.lte('data', opts.end);
                }
            }

            const { data, error } = await query;

            if (!error && data) {
                setTreinos(data as Treino[]);
            } else {
                console.warn('Supabase fetch error:', error);
                setTreinos([]);
            }
        } catch (err) {
            console.warn('Erro ao buscar treinos:', err);
            setTreinos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTreinos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // aplicar filtro (startDate/endDate em formato YYYY-MM-DD)
    const aplicarFiltro = () => {
        // se apenas startDate definido, busca a partir daquela data exata (eq)
        // se ambos definidos, busca intervalo inclusive.
        fetchTreinos({ start: startDate ?? null, end: endDate ?? null });
    };

    const limparFiltro = () => {
        setStartDate(null);
        setEndDate(null);
        setSelectingStart(true);
        fetchTreinos();
    };

    // quando o usuário pressiona um dia no calendário
    const onDayPress = (day: any) => {
        const dateStr = day.dateString; // YYYY-MM-DD

        // inicia nova seleção quando não tem start ou quando já existia um intervalo completo
        if (!startDate || (startDate && endDate) || (!selectingStart && !endDate)) {
            setStartDate(dateStr);
            setEndDate(null);
            setSelectingStart(false);
            return;
        }

        // se já existe startDate e não existe endDate -> definir end
        if (startDate && !endDate) {
            const start = new Date(startDate + 'T00:00:00');
            const clicked = new Date(dateStr + 'T00:00:00');
            if (clicked < start) {
                setStartDate(dateStr);
                setEndDate(null);
                setSelectingStart(false);
            } else {
                setEndDate(dateStr);
                setSelectingStart(true);
            }
        }
    };

    // >>> APLICA FILTRO AUTOMÁTICO: quando endDate muda (aplica intervalo)
    useEffect(() => {
        if (endDate) {
            aplicarFiltro();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endDate]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>

            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity activeOpacity={0.6} onPress={() => router.replace('/pages/(logado)/home/page')}>
                        <MaterialIcons name="arrow-back-ios" size={24} color={colors.darkBlue} />
                    </TouchableOpacity>

                    <Text style={styles.logoText}>Histórico de treinos</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.white }}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.main}>
                    <Text style={styles.welcomeText}>Confira seus resultados!</Text>

                    {/* CALENDAR RANGE (react-native-calendars) */}
                    <View style={{ marginTop: 12 }}>
                        <Calendar
                            style={{ width: '80%', alignSelf: 'center', borderRadius: 30, padding: 10, borderWidth: 1, borderColor: colors.darkBlue, paddingVertical: 10 }}
                            markingType={'period'}
                            markedDates={buildMarkedDates()}
                            onDayPress={onDayPress}
                            theme={{
                                todayTextColor: colors.blue,
                                arrowColor: colors.darkBlue,
                                monthTextColor: colors.darkBlue,
                                textSectionTitleColor: colors.darkGray,
                                selectedDayBackgroundColor: colors.darkBlue,
                            }}
                        />
                        <View style={styles.calendarInfoRow}>
                            <Text style={styles.calendarInfoText}>Início: {startDate ?? '-'}</Text>
                            <Text style={styles.calendarInfoText}>Fim: {endDate ?? '-'}</Text>
                        </View>

                        <View style={styles.filterButtonsRow}>
                            <TouchableOpacity style={styles.filterButton} activeOpacity={0.8} onPress={aplicarFiltro}>
                                <Text style={styles.filterButtonText}>Filtrar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.filterButton, styles.clearButton]} activeOpacity={0.8} onPress={limparFiltro}>
                                <Text style={[styles.filterButtonText, styles.clearButtonText]}>Limpar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.atividadesEmGrupo}>
                        <Text style={styles.dataUltimoTreinoTitle}>Todos os treinos:</Text>

                        {loading ? (
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={colors.blue} />
                                <Text style={{ marginTop: 10 }}>Carregando treinos...</Text>
                            </View>
                        ) : treinos.length === 0 ? (
                            <View style={styles.conatinerUltimosTreinos}>
                                <Text style={styles.ultimoTreinoText}>Nenhum treino encontrado.</Text>
                            </View>
                        ) : (
                            <View style={{ marginTop: 15 }}>
                                {treinos.map((t) => {
                                    const ph = gerarPlaceholder(t.id);
                                    return (
                                        <View key={t.id} style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.pill}>
                                                    <Text style={styles.pillText}>
                                                        Treino • {formatarDataCard(t.data)}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.cardRow}>
                                                <MaterialCommunityIcons name="run" size={24} color="white" />
                                                <Text style={styles.cardText}>{ph.distancia}</Text>
                                            </View>

                                            <View style={styles.cardRow}>
                                                <MaterialIcons name="directions-walk" size={24} color="white" />
                                                <Text style={styles.cardText}>{ph.passos}</Text>
                                            </View>

                                            <View style={styles.cardRow}>
                                                <MaterialCommunityIcons name="heart-pulse" size={24} color="white" />
                                                <Text style={styles.cardText}>{ph.bpm}</Text>
                                            </View>

                                            <View style={styles.cardRow}>
                                                <MaterialCommunityIcons name="speedometer" size={24} color="white" />
                                                <Text style={styles.cardText}>{ph.velocidade}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        backgroundColor: colors.white,
        paddingVertical: '5%',
        paddingHorizontal: '5%',
        gap: 5,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    logoText: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: colors.darkBlue,
    },
    main: {
        padding: 20,
        gap: 12,
    },
    welcomeText: {
        fontSize: 16,
        color: colors.darkGray,
    },
    calendarInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    calendarInfoText: {
        color: colors.darkGray,
    },

    filterButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    filterButton: {
        flex: 1,
        backgroundColor: colors.darkBlue,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterButtonText: {
        color: 'white',
        fontWeight: '700',
    },
    clearButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.darkBlue,
    },
    clearButtonText: {
        color: colors.darkBlue,
    },

    atividadesEmGrupo: {
        marginTop: 20,
    },
    dataUltimoTreinoTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.darkBlue,
    },
    conatinerUltimosTreinos: {
        width: '100%',
        minHeight: 200,
        justifyContent: 'center',
        backgroundColor: colors.lightGray,
        borderRadius: 10,
        alignItems: 'center',
        padding: 20,
    },
    ultimoTreinoText: {
        fontSize: 15,
        color: colors.darkGray,
        textAlign: "center",
    },

    /* ---- CARD ---- */
    card: {
        backgroundColor: colors.darkBlue,
        padding: 20,
        borderRadius: 15,
        marginBottom: 16,

    },
    cardHeader: {
        marginBottom: 15,
        alignSelf: "center",
    },
    pill: {
        borderWidth: 2,
        borderColor: "white",
        alignSelf: "flex-start",
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 20,

    },
    pillText: {
        color: "white",
        fontWeight: "bold",
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
        justifyContent: "center",
    },
    cardText: {
        color: "white",
        fontSize: 18,
    },
});
