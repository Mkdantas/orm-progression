import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig'; // Your Firestore config file
import { ThemedView } from '@/components/ThemedView';
import { Picker } from '@react-native-picker/picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ActivityIndicator, Button } from 'react-native-paper';

const add = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Rapaz' | 'Moça'>('Rapaz');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Basic validation
    if (!name || !type) {
      Alert.alert('Erro', 'Por favor preencha tudo');
      setLoading(false);
      return;
    }

    try {
      // Add data to Firestore
      await addDoc(collection(db, 'jovens'), {
        name,
        type,
        goal: { description: '', timestamp: new Date() },
        progress: [
          {
            read: false,
          },
          {
            pray: false,
          },
          {
            aof: false,
          },
          {
            seminary: false,
          },
          {
            activities: false,
          },
          {
            mission: false,
          },
          {
            care: false,
          },
          {
            reverence: false,
          },
        ],
        notes: { description: '', timestamp: new Date() },
      });
      Alert.alert('Successo', 'Jovem adicionado com sucesso!');
      setLoading(false);
      setName(''); // Clear form fields
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar, tente novamente.');
      setLoading(false);
      console.error('Firestore error:', error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/christ.jpg')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.container}>
        <Text style={styles.heading}>Adicionar Jovem</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
        />
        <Picker
          style={styles.input}
          selectedValue={type}
          onValueChange={(itemValue, itemIndex) => setType(itemValue)}
        >
          <Picker.Item label="Rapaz" value="Rapaz" />
          <Picker.Item label="Moça" value="Moça" />
        </Picker>

        <Button
          disabled={loading}
          mode="contained"
          onPress={handleSubmit}
          buttonColor="#003058"
          textColor='white'
        >
          {loading ? (
            <ActivityIndicator animating={true} color="white" />
          ) : (
            'Enviar'
          )}
        </Button>
      </ThemedView>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  reactLogo: {
    height: '100%',
    width: '100%',
    flex: 1,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

export default add;
