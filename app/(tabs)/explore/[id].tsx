import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';

// Assets (Mismos que explore)
const bgImage = require('@/assets/images/fondo-empresas.png');
const cityOverlay = require('@/assets/images/city-overlay.png');
const logoImage = require('@/assets/images/logo-minQhoar.png');

interface Subcategory {
    id: number;
    name: string;
    description: string | null;
}

export default function SubcategoryScreen() {
    const { id, name } = useLocalSearchParams(); // Recibimos el ID y el Nombre de la categoría
    const router = useRouter();

    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchSubcategories();
    }, [id]);

    const fetchSubcategories = async () => {
        try {
            const { data, error } = await supabase
                .from('subcategories')
                .select('*')
                .eq('category_id', id) // Filtramos por la categoría padre
                .order('name');

            if (error) throw error;
            if (data) setSubcategories(data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Subcategory }) => (
        <TouchableOpacity
            className="bg-white mx-6 mb-4 p-5 rounded-2xl shadow-sm border border-orange-100 flex-row justify-between items-center"
            style={{ elevation: 2 }}
            onPress={() => console.log("Ir a empresas de: " + item.name)}
        >
            <View className="flex-1 pr-4">
                {/* Título de la subcategoría */}
                <Text className="text-gray-800 font-bold text-lg mb-1">
                    {item.name}
                </Text>

                {/* Descripción pequeña (si existe) */}
                {item.description ? (
                    <Text className="text-gray-500 text-xs leading-4">
                        {item.description}
                    </Text>
                ) : (
                    <Text className="text-gray-400 text-xs italic">
                        Ver empresas disponibles
                    </Text>
                )}
            </View>

            {/* Icono de flecha para indicar acción */}
            <View className="bg-orange-50 w-10 h-10 rounded-full items-center justify-center">
                <FontAwesome5 name="chevron-right" size={14} color="#f97316" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* FONDO */}
            <Image
                source={bgImage}
                className="absolute w-full h-full opacity-10"
                resizeMode="cover"
            />

            <SafeAreaView className="flex-1">
                {/* HEADER */}
                <View className="flex-row justify-between items-center px-6 pt-2 mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-orange-100 p-2 rounded-lg z-10"
                    >
                        <FontAwesome5 name="chevron-left" size={20} color="#f97316" />
                    </TouchableOpacity>

                    <Image
                        source={logoImage}
                        className="w-20 h-8"
                        resizeMode="contain"
                    />
                </View>

                {/* TÍTULO DINÁMICO (Nombre de la Categoría seleccionada) */}
                <View className="px-6 mb-6">
                    <Text className="text-gray-400 font-bold tracking-[0.2em] text-[10px] uppercase">
                        EXPLORANDO
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Text className="text-2xl font-black text-gray-700 uppercase tracking-tighter shrink">
                            {name || 'Categoría'}
                        </Text>
                        {/* Barra decorativa */}
                        <View className="h-4 bg-orange-500 flex-1 ml-3 rounded-r-md" />
                    </View>
                </View>

                {/* LISTA */}
                {loading ? (
                    <ActivityIndicator size="large" color="#f97316" className="mt-10" />
                ) : (
                    <FlatList
                        data={subcategories}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 160, paddingTop: 10 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center mt-10">
                                <Text className="text-gray-400">No hay subcategorías aún.</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>

            {/* CIUDAD FOOTER */}
            <Image
                source={cityOverlay}
                className="absolute bottom-0 w-full h-48 opacity-90 -z-10"
                resizeMode="contain"
                style={{ bottom: -10 }}
            />
        </View>
    );
}