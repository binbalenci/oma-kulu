import { hasPasscode, setPasscode, verifyPasscode } from "@/lib/passcode";
import Constants from "expo-constants";
import React from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

type Props = {
  onUnlocked: () => void;
};

export default function PasscodeGate({ onUnlocked }: Props) {
  const [isSetup, setIsSetup] = React.useState<boolean | null>(null);
  const [step, setStep] = React.useState<"enter" | "confirm">("enter");
  const [pin, setPin] = React.useState("");
  const [confirmPin, setConfirmPin] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const exists = await hasPasscode();
      setIsSetup(!exists);
    })();
  }, []);

  const onSubmit = async () => {
    setError(null);
    if (pin.length !== 4) {
      setError("Passcode");
      return;
    }
    setLoading(true);
    try {
      if (isSetup) {
        if (step === "enter") {
          setStep("confirm");
          setLoading(false);
          return;
        }
        if (pin !== confirmPin) {
          setLoading(false);
          setError("Passcodes do not match");
          return;
        }
        await setPasscode(pin);
        onUnlocked();
      } else {
        const ok = await verifyPasscode(pin);
        if (ok) onUnlocked();
        else setError("Incorrect passcode");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSetup === null) return null;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
      <Text variant="headlineMedium">{isSetup ? "Set Passcode" : "Enter Passcode"}</Text>
      <TextInput
        mode="outlined"
        label={isSetup && step === "confirm" ? "Confirm passcode" : "Passcode"}
        value={isSetup && step === "confirm" ? confirmPin : pin}
        onChangeText={(t) =>
          isSetup && step === "confirm"
            ? setConfirmPin(t.replace(/\D/g, "").slice(0, 4))
            : setPin(t.replace(/\D/g, "").slice(0, 4))
        }
        secureTextEntry
        keyboardType="number-pad"
        maxLength={4}
        style={{ width: "100%" }}
      />
      {!!error && <Text style={{ color: "red" }}>{error}</Text>}
      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        style={{ alignSelf: "stretch" }}
      >
        {isSetup ? (step === "confirm" ? "Confirm" : "Continue") : "Unlock"}
      </Button>
      
      {/* Version Display */}
      <Text variant="bodySmall" style={{ color: "#666", marginTop: 24 }}>
        Version {Constants.expoConfig?.version || "1.0.0"}
      </Text>
    </View>
  );
}
