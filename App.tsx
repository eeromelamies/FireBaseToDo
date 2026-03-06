import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Button, TextInput, Text, FlatList } from 'react-native';
import { firestore, collection, addDoc, serverTimestamp, MESSAGES, onSnapshot, query, orderBy, deleteDoc, doc } from './firebase/config';
import { useState, useEffect } from 'react';


export default function App() {

  const [value, setValue] = useState("")
  const [messages, setMessages] = useState<any[]>([])


  useEffect(() => {

    const colRef = collection(firestore, MESSAGES)
    const q = query(colRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMessages(docs)
    })

    return () => unsubscribe()
  }, [])


  const handleSend = async () => {
    if (!value.trim()) return

    try {
      const colRef = collection(firestore, MESSAGES)
      await addDoc(colRef, {
        text: value,
        createdAt: serverTimestamp()
      })
      setValue('')
    } catch (error) {
      console.log(error)
    }
  }


  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(firestore, MESSAGES, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          placeholder="New task"
          value={value}
          onChangeText={setValue}
        />
        <Button title='Add task' onPress={handleSend} />
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginTop: 10 }}>
            {/* Ei erikseen nappia poistamiselle kun painaa tekstä niin tuo handleDelete pyörähtää ja poistaa sen ruudulta ja firebasesta */}
            <Text onPress={() => handleDelete(item.id)}>
              {item.text}
            </Text>
          </View>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: 16,
    marginTop: 70
  },
  form: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginTop: 20,
  }
});

