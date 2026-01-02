import { Link, router } from 'expo-router';
import {View, Text, Pressable, Platform} from 'react-native';
import { StatusBar } from 'expo-status-bar';



export default function ModalScreen() {
    const isPresented = router.canGoBack();

    return (
        <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-neutral-900">

            {/* Título */}
            <Text className="text-2xl font-bold mb-4 text-black dark:text-white">
                ¡Este es un Modal con Tailwind!
            </Text>

            <Text className="text-gray-500 text-center mb-8 dark:text-gray-400">
                Mira qué limpio queda el código sin usar StyleSheet.create al final del archivo.
            </Text>

            {/* Botón de enlace */}
            <Link href="../" asChild>
                <Pressable className="bg-blue-600 px-6 py-3 rounded-full active:bg-blue-700">
                    <Text className="text-white font-semibold text-lg">
                        Volver al inicio
                    </Text>
                </Pressable>
            </Link>

            {/* StatusBar para controlar la barra superior (batería, hora) */}
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </View>
    );
}