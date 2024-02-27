import React, { memo } from "react";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Paragraph from "../components/Paragraph";
import Button from "../components/Button";
import { logoutUser } from "../api/auth-api";
import firebase from "firebase/app";
import "firebase/auth";

const Dashboard = () => (
  <Background>
    <Logo />
    <Header>VideoChatting start</Header>
    <Paragraph>
      
    </Paragraph>
    <Button mode="outlined" onPress={() => logoutUser()}>
      Logout
    </Button>
  </Background>
);

export default memo(Dashboard);
