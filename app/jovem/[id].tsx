import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Badge, Chip, Divider, FAB, PaperProvider, Portal, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { doc, DocumentData, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';

export default function UserProfile() {
  const router = useRouter()
  const [isAvailable, setIsAvailable] = useState(false);
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<DocumentData>([])
  const [open, setOpen] = useState(false)

  const onStateChange = (open:boolean) => setOpen(open);

  const updateData = async (update:any) => {
    await updateDoc(doc(db, "jovens", id.toString()), update)
  }

  const getData = async () => {
    
    const querySnapshot = await getDoc(doc(db, 'jovens', id.toString()));
    if (querySnapshot.exists()) {
      setData(querySnapshot.data());
    } else {
      router.push('+not-found')
    }
  }
    

  useEffect(() => {
    getData();
  }, []);


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PaperProvider>
      <Portal>
        <FAB.Group
          open={open}
          color="white"
          visible
          icon={'plus'}
          actions={[
            {
              icon: 'check',
              label: 'Editar progresso',
              onPress: () => console.log('Pressed star'),
            },
            {
              icon: 'flag',
              label: 'Editar metas',
              onPress: () => console.log('Pressed email'),
            },
            {
              icon: 'pencil',
              label: 'Adicionar observação',
              onPress: () => console.log('Pressed notifications'),
            },
          ]}
          onStateChange={() => onStateChange(!open)}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
      </Portal>

      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/christ.jpg')}
            style={styles.reactLogo}
          />
        }
      >
        {data && (<View style={styles.container}>
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
                  style={item[Object.keys(item)[0]] ? styles.chipTrue : styles.chipFalse}
                >
                  <Text style={item[Object.keys(item)[0]] ? styles.chipTextTrue : styles.chipTextFalse}>{Object.keys(item)[0]}</Text>
                </Chip>
              ))}
          </View>
          <Divider />
          <Text style={styles.title} variant="titleLarge">
            Meta
          </Text>
          <Text style={styles.title} variant="bodyLarge">
            {data.goal?.description || ''} - {data.goal? new Date(data.goal?.timestamp.seconds * 1000 + data.goal?.timestamp.nanoseconds / 1e6).toDateString() : ''}
          </Text>
          <Divider />
          <Text style={styles.title} variant="titleLarge">
            Observações
          </Text>

          <Text style={styles.title} variant="bodyLarge">
            {data.notes?.description || ''} - {data.notes? new Date(data.notes?.timestamp.seconds * 1000 + data.notes?.timestamp.nanoseconds / 1e6).toDateString() : ''}
          </Text>
        </View>)}
      </ParallaxScrollView>
      </PaperProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
  },
  title: {
    color: 'white',
  },
  chips: {
    flex: 1,
    flexDirection: 'row',
    columnGap: 5,
    rowGap: 5,
    flexWrap: 'wrap',
  },
  chipTrue: {
    backgroundColor: 'green',
    borderColor: '#003058',
  },
  chipFalse: {
    backgroundColor: 'white',
    borderColor: '#003058',
  },
  chipTextTrue: {
    color: 'white',
  },
  chipTextFalse: {
    color: '#003058',
  },
  reactLogo: {
    height: '100%',
    width: '100%',
    flex: 1,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
  },
});
