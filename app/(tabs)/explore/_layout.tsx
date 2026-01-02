import { Stack } from 'expo-router';

export default function ExploreLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'default',
                contentStyle: { backgroundColor: 'white' }
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="[id]" />
        </Stack>
    );
}