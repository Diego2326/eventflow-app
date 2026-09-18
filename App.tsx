import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { api, login, logout, request, restore } from "./src/api";
type EventItem = {
  id: string;
  name: string;
  type: string;
  startsAt: string;
  location: string;
};
type Mod = {
  code: string;
  name: string;
  category: string;
  featured: boolean;
  order: number;
};
const Stack = createNativeStackNavigator();
function Login({ navigation }: { navigation: any }) {
  const [identifier, setIdentifier] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  async function submit() {
    try {
      await login(identifier, password);
      navigation.replace("Eventos");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <SafeAreaView style={s.auth}>
      <View style={s.logoRow}>
        <Image source={require("./assets/eventflow-mark.png")} style={s.logo} />
        <Text style={s.brand}>EventFlow</Text>
      </View>
      <Text style={s.kicker}>TU EVENTO, BAJO CONTROL</Text>
      <Text style={s.title}>Entra al ritmo de la operación.</Text>
      <Text style={s.muted}>
        Agenda, accesos y novedades en un mismo lugar.
      </Text>
      <TextInput
        style={s.input}
        placeholder="Correo o teléfono"
        placeholderTextColor="#89909b"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
      />
      <TextInput
        style={s.input}
        placeholder="Contraseña"
        placeholderTextColor="#89909b"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {!!error && <Text style={s.error}>{error}</Text>}
      <Pressable style={s.button} onPress={submit}>
        <Text style={s.buttonText}>Entrar a EventFlow →</Text>
      </Pressable>
      <View style={s.loginLinks}>
        <Pressable onPress={() => navigation.navigate("Registro")}>
          <Text style={s.centerLink}>Crear cuenta</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Recuperación")}>
          <Text style={s.centerLink}>Recuperar acceso</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
function Register() {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [phone, setPhone] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState("");
  async function submit() {
    try {
      await request("/auth/register", "POST", { name, email, phone, password });
      setMessage("Cuenta creada. Revisa el enlace de activación.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <SafeAreaView style={s.auth}>
      <Text style={s.title}>Crea tu cuenta</Text>
      <TextInput
        style={s.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={s.input}
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={s.input}
        placeholder="Teléfono"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={s.input}
        placeholder="Contraseña segura"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable style={s.button} onPress={submit}>
        <Text style={s.buttonText}>Registrarme</Text>
      </Pressable>
      {!!message && <Text style={s.notice}>{message}</Text>}
    </SafeAreaView>
  );
}
function Forgot() {
  const [email, setEmail] = useState(""),
    [message, setMessage] = useState("");
  async function submit() {
    try {
      await request("/auth/forgot-password", "POST", { email });
      setMessage("Si la cuenta existe, recibirás instrucciones.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <SafeAreaView style={s.auth}>
      <Text style={s.title}>Recupera tu acceso</Text>
      <TextInput
        style={s.input}
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Pressable style={s.button} onPress={submit}>
        <Text style={s.buttonText}>Enviar instrucciones</Text>
      </Pressable>
      {!!message && <Text style={s.notice}>{message}</Text>}
    </SafeAreaView>
  );
}
function Events({ navigation }: { navigation: any }) {
  const [items, setItems] = useState<EventItem[] | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api<EventItem[]>("/events")
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <SafeAreaView style={s.screen}>
      <View style={s.row}>
        <View>
          <Text style={s.kicker}>MIS EXPERIENCIAS</Text>
          <Text style={s.heading}>Eventos</Text>
        </View>
        <Pressable
          onPress={async () => {
            await logout();
            navigation.replace("Login");
          }}
        >
          <Text style={s.link}>Salir</Text>
        </Pressable>
      </View>
      {error ? (
        <Text style={s.error}>{error}</Text>
      ) : !items ? (
        <ActivityIndicator color="#6473df" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.id}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <Text style={s.muted}>Aún no tienes eventos disponibles.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={s.card}
              onPress={() =>
                navigation.navigate("Inicio del evento", { event: item })
              }
            >
              <Text style={s.pill}>{item.type}</Text>
              <Text style={s.cardTitle}>{item.name}</Text>
              <Text style={s.muted}>
                {new Date(item.startsAt).toLocaleDateString()} · {item.location}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
function EventHome({ route }: { route: any }) {
  const event: EventItem = route.params.event,
    [mods, setMods] = useState<Mod[] | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api<Mod[]>(`/events/${event.id}/modules/navigation`)
      .then(setMods)
      .catch((e) => setError(e.message));
  }, [event.id]);
  const featured = mods?.filter((x) => x.featured) ?? [];
  return (
    <SafeAreaView style={s.screen}>
      <Text style={s.kicker}>{event.type}</Text>
      <Text style={s.heading}>{event.name}</Text>
      <Text style={s.muted}>{event.location}</Text>
      {!!featured.length && (
        <>
          <Text style={s.section}>Destacados</Text>
          <View style={s.featured}>
            {featured.map((m) => (
              <View style={s.feature} key={m.code}>
                <Text style={s.icon}>{m.code}</Text>
                <Text style={s.featureText}>{m.name}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      <Text style={s.section}>Explora el evento</Text>
      {error ? (
        <Text style={s.error}>{error}</Text>
      ) : !mods ? (
        <ActivityIndicator color="#6473df" />
      ) : (
        <FlatList
          data={mods}
          keyExtractor={(x) => x.code}
          renderItem={({ item }) => (
            <Pressable style={s.module}>
              <View style={s.moduleIcon}>
                <Text style={s.moduleCode}>{item.code}</Text>
              </View>
              <View>
                <Text style={s.moduleTitle}>{item.name}</Text>
                <Text style={s.muted}>{item.category}</Text>
              </View>
              <Text style={s.chevron}>›</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
export default function App() {
  const [ready, setReady] = useState(false),
    [signed, setSigned] = useState(false);
  useEffect(() => {
    restore().then((x) => {
      setSigned(x);
      setReady(true);
    });
  }, []);
  if (!ready)
    return (
      <View style={s.loading}>
        <ActivityIndicator color="#6473df" />
      </View>
    );
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={signed ? "Eventos" : "Login"}
        screenOptions={{
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Registro" component={Register} />
        <Stack.Screen name="Recuperación" component={Forgot} />
        <Stack.Screen
          name="Eventos"
          component={Events}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Inicio del evento" component={EventHome} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const s = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center" },
  auth: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    backgroundColor: "#f5f1e9",
  },
  screen: { flex: 1, padding: 22, backgroundColor: "#f5f1e9" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 52 },
  logo: { width: 38, height: 38 },
  brand: {
    fontSize: 23,
    fontWeight: "800",
    color: "#10213a",
    letterSpacing: -1,
  },
  accent: { color: "#f56642" },
  title: { fontSize: 40, lineHeight: 43, fontWeight: "700", color: "#10213a", marginBottom: 12, letterSpacing: -1.5 },
  heading: { fontSize: 37, fontWeight: "700", color: "#10213a", letterSpacing: -1.2 },
  muted: { color: "#697386", fontSize: 15, lineHeight: 22 },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#cbc6bb",
    borderRadius: 4,
    padding: 15,
    marginTop: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#10213a",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  centerLink: {
    color: "#10213a",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
  },
  loginLinks: { flexDirection: "row", justifyContent: "space-between" },
  notice: {
    color: "#287846",
    backgroundColor: "#e8f8ee",
    padding: 12,
    borderRadius: 9,
    marginTop: 12,
  },
  error: {
    color: "#ae4139",
    backgroundColor: "#fff0ee",
    padding: 12,
    borderRadius: 9,
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  link: { color: "#f56642", fontWeight: "700" },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    color: "#f56642",
    fontWeight: "800",
  },
  list: { gap: 10 },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d8d4cb",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202b3b",
    marginVertical: 9,
  },
  pill: {
    alignSelf: "flex-start",
    fontSize: 10,
    color: "#c24a2f",
    backgroundColor: "#fff0ea",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    fontWeight: "800",
  },
  section: {
    fontSize: 19,
    fontWeight: "800",
    color: "#253044",
    marginTop: 28,
    marginBottom: 14,
  },
  featured: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  feature: {
    width: "30%",
    backgroundColor: "#10213a",
    padding: 14,
    borderRadius: 4,
    minHeight: 100,
    justifyContent: "space-between",
  },
  icon: { color: "#dfe3ff", fontWeight: "800" },
  featureText: { color: "white", fontWeight: "700" },
  module: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: "white",
    padding: 14,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d8d4cb",
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 3,
    backgroundColor: "#fff0ea",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleCode: { fontWeight: "800", color: "#c24a2f", fontSize: 12 },
  moduleTitle: { fontSize: 16, fontWeight: "700", color: "#273246" },
  chevron: { marginLeft: "auto", fontSize: 28, color: "#a0a7b4" },
});
