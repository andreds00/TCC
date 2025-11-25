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
  zumba: {
    title: 'Zumba Fitness',
    description:
      'Estúdios com aulas de Zumba para todos os níveis, focando em dança e condicionamento físico.',
    query: 'zumba|aula de zumba|estudio de zumba',
    fallback: [
      {
        id: 'espaco-fitness',
        name: 'Espaço Fitness',
        address: 'Rua das Flores, 123 - Centro',
        highlight: 'Aulas energéticas de Zumba.',
        extra: 'Abre às 07h',
        location: { lat: -23.5635, lng: -46.6549 },
      },
      {
        id: 'zumba-vibes',
        name: 'Zumba Vibes',
        address: 'Av. Paulista, 1000 - Bela Vista',
        highlight: 'Aulas para todos os níveis com instrutores experientes.',
        extra: 'Instrutores certificados',
        location: { lat: -23.5478, lng: -46.6363 },
      },
      {
        id: 'zumberia',
        name: 'Zumberia',
        address: 'Rua da Paz, 75 - Jardins',
        highlight: 'Aulas dinâmicas com foco em diversão e fitness.',
        extra: 'Agenda flexível',
        location: { lat: -23.5672, lng: -46.6429 },
      },
    ],
  },

  jazz: {
    title: 'Jazz',
    description:
      'Estúdios com aulas de Jazz para todos os níveis, focando em técnica e expressão corporal.',
    query: 'estudio jazz|aula de jazz|dança jazz',
    fallback: [
      {
        id: 'expression-dance',
        name: 'Expression Dance Studio',
        address: 'Rua das Orquídeas, 45 - Centro',
        highlight: 'Aulas de Jazz para iniciantes e avançados.',
        extra: 'Instrutores premiados',
        location: { lat: -23.6001, lng: -46.6673 },
      },
      {
        id: 'jazz-movement',
        name: 'Jazz Movement Studio',
        address: 'Av. Liberdade, 200 - Liberdade',
        highlight: 'Aulas focadas em técnica e performance.',
        extra: 'Planos mensais',
        location: { lat: -23.5704, lng: -46.6582 },
      },
      {
        id: 'bora-dancar',
        name: 'Bora Dançar',
        address: 'Rua das Acácias, 300 - Vila Mariana',
        highlight: 'Jazz para iniciantes às terças e quintas.',
        extra: 'Estacionamento próprio',
        location: { lat: -23.5712, lng: -46.6789 },
      },
    ],
  },

  'barre-fit': {
    title: 'Barre Fit',
    description:
      'Estúdios com aulas de Barre Fit para todos os níveis, focando em tonificação muscular e flexibilidade.',
    query: 'barre fit|aula de barre fit|estudio de barre fit',
    fallback: [
      {
        id: 'danca-e-vida',
        name: 'Dança e Vida Studio',
        address: 'Rua das Palmeiras, 88 - Centro',
        highlight: 'Aulas de Barre Fit para todos os níveis.',
        extra: 'Formato híbrido',
        location: { lat: -23.5558, lng: -46.6396 },
      },
      {
        id: 'fit-barre',
        name: 'Fit Barre Studio',
        address: 'Rua Horizonte, 410 - Zona Norte',
        highlight: 'Aulas de Barre Fit para todos os níveis.',
        extra: 'Sábados de imersão',
        location: { lat: -23.5294, lng: -46.6499 },
      },
      {
        id: 'danca-corpo',
        name: 'Dança & Corpo',
        address: 'Av. Central, 1500 - Centro',
        highlight: 'Aulas de Barre Fit para todos os níveis.',
        extra: 'Equipe multidisciplinar',
        location: { lat: -23.5505, lng: -46.6333 },
      },
    ],
  },
};

const DEFAULT_ACTIVITY = 'barre-fit';

// centro padrão do mapa
const SAO_PAULO_CENTER = { lat: -23.5505, lng: -46.6333 };

export default function LocaisMeditacao() {
  const params = useLocalSearchParams<{ atividade?: string }>();
  const activityKey =
    typeof params.atividade === 'string' ? params.atividade : DEFAULT_ACTIVITY;
  const activity = ACTIVITIES[activityKey] ?? ACTIVITIES[DEFAULT_ACTIVITY];

  const displayPlaces = useMemo(() => activity.fallback, [activity.fallback]);
  const markers = displayPlaces.filter((p) => p.location);

  const mapHtml = useMemo(() => {
    const markersJson = JSON.stringify(
      markers.map((m) => ({
        name: m.name,
        address: m.address,
        lat: m.location!.lat,
        lng: m.location!.lng,
      }))
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
          <style>
            html, body, #map {
              height: 100%;
              width: 100%;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>

          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            var map = L.map('map').setView([${SAO_PAULO_CENTER.lat}, ${SAO_PAULO_CENTER.lng}], 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap'
            }).addTo(map);

            var markers = ${markersJson};

            markers.forEach(function(m) {
              L.marker([m.lat, m.lng])
                .addTo(map)
                .bindPopup('<b>' + m.name + '</b><br>' + m.address);
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
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>{activity.title}</Text>
      </LinearGradient>

      <View style={styles.main}>
        <Text style={styles.subtitle}>{activity.description}</Text>

        {/* MAPA */}
        <View style={styles.mapWrapper}>
          <WebView source={{ html: mapHtml }} style={styles.map} />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Locais recomendados</Text>
          <Text style={styles.listSubtitle}>Sugestões fixas</Text>
        </View>

        <ScrollView>
          {displayPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/pages/(logado)/categorias/danca/horarios',
                  params: {
                    localNome: place.name,
                    localEndereco: place.address,
                  },
                })
              }
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
    marginBottom: 16,
    padding: 16,
  },
  title: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  main: { flex: 1, paddingHorizontal: 20 },
  subtitle: {
    textAlign: 'center',
    marginBottom: 12,
    color: colors.darkGray,
  },
  mapWrapper: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: { flex: 1 },
  listHeader: {
    marginVertical: 12,
  },
  listTitle: {
    fontWeight: '600',
    fontSize: 18,
    color: colors.darkBlue,
  },
  listSubtitle: {
    fontSize: 12,
    color: colors.darkGray,
  },
  card: {
    backgroundColor: '#f7f9ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e5ff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeName: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.darkBlue,
  },
  placeAddress: {
    marginTop: 4,
    color: colors.darkGray,
  },
  placeHighlight: {
    marginTop: 6,
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
    borderRadius: 999,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
});
