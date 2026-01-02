import { Redirect } from 'expo-router';

// Componente no se verá realmente, el TabBar lo intercepta. Necesario por AppRouter
export default function TabHome() {
    return <Redirect href="/" />;
}