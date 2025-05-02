// ToastConfig.tsx
import React from "react";
import { View, Text, Button } from "react-native";

export const toastConfig = {
  custom_delete: ({ text1, props }: { text1?: string; props: { onCancel: () => void; onConfirm: (id: string) => void; id: string } }) => (
    <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 10 }}>
      <Text style={{ fontWeight: "bold" }}>{text1 || "Confirm Deletion"}</Text>
      <Text>Are you sure you want to delete this expense?</Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Button title="Cancel" onPress={props.onCancel} />
        <Button title="Delete" color="red" onPress={() => {
          props.onConfirm(props.id);
          props.onCancel(); // hide toast
        }} />
      </View>
    </View>
  ),
};
