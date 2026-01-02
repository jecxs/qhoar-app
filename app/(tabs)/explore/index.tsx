import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { CategoryIcon } from '@/components/CategoryIcon';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// Importa tus assets (Ajusta las rutas si es necesario)
const bgImage = require('@/assets/images/fondo-empresas.png');
const cityOverlay = require('@/assets/images/city-overlay.png');
const logoImage = require('@/assets/images/logo-minQhoar.png');

interface Category {
    id: number;
    name: string;
    icon_name: string;
    slug: string;
}

export default function CategoriesScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            if (error) throw error;
            if (data) setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            className="flex-1 bg-white m-2 p-4 rounded-xl shadow-sm border border-orange-100 items-center justify-center h-32"
            onPress={() => router.push({
                pathname: '/(tabs)/explore/[id]',
                params: { id: item.id, name: item.name }
            })}
            style={{ elevation: 3 }}
        >
            {/* Ícono dentro de marco naranja redondeado */}
            <View className="mb-2">
                <CategoryIcon name={item.icon_name || 'store'} size={34} color="#f97316" />
            </View>

            <Text className="text-gray-700 font-bold text-center text-xs mt-1">
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* 1. FONDO (Estilo marca de agua) */}
            <Image
                source={bgImage}
                className="absolute w-full h-full opacity-15"
                resizeMode="cover"
            />

            <SafeAreaView className="flex-1">
                {/* 2. HEADER PERSONALIZADO CORREGIDO */}
                <View className="flex-row justify-between items-start px-6 pt-2 mb-4">

                    {/* CORRECCIÓN: Botón Atrás */}
                    <TouchableOpacity
                        onPress={() => {
                            router.navigate('/');
                        }}
                        className="bg-orange-100 p-2 rounded-lg"
                    >
                        <FontAwesome5 name="chevron-left" size={20} color="#f97316" />
                    </TouchableOpacity>

                    {/* Logo ... */}
                    <Image
                        source={logoImage}
                        className="w-20 h-8"
                        resizeMode="contain"
                    />
                </View>

                {/* 3. TÍTULO DE LA SECCIÓN */}
                <View className="px-6 mb-6">
                    <Text className="text-gray-400 font-bold tracking-[0.2em] text-[10px] uppercase">
                        ÁMBITOS DE DESARROLLO
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Text className="text-3xl font-black text-gray-700 uppercase tracking-tighter">
                            RUBROS
                        </Text>
                        {/* Barra naranja gruesa */}
                        <View className="h-4 bg-orange-500 flex-1 ml-3 rounded-r-md" />
                    </View>
                </View>

                {/* 4. LISTA DE CATEGORÍAS */}
                {loading ? (
                    <ActivityIndicator size="large" color="#f97316" className="mt-10" />
                ) : (
                    <FlatList
                        data={categories}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 160 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>

            {/* 5. CIUDAD (Footer fijo abajo) */}
            <Image
                source={cityOverlay}
                className="absolute bottom-0 w-full h-32 opacity-90 z-0"
                resizeMode="stretch"
            />
        </View>
    );
}