import {View, Image, Text, BackHandler, ToastAndroid, Platform, TouchableOpacity} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Stack, useFocusEffect, useRouter} from 'expo-router';
import HomeButton from '@/components/HomeButton';
import {useCallback, useRef} from "react";
import {FontAwesome5} from "@expo/vector-icons";

const bgImage = require('@/assets/images/home-bg.png');
const cityOverlay = require('@/assets/images/city-overlay.png');
const logoImage = require('@/assets/images/qhoar-logo.png');


export default function HomeScreen() {
    const lastBackPress = useRef(0);
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                const current = Date.now();
                const DOUBLE_PRESS_DELAY = 2000;
                if (current - lastBackPress.current < DOUBLE_PRESS_DELAY) {
                    BackHandler.exitApp();
                    return true;
                }
                lastBackPress.current = current;
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Presiona otra vez para salir', ToastAndroid.SHORT);
                }
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

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
                <View className="flex-1 px-8 pt-6 pb-20 items-center justify-center">
                    {/* LOGO */}
                    <View className="mb-12 items-center w-full">
                        <Image
                            source={logoImage}
                            className="w-64 h-64"
                            resizeMode="contain"
                        />
                    </View>
                    {/* MENU DE BOTONES */}
                    <View className="w-full gap-y-4 px-2">
                        {/* Botón Principal Grande */}
                        <HomeButton
                            title="Explorar Directorio"
                            iconName="search-location"
                            href="/(tabs)/explore"
                            variant="hero"
                        />

                        {/* Fila de Secundarios */}
                        <View className="flex-row gap-x-4">
                            <View className="flex-1">
                                <HomeButton
                                    title="Eventos"
                                    iconName="calendar-day"
                                    href="/events"
                                    variant="box"
                                />
                            </View>
                            <View className="flex-1">
                                <HomeButton
                                    title="Inscripción"
                                    iconName="user-plus"
                                    href="/register"
                                    variant="box"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* FOOTER */}
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