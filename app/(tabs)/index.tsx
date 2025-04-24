import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  Button,
  FlatList,
} from "react-native";

import { Trivia } from "@/constants/Trivia";
import { useState } from "react";

export default function HomeScreen() {
  const [selected, setSelected] = useState<number[]>([]);
  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        style={styles.list}
        numColumns={3}
        data={Trivia}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Text>{item.id}</Text>
              <Button
                title="Select"
                onPress={() => {
                  setSelected((prev) => {
                    if (prev.includes(item.id)) {
                      return prev.filter((id) => id !== item.id);
                    }
                    return [...prev, item.id];
                  });
                }}
              />
            </View>
          );
        }}
        keyExtractor={(item) => `${item.id}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "lightgreen",
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flexDirection: "column",
  },
  card: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "lightblue",
    justifyContent: "center",
    alignItems: "center",
  },
});
