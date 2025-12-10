import React, { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import colors from '@/constants/Colors';
import { useAuth } from '@/src/contextos/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';

import { supabase } from '@/lib/supabase';

type SupabaseRow = {
  id: string; 
  user_id: string;
  data: string; 
  horario?: string; 
  esporte?: string; 
  created_at?: string;
};

export default function Home() {
  const { user, userData } = useAuth();
  const bottomSheetRef = useRef<BottomSheetModal | null>(null);
  const snapPoints = useMemo<string[]>(() => ['30%', '88%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present?.();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const renderBackdrop = useCallback(
    (props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  
  const [lastWorkout, setLastWorkout] = useState<SupabaseRow | null>(null);
  const [loadingLast, setLoadingLast] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchLastWorkout = async () => {
      if (!user?.id) {
        if (mounted) {
          setLastWorkout(null);
          setLoadingLast(false);
        }
        return;
      }

      try {
        setLoadingLast(true);
        setLastError(null);

       
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

       
       
        const { data, error } = await supabase
          .from('treinos') 
          .select('*')
          .eq('user_id', user.id)
          .lt('data', todayStr)
          .order('data', { ascending: false })
          .order('horario', { ascending: false })
          .limit(1)
          .maybeSingle();

        
        if (error) {
          console.warn('Supabase error fetching last workout:', error);
          if (mounted) {
            setLastWorkout(null);
            setLastError(error.message ?? String(error));
          }
        } else if (data) {
          if (mounted) setLastWorkout(data);
        } else {
          
          if (mounted) {
            setLastWorkout(null);
            setLastError(null); 
          }
        }
      } catch (err) {
        console.warn('Erro ao buscar último treino:', err);
        if (mounted) {
          setLastWorkout(null);
          setLastError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (mounted) setLoadingLast(false);
      }
    };

    fetchLastWorkout();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const formatDateHuman = (dateStr?: string, horario?: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map((s) => Number(s));
      const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      const dateFormatted = dt.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return horario ? `${dateFormatted} • ${horario}` : dateFormatted;
    } catch {
      return `${dateStr}${horario ? ` • ${horario}` : ''}`;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={['top', 'left', 'right']}>
      <GestureHandlerRootView style={styles.container}>
        <BottomSheetModalProvider>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.white }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image style={styles.logo} source={require('@/assets/images/logoClara.png')} />
                  <Text style={styles.logoText}>Body Moove</Text>
                </View>

                <View style={styles.iconesHeader}>
                  <TouchableOpacity activeOpacity={0.6} onPress={() => router.replace('/pages/(logado)/notificacao/page')}>
                    <View style={styles.icone}>
                      <MaterialIcons name="notifications" size={20} color="white" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.6} onPress={() => router.replace('/pages/(logado)/perfil/page')}>
                    <View style={styles.icone}>
                      <MaterialIcons name="person" size={20} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.main}>
                <Text style={styles.welcomeText}>Bem-vindo(a), {userData?.name || user?.user_metadata?.name}</Text>

                <Text style={styles.labelSearch}>O que faremos hoje?</Text>

                <View style={styles.formSearch}>
                  <TouchableOpacity activeOpacity={0.4} style={styles.buttonCategorias} onPress={handlePresentModalPress}>
                    <Text style={styles.textButtonCategorias}>Buscar por categoria</Text>
                    <TouchableOpacity activeOpacity={0.6}>
                      <MaterialIcons name="search" size={24} color={colors.gray} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>

                <BottomSheetModal
                  ref={bottomSheetRef}
                  index={1}
                  snapPoints={snapPoints}
                  backgroundStyle={{ backgroundColor: colors.white }}
                  enablePanDownToClose={true}
                  backdropComponent={renderBackdrop}
                  onChange={handleSheetChanges}
                >
                  <BottomSheetView style={{ flex: 1, alignItems: 'center' }}>
                    <LinearGradient style={styles.bottonShettHeader} colors={[colors.darkBlue, colors.blue, colors.lightBlue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Text style={styles.titleBottomSheet}>Categorias</Text>
                    </LinearGradient>

                    <View style={styles.modalidadesContainer}>
                      <View style={{ width: "100%", padding: "4%", flexDirection: 'row', flexWrap: 'wrap', justifyContent: "space-around", alignItems: 'center', gap: 9.5 }}>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/volei/page') }}>
                          <MaterialIcons style={styles.modalidadesIcon} name='sports-volleyball' size={40} color="white" />
                          <Text style={styles.modalidadesText}>Vôlei</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/capoeira/page') }}>
                          <MaterialIcons style={styles.modalidadesIcon} name='sports-tennis' size={38} color="white" />
                          <Text style={styles.modalidadesText}>Tênis</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/capoeira/page') }}>
                          <MaterialIcons style={styles.modalidadesIcon} name='sports-kabaddi' size={38} color="white" />
                          <Text style={styles.modalidadesText}>Capoeira</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/lutas/page') }}>
                          <MaterialIcons style={styles.modalidadesIcon} name='sports-mma' size={38} color="white" />
                          <Text style={styles.modalidadesText}>Lutas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/danca/page') }}>
                          <View style={styles.modalidadesImageContainer}>
                            <Image style={styles.modalidadesImage} source={require('@/assets/images/danca.png')} />
                          </View>
                          <Text style={styles.modalidadesText}>Dança</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/handebol/page') }}>
                          <MaterialIcons style={styles.modalidadesIcon} name='sports-handball' size={38} color="white" />
                          <Text style={styles.modalidadesText}>Handebol</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/ginastica/page') }}>
                          <MaterialIcons style={styles.modalidadesIcon} name='sports-gymnastics' size={38} color="white" />
                          <Text style={styles.modalidadesText}>Ginástica</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push("/pages/(logado)/categorias/basquete/page") }}>
                          <MaterialIcons style={styles.modalidadesIcon} name='sports-basketball' size={38} color="white" />
                          <Text style={styles.modalidadesText}>Basquete</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/meditacao/page') }}>
                          <View style={styles.modalidadesImageContainer}>
                            <Image style={styles.modalidadesImage} source={require('@/assets/images/meditacao.png')} />
                          </View>
                          <Text style={styles.modalidadesText}>Meditação</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/corrida/page') }}>
                          <View style={styles.modalidadesImageContainer}>
                            <MaterialIcons style={styles.modalidadesIcon} name='directions-run' size={35} color="white" />
                          </View>
                          <Text style={styles.modalidadesText}>Corrida</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/recuperacao/page') }}>
                          <Ionicons style={styles.modalidadesIcon} name="medkit" size={38} color={colors.white} />
                          <Text style={styles.modalidadesText}>Recuperação</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/circo/page') }}>
                          <View style={styles.modalidadesImageContainer}>
                            <Image style={styles.modalidadesImage} source={require('@/assets/images/circo.png')} />
                          </View>
                          <Text style={styles.modalidadesText}>Circo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/squash/page') }}>
                          <MaterialIcons style={styles.modalidadesIcon} name='sports-cricket' size={38} color="white" />
                          <Text style={styles.modalidadesText}>Squash</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/musculacao/page') }}>
                          <MaterialIcons style={styles.modalidadesIcon} name='fitness-center' size={38} color="white" />

                          <Text style={styles.modalidadesText}>Musculação</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalidades} activeOpacity={0.7} onPress={() => { router.push('/pages/(logado)/categorias/patinacao/page') }}>
                          <MaterialIcons style={styles.modalidadesIcon} name='ice-skating' size={38} color="white" />
                          <Text style={styles.modalidadesText}>Patinação</Text>
                        </TouchableOpacity>

                      </View>
                    </View>
                  </BottomSheetView>
                </BottomSheetModal>

                <View style={styles.atividadesEmGrupo}>
                  <Text style={styles.welcomeText}>Atividades em grupo</Text>

                  <TouchableOpacity activeOpacity={0.6} style={styles.atividades} onPress={() => { router.replace("/pages/categorias/hot yoga/informacoes") }}>
                    <Text style={styles.atividadeTitle}>Hot Yoga Iniciante - 10h</Text>
                    <MaterialIcons name="arrow-forward-ios" size={18} color={colors.white} />
                  </TouchableOpacity>
                </View>

                <View style={styles.containerTreinos}>
                  <View style={styles.mostrarTreinos}>
                    <Text style={styles.mostrarTreinosText}>Mostrar meus treinos</Text>
                    <TouchableOpacity activeOpacity={0.6} style={styles.buttonMostrarTreinos} onPress={() => { router.push('/pages/(logado)/meusTreinos/page') }}>
                      <MaterialIcons name="arrow-forward-ios" size={18} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.avatar}>
                    <Image style={styles.avatar} source={require('@/assets/images/avatar.png')} />
                  </View>
                </View>

                <LinearGradient style={styles.ultimoTreino} colors={[colors.darkBlue, colors.blue, colors.lightBlue]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}>
                  {loadingLast ? (
                    <Text style={styles.ultimoTreinoText}>Carregando último treino...</Text>
                  ) : lastError ? (
                    <Text style={styles.ultimoTreinoText}>Erro: {lastError}</Text>
                  ) : lastWorkout ? (

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={{ width: '100%' }}
                      onPress={() =>
                        router.push({
                          pathname: '/pages/(logado)/meusTreinos/page',
                          params: { workoutId: lastWorkout.id },
                        })
                      }
                    >
                      <View style={[styles.dataUltimoTreino, { borderWidth: 2, borderColor: colors.white }]}>
                        <Text style={styles.dataUltimoTreinoText}>{formatDateHuman(lastWorkout.data, lastWorkout.horario)}</Text>
                      </View>

                      <View style={styles.descricaoUltimoTreino}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.km, { color: colors.white }]}>{lastWorkout.esporte ?? 'Treino'}</Text>
                          {lastWorkout.horario ? <Text style={{ color: colors.lightGray }}>Ultimo treino</Text> : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.ultimoTreinoText}>Você ainda não fez nenhum treino.</Text>
                  )}
                </LinearGradient>

                <View style={styles.containerButtons}>
                  <TouchableOpacity activeOpacity={0.6} style={styles.buttonTreinosMetas} onPress={() => router.push('/pages/(logado)/historicoTreinos/page')}>
                    <MaterialIcons name="calendar-today" size={24} color={colors.darkBlue} />
                    <Text style={styles.buttonTreinosMetasText}>Histórico de treinos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.6} style={styles.buttonTreinosMetas} onPress={() => router.push('/pages/(logado)/metas/page')}>
                    <MaterialIcons name="crisis-alert" size={24} color={colors.darkBlue} />
                    <Text style={styles.buttonTreinosMetasText}>Metas</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: colors.white,
    paddingVertical: '3%',
    paddingHorizontal: '3%',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 40,
    height: 35,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  iconesHeader: {
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "flex-end",
    gap: 16,
  },
  icone: {
    backgroundColor: colors.darkBlue,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
  },
  main: {
    width: '100%',
    padding: 20,
    paddingBottom: 10,
    gap: 12,
  },
  welcomeText: {
    width: '100%',
    fontSize: 16,
    color: colors.darkGray,
  },
  labelSearch: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.darkBlue,
    marginTop: 16,
  },
  formSearch: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray,
    paddingHorizontal: 16,
    paddingVertical: 3,
    gap: 8,
    borderRadius: 30,
    marginTop: 10,
  },
  buttonCategorias: {
    flex: 1,
    flexDirection: "row",
    width: '100%',
    minHeight: 40,
    alignItems: "center",
  },
  textButtonCategorias: {
    flex: 1,
    fontSize: 16,
    color: colors.darkBlue,
  },
  atividadesEmGrupo: {
    marginTop: 10,
  },
  atividades: {
    flexDirection: "row",
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.blue,
  },
  atividadeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  containerTreinos: {
    flexDirection: "row",
    width: '100%',
    height: "auto",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  mostrarTreinos: {
    width: '55%',
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 12,
    height: 'auto',
    paddingVertical: 50,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: colors.darkBlue,
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 3,
  },
  mostrarTreinosText: {
    width: '100%',
    textAlign: 'justify',
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
  },
  buttonMostrarTreinos: {
    alignItems: "flex-end",
    borderWidth: 1,
    borderColor: colors.white,
    width: "100%",
    borderRadius: 25,
    padding: 10,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 300,
  },
  ultimoTreino: {
    width: '100%',
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 20,
    borderRadius: 25,
    backgroundColor: colors.lightGray,
  },
  ultimoTreinoText: {
    fontSize: 15,
    color: colors.lightGray,
    textAlign: "center",
  },
  dataUltimoTreino: {
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 25,
    padding: 8,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 10,
  },
  dataUltimoTreinoText: {
    fontWeight: "bold",
    fontSize: 17,
    color: colors.white,
  },
  descricaoUltimoTreino: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: '100%',
    marginTop: 10,
    flexDirection: "row",
  },
  km: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    paddingBottom: 20,
    color: colors.white,
  },
  containerButtons: {
    marginTop: 20,
    gap: 15,
  },
  buttonTreinosMetas: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.gray,
  },
  buttonTreinosMetasText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.darkBlue,
  },
  titleBottomSheet: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 10,
    marginBottom: 10,
  },
  bottonShettHeader: {
    backgroundColor: colors.blue,
    width: '100%',
    height: "13%",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,


  },
  modalidadesContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  modalidades: {
    width: 90,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: "10%",


  },
  modalidadesIcon: {
    marginBottom: 4,
    backgroundColor: colors.darkBlue,
    borderRadius: 50,
    padding: 10,
    width: "100%",
    height: "100%",
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.white,


  },
  modalidadesImage: {
    width: 40,
    height: 40,

    textAlign: 'center',
    textAlignVertical: 'center',

  },
  modalidadesImageContainer: {
    width: 90,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: "4%",
    backgroundColor: colors.darkBlue,
    borderRadius: 50,
    padding: 10,
  },

  modalidadesText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.darkBlue,
    fontWeight: 'bold',


  },
});
