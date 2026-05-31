import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import StudentScreen from "./screens/StudentScreen";
import TeacherScreen from "./screens/TeacherScreen";

const Stack = createStackNavigator();

function AppNavigator() {
  const { user } = useAuth();

  if (!user) return <LoginScreen />;
  if (user.role === "student") return <StudentScreen />;
  if (user.role === "teacher") return <TeacherScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}