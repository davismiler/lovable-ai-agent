import React, { memo, useState } from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import BackButton from "../components/BackButton";
import { theme } from "../core/theme";
import { emailValidator, passwordValidator } from "../core/utils";
import { loginUser } from "../api/auth-api";
import Toast from "../components/Toast";
import "firebase/firestore";
const ChatScreen = ({ navigation }) => {
  // var db = firebase.firestore ();
  // db.collection("users").get().then((querySnapshot) => {
  //     querySnapshot.forEach((doc) => {
  //         console.log(`${doc.id} => ${doc.data()}`);
  //     });
  // });

    return (
        <Background>
          <BackButton goBack={() => navigation.navigate("HomeScreen")} />

        </Background>
    );
};

export default memo(ChatScreen);