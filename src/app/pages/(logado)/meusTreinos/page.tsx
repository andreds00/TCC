import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';
import colors from '@/constants/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Calendar } from 'react-native-calendars';
import { MaskedTextInput } from "react-native-mask-text";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/src/contextos/AuthContext'; // Contexto de autenticação

const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
] as const;

export default function MeusTreinos() {
    const { user } = useAuth();
    const [selecionado, setSelecionado] = useState<"Treinos" | "Consultas">("Treinos");
    const [month, setMonth] = useState<number>(new Date().getMonth());
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [loading, setLoading] = useState<boolean>(true);

    const [tempDate, setTempDate] = useState<string>("");
    const [tempTime, setTempTime] = useState<string>("");
    const [selectedSport, setSelectedSport] = useState<string>("");
    const [showSports, setShowSports] = useState<boolean>(false);

    const [agendamentos, setAgendamentos] = useState<any[]>([]);
    const bottomSheetRef = useRef<BottomSheetModal | null>(null);
    const snapPoints = useMemo(() => ['40%', '70%'], []);
    const hoje = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (user) fetchAgendamentos();
    }, [user, selecionado]);

    // Buscar agendamentos do usuário

    const validarHorario = (texto: string) => {
        const [h, m] = texto.split(":").map(Number);
        if (h > 23 || m > 59) return "";
        return texto;
    };

    // Confirmar seleção e salvar no Supabase
    const confirmarSelecao = async () => {
        if (!user || !tempDate || !tempTime || !selectedSport) return;

        const table = selecionado === "Treinos" ? 'treinos' : 'consultas';
        const payload = selecionado === "Treinos"
            ? { user_id: user.id, data: tempDate, horario: tempTime, esporte: selectedSport }
            : { user_id: user.id, data: tempDate, horario: tempTime, especialista: selectedSport };

        const { data, error } = await supabase.from(table).insert([payload]);

        if (error) {
            console.log('Erro ao salvar:', error.message);
            alert('Não foi possível salvar. Tente novamente.');
            return;
        }

        alert('Agendamento salvo!');
        bottomSheetRef.current?.close();
        setTempDate('');
        setTempTime('');
        setSelectedSport('');
        fetchAgendamentos();
    };

    //Deletar agendamento
    const deletarAgendamento = async (id: string) => {
        const table = selecionado === "Treinos" ? "treinos" : "consultas";

        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) {
            console.log("Erro ao excluir:", error.message);
            alert("Não foi possível excluir o agendamento.");
            return;
        }

        // Atualiza lista local
        setAgendamentos((prev) => prev.filter((item) => item.id !== id));
        alert("Agendamento excluído!");
    };



    const handlePresentModalPress = useCallback(() => {
        bottomSheetRef.current?.present?.();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        ),
        []
    );

    const prevMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const nextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    // Atualiza automaticamente quando o mês/ano ou tipo muda
    useEffect(() => {
        if (user) fetchAgendamentos();
    }, [month, year, selecionado]);

    const fetchAgendamentos = async () => {
        if (!user) return;
        const table = selecionado === 'Treinos' ? 'treinos' : 'consultas';

        const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('user_id', user.id)
            .gte('data', firstDay)
            .lte('data', lastDay)
            .order('data', { ascending: true });

        if (error) {
            console.log('Erro ao buscar agendamentos:', error.message);
            setLoading(false);
        } else {
            setAgendamentos(data || []);
            
        }
        setTimeout(() => setLoading(false), 800);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white, marginTop: 10 }}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => router.replace('/pages/(logado)/home/page')}>
                                <MaterialIcons name="arrow-back-ios" size={24} color={colors.darkBlue} />
                            </TouchableOpacity>
                            <Text style={styles.title}>Meus Treinos</Text>
                        </View>

                        {/* Subtitle */}
                        <View style={styles.containerSubtitle}>
                            <Text style={styles.subtitle}>
                                {selecionado === "Treinos"
                                    ? "Programe seus próximos treinos."
                                    : "Programe suas próximas consultas."}
                            </Text>
                        </View>

                        {/* Switch entre Treinos / Consultas */}
                        <View style={{ width: "100%", alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity
                                style={[styles.botao, selecionado === "Treinos" && styles.ativo]}
                                onPress={() => setSelecionado("Treinos")}>
                                <Text style={[styles.texto, selecionado === "Treinos" && styles.textoAtivo]}>Treinos</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.botao, selecionado === "Consultas" && styles.ativo]}
                                onPress={() => setSelecionado("Consultas")}>
                                <Text style={[styles.texto, selecionado === "Consultas" && styles.textoAtivo]}>Consultas</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Filtro de mês */}
                        <View style={styles.monthRow}>
                            <Pressable style={styles.monthPast} onPress={prevMonth}>
                                <Text style={styles.monthPastLabel}>
                                    {MONTHS[(month - 1 + 12) % 12]} {/* Corrige exibição em janeiro/dezembro */}
                                </Text>
                            </Pressable>

                            <View style={styles.monthControls}>
                                <TouchableOpacity onPress={prevMonth}>
                                    <Entypo name="chevron-left" size={20} color="#0D2040" />
                                </TouchableOpacity>
                                <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
                                <TouchableOpacity onPress={nextMonth}>
                                    <Entypo name="chevron-right" size={20} color="#0D2040" />
                                </TouchableOpacity>
                            </View>

                            <Pressable style={styles.monthPast} onPress={nextMonth}>
                                <Text style={styles.monthPastLabel}>
                                    {MONTHS[(month + 1) % 12]}
                                </Text>
                            </Pressable>
                        </View>

                        {/* Lista de agendamentos filtrados */}
                        <View style={{ flex: 1, marginTop: 10 }}>
                            {loading ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color="#0D2040" />
                                </View>
                            ) : agendamentos.length > 0 ? (
                                <FlatList
                                    data={agendamentos}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => {
                                        const dataObj = new Date(item.data + 'T00:00:00');
                                        const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
                                        const dia = dataObj.getDate().toString().padStart(2, '0');
                                        const mes = dataObj.toLocaleDateString('pt-BR', { month: 'short' });

                                        return (
                                            <View style={styles.card}>
                                                {/* Esquerda: data */}
                                                <View style={styles.dateContainer}>
                                                    <Text style={styles.weekday}>{diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}</Text>
                                                    <Text style={styles.day}>{dia}</Text>
                                                    <Text style={styles.month}>{mes}</Text>
                                                </View>

                                                {/* Linha divisória */}
                                                <View style={styles.divider} />

                                                {/* Direita: informações */}
                                                <View style={styles.infoContainer}>
                                                    {selecionado === 'Treinos' ? (
                                                        <>
                                                            <View style={styles.infoRow}>
                                                                <FontAwesome5 name="running" size={16} color="#FFF" />
                                                                <Text style={styles.infoText}>{item.esporte}</Text>
                                                            </View>
                                                            <View style={styles.infoRow}>
                                                                <Ionicons name="time-outline" size={16} color="#FFF" />
                                                                <Text style={styles.infoText}>{item.horario}</Text>
                                                            </View>
                                                            <View style={styles.infoRow}>
                                                                <Ionicons name="speedometer-outline" size={16} color="#FFF" />
                                                                <Text style={styles.infoText}>Relógio</Text>
                                                            </View>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <View style={styles.infoRow}>
                                                                <Ionicons name="person-circle-outline" size={16} color="#FFF" />
                                                                <Text style={styles.infoText}>{item.especialista}</Text>
                                                            </View>
                                                            <View style={styles.infoRow}>
                                                                <Ionicons name="calendar-outline" size={16} color="#FFF" />
                                                                <Text style={styles.infoText}>{item.horario}</Text>
                                                            </View>
                                                            <View style={styles.infoRow}>
                                                                <Ionicons name="location-outline" size={16} color="#FFF" />
                                                                <Text style={styles.infoText}>Atendimento online</Text>
                                                            </View>
                                                        </>
                                                    )}
                                                </View>
                                                <TouchableOpacity onPress={() => deletarAgendamento(item.id)}>
                                                    <Ionicons name="trash-outline" size={24} color="#FF4D4D" />
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    }}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                />
                            ) : (
                                <View style={styles.containerBackground}>
                                    {selecionado === "Treinos"
                                        ? <FontAwesome5 name="dumbbell" size={100} color={colors.lightGray} />
                                        : <Ionicons name="medkit" size={100} color={colors.lightGray} />}
                                    <Text style={{ marginTop: 20, fontSize: 18, color: colors.lightGray, textAlign: 'center' }}>
                                        Você ainda não possui {selecionado === "Treinos" ? "treinos" : "consultas"} agendados.
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Botão adicionar */}
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.botaoAdd}
                            onPress={handlePresentModalPress}
                        >
                            <MaterialIcons name="add" size={34} color={colors.white} />
                        </TouchableOpacity>

                        {/* Bottom Sheet */}
                        <BottomSheetModal
                            ref={bottomSheetRef}
                            index={1}
                            snapPoints={['30%', '50%']}
                            backgroundStyle={{ backgroundColor: colors.white }}
                            enablePanDownToClose
                            backdropComponent={renderBackdrop}
                            onChange={handleSheetChanges}
                        >
                            <BottomSheetScrollView
                                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 90 }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.titleBottomSheet}>
                                    {selecionado === 'Treinos' ? 'Adicionar um treino' : 'Marcar uma consulta'}
                                </Text>

                                <View style={styles.mainBottomSheet}>
                                    <Text style={styles.modalTitle}>Selecione a data e o horário:</Text>

                                    <Calendar
                                        style={{ width: '100%', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.gray }}
                                        onDayPress={(day) => { if (day.dateString >= hoje) setTempDate(day.dateString); }}
                                        markedDates={tempDate ? { [tempDate]: { selected: true, selectedColor: colors.blue, selectedTextColor: '#fff' } } : {}}
                                        minDate={hoje}
                                        theme={{
                                            todayTextColor: colors.darkBlue,
                                            arrowColor: colors.darkBlue,
                                            selectedDayBackgroundColor: colors.darkBlue,
                                            textDayFontWeight: '500',
                                        }}
                                    />

                                    <View style={[styles.inputContainer, { marginTop: 20 }]}>
                                        <MaterialIcons name="access-time" size={22} color={colors.gray} />
                                        <MaskedTextInput
                                            mask="99:99"
                                            keyboardType="numeric"
                                            placeholder="00:00"
                                            value={tempTime}
                                            onChangeText={(text) => setTempTime(validarHorario(text))}
                                            style={styles.input}
                                            placeholderTextColor={colors.gray}
                                        />
                                    </View>

                                    <View style={[styles.inputContainer, { marginTop: 16 }]}>
                                        <TouchableOpacity
                                            style={styles.selectContainer}
                                            activeOpacity={0.8}
                                            onPress={() => setShowSports((s) => !s)}
                                        >
                                            <Text style={[styles.selectText, !selectedSport && { color: colors.gray }]}>
                                                {selectedSport || (selecionado === "Treinos" ? 'Selecione o esporte' : 'Selecione o especialista')}
                                            </Text>
                                            <Entypo name={showSports ? 'chevron-up' : 'chevron-down'} size={18} color={colors.gray} />
                                        </TouchableOpacity>
                                    </View>

                                    {showSports && (
                                        <View style={styles.dropdown}>
                                            {(selecionado === "Treinos"
                                                ? ['Musculação', 'Corrida', 'Natação', 'Ciclismo', 'Yoga', 'Pilates']
                                                : ['Dr. Carlos Andrade', 'Dra. Marlene Costa', 'Dr. Fernando Camargo']
                                            ).map((item) => (
                                                <TouchableOpacity
                                                    key={item}
                                                    style={styles.dropdownItem}
                                                    onPress={() => { setSelectedSport(item); setShowSports(false); }}
                                                >
                                                    <Text style={styles.dropdownText}>{item}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </BottomSheetScrollView>

                            {/* Botão fixo */}
                            <View style={styles.bottomButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.botaoConfirmar, !(tempDate && tempTime && selectedSport) && { opacity: 0.5 }]}
                                    disabled={!(tempDate && tempTime && selectedSport)}
                                    onPress={confirmarSelecao}
                                >
                                    <Text style={styles.botaoTexto}>Confirmar</Text>
                                </TouchableOpacity>
                                {selecionado === "Treinos" ? (

                                    <TouchableOpacity style={styles.buttomRelogio}>
                                        <MaterialIcons name="watch" size={24} color={colors.darkBlue} />
                                        <Text style={styles.buttomRelogioText}>Importar treino do relógio</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                        </BottomSheetModal>
                    </View>
                </BottomSheetModalProvider>
            </GestureHandlerRootView >
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: colors.white },
    header: { flexDirection: "row", alignContent: "center", marginBottom: 30 },
    title: { flex: 1, textAlign: "center", fontSize: 20, fontWeight: "bold", color: colors.darkBlue, alignSelf: "center" },
    containerSubtitle: { height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    subtitle: { fontSize: 16, color: colors.darkGray },
    botao: { width: 150, alignItems: "center", backgroundColor: "#eee", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, marginHorizontal: 5, marginBottom: 20 },
    ativo: { backgroundColor: "#0D2040" },
    texto: { color: "#333", fontWeight: "bold", fontSize: 16 },
    textoAtivo: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    containerBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, backgroundColor: colors.white },
    botaoAdd: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.darkBlue, justifyContent: 'center', alignItems: 'center' },
    mainBottomSheet: { marginTop: 20, width: '100%', paddingHorizontal: 20, justifyContent: 'center' },
    titleBottomSheet: { textAlign: 'center', marginTop: 10, fontSize: 20, fontWeight: '700', color: colors.darkBlue },
    inputContainer: { flexDirection: "row", alignItems: "center", borderColor: colors.gray, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10 },
    input: { flex: 1, fontSize: 16, color: colors.darkBlue, marginLeft: 10 },
    modalTitle: { marginTop: 10, fontSize: 17, fontWeight: "700", color: colors.darkBlue, marginBottom: 15 },
    botaoConfirmar: { backgroundColor: colors.darkBlue, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginBottom: 10 },
    botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    selectContainer: { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    selectText: { fontSize: 16, color: colors.darkBlue },
    dropdown: { width: "100%", borderWidth: 1, borderColor: colors.gray, borderRadius: 10, marginTop: 5, backgroundColor: "#fff", overflow: "hidden" },
    dropdownItem: { paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
    dropdownText: { fontSize: 16, color: colors.darkBlue },
    bottomButtonContainer: { backgroundColor: colors.white, paddingVertical: 15, paddingHorizontal: 20, marginBottom: 10 },
    agendamentoItem: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, marginBottom: 10 },
    buttomRelogio: { width: '100%', justifyContent: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6EAF6', paddingVertical: 12, borderRadius: 10, marginTop: 10, },
    buttomRelogioText: { color: colors.darkBlue, fontSize: 15, fontWeight: '500' },
    monthRow: { width: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 6, gap: 10, paddingHorizontal: 10 },
    monthLabel: { fontWeight: "700", color: "#0D2040", fontSize: 16 },
    monthControls: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" },
    monthPast: { flex: 1, alignItems: "center" },
    monthPastLabel: { fontWeight: "700", color: "#AAA", fontSize: 15 },


    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#001233',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 12,
        justifyContent: 'space-between',
    },
    dateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 90,
    },
    weekday: {
        color: '#AFC3FF',
        fontSize: 14,
        marginBottom: 2,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    day: {
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: 'bold',
        lineHeight: 42,
    },
    month: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        textTransform: 'lowercase',
    },
    divider: {
        width: 1,
        height: '70%',
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 20,
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },


});
