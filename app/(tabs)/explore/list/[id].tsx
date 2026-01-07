import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

// Assets
const bgImage = require('@/assets/images/fondo-empresas.png');
const cityOverlay = require('@/assets/images/city-overlay.png');
// Placeholder por si no hay imagen
const placeholderImage = 'https://via.placeholder.com/300x150.png?text=Sin+Imagen';

interface Business {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    whatsapp: string;
    logo_url: string | null;
    hero_image_url: string | null;
    is_premium: boolean;
    design_config: {
        cover_url?: string;
        cover_type?: string;
    } | null;
}

export default function BusinessListScreen() {
    const { id, name } = useLocalSearchParams(); // ID de la subcategoría
    const router = useRouter();

    const [premiumBusinesses, setPremiumBusinesses] = useState<Business[]>([]);
    const [standardBusinesses, setStandardBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBusinesses();
    }, [id]);

    const fetchBusinesses = async () => {
        try {
            // Traemos TODAS las empresas de esta subcategoría que estén activas
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('subcategory_id', id)
                // .eq('status', 'APPROVED') // Descomenta esto cuando tengas datos reales validados
                .order('is_premium', { ascending: false }); // Premium primero por si acaso

            if (error) throw error;

            if (data) {
                // Separamos la lógica en memoria
                const premiums = data.filter((b: Business) => b.is_premium);
                const standards = data.filter((b: Business) => !b.is_premium);

                setPremiumBusinesses(premiums);
                setStandardBusinesses(standards);
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    // --- RENDERIZADO: TARJETA PREMIUM (CARRUSEL) ---
    const renderPremiumItem = ({ item }: { item: Business }) => {
        const cardImage = item.design_config?.cover_url || item.hero_image_url || placeholderImage;

        return (
            <TouchableOpacity
                className="mr-4 bg-white rounded-2xl shadow-sm border border-orange-200 w-72 overflow-hidden"
                style={{ elevation: 4 }}
                onPress={() => router.push({
                    pathname: '/(tabs)/explore/list/detail/[id]',
                    params: { id: item.id }
                })}
            >
                {/* Usamos la variable calculada arriba */}
                <Image
                    source={{ uri: cardImage }}
                    className="w-full h-32"
                    resizeMode="cover"
                />

                {/* Badge Premium */}
                <View className="absolute top-2 right-2 bg-yellow-400 px-2 py-1 rounded-full flex-row items-center shadow-sm">
                    <FontAwesome5 name="crown" size={10} color="#fff" />
                    <Text className="text-[10px] font-bold text-white ml-1">DESTACADO</Text>
                </View>

                <View className="p-3">
                    <Text className="text-gray-800 font-bold text-lg" numberOfLines={1}>{item.name}</Text>
                    {/* ... resto del contenido ... */}
                    <View className="flex-row items-center mt-2">
                        <FontAwesome5 name="map-marker-alt" size={10} color="#f97316" />
                        <Text className="text-gray-400 text-xs ml-1 flex-1" numberOfLines={1}>
                            {item.address}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // --- RENDERIZADO: TARJETA ESTÁNDAR (LISTA VERTICAL) ---
    const renderStandardItem = ({ item }: { item: Business }) => (
        <TouchableOpacity
            className="bg-white mb-3 p-4 rounded-xl shadow-sm border border-gray-100 flex-row items-center mx-6"
            style={{ elevation: 2 }}
            onPress={() => router.push({
                pathname: '/(tabs)/explore/list/detail/[id]',
                params: { id: item.id }
            })}
        >
            {/* Logo Cuadrado */}
            <Image
                source={{ uri: item.logo_url || placeholderImage }}
                className="w-16 h-16 rounded-lg bg-gray-50"
                resizeMode="cover"
            />

            <View className="flex-1 ml-4 justify-center">
                <Text className="text-gray-800 font-bold text-base">{item.name}</Text>
                <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
                    {item.description}
                </Text>
                <View className="flex-row items-center mt-2 space-x-3">
                    {/* Botones de acción rápida */}
                    {item.phone && (
                        <TouchableOpacity onPress={() => handleCall(item.phone)} className="bg-green-50 p-1.5 rounded-md">
                            <FontAwesome5 name="phone" size={12} color="#16a34a" />
                        </TouchableOpacity>
                    )}
                    <View className="flex-row items-center flex-1">
                        <FontAwesome5 name="map-marker-alt" size={10} color="#9ca3af" />
                        <Text className="text-gray-400 text-[10px] ml-1">
                            {item.address}
                        </Text>
                    </View>
                </View>
            </View>
            <FontAwesome5 name="chevron-right" size={12} color="#d1d5db" />
        </TouchableOpacity>
    );

    // --- HEADER DEL FLATLIST (Contiene el Carrusel Premium) ---
    const ListHeader = () => (
        <View className="mb-4">
            {/* Título de la página */}
            <View className="px-6 mb-4">
                <Text className="text-gray-400 font-bold tracking-[0.2em] text-[10px] uppercase">
                    DIRECTORIO
                </Text>
                <View className="flex-row items-center mt-1">
                    <Text className="text-2xl font-black text-gray-700 uppercase tracking-tighter shrink">
                        {name || 'Empresas'}
                    </Text>
                    <View className="h-4 bg-orange-500 flex-1 ml-3 rounded-r-md" />
                </View>
            </View>

            {/* SECCIÓN PREMIUM (Solo si hay premiums) */}
            {premiumBusinesses.length > 0 && (
                <View className="mb-6">
                    <Text className="px-6 text-gray-800 font-bold text-sm mb-3 flex-row items-center">
                        Recomendados en Ayacucho
                    </Text>
                    <FlatList
                        horizontal
                        data={premiumBusinesses}
                        renderItem={renderPremiumItem}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                    />
                </View>
            )}

            {/* Título lista normal */}
            <View className="px-6 mb-2 mt-2">
                <Text className="text-gray-600 font-bold text-sm">Todas las empresas</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Fondo decorativo */}
            <Image source={bgImage} className="absolute w-full h-full opacity-10" resizeMode="cover" />

            <SafeAreaView className="flex-1">
                {/* Header Navegación */}
                <View className="flex-row items-center px-6 pt-2 mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="bg-orange-100 p-2 rounded-lg z-10 mr-4">
                        <FontAwesome5 name="chevron-left" size={20} color="#f97316" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#f97316" className="mt-20" />
                ) : (
                    <FlatList
                        data={standardBusinesses}
                        renderItem={renderStandardItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={ListHeader} // Aquí inyectamos el carrusel
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            standardBusinesses.length === 0 && premiumBusinesses.length === 0 ? (
                                <View className="items-center mt-10 px-10">
                                    <Text className="text-gray-400 text-center">
                                        Aún no hay empresas registradas en esta categoría.
                                    </Text>
                                </View>
                            ) : null
                        }
                    />
                )}
            </SafeAreaView>

            {/* Ciudad Footer */}
            <Image
                source={cityOverlay}
                className="absolute bottom-0 w-full h-24 opacity-80 -z-10"
                resizeMode="cover"
            />
        </View>
    );
}