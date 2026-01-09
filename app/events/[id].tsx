// app/events/[id].tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Linking,
    Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { Event } from '@/constants/types/events';

export default function EventDetailModal() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*, businesses(name, logo_url, phone, whatsapp)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setEvent(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const openMap = () => {
        if (!event?.latitude || !event?.longitude) return;

        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${event.latitude},${event.longitude}`;
        const label = event.title;

        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        Linking.openURL(url!).catch(() => {
            Alert.alert("Error", "No se pudo abrir la aplicación de mapas.");
        });
    };
    const handleMainAction = () => {
        if (event?.external_link) {
            Linking.openURL(event.external_link).catch(() =>
                Alert.alert("Error", "No se pudo abrir el enlace.")
            );
        } else {
            Alert.alert("Información", "Este evento no requiere registro previo o compra de entradas.");
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    if (!event) return null;

    // Lógica de Fechas
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    // Formato: Sábado, 12 de Enero
    const dateString = startDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
    // Formato: 4:00 PM
    const timeString = startDate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    // Lógica de Organizador
    const organizerName = event.businesses?.name || event.organizer_name || 'Qhoar Eventos';
    const isBusiness = !!event.businesses;

    const actionButtonText = event.action_text || 'Más Información / Asistir';
    const getActionIcon = () => {
        const text = actionButtonText.toLowerCase();
        if (text.includes('whatsapp')) return 'whatsapp';
        if (text.includes('comprar') || text.includes('ticket')) return 'ticket-alt';
        if (text.includes('web') || text.includes('sitio')) return 'globe';
        return 'external-link-alt';
    };

    return (
        <View className="flex-1 bg-white">
            {/* iOS Modal Hack: En iOS los modales nativos tienen un estilo carta,
                ponemos StatusBar light para que se vea bien sobre la foto oscura */}
            <StatusBar style="light" />

            <ScrollView bounces={false} className="flex-1">
                {/* HERO IMAGE */}
                <View className="relative h-72 w-full">
                    <Image
                        source={{ uri: event.poster_url }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    {/* Gradiente para que el botón cerrar y textos se vean bien */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)']}
                        className="absolute w-full h-full"
                    />

                    {/* Botón Cerrar Flotante */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-4 right-4 bg-black/30 p-2 rounded-full backdrop-blur-md"
                        style={{ marginTop: Platform.OS === 'android' ? 20 : 0 }} // Ajuste para Android
                    >
                        <FontAwesome5 name="times" size={20} color="white" />
                    </TouchableOpacity>

                    {/* Título sobre la imagen (Estilo moderno) */}
                    <View className="absolute bottom-0 p-6 w-full">
                        <View className="flex-row mb-2">
                            <View className="bg-orange-500 px-3 py-1 rounded-full self-start">
                                <Text className="text-white text-xs font-bold uppercase">{event.category}</Text>
                            </View>
                            {event.is_featured && (
                                <View className="bg-yellow-400 ml-2 px-3 py-1 rounded-full self-start">
                                    <Text className="text-black text-xs font-bold uppercase">Destacado</Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-white text-3xl font-extrabold shadow-sm leading-8">
                            {event.title}
                        </Text>
                    </View>
                </View>

                {/* CONTENIDO DEL CUERPO */}
                <View className="px-6 py-6">

                    {/* Fecha y Hora */}
                    <View className="flex-row items-start mb-6">
                        <View className="bg-orange-50 p-3 rounded-xl mr-4 items-center justify-center w-14 h-14">
                            <FontAwesome5 name="calendar-alt" size={24} color="#f97316" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-bold text-lg capitalize">{dateString}</Text>
                            <Text className="text-gray-500 text-base">{timeString} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                        </View>
                    </View>

                    {/* NUEVO: Ubicación + Botón Mapa */}
                    <View className="flex-row items-start mb-6">
                        <View className="bg-blue-50 p-3 rounded-xl mr-4 items-center justify-center w-14 h-14">
                            <FontAwesome5 name="map-marker-alt" size={24} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-900 font-bold text-lg">Ubicación</Text>
                                    <Text className="text-gray-600 text-base leading-5">{event.location_text}</Text>
                                </View>

                                {/* Botón para abrir mapa solo si hay coordenadas */}
                                {(event.latitude && event.longitude) && (
                                    <TouchableOpacity
                                        onPress={openMap}
                                        className="bg-blue-100 px-3 py-2 rounded-lg flex-row items-center border border-blue-200 mt-1"
                                    >
                                        <FontAwesome5 name="location-arrow" size={12} color="#2563eb" />
                                        <Text className="text-blue-700 font-bold text-xs ml-2">Ver Mapa</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Organizador */}
                    <View className="flex-row items-center mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {isBusiness && event.businesses?.logo_url ? (
                            <Image source={{ uri: event.businesses.logo_url }} className="w-12 h-12 rounded-full mr-3 bg-gray-200" />
                        ) : (
                            <View className="w-12 h-12 rounded-full mr-3 bg-gray-200 items-center justify-center">
                                <FontAwesome5 name="user-tie" size={20} color="#6b7280" />
                            </View>
                        )}
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs uppercase font-bold">Organizado por</Text>
                            <Text className="text-gray-900 font-bold text-lg">{organizerName}</Text>
                        </View>
                        {isBusiness && (
                            <TouchableOpacity className="bg-white p-2 rounded-full border border-gray-200">
                                <FontAwesome5 name="chevron-right" size={14} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="h-[1px] bg-gray-200 my-2 w-full" />

                    {/* Descripción */}
                    <Text className="text-gray-900 font-bold text-xl mb-3 mt-4">Acerca del evento</Text>
                    <Text className="text-gray-600 text-base leading-7 text-justify">
                        {event.description}
                    </Text>

                    <View className="h-24" />
                </View>
            </ScrollView>

            {/* BOTÓN DE ACCIÓN (Fixed Bottom) */}
            {event.external_link && (
                <View className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        className="w-full bg-orange-600 py-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-orange-200 active:bg-orange-700"
                        onPress={handleMainAction}
                    >
                        <FontAwesome5 name={getActionIcon()} size={18} color="white" />
                        <Text className="text-white font-bold text-lg ml-2 uppercase">
                            {actionButtonText}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}