import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '@/constants/Colors';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';

type HandebolPlace = {
  nome: string;
  distancia: string;
  endereco: string;
  latitude: number;
  longitude: number;
  destaque?: string;
};

const locais: HandebolPlace[] = [
  {
    nome: 'Federação Paulista de Handebol',
    distancia: '1 km de distância',
    endereco: 'Rua Abolição, 201 - Bela Vista',
    latitude: -23.5588,
    longitude: -46.6454,
    destaque: 'Quadra oficial indoor e clínicas técnicas.',
  },
  {
    nome: 'H10 Escola de Esportes',
    distancia: '4 km de distância',
    endereco: 'Av. Dr. Arnaldo, 351 - Sumaré',
    latitude: -23.5427,
    longitude: -46.6658,
    destaque: 'Treinos para todas as idades com material incluso.',
  },
  {
    nome: 'ACM Centro',
    distancia: '8 km de distância',
    endereco: 'Rua da Consolação, 247 - Consolação',
    latitude: -23.5472,
    longitude: -46.6497,
    destaque: 'Programação semanal e vestiários completos.',
  },
];

// centro padrão São Paulo
const SAO_PAULO_CENTER = {
  lat: -23.5505,
  lng: -46.6333,
};

export default function LocaisHandebol() {
  // monta o HTML do mapa com Leaflet + OSM e os marcadores de `locais`
  const mapHtml = useMemo(() => {
    const markersJson = JSON.stringify(
      locais.map((l) => ({
        nome: l.nome,
        endereco: l.endereco,
        lat: l.latitude,
        lng: l.longitude,
      }))
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />
          <style>
            html, body, #map {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>

          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            var center = [${SAO_PAULO_CENTER.lat}, ${SAO_PAULO_CENTER.lng}];
            var map = L.map('map').setView(center, 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            var markers = ${markersJson};

            markers.forEach(function(m) {
              L.marker([m.lat, m.lng])
                .addTo(map)
                .bindPopup('<b>' + m.nome + '</b><br/>' + m.endereco);
            });
          </script>
        </body>
      </html>
    `;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        style={styles.header}
        colors={[colors.darkBlue, colors.blue, colors.lightBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Quadras de Handebol</Text>
      </LinearGradient>

      <View style={styles.main}>
        <Text style={styles.subtitle}>
          Selecione um local para reservar seu horário
        </Text>

        {/* Mapa com OpenStreetMap (sem API do Google, sem localização) */}
        <View style={styles.mapWrapper}>
          <WebView
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.map}
          />
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {locais.map((local, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/pages/(logado)/categorias/handebol/horarios',
                  params: {
                    localNome: local.nome,
                    localEndereco: local.endereco,
                  },
                })
              }
            >
              <Text style={styles.localNome}>{local.nome}</Text>
              <Text style={styles.localEndereco}>{local.endereco}</Text>
              <Text style={styles.localDistancia}>{local.distancia}</Text>
              {local.destaque ? (
                <Text style={styles.localDestaque}>{local.destaque}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  main: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.darkGray,
    marginBottom: 12,
  },
  mapWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  list: {
    paddingVertical: 18,
    gap: 14,
  },
  card: {
    backgroundColor: '#f6f8ff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e0e6ff',
  },
  localNome: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  localEndereco: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 4,
  },
  localDistancia: {
    fontSize: 13,
    color: colors.darkGray,
    marginTop: 4,
  },
  localDestaque: {
    fontSize: 13,
    color: colors.blue,
    marginTop: 6,
  },
});
