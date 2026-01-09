import React from 'react';
import { View, Text, ScrollView, ImageBackground, TouchableOpacity, Linking, Dimensions, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Business, BusinessImage, DesignConfig } from '@/constants/types/business';
import {SOCIAL_PLATFORMS, SocialLink} from "@/constants/socials";

const { height, width } = Dimensions.get('window');

interface Props {
    business: Business;
    gallery: BusinessImage[];
    theme: DesignConfig;
}

export default function VisualLayout({ business, gallery, theme }: Props) {
    const bgImage = theme.background_url || theme.cover_url || business.hero_image_url || 'https://via.placeholder.com/800x1200';

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
    const hasAnyLink = displayLinks.length > 0 || !!business.website_url;

    // Colores con fallback
    const primaryColor = theme.primary_color || '#f97316';
    const secondaryColor = theme.secondary_color || '#fbbf24';
    const opacity = theme.background_opacity ?? 0.5;

    const handleWhatsApp = () => {
        if (business.whatsapp) {
            const text = `Hola, vi ${business.name} en Qhoar y me interesa saber más.`;
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

    const handleCall = () => {
        if (business.phone) {
            Linking.openURL(`tel:${business.phone}`);
        }
    };

    const openLink = (url?: string) => {
        if (url) Linking.openURL(url);
    };

    return (
        <View className="flex-1 bg-black">
            {/* FONDO INMERSIVO */}
            <ImageBackground
                source={{ uri: bgImage }}
                className="absolute w-full h-full"
                resizeMode="cover"
                imageStyle={{ opacity: opacity }}
            >
                <LinearGradient
                    colors={['rgba(66,66,66,0.25)', 'transparent', 'rgba(0,0,0,0.79)']}
                    locations={[0, 0.3, 0.85]}
                    className="absolute w-full h-full"
                />
            </ImageBackground>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: height * 0.25, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6">

                    {/* LOGO DESTACADO */}
                    <View className="items-center mb-10">
                        <View className="mb-6 relative">
                            <View
                                className="w-28 h-28 rounded-full p-1"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderWidth: 2,
                                    borderColor: 'rgba(255,255,255,0.3)'
                                }}
                            >
                                <Image
                                    source={{ uri: business.logo_url }}
                                    className="w-full h-full rounded-full"
                                />
                            </View>

                            {/* Badge flotante con color primario */}
                            {gallery.length > 0 && (
                                <View
                                    className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <Text className="text-white text-xs font-bold">
                                        {gallery.length}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text className="text-white font-black text-4xl text-center leading-tight mb-3">
                            {business.name}
                        </Text>

                        {/* Línea decorativa con gradiente */}
                        <LinearGradient
                            colors={[primaryColor, secondaryColor]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="w-24 h-1 rounded-full mb-4"
                        />

                        <Text className="text-gray-300 text-center text-sm font-medium tracking-[3px] uppercase">
                            Experiencia Exclusiva
                        </Text>
                    </View>

                    {/* BOTONES DE ACCIÓN */}
                    <View className="flex-row justify-center gap-3 mb-8">
                        <TouchableOpacity
                            onPress={handleWhatsApp}
                            activeOpacity={0.85}
                            className="px-8 py-4 rounded-full flex-row items-center"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderWidth: 1.5,
                                borderColor: 'rgba(255,255,255,0.25)'
                            }}
                        >
                            <FontAwesome5 name="whatsapp" size={18} color="white" />
                            <Text className="text-white font-bold ml-3">Contacto</Text>
                        </TouchableOpacity>

                        {business.phone && (
                            <TouchableOpacity
                                onPress={handleCall}
                                activeOpacity={0.85}
                                className="w-14 h-14 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: secondaryColor,
                                    borderWidth: 1.5,
                                    borderColor: 'rgba(255,255,255,0.2)'
                                }}
                            >
                                <FontAwesome5 name="phone" size={18} color="white" />
                            </TouchableOpacity>
                        )}

                        {business.latitude && business.longitude && (
                            <TouchableOpacity
                                onPress={handleMap}
                                activeOpacity={0.85}
                                className="w-14 h-14 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: primaryColor,
                                    borderWidth: 1.5,
                                    borderColor: 'rgba(255,255,255,0.2)'
                                }}
                            >
                                <FontAwesome5 name="map-marker-alt" size={18} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* DESCRIPCIÓN + INFO GLASSMORPHISM */}
                    <View
                        className="backdrop-blur-2xl rounded-3xl p-6 border border-white/10 mb-8"
                        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    >
                        <Text className="text-white/90 text-lg font-bold mb-4">
                            Sobre nosotros
                        </Text>
                        <Text className="text-gray-300 leading-7 mb-6">
                            {business.description}
                        </Text>

                        {/* Dirección con icono */}
                        {business.address && (
                            <View className="flex-row items-start pt-4 border-t border-white/10">
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: `${primaryColor}40` }}
                                >
                                    <FontAwesome5 name="map-marker-alt" size={16} color={primaryColor} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white/70 text-xs uppercase tracking-wide mb-1 font-semibold">
                                        Ubicación
                                    </Text>
                                    <Text className="text-white text-sm">
                                        {business.address}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* IMAGEN DESTACADA - HERO IMAGE */}
                    {business.hero_image_url && (
                        <View className="mb-8">
                            <Text className="text-white font-bold text-xl mb-4">
                                Destacado
                            </Text>
                            <View className="relative rounded-3xl overflow-hidden">
                                <Image
                                    source={{ uri: business.hero_image_url }}
                                    className="w-full h-64"
                                    resizeMode="cover"
                                />
                                {/* Overlay sutil con color primario */}
                                <LinearGradient
                                    colors={['transparent', `${primaryColor}40`]}
                                    className="absolute bottom-0 w-full h-24"
                                />
                                {/* Borde brillante */}
                                <View
                                    className="absolute inset-0 rounded-3xl border-2"
                                    style={{ borderColor: `${primaryColor}30` }}
                                />
                            </View>
                        </View>
                    )}

                    {/* GALERÍA EN GRID */}
                    {gallery.length > 0 && (
                        <View className="mb-8">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-white font-bold text-xl">
                                    Galería
                                </Text>
                                <View
                                    className="px-3 py-1 rounded-full backdrop-blur-xl border border-white/20"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                >
                                    <Text className="text-white text-xs font-bold">
                                        {gallery.length} fotos
                                    </Text>
                                </View>
                            </View>

                            {/* Grid de 2 columnas */}
                            <View className="flex-row flex-wrap gap-3">
                                {gallery.slice(0, 4).map((img, idx) => (
                                    <View
                                        key={img.id}
                                        className="relative rounded-2xl overflow-hidden border border-white/20"
                                        style={{
                                            width: (width - 60) / 2,
                                            height: idx === 0 ? 240 : 180
                                        }}
                                    >
                                        <Image
                                            source={{ uri: img.image_url }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />

                                        {/* Gradient overlay */}
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                                            className="absolute bottom-0 w-full h-20 justify-end p-3"
                                        >
                                            {img.title && (
                                                <Text className="text-white text-sm font-bold">
                                                    {img.title}
                                                </Text>
                                            )}
                                        </LinearGradient>

                                        {/* Badge numerado */}
                                        <View
                                            className="absolute top-3 right-3 w-7 h-7 rounded-full items-center justify-center backdrop-blur-xl border border-white/20"
                                            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                                        >
                                            <Text className="text-white text-xs font-bold">
                                                {idx + 1}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Ver más (si hay más de 4) */}
                            {gallery.length > 4 && (
                                <TouchableOpacity
                                    className="mt-4 py-3 backdrop-blur-xl border border-white/20 rounded-2xl items-center"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                    activeOpacity={0.85}
                                >
                                    <Text className="text-white font-semibold">
                                        Ver todas las fotos ({gallery.length})
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* MAPA INTEGRADO */}
                    {business.latitude && business.longitude && (
                        <View className="mb-8">
                            <Text className="text-white font-bold text-xl mb-4">
                                Cómo llegar
                            </Text>
                            <TouchableOpacity
                                onPress={handleMap}
                                activeOpacity={0.9}
                                className="backdrop-blur-2xl border border-white/10 rounded-3xl p-5 overflow-hidden"
                                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                            >
                                {/* Mapa placeholder con overlay */}
                                <View className="h-40 rounded-2xl overflow-hidden mb-4 bg-gray-900/50 relative">
                                    <Image
                                        source={require('@/assets/images/map-pattern.png')}
                                        className="w-full h-full opacity-30"
                                        resizeMode="cover"
                                    />
                                    {/* Overlay con gradiente del color primario */}
                                    <LinearGradient
                                        colors={['transparent', `${primaryColor}60`]}
                                        className="absolute inset-0"
                                    />
                                    {/* Pin central */}
                                    <View className="absolute inset-0 items-center justify-center">
                                        <View
                                            className="w-16 h-16 rounded-full items-center justify-center"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <FontAwesome5 name="map-marker-alt" size={28} color="white" />
                                        </View>
                                    </View>
                                </View>

                                {/* Call to action */}
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 mr-3">
                                        <Text className="text-white font-bold text-base mb-1">
                                            Abrir en Google Maps
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            Toca para ver las indicaciones
                                        </Text>
                                    </View>
                                    <View
                                        className="w-10 h-10 rounded-full items-center justify-center"
                                        style={{ backgroundColor: `${primaryColor}30` }}
                                    >
                                        <FontAwesome5 name="arrow-right" size={14} color="white" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* REDES SOCIALES CON DISEÑO MEJORADO */}
                    {hasAnyLink && (
                        <View className="mb-10">
                            <Text className="text-white font-bold text-xl mb-4 text-center">
                                Síguenos
                            </Text>

                            <View className="flex-row flex-wrap justify-center gap-4">
                                {/* 1. Botón de Sitio Web (si existe) */}
                                {business.website_url && (
                                    <TouchableOpacity
                                        onPress={() => openLink(business.website_url)}
                                        className="w-14 h-14 rounded-2xl backdrop-blur-xl border border-white/20 items-center justify-center"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                        activeOpacity={0.8}
                                    >
                                        <FontAwesome5 name="globe" size={22} color="white" />
                                    </TouchableOpacity>
                                )}

                                {/* 2. Loop de Redes Sociales */}
                                {displayLinks.map((link, index) => {
                                    const config = SOCIAL_PLATFORMS[link.platform] || SOCIAL_PLATFORMS.globe;

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => openLink(link.url)}
                                            className="w-14 h-14 rounded-2xl backdrop-blur-xl border border-white/20 items-center justify-center"
                                            style={{
                                                backgroundColor: `${config.color}30`
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <FontAwesome5 name={config.icon} size={22} color="white" />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* CTA FINAL CON GRADIENTE */}
                    <View className="rounded-3xl overflow-hidden">
                        <TouchableOpacity
                            onPress={handleWhatsApp}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[primaryColor, primaryColor]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="py-5 px-6 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
                                        <FontAwesome5 name="whatsapp" size={22} color="white" />
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
                                <FontAwesome5 name="arrow-right" size={20} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}