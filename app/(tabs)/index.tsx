import { View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function TabHomeDummy() {
    const router = useRouter();


    useFocusEffect(
        useCallback(() => {
            router.dismissAll();
            router.navigate('/');
        }, [])
    );

    return <View style={{ flex: 1, backgroundColor: 'white' }} />;
}