// components/events/FeaturedEventCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Event } from '@/constants/types/events';
import { FontAwesome5 } from '@expo/vector-icons';

interface Props {
    event: Event;
    onPress: () => void;
}

export default function FeaturedEventCard({ event, onPress }: Props) {
    const date = new Date(event.start_date);
    const day = date.getDate();
    const month = date.toLocaleString('es-ES', { month: 'short' }).toUpperCase();

    // LOGICA DE ORGANIZADOR: Empresa > Campo Texto > Defecto
    const organizer = event.businesses?.name || event.organizer_name || 'Qhoar Eventos';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            className="mr-4 w-[300px] h-[200px] rounded-2xl overflow-hidden relative shadow-lg shadow-black/30"
        >
            <Image
                source={{ uri: event.poster_url }}
                className="w-full h-full absolute"
                resizeMode="cover"
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                className="absolute w-full h-full justify-end p-4"
            >
                {/* Badge de Patrocinado */}
                <View className="absolute top-3 right-3 bg-orange-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-[10px] font-bold uppercase">Destacado</Text>
                </View>

                <View className="flex-row items-end">
                    {/* Fecha */}
                    <View className="bg-white/95 rounded-lg p-2 items-center mr-3 w-14">
                        <Text className="text-gray-900 font-bold text-lg">{day}</Text>
                        <Text className="text-gray-600 text-[10px] font-bold">{month}</Text>
                    </View>

                    <View className="flex-1">
                        {/* NUEVO: Nombre del Organizador */}
                        <Text className="text-orange-400 font-bold text-[10px] uppercase mb-0.5" numberOfLines={1}>
                            {organizer}
                        </Text>

                        <Text className="text-white font-bold text-lg leading-5 mb-1" numberOfLines={2}>
                            {event.title}
                        </Text>

                        <View className="flex-row items-center">
                            <FontAwesome5 name="map-marker-alt" size={10} color="#cbd5e1" />
                            <Text className="text-gray-300 text-xs ml-1" numberOfLines={1}>
                                {event.location_text}
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}