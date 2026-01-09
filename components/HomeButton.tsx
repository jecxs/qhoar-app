import { TouchableOpacity, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    title: string;
    subtitle?: string;
    iconName: string;
    href: string;
    variant?: 'wide' | 'box' | 'hero';
    disabled?: boolean;
}

export default function HomeButton({ title, subtitle, iconName, href, variant = 'wide', disabled }: Props) {

    // Renderizado del contenido según la variante
    const renderContent = () => {
        if (variant === 'hero') {
            return (
                <LinearGradient
                    // Gradiente Naranja Intenso (Marca Qhoar)
                    colors={['#d66418', '#ea580c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-36 rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-orange-500/40"
                    style={{ elevation: 8 }}
                >
                    {/* Icono Fantasma de Fondo (Decorativo) */}
                    <View className="absolute -right-4 -bottom-4 opacity-20">
                        <FontAwesome5 name={iconName} size={100} color="white" />
                    </View>

                    {/* Contenido */}
                    <View className="flex-1 justify-between">
                        <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-sm">
                            <FontAwesome5 name={iconName} size={20} color="white" />
                        </View>
                        <View>
                            <Text className="text-white font-black text-2xl tracking-tight">
                                {title}
                            </Text>
                            <Text className="text-orange-50 font-medium text-sm mt-1 opacity-90">
                                {subtitle || "Descubre lo mejor de Ayacucho"}
                            </Text>
                        </View>
                    </View>

                    {/* Flecha indicadora */}
                    <View className="absolute top-6 right-6">
                        <FontAwesome5 name="arrow-right" size={16} color="white" />
                    </View>
                </LinearGradient>
            );
        }

        // Diseño para los botones cuadrados (Box)
        return (
            <View
                className="w-full h-36 bg-white rounded-3xl p-5 justify-between shadow-sm border border-orange-100/50"
                style={{ elevation: 4 }}
            >
                {/* Icono con fondo suave */}
                <View className="bg-orange-50 w-12 h-12 rounded-2xl items-center justify-center">
                    <FontAwesome5 name={iconName} size={22} color="#f97316" />
                </View>

                <View>
                    <Text className="text-gray-800 font-bold text-lg leading-6">
                        {title}
                    </Text>
                    {/* Línea decorativa */}
                    <View className="w-8 h-1 bg-orange-200 rounded-full mt-2" />
                </View>
            </View>
        );
    };

    if (disabled) return <View className="opacity-50">{renderContent()}</View>;

    return (
        <Link href={href as any} asChild>
            <TouchableOpacity activeOpacity={0.9}>
                {renderContent()}
            </TouchableOpacity>
        </Link>
    );
}