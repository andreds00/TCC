import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

type DisplayPlace = {
  id: string;
  name: string;
  address: string;
  highlight?: string;
  rating?: number;
  extra?: string;
  location?: {
    lat: number;
    lng: number;
  };
};

type ActivityConfig = {
  title: string;
  description: string;
  query: string;
  fallback: DisplayPlace[];
};

const ACTIVITIES: Record<string, ActivityConfig> = {
  acrobatismo: {
    title: 'Acrobatismo',
    description:
      'Locais com instrutores e espaços para prática de acrobacias e ginástica.',
    query: 'acrobacias|ginástica|instrutores de acrobacias',
    fallback: [
      {
        id: 'acrofit-studio',
        name: 'Acrofit Studio',
        address: 'Rua das Flores, 123 - Centro',
        highlight: 'Instrutores experientes em acrobacias aéreas.',
        extra: 'Aulas para todas as idades',
        location: { lat: -23.5635, lng: -46.6549 },
      },
      {
        id: 'gymnastica-max',
        name: 'Ginástica Max',
        address: 'Av. Paulista, 1000 - Bela Vista',
        highlight: 'Espaço amplo com equipamentos modernos.',
        extra: 'Planos mensais',
        location: { lat: -23.5478, lng: -46.6363 },
      },
      {
        id: 'circo-acrobatico',
        name: 'Circo Acrobático',
        address: 'Rua do Circo, 75 - Liberdade',
        highlight: 'Aulas de acrobacias em grupo e individuais.',
        extra: 'Agenda flexível',
        location: { lat: -23.5672, lng: -46.6429 },
      },
    ],
  },
  malabarismo: {
    title: 'Malabarismo',
    description:
      'Locais com espaços e instrutores para prática de malabarismo e habilidades circenses.',
    query: 'malabarismo|habilidades circenses|instrutores de malabarismo',
    fallback: [
      {
        id: 'circo-habilidades',
        name: 'Circo & Habilidades',
        address: 'Av. das Artes, 200 - Jardim América',
        highlight: 'Instrutores especializados em malabarismo.',
        extra: 'Primeira aula experimental',
        location: { lat: -23.6001, lng: -46.6673 },
      },
      {
        id: 'palhacos-e-arte',
        name: 'Palhaços & Arte',
        address: 'Rua Alegre, 88 - Moema',
        highlight:
          'Espaço dedicado ao ensino de malabarismo para todas as idades.',
        extra: 'Aulas em grupo e individuais',
        location: { lat: -23.5704, lng: -46.6582 },
      },
      {
        id: 'arte-do-malabarismo',
        name: 'Arte do Malabarismo',
        address: 'Praça Central, 45 - Pinheiros',
        highlight: 'Aulas práticas com foco em técnicas variadas.',
        extra: 'Estacionamento próprio',
        location: { lat: -23.5712, lng: -46.6789 },
      },
    ],
  },
};

const DEFAULT_ACTIVITY = 'malabarismo';

// centro padrão em São Paulo (para o mapa)
const SAO_PAULO_CENTER = {
  lat: -23.5505,
  lng: -46.6333,
};

export default function LocaisCirco() {
  const params = useLocalSearchParams<{ atividade?: string }>();
  const activityKey =
    typeof params.atividade === 'string' ? params.atividade : DEFAULT_ACTIVITY;
  const activity = ACTIVITIES[activityKey] ?? ACTIVITIES[DEFAULT_ACTIVITY];

  const displayPlaces: DisplayPlace[] = useMemo(
    () => activity.fallback,
    [activity.fallback],
  );

  const markers = displayPlaces.filter((p) => p.location);

  // HTML do mapa (Leaflet + OpenStreetMap) com os marcadores vindo do JS
  const mapHtml = useMemo(() => {
    const markersJson = JSON.stringify(
      markers.map((m) => ({
        id: m.id,
        name: m.name,
        address: m.address,
        lat: m.location!.lat,
        lng: m.location!.lng,
      })),
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
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
              if (!m.lat || !m.lng) return;
              L.marker([m.lat, m.lng])
                .addTo(map)
                .bindPopup('<b>' + m.name + '</b><br/>' + m.address);
            });
          </script>
        </body>
      </html>
    `;
  }, [markers]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        style={styles.header}
        colors={[colors.darkBlue, colors.blue, colors.lightBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={{ paddingHorizontal: 4 }}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{activity.title}</Text>
      </LinearGradient>

      <View style={styles.main}>
        <Text style={styles.subtitle}>{activity.description}</Text>

        {/* Mapa via WebView + Leaflet + OpenStreetMap */}
        <View style={styles.mapWrapper}>
          <WebView
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.map}
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Locais recomendados</Text>
          <Text style={styles.listSubtitle}>Mostrando sugestões fixas</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {displayPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.card}
              onPress={() => {
                router.push({
                  pathname: '/pages/(logado)/categorias/circo/horarios',
                  params: {
                    localNome: place.name,
                    localEndereco: place.address,
                  },
                });
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.placeName}>{place.name}</Text>
                {place.rating && (
                  <View style={styles.ratingPill}>
                    <MaterialCommunityIcons
                      name="star"
                      size={14}
                      color="#FFB703"
                    />
                    <Text style={styles.ratingText}>
                      {place.rating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.placeAddress}>{place.address}</Text>
              {place.highlight && (
                <Text style={styles.placeHighlight}>{place.highlight}</Text>
              )}
              {place.extra && (
                <Text style={styles.placeExtra}>{place.extra}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  main: { flex: 1, paddingHorizontal: 20 },
  subtitle: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  mapWrapper: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  map: {
    flex: 1,
  },
  listHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkBlue,
    textAlign: 'left',
  },
  listSubtitle: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#f7f9ff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e5ff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkBlue,
  },
  placeAddress: {
    marginTop: 4,
    fontSize: 14,
    color: colors.darkGray,
  },
  placeHighlight: {
    marginTop: 8,
    fontSize: 13,
    color: colors.blue,
  },
  placeExtra: {
    marginTop: 4,
    fontSize: 12,
    color: colors.darkGray,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7dd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
});
