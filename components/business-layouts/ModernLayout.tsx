import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Business, BusinessImage, DesignConfig } from '@/constants/types/business';
import { LinearGradient } from 'expo-linear-gradient';
import {SOCIAL_PLATFORMS, SocialLink} from "@/constants/socials";

const { width } = Dimensions.get('window');

interface Props {
    business: Business;
    gallery: BusinessImage[];
    theme: DesignConfig;
}

export default function ModernLayout({ business, gallery, theme }: Props) {
    const hasBackground = !!theme.background_url;
    const headerImage = theme.cover_url || business.hero_image_url || 'https://via.placeholder.com/400';
    const socialLinks = business.social_links || {};

    const primaryColor = theme.primary_color || '#f97316';
    const secondaryColor = theme.secondary_color || '#374151';

    const openLink = (url: string) => {
        if (url) Linking.openURL(url);
    };

    const handleWhatsApp = () => {
        if (business.whatsapp) {
            const text = `Hola ${business.name}, vi su perfil en Qhoar.`;
            Linking.openURL(`https://wa.me/${business.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`);
        }
    };

    const handleMap = () => {
        if (business.latitude && business.longitude) {
            const label = encodeURIComponent(business.name);
            const url = `geo:0,0?q=${business.latitude},${business.longitude}(${label})`;
            Linking.openURL(url);
        }
    };
    const getSocials = (): SocialLink[] => {
        const sl = business.social_links;
        if (Array.isArray(sl)) return sl;

        const arr: SocialLink[] = [];
        if (sl?.facebook) arr.push({ platform: 'facebook', url: sl.facebook });
        if (sl?.instagram) arr.push({ platform: 'instagram', url: sl.instagram });
        if (sl?.tiktok) arr.push({ platform: 'tiktok', url: sl.tiktok });
        return arr;
    };

    const displayLinks = getSocials();

    return (
        <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
        >
            {/* HERO DRAMÁTICO */}
            <View className="relative">
                <Image
                    source={{ uri: headerImage }}
                    className="w-full h-96"
                    resizeMode="cover"
                />

                {/* Gradiente dramático */}
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(255,255,255,1)']}
                    locations={[0, 0.5, 1]}
                    className="absolute bottom-0 w-full h-5"
                />

                {/* Logo flotante minimalista */}
                <View className="absolute bottom-0 left-6 -mb-8">
                    <View className="bg-white rounded-3xl p-2 shadow-2xl" style={{ elevation: 8 }}>
                        <Image
                            source={{ uri: business.logo_url }}
                            className="w-24 h-24 rounded-2xl"
                            resizeMode="cover"
                        />
                    </View>
                </View>

                {/* Badge galería minimalista */}
                {gallery.length > 0 && (
                    <View
                        className="absolute top-12 right-6 px-4 py-2 rounded-full backdrop-blur-xl"
                        style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                    >
                        <Text className="text-white text-sm font-semibold">
                            {gallery.length} {gallery.length === 1 ? 'foto' : 'fotos'}
                        </Text>
                    </View>
                )}
            </View>

            {/* CONTENIDO */}
            <View className="px-6 pt-12">

                {/* Título asimétrico */}
                <View className="mb-8">
                    <Text className="text-4xl font-black text-gray-900 leading-tight mb-3">
                        {business.name}
                    </Text>

                    {/* Subrayado orgánico con color secundario */}
                    <View className="flex-row items-center">
                        <View
                            className="h-1.5 rounded-full"
                            style={{ width: 60, backgroundColor: secondaryColor }}
                        />
                        <View
                            className="h-1.5 rounded-full ml-2"
                            style={{ width: 30, backgroundColor: primaryColor }}
                        />
                    </View>
                </View>

                {/* Descripción con tipografía espaciada */}
                <Text className="text-gray-700 text-base leading-7 mb-10 tracking-wide">
                    {business.description}
                </Text>

                {/* Botones de contacto - diseño único */}
                <View className="flex-row gap-3 mb-12">
                    <TouchableOpacity
                        onPress={handleWhatsApp}
                        activeOpacity={0.85}
                        className="flex-1 py-4 rounded-2xl flex-row items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <FontAwesome5 name="whatsapp" size={20} color="white" />
                        <Text className="text-white font-semibold text-base ml-3">
                            WhatsApp
                        </Text>
                    </TouchableOpacity>

                    {business.phone && (
                        <TouchableOpacity
                            onPress={() => Linking.openURL(`tel:${business.phone}`)}
                            activeOpacity={0.85}
                            className="w-16 h-16 rounded-2xl items-center justify-center"
                            style={{ backgroundColor: secondaryColor }}
                        >
                            <FontAwesome5 name="phone" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* IMAGEN DESTACADA - estilo editorial */}
                {business.hero_image_url && (
                    <View className="mb-12">
                        <View className="overflow-hidden rounded-3xl">
                            <Image
                                source={{ uri: business.hero_image_url }}
                                className="w-full h-80"
                                resizeMode="cover"
                            />
                            {/* Detalle de color en esquina */}
                            <View
                                className="absolute bottom-0 right-0 w-20 h-20 opacity-30"
                                style={{ backgroundColor: secondaryColor }}
                            />
                        </View>
                    </View>
                )}

                {/* REDES SOCIALES - minimalista */}
                {displayLinks.map((link, i) => {
                    const cfg = SOCIAL_PLATFORMS[link.platform] || SOCIAL_PLATFORMS.globe;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => Linking.openURL(link.url)}
                            className="bg-gray-100 px-5 py-3 rounded-xl flex-row items-center active:bg-gray-200"
                        >
                            <FontAwesome5 name={cfg.icon} size={18} color={cfg.color} />
                            <Text className="text-gray-700 font-semibold ml-2 capitalize">
                                {cfg.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

                {/* GALERÍA - Lookbook style */}
                {gallery.length > 0 && (
                    <View className="mb-12">
                        <View className="flex-row items-end justify-between mb-6">
                            <Text className="text-2xl font-bold text-gray-900">
                                Galería
                            </Text>
                            <View
                                className="px-3 py-1 rounded-full"
                                style={{ backgroundColor: `${secondaryColor}15` }}
                            >
                                <Text
                                    className="text-xs font-bold"
                                    style={{ color: secondaryColor }}
                                >
                                    {gallery.length}
                                </Text>
                            </View>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="-mx-6"
                            contentContainerStyle={{ paddingHorizontal: 24 }}
                        >
                            {gallery.map((img, idx) => {
                                // Variación de altura para efecto lookbook
                                const heights = [240, 200, 260, 220];
                                const height = heights[idx % heights.length];

                                return (
                                    <View key={img.id} className="mr-4" style={{ width: width * 0.7 }}>
                                        <View
                                            className="rounded-3xl overflow-hidden bg-gray-100"
                                            style={{ height }}
                                        >
                                            <Image
                                                source={{ uri: img.image_url }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />

                                            {img.title && (
                                                <View className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
                                                    <Text className="text-white font-semibold text-base">
                                                        {img.title}
                                                    </Text>
                                                    {img.description && (
                                                        <Text className="text-white/80 text-sm mt-1">
                                                            {img.description}
                                                        </Text>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* UBICACIÓN - Card limpia */}
                {business.latitude && business.longitude && (
                    <View className="mb-12">
                        <Text className="text-sm uppercase tracking-widest text-gray-400 mb-4 font-semibold">
                            Ubicación
                        </Text>

                        <TouchableOpacity
                            onPress={handleMap}
                            activeOpacity={0.9}
                            className="bg-gray-50 rounded-3xl p-6 border border-gray-100"
                        >
                            <View className="flex-row items-center mb-4">
                                <View
                                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                    style={{ backgroundColor: `${primaryColor}15` }}
                                >
                                    <FontAwesome5 name="map-marker-alt" size={18} color={primaryColor} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-semibold text-base mb-1">
                                        Cómo llegar
                                    </Text>
                                    <Text className="text-gray-500 text-sm">
                                        {business.address}
                                    </Text>
                                </View>
                                <FontAwesome5 name="chevron-right" size={16} color={primaryColor} />
                            </View>

                            {/* Mapa placeholder estilizado */}
                            <View className="h-32 rounded-2xl overflow-hidden bg-gray-100">
                                <Image
                                    source={require('@/assets/images/map-pattern.png')}
                                    className="w-full h-full opacity-40"
                                    resizeMode="cover"
                                />
                                <View
                                    className="absolute inset-0"
                                    style={{ backgroundColor: `${primaryColor}10` }}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* CTA FINAL - Sutil pero efectivo */}
                <TouchableOpacity
                    onPress={handleWhatsApp}
                    activeOpacity={0.85}
                    className="rounded-3xl overflow-hidden mb-8"
                >
                    <LinearGradient
                        colors={[primaryColor, primaryColor]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="py-5 px-8 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center mr-4">
                                <FontAwesome5 name="whatsapp" size={20} color="white" />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-lg">
                                    Conversemos
                                </Text>
                                <Text className="text-white/80 text-sm">
                                    Respuesta inmediata
                                </Text>
                            </View>
                        </View>
                        <FontAwesome5 name="arrow-right" size={18} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}