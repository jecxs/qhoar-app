import { Pressable, Text, Image, View, ImageSourcePropType, Platform } from 'react-native';
import { Link } from 'expo-router';

interface HomeButtonProps {
    title: string;
    iconSource: ImageSourcePropType;
    href: any;
    disabled?: boolean;
}

export default function HomeButton({ title, iconSource, href, disabled }: HomeButtonProps) {
    return (
        <Link href={href} asChild disabled={disabled}>
            <Pressable

                className={`w-[35%] aspect-square bg-[#FF7F27] rounded-[35px] items-center justify-center mb-6 ${disabled ? 'opacity-60' : 'active:scale-95'}`}
                style={Platform.select({
                    ios: {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                    },
                    android: {
                        elevation: 8,
                    }
                })}
            >
                {/* 3. Quitamos el padding (p-0) */}
                <View className="items-center justify-center w-full h-full p-0">
                    {/* 2. ICONO GIGANTE: Aumentado al 80% del contenedor */}
                    <Image
                        source={iconSource}
                        className="w-[80%] h-[80%] -mb-1 mt-2" // Ajuste fino de márgenes
                        resizeMode="contain"
                        style={{ tintColor: 'white' }}
                    />

                    {/* 4. Texto ajustado para caber abajo */}
                    <Text className="text-white font-bold text-center text-[13px] leading-tight mb-2 px-1">
                        {title}
                    </Text>
                </View>
            </Pressable>
        </Link>
    );
}