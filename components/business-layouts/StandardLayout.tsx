import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, FlatList, ImageBackground } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Business, BusinessImage, DesignConfig } from '@/constants/types/business';
import { LinearGradient } from 'expo-linear-gradient';

const PLACEHOLDER_LOGO = 'https://via.placeholder.com/150';

interface Props {
    business: Business;
    gallery: BusinessImage[];
    theme: DesignConfig;
}

export default function StandardLayout({ business, gallery, theme }: Props) {
    const hasBackground = !!theme.background_url;
    const hasCover = !!theme.cover_url && theme.cover_url.length > 0;
    const socialLinks = business.social_links || {};
    const isPremium = business.is_premium;

    const openLink = (url?: string) => { if (url) Linking.openURL(url); };

    const handleCall = () => { if (business.phone) Linking.openURL(`tel:${business.phone}`); };

    const handleWhatsApp = () => {
        if (business.whatsapp) {
            const text = `Hola ${business.name}, los vi en la app Qhoar.`;
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

    const renderGalleryItem = ({ item }: { item: BusinessImage }) => (
        <View className="mr-4">
            <Image
                source={{ uri: item.image_url }}
                className="w-72 h-48 rounded-2xl bg-gray-200"
                resizeMode="cover"
            />
            {item.title && (
                <Text className="text-sm font-semibold text-gray-800 mt-2">{item.title}</Text>
            )}
        </View>
    );

    // Verificar si hay redes sociales
    const hasSocials = socialLinks.facebook || socialLinks.instagram || socialLinks.tiktok || business.website_url;

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: hasBackground ? 'transparent' : '#fafafa' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
        >
            {/* Header con Cover */}
            {hasCover ? (
                <ImageBackground
                    source={{ uri: theme.cover_url }}
                    className="h-48 w-full relative"
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.4)']}
                        className="absolute w-full h-full"
                    />
                </ImageBackground>
            ) : (
                <View className="h-48 w-full relative overflow-hidden" style={{ backgroundColor: theme.primary_color || '#f97316' }}>
                    {/* Patrón decorativo de fondo */}
                    <View className="absolute -right-8 -top-8 opacity-10">
                        <FontAwesome5 name="store" size={150} color="white" />
                    </View>
                    <View className="absolute -left-12 bottom-4 opacity-5">
                        <FontAwesome5 name="building" size={120} color="white" />
                    </View>
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.1)']}
                        className="absolute w-full h-full"
                    />
                </View>
            )}

            {/* Contenedor Principal */}
            <View className={hasBackground ? 'bg-white/95 mx-4 -mt-8 rounded-3xl shadow-xl' : 'bg-white -mt-8 rounded-t-3xl'}>

                {/* Logo con Badge Premium */}
                <View className="-mt-16 px-6 mb-4">
                    <View className="relative self-start">
                        <View className="bg-white p-2 rounded-3xl shadow-lg">
                            <Image
                                source={{ uri: business.logo_url || PLACEHOLDER_LOGO }}
                                className="w-28 h-28 rounded-2xl border-2 border-gray-100"
                                resizeMode="cover"
                            />
                        </View>
                        {isPremium && (
                            <View className="absolute -bottom-1 -right-1 bg-amber-400 px-2 py-1 rounded-full flex-row items-center shadow-md">
                                <FontAwesome5 name="crown" size={10} color="white" />
                                <Text className="text-white text-xs font-bold ml-1">PRO</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Información Principal */}
                <View className="px-6">
                    {/* Título y Dirección */}
                    <View className="mb-5">
                        <Text className="text-3xl font-black text-gray-900 leading-tight mb-1">
                            {business.name}
                        </Text>
                        {business.address && (
                            <View className="flex-row items-center mt-2">
                                <FontAwesome5 name="map-marker-alt" size={14} color="#9ca3af" />
                                <Text className="text-gray-500 text-sm ml-2 flex-1">{business.address}</Text>
                            </View>
                        )}
                    </View>

                    {/* Botones de Contacto Mejorados */}
                    <View className="flex-row mb-6 gap-3">
                        <TouchableOpacity
                            onPress={handleWhatsApp}
                            className="flex-1 bg-green-500 active:bg-green-600 flex-row items-center justify-center py-4 rounded-2xl shadow-md"
                        >
                            <FontAwesome5 name="whatsapp" size={20} color="white" />
                            <Text className="text-white font-bold ml-2 text-base">WhatsApp</Text>
                        </TouchableOpacity>
                        {business.phone && (
                            <TouchableOpacity
                                onPress={handleCall}
                                className="w-14 h-14 bg-gray-100 active:bg-gray-200 items-center justify-center rounded-2xl shadow-sm"
                            >
                                <FontAwesome5 name="phone-alt" size={18} color="#374151" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Descripción con Card Mejorada */}
                    <View className="mb-5">
                        <View className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-5">
                            <View className="flex-row items-center mb-3">
                                <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
                                    <FontAwesome5 name="info-circle" size={14} color="#f97316" />
                                </View>
                                <Text className="text-gray-900 font-bold text-lg ml-3">Sobre Nosotros</Text>
                            </View>
                            <Text className="text-gray-600 leading-6 text-base">
                                {business.description || "Bienvenido a nuestro negocio. Estamos aquí para atenderte con la mejor calidad y servicio."}
                            </Text>
                        </View>
                    </View>

                    {/* Hero Image (si existe) */}
                    {business.hero_image_url && (
                        <View className="mb-5">
                            <Image
                                source={{ uri: business.hero_image_url }}
                                className="w-full h-56 rounded-2xl border border-gray-200"
                                resizeMode="cover"
                            />
                        </View>
                    )}

                    {/* Botón de Mapa Mejorado */}
                    {(business.latitude && business.longitude) && (
                        <TouchableOpacity
                            onPress={handleMap}
                            className="mb-5 bg-blue-50 border border-blue-200 rounded-2xl p-5 flex-row items-center justify-between active:bg-blue-100"
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
                                    <FontAwesome5 name="map-marked-alt" size={16} color="white" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-blue-900 font-bold text-base">Cómo llegar</Text>
                                    <Text className="text-blue-600 text-sm">Ver ubicación en el mapa</Text>
                                </View>
                            </View>
                            <FontAwesome5 name="chevron-right" size={16} color="#93c5fd" />
                        </TouchableOpacity>
                    )}

                    {/* Redes Sociales Mejoradas */}
                    {hasSocials && (
                        <View className="mb-6">
                            <View className="flex-row items-center mb-4">
                                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                                    <FontAwesome5 name="share-alt" size={12} color="#9333ea" />
                                </View>
                                <Text className="text-gray-900 font-bold text-base ml-3">Síguenos</Text>
                            </View>

                            <View className="flex-row flex-wrap gap-3">
                                {business.website_url && (
                                    <TouchableOpacity
                                        onPress={() => openLink(business.website_url)}
                                        className="bg-gray-100 px-5 py-3 rounded-xl flex-row items-center active:bg-gray-200"
                                    >
                                        <FontAwesome5 name="globe" size={18} color="#6b7280" />
                                        <Text className="text-gray-700 font-semibold ml-2">Sitio Web</Text>
                                    </TouchableOpacity>
                                )}
                                {socialLinks.facebook && (
                                    <TouchableOpacity
                                        onPress={() => openLink(socialLinks.facebook)}
                                        className="bg-blue-50 px-5 py-3 rounded-xl flex-row items-center active:bg-blue-100"
                                    >
                                        <FontAwesome5 name="facebook" size={18} color="#1877F2" />
                                        <Text className="text-blue-700 font-semibold ml-2">Facebook</Text>
                                    </TouchableOpacity>
                                )}
                                {socialLinks.instagram && (
                                    <TouchableOpacity
                                        onPress={() => openLink(socialLinks.instagram)}
                                        className="bg-pink-50 px-5 py-3 rounded-xl flex-row items-center active:bg-pink-100"
                                    >
                                        <FontAwesome5 name="instagram" size={18} color="#E1306C" />
                                        <Text className="text-pink-700 font-semibold ml-2">Instagram</Text>
                                    </TouchableOpacity>
                                )}
                                {socialLinks.tiktok && (
                                    <TouchableOpacity
                                        onPress={() => openLink(socialLinks.tiktok)}
                                        className="bg-gray-100 px-5 py-3 rounded-xl flex-row items-center active:bg-gray-200"
                                    >
                                        <FontAwesome5 name="tiktok" size={18} color="#000000" />
                                        <Text className="text-gray-800 font-semibold ml-2">TikTok</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* Galería Premium (solo si es premium y tiene imágenes) */}
            {isPremium && gallery.length > 0 && (
                <View className="mt-6 mb-8">
                    <View className="px-6 mb-4">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
                                <FontAwesome5 name="images" size={12} color="#f97316" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg ml-3">Galería</Text>
                        </View>
                    </View>
                    <FlatList
                        horizontal
                        data={gallery}
                        renderItem={renderGalleryItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            )}

            {/* Footer Decorativo */}
            <View className="mt-4 mb-6 px-6">
                <View className="border-t border-gray-200 pt-4">
                    <View className="flex-row items-center justify-center opacity-50">
                        <FontAwesome5 name="map-marked-alt" size={12} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs ml-2">Descubre Ayacucho en Qhoar</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}