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
  'ginastica-artistica': {
    title: 'Ginástica Artística',
    description:
      'Estúdios com aulas de ginástica artística para todas as idades e níveis.',
    query: 'ginástica artística|centro ginastica|ginastica para crianças',
    fallback: [
      {
        id: 'studio-sunset',
        name: 'Studio Sunset',
        address: 'Rua das Palmeiras, 145 - Centro',
        highlight: 'Aulas para crianças e adultos.',
        extra: 'Abre às 07h',
        location: { lat: -23.5635, lng: -46.6549 },
      },
      {
        id: 'espaco-artemis',
        name: 'Espaço Artemis',
        address: 'Av. das Nações, 300 - Bairro Novo',
        highlight: 'Aulas para todas as idades e níveis.',
        extra: 'Instrutores certificados',
        location: { lat: -23.5478, lng: -46.6363 },
      },
      {
        id: 'experience-gyms',
        name: 'Experience Gyms',
        address: 'Rua do Comércio, 220 - Centro',
        highlight: 'Aulas de ginástica artística e acrobacias.',
        extra: 'Agenda flexível',
        location: { lat: -23.5672, lng: -46.6429 },
      },
    ],
  },

  'ginastica-ritmica': {
    title: 'Ginástica Rítmica',
    description:
      'Estúdios com aulas de ginástica rítmica para todas as idades e níveis.',
    query: 'ginástica rítmica|estudio ginastica ritmica|aula de ginastica ritmica',
    fallback: [
      {
        id: 'ginastica-ritmica-center',
        name: 'Ginástica Rítmica Center',
        address: 'Rua das Flores, 250 - Jardim das Acácias',
        highlight: 'Aulas para iniciantes e avançados.',
        extra: 'Primeira aula experimental',
        location: { lat: -23.6001, lng: -46.6673 },
      },
      {
        id: 'ritmica-fit',
        name: 'Rítmica Fit Studio',
        address: 'Av. Paulista, 1500 - Bela Vista',
        highlight: 'Aulas para todas as idades.',
        extra: 'Planos mensais',
        location: { lat: -23.5704, lng: -46.6582 },
      },
      {
        id: 'studio-ritmica',
        name: 'Studio Rítmica',
        address: 'Rua do Sol, 75 - Centro',
        highlight: 'Aulas de ginástica rítmica e dança.',
        extra: 'Instrutores experientes',
        location: { lat: -23.5712, lng: -46.6789 },
      },
    ],
  },

  hidroginastica: {
    title: 'Hidroginástica',
    description:
      'Estúdios com aulas de hidroginástica para todas as idades e níveis.',
    query: 'hidroginástica|aula de hidroginástica|ginastica na água',
    fallback: [
      {
        id: 'aqua-fit',
        name: 'Aqua Fit',
        address: 'Rua das Acácias, 12 - Centro',
        highlight: 'Aulas de hidroginástica para todas as idades.',
        extra: 'Formato híbrido',
        location: { lat: -23.5558, lng: -46.6396 },
      },
      {
        id: 'hydro-health',
        name: 'Hydro Health',
        address: 'Rua Horizonte, 410 - Zona Norte',
        highlight: 'Sessões de hidroginástica e reabilitação.',
        extra: 'Sábados de imersão',
        location: { lat: -23.5294, lng: -46.6499 },
      },
      {
        id: 'splash-gym',
        name: 'Splash Gym',
        address: 'Av. Central, 1500 - Centro',
        highlight: 'Aulas de hidroginástica para todos os níveis.',
        extra: 'Equipe multidisciplinar',
        location: { lat: -23.5505, lng: -46.6333 },
      },
    ],
  },
};

const DEFAULT_ACTIVITY = 'hidroginastica';

// Centro fixo em São Paulo
const SAO_PAULO_CENTER = { lat: -23.5505, lng: -46.6333 };

export default function LocaisMeditacao() {
  const params = useLocalSearchParams<{ atividade?: string }>();
  const activityKey =
    typeof params.atividade === 'string'
      ? params.atividade
      : DEFAULT_ACTIVITY;

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
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
              .bindPopup('<strong>' + m.name + '</strong><br>' + m.address);
          });
        </script>
      </body>
      </html>
    `;
  }, [markers]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient style={styles.header} colors={[colors.darkBlue, colors.blue, colors.lightBlue]}>
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
                  pathname: '/pages/(logado)/categorias/ginastica/horarios',
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
                    <MaterialCommunityIcons name="star" size={14} color="#FFB703" />
                    <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.placeAddress}>{place.address}</Text>
              {place.highlight && <Text style={styles.placeHighlight}>{place.highlight}</Text>}
              {place.extra && <Text style={styles.placeExtra}>{place.extra}</Text>}
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
    marginBottom: 10,
    color: colors.darkGray,
  },
  mapWrapper: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: { flex: 1 },
  listHeader: { marginVertical: 12 },
  listTitle: { fontSize: 18, fontWeight: '600', color: colors.darkBlue },
  listSubtitle: { fontSize: 12, color: colors.darkGray },
  card: {
    backgroundColor: '#f7f9ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e5ff',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  placeName: { fontSize: 16, fontWeight: '600', color: colors.darkBlue },
  placeAddress: { marginTop: 4, color: colors.darkGray },
  placeHighlight: { marginTop: 6, color: colors.blue },
  placeExtra: { marginTop: 4, fontSize: 12, color: colors.darkGray },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7dd',
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#D97706' },
});
