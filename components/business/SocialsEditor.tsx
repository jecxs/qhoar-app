import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SocialLink, SOCIAL_PLATFORMS, detectPlatform } from '@/constants/socials';

interface Props {
    links: SocialLink[];
    onChange: (links: SocialLink[]) => void;
    isPremium: boolean;
}

export default function SocialsEditor({ links, onChange, isPremium }: Props) {
    const [tempUrl, setTempUrl] = useState('');

    // Límite: 2 para Freemium, Ilimitado (99) para Premium
    const MAX_LINKS = isPremium ? 99 : 2;

    const handleAddLink = () => {
        if (!tempUrl.trim()) return;

        // Validación Freemium
        if (links.length >= MAX_LINKS) {
            Alert.alert(
                "Límite alcanzado",
                "Las cuentas gratuitas solo pueden agregar 2 redes sociales. ¡Pásate a Premium para agregar ilimitadas!",
                [{ text: "Entendido" }]
            );
            return;
        }

        const platform = detectPlatform(tempUrl);
        const newLink: SocialLink = { platform, url: tempUrl.trim() };

        onChange([...links, newLink]);
        setTempUrl(''); // Limpiar input
    };

    const handleRemoveLink = (index: number) => {
        const newLinks = [...links];
        newLinks.splice(index, 1);
        onChange(newLinks);
    };

    return (
        <View className="mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-2">Redes Sociales y Enlaces</Text>
            <Text className="text-gray-500 text-xs mb-4">
                {isPremium
                    ? "Agrega todas las redes que desees (Premium)."
                    : `Plan Gratuito: ${links.length}/${MAX_LINKS} enlaces permitidos.`}
            </Text>

            {/* Lista de Redes Agregadas */}
            <View className="gap-3 mb-4">
                {links.map((link, index) => {
                    const config = SOCIAL_PLATFORMS[link.platform] || SOCIAL_PLATFORMS.globe;
                    return (
                        <View key={index} className="flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                                style={{ backgroundColor: `${config.color}20` }}
                            >
                                <FontAwesome5 name={config.icon} size={14} color={config.color} />
                            </View>
                            <Text className="flex-1 text-gray-700 text-sm truncate" numberOfLines={1}>
                                {link.url}
                            </Text>
                            <TouchableOpacity
                                onPress={() => handleRemoveLink(index)}
                                className="p-2"
                            >
                                <FontAwesome5 name="trash-alt" size={14} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>

            {/* Input para agregar nueva */}
            <View className="flex-row gap-2">
                <TextInput
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                    placeholder="https://..."
                    value={tempUrl}
                    onChangeText={setTempUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                />
                <TouchableOpacity
                    onPress={handleAddLink}
                    disabled={!tempUrl.trim()}
                    className={`px-5 justify-center rounded-xl ${!tempUrl.trim() ? 'bg-gray-300' : 'bg-orange-500'}`}
                >
                    <FontAwesome5 name="plus" size={16} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}