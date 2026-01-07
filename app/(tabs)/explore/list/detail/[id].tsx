import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, ScrollView, ImageBackground } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import { Business, BusinessImage, DesignConfig } from '@/constants/types/business';

import StandardLayout from '@/components/business-layouts/StandardLayout';
import ModernLayout from '@/components/business-layouts/ModernLayout';
import VisualLayout from '@/components/business-layouts/VisualLayout';

// Valores por defecto (Identidad Visual de Qhoar/Ayacucho)
const DEFAULT_THEME: DesignConfig = {
    layout_variant: 'classic',
    primary_color: '#f97316', // Tu naranja actual
    secondary_color: '#374151', // Gris oscuro
    cover_type: 'solid',
    background_opacity: 0
};

export default function BusinessDetailScreen() {
    const { id } = useLocalSearchParams();
    const [business, setBusiness] = useState<Business | null>(null);
    const [gallery, setGallery] = useState<BusinessImage[]>([]);
    const [loading, setLoading] = useState(true);

    // Configuración final calculada
    const [activeTheme, setActiveTheme] = useState<DesignConfig>(DEFAULT_THEME);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // 1. Obtener info del negocio
            const { data: bizData, error: bizError } = await supabase
                .from('businesses')
                .select('*')
                .eq('id', id)
                .single();

            if (bizError) throw bizError;

            // 2. Obtener galería (imágenes extra)
            const { data: imgData, error: imgError } = await supabase
                .from('business_images')
                .select('*')
                .eq('business_id', id)
                .order('order_index');

            if (imgData) setGallery(imgData);

            // 3. Procesar lógica Premium
            if (bizData) {
                setBusiness(bizData);

                if (bizData.is_premium && bizData.design_config) {
                    // Si es premium, mezclamos su config con los defaults para evitar nulos
                    setActiveTheme({
                        ...DEFAULT_THEME,
                        ...bizData.design_config
                    });
                } else {
                    // Si es freemium, forzamos el default
                    setActiveTheme(DEFAULT_THEME);
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator color="#f97316" size="large"/></View>;
    }

    if (!business) return <View><Text>Error al cargar</Text></View>;

    // --- RENDERIZADO ---

    // Contenedor Principal (Maneja el fondo global si es Premium)
    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style={activeTheme.cover_type === 'video' ? 'light' : 'dark'} />

            {/* Fonde de Pantalla (Solo Premium) */}
            {activeTheme.background_url && (
                <ImageBackground
                    source={{ uri: activeTheme.background_url }}
                    className="absolute w-full h-full"
                    style={{ opacity: activeTheme.background_opacity || 0.05 }}
                    resizeMode="cover"
                />
            )}

            {/* Selector de Layout */}
            {business.is_premium ? (
                (() => {
                    // Switch dinámico basado en design_config
                    switch (activeTheme.layout_variant) {
                        case 'modern':
                            return <ModernLayout business={business} gallery={gallery} theme={activeTheme} />;
                        case 'visual':
                            return <VisualLayout business={business} gallery={gallery} theme={activeTheme} />;
                        case 'classic':
                        default:
                            return <StandardLayout business={business} gallery={gallery} theme={activeTheme} />;
                    }
                })()
            ) : (

                <StandardLayout business={business} gallery={gallery} theme={DEFAULT_THEME} />
            )}
        </View>
    );
}