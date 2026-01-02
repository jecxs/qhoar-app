import { View, Image, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import HomeButton from '@/components/HomeButton';

const bgImage = require('@/assets/images/home-bg.png');
const cityOverlay = require('@/assets/images/city-overlay.png');
const logoImage = require('@/assets/images/qhoar-logo.png');
const catIcon = require('@/assets/images/cat-icon.png');

export default function HomeScreen() {
    return (

        <View className="flex-1">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            {/* CAPA 1: FONDO */}
            <Image
                source={bgImage}
                className="absolute w-full h-full opacity-60"
                resizeMode="cover"
                blurRadius={1}
            />

            {/* CAPA 2: */}
            <Image
                source={cityOverlay}
                className="absolute bottom-0 w-full h-[28%]"
                resizeMode="stretch"
            />

            {/* CAPA 3: CONTENIDO */}
            <SafeAreaView className="flex-1">
                {/* Aumentamos padding horizontal a px-8  */}
                <View className="flex-1 px-8 pt-6 pb-20 items-center justify-center">

                    <View className="mb-10 items-center w-full">
                        <Image
                            source={logoImage}
                            className="w-64 h-64"
                            resizeMode="contain"
                        />
                    </View>

                    {/* 2. Espaciado vertical  */}
                    <View className="flex-row flex-wrap justify-center w-full gap-y-2 gap-x-10">

                        <HomeButton
                            title="Realidad Aumentada"
                            iconSource={catIcon}
                            href="/ar-view"
                            disabled={true}
                        />

                        <HomeButton
                            title="Directorio"
                            iconSource={catIcon}
                            href="/(tabs)/explore"
                        />

                        <HomeButton
                            title="Eventos"
                            iconSource={catIcon}
                            href="/events"
                        />

                        <HomeButton
                            title="Inscripción"
                            iconSource={catIcon}
                            href="/register"
                        />

                    </View>
                </View>

                <View className="absolute bottom-5 w-full flex-row justify-between px-6 z-20">
                    <Text className="text-white font-extrabold text-xs shadow-black drop-shadow-md">
                        Versión 1.0.0
                    </Text>
                    <Text className="text-white font-extrabold text-xs shadow-black drop-shadow-md">
                        Ayacucho - Perú
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}