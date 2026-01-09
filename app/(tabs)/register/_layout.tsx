// app/(tabs)/register/_layout.tsx
import { Stack } from 'expo-router';

export default function RegisterLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'white' },
            animation: 'slide_from_right'
        }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="form" />
            <Stack.Screen name="manage" />
            <Stack.Screen
                name="manage-premium"
                options={{
                    presentation: 'modal'
                }}
            />
        </Stack>
    );
}