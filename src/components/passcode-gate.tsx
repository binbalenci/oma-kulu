import { AppTheme } from "@/src/constants/AppTheme";
import { hasPasscode, setPasscode, verifyPasscode } from "@/src/lib/passcode";
import { createSession } from "@/src/lib/session";
import Constants from "expo-constants";
import { Platform } from "expo-modules-core";
import React from "react";
import { StyleSheet, View } from "react-native";
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
    const currentPin = isSetup && step === "confirm" ? confirmPin : pin;
    if (currentPin.length === 0) {
      setError("Please enter a passcode");
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
        // Create session after successful passcode setup
        await createSession();
        onUnlocked();
      } else {
        const ok = await verifyPasscode(pin);
        if (ok) {
          // Create session after successful passcode verification
          await createSession();
          onUnlocked();
        } else {
          setError("Incorrect passcode");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: any) => {
    if (Platform.OS === 'web' && event.nativeEvent.key === 'Enter') {
      onSubmit();
    }
  };

  if (isSetup === null) return null;

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {isSetup ? "Set Passcode" : "Enter Passcode"}
      </Text>
      <TextInput
        mode="outlined"
        label={isSetup && step === "confirm" ? "Confirm passcode" : "Passcode"}
        value={isSetup && step === "confirm" ? confirmPin : pin}
        onChangeText={(t) =>
          isSetup && step === "confirm"
            ? setConfirmPin(t)
            : setPin(t)
        }
        secureTextEntry
        keyboardType="number-pad"
        style={styles.input}
        onSubmitEditing={onSubmit}
        onKeyPress={handleKeyPress}
        returnKeyType="done"
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        style={styles.button}
      >
        {isSetup ? (step === "confirm" ? "Confirm" : "Continue") : "Unlock"}
      </Button>
      
      {/* Version Display */}
      <Text variant="bodySmall" style={styles.versionText}>
        Version {Constants.expoConfig?.version || "1.0.0"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: AppTheme.spacing['3xl'],
    gap: AppTheme.spacing.lg,
    backgroundColor: AppTheme.colors.background,
  },
  title: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: AppTheme.colors.background,
  },
  errorText: {
    color: AppTheme.colors.error,
    fontSize: AppTheme.typography.fontSize.sm,
    textAlign: "center",
  },
  button: {
    alignSelf: "stretch",
    backgroundColor: AppTheme.colors.primary,
  },
  versionText: {
    color: AppTheme.colors.textSecondary,
    marginTop: AppTheme.spacing['3xl'],
    textAlign: "center",
  },
});
