import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#f97316',
                tabBarInactiveTintColor: '#9ca3af',
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: Platform.OS === 'ios' ? 85 : 65,
                    backgroundColor: '#ffffff',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: -5 },
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: 5,
                }
            }}>

            {/* 1. CORRECCIÓN AQUÍ: Botón INICIO */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={22} color={color} />,
                }}
                listeners={() => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        router.navigate('/');
                    },
                })}
            />

            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Directorio',
                    tabBarIcon: ({ color }) => <View className="bg-orange-50 p-1 rounded-full"><FontAwesome5 name="th-large" size={22} color={color} /></View>,
                }}
            />

            <Tabs.Screen
                name="register"
                options={{
                    title: 'Inscripción',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="file-signature" size={22} color={color} />,
                }}
            />

            <Tabs.Screen
                name="modal"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}