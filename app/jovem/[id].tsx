import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import {
  Badge,
  Button,
  Chip,
  Divider,
  FAB,
  PaperProvider,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { doc, DocumentData, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebaseConfig";

export default function UserProfile() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(false);
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<DocumentData>([]);
  const [open, setOpen] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState("");
  const [editingNotes, setEditingNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const progression: any = {
    read: "Leitura diária",
    pray: "Oração diária",
    aof: "Regras de fé",
    seminary: "Seminário",
    activities: "Atividades",
    mission: "Foco na Missão",
    care: "Amor ao próximo",
    reverence: "Reverência",
  };

  const onStateChange = (open: boolean) => setOpen(open);

  const handleChipPress = async (progress: any) => {
    await updateDoc(doc(db, "jovens", id.toString()), {
      progress: data.progress.map((d: any) => {
        if (Object.keys(d)[0] === progress) d[progress] = !d[progress];
        return d;
      }),
    });
    await getData();
    Alert.alert("Successo", `${progression[progress]} modificado com sucesso`);
  };

  const handleGoalChange = async () => {
    await updateDoc(doc(db, "jovens", id.toString()), {
      goal: {
        description: editingGoal,
        timestamp: new Date()
      }
    })
    await getData()
    setIsEditingGoal(false)
    Alert.alert("Successo", 'Meta adicionada com sucesso');

  }

  const handleNotesChange = async () => {
    await updateDoc(doc(db, "jovens", id.toString()), {
      notes: {
        description: editingNotes,
        timestamp: new Date()
      }
    })
    await getData()
    setIsEditingNotes(false)
    Alert.alert("Successo", 'Nota adicionada com sucesso');

  }

  const getData = async () => {
    const querySnapshot = await getDoc(doc(db, "jovens", id.toString()));
    if (querySnapshot.exists()) {
      setData(querySnapshot.data());
    } else {
      router.push("+not-found");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>

        <ParallaxScrollView
          headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
          headerImage={
            <Image
              source={require("@/assets/images/christ.jpg")}
              style={styles.reactLogo}
            />
          }
        >
          {data && (
            <View style={styles.container}>
              <Text style={styles.title} variant="headlineLarge">
                {data.name}
              </Text>
              <Divider />
              <Text style={styles.title} variant="titleLarge">
                Progresso
              </Text>
              <View style={styles.chips}>
                {data.progress &&
                  data.progress.map((item: any) => (
                    <Chip
                      key={Object.keys(item)[0]}
                      style={styles.chipTrue}
                      onPress={() => handleChipPress(Object.keys(item)[0])}
                    >
                      <Text
                        style={
                          item[Object.keys(item)[0]]
                            ? styles.chipTextTrue
                            : styles.chipTextFalse
                        }
                      >
                        {progression[Object.keys(item)[0]]}
                      </Text>
                    </Chip>
                  ))}
              </View>
              <Divider />
              <Text style={styles.title} variant="titleLarge">
                Meta
              </Text>
              {isEditingGoal ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editingGoal}
                    textColor="#003058"
                    onChange={(e: any) => setEditingGoal(e.target.value)}
                  />
                  <Button
                    mode="contained"
                    buttonColor="#003058"
                    textColor="white"
                    onPress={() => handleGoalChange()}
                  >
                    Enviar
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor="red"
                    textColor="white"
                    onPress={() => setIsEditingGoal(false)}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Text
                  style={styles.title}
                  variant="bodyLarge"
                  onPress={() => {
                    setIsEditingGoal(true);
                    setEditingGoal(data.goal?.description);
                  }}
                >
                  {data.goal?.description || ""} -{" "}
                  {data.goal
                    ? new Date(
                        data.goal?.timestamp.seconds * 1000 +
                          data.goal?.timestamp.nanoseconds / 1e6
                      ).toDateString()
                    : ""}
                </Text>
              )}
              <Divider />
              <Text style={styles.title} variant="titleLarge">
                Observações
              </Text>

              {isEditingNotes ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editingNotes}
                    textColor="#003058"
                    onChange={(e: any) => setEditingNotes(e.target.value)}
                  />
                  <Button
                    mode="contained"
                    buttonColor="#003058"
                    textColor="white"
                    onPress={() => handleNotesChange()}
                  >
                    Enviar
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor="red"
                    textColor="white"
                    onPress={() => setIsEditingNotes(false)}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Text
                  style={styles.title}
                  variant="bodyLarge"
                  onPress={() => {
                    setIsEditingNotes(true);
                    setEditingNotes(data.notes?.description);
                  }}
                >
                  {data.notes?.description || ""} -{" "}
                  {data.notes
                    ? new Date(
                        data.notes?.timestamp.seconds * 1000 +
                          data.notes?.timestamp.nanoseconds / 1e6
                      ).toDateString()
                    : ""}
                </Text>
              )}
            </View>
          )}
        </ParallaxScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
  },
  title: {
    color: "white",
  },
  chips: {
    flex: 1,
    flexDirection: "row",
    columnGap: 5,
    rowGap: 5,
    flexWrap: "wrap",
  },
  chipTrue: {
    backgroundColor: "white",
    borderColor: "#003058",
  },
  chipTextTrue: {
    color: "green",
    fontWeight: "bold",
  },
  chipTextFalse: {
    color: "#003058",
    fontWeight: "bold",
  },
  reactLogo: {
    height: "100%",
    width: "100%",
    flex: 1,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  fab: {
    position: "absolute",
    margin: 20,
    right: 0,
    bottom: 0,
  },
});
