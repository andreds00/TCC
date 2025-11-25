import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable
} from "react-native";
import colors from '@/constants/Colors';
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function ConfirmarEmail() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [erro, setErro] = useState("");

  const offset = new Animated.ValueXY({ x: 0, y: 0 });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      Animated.spring(offset, {
        toValue: { x: gesture.dx / 15, y: gesture.dy / 15 },
        useNativeDriver: false,
      }).start();
    },
    onPanResponderRelease: () => {
      Animated.spring(offset, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });

  const handleSubmit = async () => {
    if (!email) {
      setErro("Por favor, digite seu e-mail.");
      return;
    }

    setErro("");
    setStatus("enviando");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:5173/recuperar", // página de NovaSenha
      });

      if (error) {
        setErro("Não foi possível enviar o e-mail. Tente novamente.");
        setStatus("");
        return;
      }

      setStatus("enviado");
    } catch (err) {
      setErro("Erro inesperado. Tente novamente.");
      setStatus("");
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>

      {/* Fundo animado */}
      <Animated.View
        style={[
          styles.background,
          {
            transform: [
              { translateX: offset.x },
              { translateY: offset.y }
            ]
          }
        ]}
      />

      <View style={styles.box}>
        <Text style={styles.titulo}>Recuperar Senha</Text>

        <View style={styles.Conteinerform}>

          <Text style={styles.label}>Endereço de email</Text>
          <View style={styles.form}>

            <TextInput placeholder="Digite seu email" value={email} onChangeText={setEmail} style={styles.input} textContentType='emailAddress' placeholderTextColor={colors.darkGray} />
            <MaterialIcons name="email" size={24} color={colors.darkBlue} />

          </View>
          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <TouchableOpacity
            style={styles.botao}
            disabled={status === "enviando"}
            onPress={handleSubmit}
          >
            <Text style={styles.botaoTexto}>
              {status === "enviando" ? "Enviando..." : "Enviar link"}
            </Text>
          </TouchableOpacity>
          {status === "enviado" && (
            <Text style={styles.sucesso}>
              Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
            </Text>
          )}

        </View>
          {/* Botão Voltar */}
          <Pressable
            style={styles.buttonVoltar}
            onPressOut={() => { router.back() }}
          >
            <Text style={styles.buttonVoltarText}>Voltar</Text>
          </Pressable>



      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
  },

  background: {
    position: "absolute",
    width: "130%",
    height: "130%",
    backgroundColor: "#ffffffff",
    opacity: 0.15,
    borderRadius: 20,
  },
  Conteinerform: {
    width: '80%',
    marginTop: 20,
    gap: 5
  },
  label: {
    fontSize: 14,
    color: colors.darkBlue,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    flex: 1,
    minHeight: 40,
    fontSize: 16,
    color: colors.darkBlue,
  },
  icon: {
    marginLeft: 10,
    color: colors.darkBlue,
  },

  box: {
    flex: 1,
    width: '100%',
    backgroundColor: "rgba(255, 255, 255, 0.54)",
    paddingVertical: 25,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: 'center',
  },
  form: {
    alignContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 15,
},

  titulo: {
    fontSize: 26,
    padding: 20,
    fontWeight: "bold",
    color: colors.darkBlue,
    marginBottom: 20,
  },

  botao: {
    marginTop: 20,
    width: '100%',
    backgroundColor: colors.blue,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    boxShadow: '3px 3px 3px 3px rgba(0,0,0, 0.07)',
  },

  botaoTexto: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
  },

  erro: {
    color: "#ff6b6b",
    marginTop: 5,
    marginBottom: 5,
    textAlign: "center",
  },

  sucesso: {
    color: colors.darkBlue,
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
  },

  buttonVoltar: {
    marginVertical: 10,
    width: '20%',
    borderBottomWidth: 3,
    borderBottomColor: colors.darkBlue,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: '30%',
},

  buttonVoltarText: {
    fontSize: 16,
    color: "#000",
  },
});
