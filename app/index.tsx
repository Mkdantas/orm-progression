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

export default function TabTwoScreen() {
  const router = useRouter();
  const [data, setData] = useState<DocumentData>([]);
  const access = 'bispado';

  function isDue(targetDate:any, difference:number) {
    const currentDate:any = new Date(); // Current date and time
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
                    data.map(
                      (jovem: any) =>{
                        const trueCount = jovem.progress.filter((value:Record<string, boolean>) => value[Object.keys(value)[0]] === true).length;
                        
                        return trueCount <= 3 && (
                          <List.Item
                            key={jovem.id}
                            right={() => isDue(new Date(jovem.goal?.timestamp.seconds * 1000 + jovem.goal?.timestamp.nanoseconds / 1e6), 1) && (<Text style={{color: 'red'}}>Meta vencida</Text>) }
                            onPress={() => router.push(`/jovem/${jovem.id}`)}
                            titleStyle={styles.item}
                            title={jovem.name}
                          />
                        )}
                    )}
                </List.Section>
              <List.Section style={styles.stepContainer}>
                <List.Subheader style={styles.stepTitle}>Progredindo</List.Subheader>
                <Divider />
                {data &&
                    data.map(
                      (jovem: any) =>{
                        const trueCount = jovem.progress.filter((value:Record<string, boolean>) => value[Object.keys(value)[0]] === true).length;
                        
                        return trueCount > 3 && trueCount <= 6 && (
                          <List.Item
                            key={jovem.id}
                            right={() => isDue(new Date(jovem.goal?.timestamp.seconds * 1000 + jovem.goal?.timestamp.nanoseconds / 1e6), 1) && (<Text style={{color: 'red'}}>Meta vencida</Text>) }
                            onPress={() => router.push(`/jovem/${jovem.id}`)}
                            titleStyle={styles.item}
                            title={jovem.name}
                          />
                        )}
                    )}
              </List.Section>

              <List.Section style={styles.stepContainer}>
                <List.Subheader style={styles.stepTitle}>Autossuficientes</List.Subheader>
                <Divider />
                {data &&
                    data.map(
                      (jovem: any) =>{
                        const trueCount = jovem.progress.filter((value:Record<string, boolean>) => value[Object.keys(value)[0]] === true).length;
                        
                        return trueCount > 6 && (
                          <List.Item
                            key={jovem.id}
                            right={() => isDue(new Date(jovem.goal?.timestamp.seconds * 1000 + jovem.goal?.timestamp.nanoseconds / 1e6), 1) && (<Text style={{color: 'red'}}>Meta vencida</Text>) }
                            onPress={() => router.push(`/jovem/${jovem.id}`)}
                            titleStyle={styles.item}
                            title={jovem.name}
                          />
                        )}
                    )}
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
    flex: 1
  },
});
