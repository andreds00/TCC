import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import colors from "@/constants/Colors";
import { router } from "expo-router";
import { useAuth } from "@/src/contextos/AuthContext";
import { supabase } from "@/lib/supabase";

export default function InformacoesPessoais() {
  const { user } = useAuth();
  const userId = user?.id;

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [modalities, setModalities] = useState("");
  const [trainingDays, setTrainingDays] = useState("");
  const [healthIssues, setHealthIssues] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshUserData } = useAuth();

  const [selectedGender, setSelectedGender] = useState("");
  const [showGenders, setShowGenders] = useState(false);

  // 🔹 CARREGAR DADOS DO SUPABASE
  useEffect(() => {
    async function carregarDados() {
      if (!userId) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.log("Erro ao buscar dados:", error.message);
        return;
      }

      if (data) {
        setName(data.name || "");
        setAge(data.age ? String(data.age) : "");
        setHeight(data.height ? String(data.height) : "");
        setWeight(data.weight ? String(data.weight) : "");
        setGender(data.gender || "");
        setSelectedGender(data.gender || "");

        // 🔹 Agora com nomes corretos:
        setModalities(data.modality_practiced || "");
        setTrainingDays(data.training_days ? String(data.training_days) : "");
        setHealthIssues(data.health_issues || "");
        setAdditionalInfo(data.additional_info || "");
      }
    }

    carregarDados();
  }, [userId]);

  // 🔹 SALVAR ALTERAÇÕES
  async function salvarAlteracoes() {
    if (!userId) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }



    // Campos obrigatórios
    if (!name || !age || !height || !weight || !selectedGender) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    

    setLoading(true);

    const { error } = await supabase
      .from("users")
      .update({
        name,
        age: parseInt(age),
        height: parseInt(height),
        weight: parseInt(weight),
        gender: selectedGender,

        // 🔹 Corrigido conforme schema:
        modality_practiced: modalities,
        training_days: trainingDays ? parseInt(trainingDays) : null,
        health_issues: healthIssues,
        additional_info: additionalInfo,

        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } else {
      await refreshUserData();
      Alert.alert("Sucesso", "Informações atualizadas!");
      router.replace("/pages/(logado)/perfil/page");
    }

  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Cabeçalho */}
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => router.replace("/pages/(logado)/perfil/page")}
              style={styles.voltar}
            >
              <MaterialIcons name="arrow-back-ios" size={24} color={colors.darkBlue} />
            </TouchableOpacity>

            <Text style={styles.logoText}>Informações Pessoais</Text>
          </View>
        </View>

        {/* Conteúdo */}
        <View style={styles.main}>
          <Text style={styles.welcomeText}>Edite suas informações pessoais abaixo:</Text>

          <LabelInput label="Nome" placeholder="Digite seu nome" value={name} onChangeText={setName} />

          <LabelInput
            label="Idade"
            placeholder="Digite sua idade"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <LabelInput
            label="Altura (cm)"
            placeholder="Ex: 175"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />

          <LabelInput
            label="Peso (kg)"
            placeholder="Ex: 70"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />

          {/* 🔹 GÊNERO */}
          <Text style={styles.labelSearch}>Gênero</Text>

          <TouchableOpacity
            style={styles.genderSelect}
            activeOpacity={0.8}
            onPress={() => setShowGenders(!showGenders)}
          >
            <Text style={[styles.genderText, !selectedGender && { color: colors.gray }]}>
              {selectedGender || "Selecione seu gênero"}
            </Text>

            <Entypo
              name={showGenders ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.darkBlue}
            />
          </TouchableOpacity>

          {showGenders && (
            <View style={styles.dropdown}>
              {["Masculino", "Feminino", "Prefiro não dizer", "Outro"].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedGender(item);
                    setGender(item);
                    setShowGenders(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <LabelInput
            label="Modalidade Praticada"
            placeholder="Ex: Musculação, Corrida..."
            value={modalities}
            onChangeText={setModalities}
          />

          <LabelInput
            label="Dias de treino por semana"
            placeholder="Ex: 3"
            value={trainingDays}
            onChangeText={setTrainingDays}
            keyboardType="numeric"
          />

          <LabelInput
            label="Problemas de Saúde"
            placeholder="Ex: Asma, Diabetes..."
            value={healthIssues}
            onChangeText={setHealthIssues}
          />

          <LabelInput
            label="Informações Adicionais"
            placeholder="Algo que deseja acrescentar?"
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            multiline
          />

          <TouchableOpacity
            style={styles.buttonSave}
            activeOpacity={0.7}
            onPress={salvarAlteracoes}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonSaveText}>Salvar Alterações</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 🔹 INPUT COMPONENT
function LabelInput({ label, placeholder, ...props }: { label: string; placeholder: string; [key: string]: any }) {
  return (
    <>
      <Text style={styles.labelSearch}>{label}</Text>
      <View style={styles.formSearch}>
        <TextInput style={styles.inputSearch} placeholder={placeholder} placeholderTextColor={colors.gray} {...props} />
        <MaterialIcons name="edit" size={24} color={colors.gray} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: "5%", paddingHorizontal: "5%" },
  voltar: { justifyContent: "center", alignItems: "flex-start", marginVertical: 10 },
  header: { flexDirection: "row" },
  logoText: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: colors.darkBlue,
    alignSelf: "center",
  },
  main: { padding: 20, gap: 12 },
  welcomeText: { fontSize: 16, color: colors.darkGray, textAlign: "center", marginBottom: 20 },

  labelSearch: { fontSize: 16, color: colors.darkBlue, marginTop: 12, paddingHorizontal: 10, fontWeight: "bold" },

  formSearch: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 30,
  },

  inputSearch: { flex: 1, minHeight: 45, color: colors.darkBlue },

  // GÊNERO
  genderSelect: {
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 18,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  genderText: { fontSize: 16, color: colors.darkBlue },

  dropdown: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 10,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownText: { fontSize: 16, color: colors.darkBlue },

  buttonSave: {
    backgroundColor: colors.blue,
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center",
    marginBottom: 40,
  },
  buttonSaveText: { color: colors.white, fontSize: 17, fontWeight: "bold" },
});
