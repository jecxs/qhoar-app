// components/events/StandardEventCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Event } from '@/constants/types/events';
import { FontAwesome5 } from '@expo/vector-icons';

interface Props {
    event: Event;
    onPress: () => void;
}

export default function StandardEventCard({ event, onPress }: Props) {
    const date = new Date(event.start_date);
    const dateString = date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeString = date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    // LOGICA DE ORGANIZADOR
    const organizer = event.businesses?.name || event.organizer_name || 'Qhoar Eventos';

    return (
        <TouchableOpacity
            className="flex-row bg-white rounded-xl mb-4 p-3 shadow-sm border border-gray-100"
            onPress={onPress}
        >
            <Image
                source={{ uri: event.poster_url }}
                className="w-24 h-24 rounded-lg bg-gray-200"
                resizeMode="cover"
            />

            <View className="flex-1 ml-3 justify-between py-1">
                <View>
                    <Text className="text-orange-500 font-bold text-[10px] uppercase mb-1">
                        {dateString} • {timeString}
                    </Text>
                    <Text className="text-gray-800 font-bold text-base leading-5" numberOfLines={2}>
                        {event.title}
                    </Text>
                </View>

                <View>
                    {/* ACTUALIZADO: Muestra empresa O nombre manual */}
                    <Text className="text-gray-500 text-xs mb-1 font-medium" numberOfLines={1}>
                        Org: <Text className="text-gray-700">{organizer}</Text>
                    </Text>

                    <View className="flex-row items-center">
                        <FontAwesome5 name="map-marker-alt" size={10} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs ml-1 flex-1" numberOfLines={1}>
                            {event.location_text}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}