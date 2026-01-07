// app/events/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Event, EventCategory } from '@/constants/types/events';

import FeaturedEventCard from '@/components/events/FeaturedEventCard';
import StandardEventCard from '@/components/events/StandardEventCard';

const CATEGORIES: { label: string; value: EventCategory | 'all' }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Cultural', value: 'cultural' },
    { label: 'Social', value: 'social' },
    { label: 'Académico', value: 'academico' },
    { label: 'Deportivo', value: 'deportivo' },
];

export default function EventsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
    const [standardEvents, setStandardEvents] = useState<Event[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        fetchEvents();
    }, [selectedCategory]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('events')
                .select('*, businesses(name, logo_url)')
                .order('start_date', { ascending: true });

            if (selectedCategory !== 'all') {
                query = query.eq('category', selectedCategory);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                // Tipar explícitamente para evitar errores de TS
                const events = data as unknown as Event[];
                setFeaturedEvents(events.filter(e => e.is_featured));
                setStandardEvents(events.filter(e => !e.is_featured));
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEventPress = (eventId: string) => {
        router.push({
            pathname: '/events/[id]',
            params: { id: eventId }
        });
    };

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            {/* HEADER */}
            {/* 2. CORRECCIÓN: edges={['top']} evita padding extra abajo si ya usas Tabs */}
            <SafeAreaView edges={['top']} className="bg-white z-10">
                <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 rounded-full">
                        <FontAwesome5 name="arrow-left" size={16} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Eventos en Ayacucho</Text>
                    {/* Asegúrate que este View no tenga espacios dentro */}
                    <View className="w-8" />
                </View>

                {/* FILTRO DE CATEGORÍAS */}
                <View className="py-3">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                    >
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.value}
                                onPress={() => setSelectedCategory(cat.value)}
                                className={`mr-3 px-4 py-2 rounded-full border ${
                                    selectedCategory === cat.value
                                        ? 'bg-orange-500 border-orange-500'
                                        : 'bg-white border-gray-300'
                                }`}
                            >
                                <Text className={selectedCategory === cat.value ? 'text-white font-bold' : 'text-gray-600'}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </SafeAreaView>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#f97316" />
                </View>
            ) : (
                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* SECCIÓN DESTACADOS */}
                    {/* Usamos sintaxis ternaria para evitar que && devuelva 0 si el length es 0 (aunque JS moderno lo maneja mejor, esto es más seguro en RN) */}
                    {featuredEvents.length > 0 ? (
                        <View className="mt-4 mb-2">
                            <View className="px-6 mb-3 flex-row items-center justify-between">
                                <Text className="text-lg font-extrabold text-gray-800">
                                    Destacados ✨
                                </Text>
                            </View>
                            <FlatList
                                horizontal
                                data={featuredEvents}
                                renderItem={({ item }) => (
                                    <FeaturedEventCard event={item} onPress={() => handleEventPress(item.id)} />
                                )}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{ paddingHorizontal: 24 }}
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>
                    ) : null}

                    {/* SECCIÓN LISTA GENERAL */}
                    <View className="px-6 mt-6">
                        <Text className="text-lg font-extrabold text-gray-800 mb-4">
                            Próximos Eventos
                        </Text>

                        {standardEvents.length > 0 ? (
                            standardEvents.map((event) => (
                                <StandardEventCard
                                    key={event.id}
                                    event={event}
                                    onPress={() => handleEventPress(event.id)}
                                />
                            ))
                        ) : (
                            <View className="items-center py-10">
                                <FontAwesome5 name="calendar-times" size={40} color="#d1d5db" />
                                <Text className="text-gray-400 mt-2 text-center">
                                    No hay eventos en esta categoría.
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}