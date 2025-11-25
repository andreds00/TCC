import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

type Item = { label: string; valor: string };
type Meta = {
  id: string;
  titulo: string;
  itens: Item[] | string | null;
  created_at?: string;
};

export default function Metas() {
  const router = useRouter();
  const mountedRef = useRef(true);

  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoItemLabel, setNovoItemLabel] = useState('');
  const [novoItemValor, setNovoItemValor] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    carregarMetas();
    return () => { mountedRef.current = false; };
  }, []);

  const carregarMetas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log('supabase auth.getUser error:', error);
      }
      const user = data?.user;
      if (!user) {
        setMetas([]);
        setLoading(false);
        return;
      }

      const resp = await supabase
        .from('metas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (resp.error) {
        console.log('Erro ao buscar metas:', resp.error);
      } else if (resp.data) {
        // Normaliza itens: pode vir string JSON dependendo do schema
        const normalized = resp.data.map((m: any) => {
          let itens: Item[] = [];
          if (Array.isArray(m.itens)) itens = m.itens;
          else if (typeof m.itens === 'string') {
            try { itens = JSON.parse(m.itens); }
            catch { itens = []; }
          } else itens = [];
          return { ...m, itens };
        });
        if (mountedRef.current) setMetas(normalized);
      }
    } catch (err) {
      console.log('Erro carregarMetas try/catch:', err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const adicionarMeta = async () => {
    if (!novoTitulo.trim() || !novoItemLabel.trim() || !novoItemValor.trim()) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log('supabase auth.getUser error:', error);
      }
      const user = data?.user;
      if (!user) return;

      const novaMeta = {
        user_id: user.id,
        titulo: novoTitulo.trim(),
        itens: [{ label: novoItemLabel.trim(), valor: novoItemValor.trim() }],
      };

      const insert = await supabase.from('metas').insert(novaMeta).select();
      if (insert.error) {
        console.log('Erro ao inserir meta:', insert.error);
      } else if (insert.data && insert.data[0]) {
        // Normaliza itens do retorno (em alguns setups Postgres -> jsonb já vem como array)
        const ret = insert.data[0];
        const itensNormalized = Array.isArray(ret.itens) ? ret.itens : (typeof ret.itens === 'string' ? JSON.parse(ret.itens) : []);
        const metaObj: Meta = { ...ret, itens: itensNormalized };
        setMetas(prev => [metaObj, ...prev]);
      }
      // limpa
      setNovoTitulo('');
      setNovoItemLabel('');
      setNovoItemValor('');
      setModalVisible(false);
    } catch (err) {
      console.log('Erro adicionarMeta try/catch:', err);
    } finally {
      setSaving(false);
    }
  };

  const removerMeta = async (id: string) => {
    try {
      const resp = await supabase.from('metas').delete().eq('id', id);
      if (resp.error) {
        console.log('Erro remover meta:', resp.error);
      } else {
        setMetas(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.log('Erro removerMeta:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('@/assets/images/banner-metas.png')}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/pages/home/page')}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Metas pessoais</Text>

        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => router.push('/pages/notificacao/page')}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/pages/(logado)/perfil/page')}>
            <Ionicons name="person-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Carregando metas...</Text>
          </View>
        )}

        {!loading && metas.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nenhuma meta adicionada ainda. Toque no + para criar.</Text>
          </View>
        )}

        {metas.map(meta => {
          // garante que itens é array
          const itensArray: Item[] = Array.isArray(meta.itens) ? meta.itens : [];
          return (
            <View key={meta.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitulo}>{meta.titulo}</Text>
                <TouchableOpacity onPress={() => removerMeta(meta.id)}>
                  <Ionicons name="trash-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.divisor} />

              {itensArray.map((item, i) => (
                <View key={i} style={styles.itemLinha}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.valor}>{item.valor}</Text>
                </View>
              ))}
            </View>
          );
        })}

        <View style={{ height: 140 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Adicionar nova meta</Text>

            <TextInput
              style={styles.input}
              placeholder="Título da meta (ex: Físicas)"
              placeholderTextColor={Colors.darkGray}
              value={novoTitulo}
              onChangeText={setNovoTitulo}
            />

            <TextInput
              style={styles.input}
              placeholder="Descrição (ex: Peso ideal)"
              placeholderTextColor={Colors.darkGray}
              value={novoItemLabel}
              onChangeText={setNovoItemLabel}
            />

            <TextInput
              style={styles.input}
              placeholder="Valor (ex: 75 kg)"
              placeholderTextColor={Colors.darkGray}
              value={novoItemValor}
              onChangeText={setNovoItemValor}
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={styles.btnTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSalvar} onPress={adicionarMeta} disabled={saving}>
                <Text style={styles.btnTexto}>{saving ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* seu styles aqui (mantive o original para não poluir) */
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerImage: {
    width: '100%',
    height: "30%",
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#0D2040',
  },
  header: {
    width: '100%',
    height: "7%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  rightIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scroll: { paddingTop: 200, paddingHorizontal: 16, paddingBottom: 100 },
  emptyBox: { marginTop: 20, backgroundColor: '#F3F4F7', borderRadius: 12, padding: 20, alignItems: 'center' },
  emptyText: { color: '#555', fontSize: 15, textAlign: 'center' },
  card: { backgroundColor: '#0D2040', borderRadius: 14, padding: 16, marginBottom: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitulo: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  divisor: { height: 1, backgroundColor: '#FFFFFF33', marginVertical: 10 },
  itemLinha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#FFFFFF', fontWeight: '500', fontSize: 14 },
  valor: { color: '#FFFFFF', fontWeight: '400', fontSize: 14 },
  addButton: { backgroundColor: '#0D2040', borderRadius: 50, width: 60, height: 60, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 25, right: 25, elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 20 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  modalTitulo: { fontSize: 18, fontWeight: '700', color: '#0D2040', marginBottom: 15 },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.darkBlue, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 14 },
  modalBotoes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btnCancelar: { backgroundColor: '#999', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  btnSalvar: { backgroundColor: '#0D2040', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  btnTexto: { color: '#FFF', fontWeight: '600' },
});
