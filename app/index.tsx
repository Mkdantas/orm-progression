import { StyleSheet, Image, Platform, Text } from 'react-native';
import { Divider, FAB, List, MD3Colors } from 'react-native-paper';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { collection, DocumentData, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';
import { useCallback, useEffect, useState } from 'react';
import {
  GestureHandlerRootView,
  RefreshControl,
  ScrollView,
} from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabTwoScreen() {
  const router = useRouter();
  const [data, setData] = useState<DocumentData>([]);
  const access = 'bispado';

  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Function to send a notification
  const sendNotification = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null, // Immediate trigger
    });
  };

  // Task identifier
  const BACKGROUND_CHECK_TASK = 'check-due-dates';

  TaskManager.defineTask(BACKGROUND_CHECK_TASK, async () => {
    try {
      // Get stored due dates
      const storedData = await AsyncStorage.getItem('dueDates');
      const dueDates = storedData ? JSON.parse(storedData) : [];

      const today = new Date().toISOString().split('T')[0];

      // Check if any due date matches today
      dueDates.forEach((item) => {
        if (item.date === today) {
          sendNotification('Lembrete', `Acompanhe as metas deste(a) jovem: ${item.task}`);
        }
      });

      return BackgroundFetch.Result.NewData;
    } catch (error) {
      console.error(error);
      return BackgroundFetch.Result.Failed;
    }
  });

  const registerBackgroundTask = async () => {
    const status = await BackgroundFetch.getStatusAsync();
  
    if (status === BackgroundFetch.Status.Restricted || status === BackgroundFetch.Status.Denied) {
      console.log('Background fetch is not available.');
      return;
    }
  
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_CHECK_TASK);
  
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_CHECK_TASK, {
        minimumInterval: 60 * 60 * 24, // Check every 24 hours
        stopOnTerminate: false, // Keep running after the app is terminated
        startOnBoot: true,      // Start task on device boot
      });
      console.log('Background fetch task registered.');
    }
  };

  const saveDueDates = async (data) => {
     // Get existing schedules from AsyncStorage
  const storedData = await AsyncStorage.getItem('dueDates');
  const dueDates = storedData ? JSON.parse(storedData) : [];

  // Check if the new due date already exists
  const exists = dueDates.some(
    item => item.task === data.task && item.date === data.date
  );

  if (exists) {
    console.log('Schedule already exists for this task and date.');
    return; // Exit early if the schedule already exists
  }

  // Add the new due date and save it
  dueDates.push(data);
  await AsyncStorage.setItem('dueDates', JSON.stringify(dueDates));

  };

  function isDue(targetDate: any, difference: number) {
    const currentDate: any = new Date(); // Current date and time
    const differenceInMilliseconds = currentDate - targetDate; // Difference in milliseconds
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24); // Convert to days
    return differenceInDays >= difference;
  }

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getData = async () => {
    const querySnapshot = await getDocs(collection(db, 'jovens'));
    const jovens: DocumentData = [];
    querySnapshot.forEach((doc) => {
      jovens.push({ ...doc.data(), id: doc.id });
    });
    setData(jovens);
  };

  
  useEffect(() => {
    getData();
    saveDueDates(data.map((d) => {
      const trueCount = d.progress.filter(
        (value: Record<string, boolean>) =>
          value[Object.keys(value)[0]] === true
      ).length;
      const pastDate = new Date(d.goal?.timestamp.seconds * 1000 +
      d.goal?.timestamp.nanoseconds / 1e6)

      if(trueCount <= 3){
        return { task: d.name, date: new Date(pastDate.getDate() + 15)}
      } else if(trueCount > 3 && trueCount <=6){
        return { task: d.name, date: new Date(pastDate.getDate() + 30)}
      } else if(trueCount > 6){
        return { task: d.name, date: new Date(pastDate.getDate() + 40)}
      }
    }))
    Notifications.requestPermissionAsync();
    registerBackgroundTask();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <FAB
          color="white"
          icon="plus"
          label="Adicionar jovem"
          style={styles.fab}
          onPress={() => router.push('/add')}
        />
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
          headerImage={
            <Image
              source={require('@/assets/images/christ.jpg')}
              style={styles.reactLogo}
            />
          }
        >
          <View style={styles.stepContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollView}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <List.Section style={styles.stepContainer}>
                <List.Subheader style={styles.stepTitle}>
                  Preocupantes
                </List.Subheader>
                <Divider />
                {data &&
                  data.map((jovem: any) => {
                    const trueCount = jovem.progress.filter(
                      (value: Record<string, boolean>) =>
                        value[Object.keys(value)[0]] === true
                    ).length;

                    return (
                      trueCount <= 3 && (
                        <List.Item
                          key={jovem.id}
                          right={() =>
                            isDue(
                              new Date(
                                jovem.goal?.timestamp.seconds * 1000 +
                                  jovem.goal?.timestamp.nanoseconds / 1e6
                              ),
                              15
                            ) && (
                              <Text style={{ color: 'red' }}>Meta vencida</Text>
                            )
                          }
                          onPress={() => router.push(`/jovem/${jovem.id}`)}
                          titleStyle={styles.item}
                          title={jovem.name}
                        />
                      )
                    );
                  })}
              </List.Section>
              <List.Section style={styles.stepContainer}>
                <List.Subheader style={styles.stepTitle}>
                  Progredindo
                </List.Subheader>
                <Divider />
                {data &&
                  data.map((jovem: any) => {
                    const trueCount = jovem.progress.filter(
                      (value: Record<string, boolean>) =>
                        value[Object.keys(value)[0]] === true
                    ).length;

                    return (
                      trueCount > 3 &&
                      trueCount <= 6 && (
                        <List.Item
                          key={jovem.id}
                          right={() =>
                            isDue(
                              new Date(
                                jovem.goal?.timestamp.seconds * 1000 +
                                  jovem.goal?.timestamp.nanoseconds / 1e6
                              ),
                              30
                            ) && (
                              <Text style={{ color: 'red' }}>Meta vencida</Text>
                            )
                          }
                          onPress={() => router.push(`/jovem/${jovem.id}`)}
                          titleStyle={styles.item}
                          title={jovem.name}
                        />
                      )
                    );
                  })}
              </List.Section>

              <List.Section style={styles.stepContainer}>
                <List.Subheader style={styles.stepTitle}>
                  Autossuficientes
                </List.Subheader>
                <Divider />
                {data &&
                  data.map((jovem: any) => {
                    const trueCount = jovem.progress.filter(
                      (value: Record<string, boolean>) =>
                        value[Object.keys(value)[0]] === true
                    ).length;

                    return (
                      trueCount > 6 && (
                        <List.Item
                          key={jovem.id}
                          right={() =>
                            isDue(
                              new Date(
                                jovem.goal?.timestamp.seconds * 1000 +
                                  jovem.goal?.timestamp.nanoseconds / 1e6
                              ),
                              40
                            ) && (
                              <Text style={{ color: 'red' }}>Meta vencida</Text>
                            )
                          }
                          onPress={() => router.push(`/jovem/${jovem.id}`)}
                          titleStyle={styles.item}
                          title={jovem.name}
                        />
                      )
                    );
                  })}
              </List.Section>
            </ScrollView>
          </View>
        </ParallaxScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    color: 'white',
  },
  stepTitle: {
    color: 'white',
    fontSize: 20,
  },
  item: {
    color: 'white',
  },
  reactLogo: {
    height: '100%',
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: '#003058',
  },
  scrollView: {
    flex: 1,
  },
});
