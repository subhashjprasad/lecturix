import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import EncryptButton from "./EncryptButton";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <EncryptButton
      handleClick={() =>
        loginWithRedirect({
          redirectUri: `${window.location.origin}/teacher`
        })
      }
    />
  );
};

export default LoginButton;