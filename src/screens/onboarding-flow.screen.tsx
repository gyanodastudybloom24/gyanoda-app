import { type ElementRef, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, FocusAwareStatusBar, customAlert } from '@/components/ui';
import { Fonts, MaxContentWidth, Rounded, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/services';
import type { RootStackScreenProps } from '@/types/navigation';

export type OnboardingFlowScreenProps = RootStackScreenProps<'OnboardingFlow'>;

const CLASS_OPTIONS = [
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'JEE / NEET Dropper',
  'College',
];

export function OnboardingFlowScreen({ navigation }: OnboardingFlowScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Main Steps for New Student Progress Bar:
  // 1 = Phone Number (includes Phone Input & Phone OTP)
  // 2 = Name (First Name & Last Name side-by-side, MANDATORY, NON-SKIPPABLE)
  // 3 = Other Details (Email with optional verify button, Class, Location - SKIPPABLE)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Phone sub-state: 'phoneInput' or 'phoneOtp'
  const [phoneSubStep, setPhoneSubStep] = useState<'phoneInput' | 'phoneOtp'>('phoneInput');

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneResendSeconds, setPhoneResendSeconds] = useState(30);
  const phoneOtpInputRef = useRef<ElementRef<typeof TextInput>>(null);

  // Step 2: Name state (Mandatory for new users)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Step 3: Other Details state
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailResendSeconds, setEmailResendSeconds] = useState(30);
  const emailOtpInputRef = useRef<ElementRef<typeof TextInput>>(null);

  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [location, setLocation] = useState('');

  const scrollViewRef = useRef<ElementRef<typeof ScrollView>>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '').slice(-10);

  // Keyboard height listener for dynamic bottom scroll padding
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Phone Resend OTP Countdown
  useEffect(() => {
    if (currentStep !== 1 || phoneSubStep !== 'phoneOtp' || phoneResendSeconds <= 0) return;
    const timer = setInterval(() => {
      setPhoneResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep, phoneSubStep, phoneResendSeconds]);

  // Email Resend OTP Countdown
  useEffect(() => {
    if (!isVerifyingEmail || emailResendSeconds <= 0) return;
    const timer = setInterval(() => {
      setEmailResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isVerifyingEmail, emailResendSeconds]);

  // Unified Back Navigation Handler
  const handleBack = () => {
    if (isVerifyingEmail) {
      setIsVerifyingEmail(false);
      return;
    }
    if (currentStep === 3) {
      setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      setCurrentStep(1);
      setPhoneSubStep('phoneInput');
      return;
    }
    if (currentStep === 1 && phoneSubStep === 'phoneOtp') {
      setPhoneSubStep('phoneInput');
      return;
    }
    navigation.goBack();
  };

  // Step 1A: Phone Number Submission -> Sends OTP
  const handlePhoneSubmit = () => {
    if (cleanPhone.length < 10) {
      customAlert.show({
        title: 'Invalid Mobile Number',
        message: 'Please enter a valid 10-digit mobile number to proceed.',
        type: 'warning',
      });
      return;
    }

    setPhoneResendSeconds(30);
    setPhoneOtp('');
    setPhoneSubStep('phoneOtp');
    setTimeout(() => {
      phoneOtpInputRef.current?.focus();
    }, 300);
  };

  // Step 1B: Phone OTP Verification -> Auto-Dynamic Database Check
  const handlePhoneOtpVerify = () => {
    if (phoneOtp.length < 4) {
      customAlert.show({
        title: 'Enter 4-Digit Code',
        message: 'Please enter the 4-digit verification code sent to your mobile (Demo code: 1234).',
        type: 'warning',
      });
      return;
    }

    // Auto-dynamic detection: Check if phone number is matched in database/service
    const isExisting = authService.isUserRegistered(cleanPhone);

    if (isExisting) {
      // Existing student: Log in and enter Main immediately (bypasses Name & Details)
      authService.loginWithPhone(cleanPhone);
      customAlert.show({
        title: 'Welcome Back!',
        message: `Logged in successfully with +91 ${cleanPhone}.`,
        type: 'success',
        buttons: [
          {
            text: 'Continue',
            style: 'primary',
            onPress: () => navigation.replace('Main'),
          },
        ],
      });
      return;
    }

    // New student: Verification is complete for Step 1 -> advance to Step 2 (Name)
    setCurrentStep(2);
  };

  const handlePhoneResendOtp = () => {
    if (phoneResendSeconds > 0) return;
    setPhoneResendSeconds(30);
    setPhoneOtp('');
    customAlert.show({
      title: 'OTP Sent',
      message: `A fresh 4-digit code has been dispatched to +91 ${cleanPhone}.`,
      type: 'info',
    });
  };

  // Step 2: Name Submission (Mandatory, cannot skip)
  const handleNameSubmit = () => {
    if (!firstName.trim()) {
      customAlert.show({
        title: 'First Name Required',
        message: 'New students must provide their name to continue with account setup.',
        type: 'warning',
      });
      return;
    }

    // Advance to Step 3: Other Details
    setCurrentStep(3);
  };

  // Step 3: Trigger Optional Email Verification
  const handleVerifyEmailPress = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      customAlert.show({
        title: 'Invalid Email',
        message: 'Please enter a valid email address before requesting verification.',
        type: 'warning',
      });
      return;
    }

    setEmailResendSeconds(30);
    setEmailOtp('');
    setIsVerifyingEmail(true);
    setTimeout(() => {
      emailOtpInputRef.current?.focus();
    }, 300);
  };

  // Step 3: Verify Email OTP
  const handleEmailOtpVerify = () => {
    if (emailOtp.length < 4) {
      customAlert.show({
        title: 'Enter 4-Digit Code',
        message: 'Please enter the 4-digit code sent to your email (Demo code: 1234).',
        type: 'warning',
      });
      return;
    }

    setIsEmailVerified(true);
    setIsVerifyingEmail(false);
    customAlert.show({
      title: 'Email Verified',
      message: `Your email (${email.trim()}) has been verified successfully.`,
      type: 'success',
    });
  };

  const handleEmailResendOtp = () => {
    if (emailResendSeconds > 0) return;
    setEmailResendSeconds(30);
    setEmailOtp('');
    customAlert.show({
      title: 'OTP Sent',
      message: `A new 4-digit verification code was sent to ${email.trim()}.`,
      type: 'info',
    });
  };

  // Step 3: Skip Button & Confirmation Dialog Handler
  const handleSkipPress = () => {
    customAlert.show({
      title: 'Are you sure?',
      message: 'You can complete your grade and academic details later from your profile.',
      type: 'confirm',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'primary',
          onPress: () => {
            // Save profile with mandatory Phone & Name, and proceed to ChooseExam
            authService.registerUser({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phoneNumber: cleanPhone,
              email: email.trim() || undefined,
              isEmailVerified,
            });
            navigation.replace('ChooseExam');
          },
        },
      ],
    });
  };

  // Step 3: Complete Setup & Proceed to ChooseExam
  const handleFinish = () => {
    authService.registerUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: cleanPhone,
      email: email.trim(),
      isEmailVerified,
      className: selectedClass,
      location: location.trim(),
    });

    navigation.replace('ChooseExam');
  };

  return (
    <ThemedView style={styles.container}>
      <FocusAwareStatusBar />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0}>
        {/* Top Header Row: Back Button, Pill Progress Bar, and Skip Button (Only on Step 3) */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            hitSlop={12}
            style={({ pressed }) => [
              styles.navIconButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressedState,
            ]}>
            <SolarIcon name="AltArrowLeft" size={20} themeColor="text" />
          </Pressable>

          {/* Pill-shaped Progress Bar: 3 Main Steps (1: Phone, 2: Name, 3: Details) */}
          <View style={styles.pillProgressBarContainer}>
            {[1, 2, 3].map((stepNumber) => {
              const isFilled = stepNumber <= currentStep;
              return (
                <View
                  key={stepNumber}
                  style={[
                    styles.progressPill,
                    {
                      backgroundColor: isFilled
                        ? theme.brand
                        : isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(0, 0, 0, 0.08)',
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Skip Button: ONLY shown on Step 3 without active email verification modal */}
          {currentStep === 3 && !isVerifyingEmail ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip optional profile details"
              onPress={handleSkipPress}
              hitSlop={12}
              style={({ pressed }) => [
                styles.skipButton,
                pressed && styles.pressedState,
              ]}>
              <Text style={[styles.skipButtonText, { color: theme.brand }]}>
                Skip
              </Text>
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {/* Scrollable Form Content */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                keyboardHeight > 0
                  ? keyboardHeight + 40
                  : Math.max(insets.bottom, 24) + Spacing.five,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <View style={styles.formWrapper}>
            {/* =========================================================================
                STEP 1: PHONE NUMBER & ITS OTP VERIFICATION (Verification is part of Phone step)
               ========================================================================= */}
            {currentStep === 1 && phoneSubStep === 'phoneInput' && (
              <View style={styles.stepSection}>
                <View style={styles.titleBlock}>
                  <ThemedText style={styles.stepTitle}>
                    Enter Mobile Number
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.stepSubtitle}>
                    We will send you a 4-digit code to verify your phone number.
                  </ThemedText>
                </View>

                {/* Phone Number Field */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Mobile Number</ThemedText>
                  <View
                    style={[
                      styles.inputContainer,
                      { backgroundColor: theme.card, borderColor: theme.border },
                    ]}>
                    <SolarIcon name="Phone" size={18} themeColor="textSecondary" />
                    <View style={styles.countryCodeBadge}>
                      <Text style={[styles.countryCodeText, { color: theme.text }]}>
                        +91
                      </Text>
                      <View style={[styles.codeDivider, { backgroundColor: theme.border }]} />
                    </View>
                    <TextInput
                      style={[styles.textInput, { color: theme.text }]}
                      placeholder="98765 43210"
                      placeholderTextColor={theme.textSecondary}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      maxLength={10}
                      returnKeyType="done"
                      autoFocus
                    />
                  </View>
                </View>

                <Button
                  title="Get OTP"
                  variant="primary"
                  size="lg"
                  rounded="full"
                  onPress={handlePhoneSubmit}
                  style={styles.submitButton}
                />
              </View>
            )}

            {currentStep === 1 && phoneSubStep === 'phoneOtp' && (
              <View style={styles.stepSection}>
                <View style={styles.titleBlock}>
                  <ThemedText style={styles.stepTitle}>
                    Verify Phone
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.stepSubtitle}>
                    We sent a 4-digit verification code to +91 {cleanPhone || '98765 43210'}.
                  </ThemedText>
                  <Pressable
                    onPress={() => setPhoneSubStep('phoneInput')}
                    hitSlop={8}
                    style={styles.changeActionPressable}>
                    <Text style={[styles.changeActionText, { color: theme.brand }]}>
                      Edit phone number
                    </Text>
                  </Pressable>
                </View>

                {/* 4-Digit Phone OTP Boxes */}
                <Pressable
                  onPress={() => phoneOtpInputRef.current?.focus()}
                  style={styles.otpBoxesRow}>
                  {[0, 1, 2, 3].map((index) => {
                    const digit = phoneOtp[index] || '';
                    const isFocused = phoneOtp.length === index;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          {
                            backgroundColor: theme.card,
                            borderColor: isFocused
                              ? theme.brand
                              : digit
                                ? theme.brand
                                : theme.border,
                          },
                        ]}>
                        <Text style={[styles.otpDigit, { color: theme.text }]}>
                          {digit}
                        </Text>
                      </View>
                    );
                  })}
                </Pressable>

                {/* Hidden Real TextInput */}
                <TextInput
                  ref={phoneOtpInputRef}
                  value={phoneOtp}
                  onChangeText={(val) => setPhoneOtp(val.replace(/[^0-9]/g, '').slice(0, 4))}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={styles.hiddenOtpInput}
                  autoFocus
                />

                {/* Resend OTP Row */}
                <View style={styles.resendRow}>
                  {phoneResendSeconds > 0 ? (
                    <ThemedText themeColor="textSecondary" style={styles.resendTimerText}>
                      Resend code in {phoneResendSeconds}s
                    </ThemedText>
                  ) : (
                    <Pressable onPress={handlePhoneResendOtp} hitSlop={8}>
                      <Text style={[styles.resendActiveText, { color: theme.brand }]}>
                        Resend OTP Code
                      </Text>
                    </Pressable>
                  )}
                </View>

                <Button
                  title="Verify & Continue"
                  variant="primary"
                  size="lg"
                  rounded="full"
                  onPress={handlePhoneOtpVerify}
                  style={styles.submitButton}
                />
              </View>
            )}

            {/* =========================================================================
                STEP 2: NAME (First Name & Last Name side-by-side, MANDATORY, NON-SKIPPABLE)
               ========================================================================= */}
            {currentStep === 2 && (
              <View style={styles.stepSection}>
                <View style={styles.titleBlock}>
                  <ThemedText style={styles.stepTitle}>
                    What&apos;s Your Name?
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.stepSubtitle}>
                    Enter your full name. Name is mandatory to setup your student account.
                  </ThemedText>
                </View>

                {/* First Name & Last Name SIDE-BY-SIDE */}
                <View style={styles.nameRow}>
                  {/* First Name */}
                  <View style={styles.nameCol}>
                    <ThemedText style={styles.inputLabel}>First Name *</ThemedText>
                    <View
                      style={[
                        styles.inputContainer,
                        { backgroundColor: theme.card, borderColor: theme.border },
                      ]}>
                      <SolarIcon name="User" size={18} themeColor="textSecondary" />
                      <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        placeholder="First Name"
                        placeholderTextColor={theme.textSecondary}
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        returnKeyType="next"
                        autoFocus
                      />
                    </View>
                  </View>

                  {/* Last Name */}
                  <View style={styles.nameCol}>
                    <ThemedText style={styles.inputLabel}>Last Name</ThemedText>
                    <View
                      style={[
                        styles.inputContainer,
                        { backgroundColor: theme.card, borderColor: theme.border },
                      ]}>
                      <SolarIcon name="User" size={18} themeColor="textSecondary" />
                      <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        placeholder="Last Name"
                        placeholderTextColor={theme.textSecondary}
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                        returnKeyType="done"
                      />
                    </View>
                  </View>
                </View>

                <Button
                  title="Continue"
                  variant="primary"
                  size="lg"
                  rounded="full"
                  onPress={handleNameSubmit}
                  style={styles.submitButton}
                />
              </View>
            )}

            {/* =========================================================================
                STEP 3: OTHER DETAILS (Email with optional verify button, Class, Location)
               ========================================================================= */}
            {currentStep === 3 && !isVerifyingEmail && (
              <View style={styles.stepSection}>
                <View style={styles.titleBlock}>
                  <ThemedText style={styles.stepTitle}>
                    Academic & Details
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.stepSubtitle}>
                    Personalize your curriculum track. Email verification is optional.
                  </ThemedText>
                </View>

                {/* Email Address with Inline "Verify" button */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <ThemedText style={styles.inputLabel}>Email Address (Optional)</ThemedText>
                    {isEmailVerified && (
                      <View style={styles.verifiedInlineBadge}>
                        <SolarIcon name="CheckCircle" type="bold" size={13} color="#10B981" />
                        <Text style={styles.verifiedInlineBadgeText}>Verified</Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.inputContainer,
                      { backgroundColor: theme.card, borderColor: theme.border },
                    ]}>
                    <SolarIcon name="Letter" size={18} themeColor="textSecondary" />
                    <TextInput
                      style={[styles.textInput, { color: theme.text }]}
                      placeholder="e.g. student@example.com"
                      placeholderTextColor={theme.textSecondary}
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        if (isEmailVerified) setIsEmailVerified(false);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                    />

                    {/* Inline Verify Button if email is typed and not yet verified */}
                    {!isEmailVerified && email.trim().length > 0 && (
                      <Pressable
                        onPress={handleVerifyEmailPress}
                        hitSlop={6}
                        style={[styles.verifyInlineButton, { backgroundColor: theme.brand }]}>
                        <Text style={styles.verifyInlineButtonText}>Verify</Text>
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Class / Grade Selector */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Select Your Class / Target</ThemedText>
                  <View style={styles.classChipsGrid}>
                    {CLASS_OPTIONS.map((item) => {
                      const isSelected = selectedClass === item;
                      return (
                        <Pressable
                          key={item}
                          onPress={() => setSelectedClass(item)}
                          style={[
                            styles.classChip,
                            {
                              backgroundColor: isSelected ? theme.brand : theme.card,
                              borderColor: isSelected ? theme.brand : theme.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.classChipText,
                              {
                                color: isSelected ? '#ffffff' : theme.text,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}>
                            {item}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Location Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Location / City</ThemedText>
                  <View
                    style={[
                      styles.inputContainer,
                      { backgroundColor: theme.card, borderColor: theme.border },
                    ]}>
                    <SolarIcon name="MapPoint" size={18} themeColor="textSecondary" />
                    <TextInput
                      style={[styles.textInput, { color: theme.text }]}
                      placeholder="e.g. Kolkata, West Bengal"
                      placeholderTextColor={theme.textSecondary}
                      value={location}
                      onChangeText={setLocation}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 250);
                      }}
                      autoCapitalize="words"
                      returnKeyType="done"
                    />
                  </View>
                </View>

                {/* Complete Setup: Non-blocking, user can proceed whether email is verified or not */}
                <Button
                  title="Complete Setup"
                  variant="primary"
                  size="lg"
                  rounded="full"
                  onPress={handleFinish}
                  style={styles.submitButton}
                />
              </View>
            )}

            {/* =========================================================================
                STEP 3 (SUB-VIEW): EMAIL OTP VERIFICATION SCREEN
                Redirected to the same OTP verification screen for email verify
               ========================================================================= */}
            {currentStep === 3 && isVerifyingEmail && (
              <View style={styles.stepSection}>
                <View style={styles.titleBlock}>
                  <ThemedText style={styles.stepTitle}>
                    Verify Email
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.stepSubtitle}>
                    We sent a 4-digit verification code to {email.trim()}.
                  </ThemedText>
                  <Pressable
                    onPress={() => setIsVerifyingEmail(false)}
                    hitSlop={8}
                    style={styles.changeActionPressable}>
                    <Text style={[styles.changeActionText, { color: theme.brand }]}>
                      Edit email or go back
                    </Text>
                  </Pressable>
                </View>

                {/* 4-Digit Email OTP Boxes */}
                <Pressable
                  onPress={() => emailOtpInputRef.current?.focus()}
                  style={styles.otpBoxesRow}>
                  {[0, 1, 2, 3].map((index) => {
                    const digit = emailOtp[index] || '';
                    const isFocused = emailOtp.length === index;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          {
                            backgroundColor: theme.card,
                            borderColor: isFocused
                              ? theme.brand
                              : digit
                                ? theme.brand
                                : theme.border,
                          },
                        ]}>
                        <Text style={[styles.otpDigit, { color: theme.text }]}>
                          {digit}
                        </Text>
                      </View>
                    );
                  })}
                </Pressable>

                {/* Hidden Real TextInput for Email OTP */}
                <TextInput
                  ref={emailOtpInputRef}
                  value={emailOtp}
                  onChangeText={(val) => setEmailOtp(val.replace(/[^0-9]/g, '').slice(0, 4))}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={styles.hiddenOtpInput}
                  autoFocus
                />

                {/* Resend Email OTP Row */}
                <View style={styles.resendRow}>
                  {emailResendSeconds > 0 ? (
                    <ThemedText themeColor="textSecondary" style={styles.resendTimerText}>
                      Resend code in {emailResendSeconds}s
                    </ThemedText>
                  ) : (
                    <Pressable onPress={handleEmailResendOtp} hitSlop={8}>
                      <Text style={[styles.resendActiveText, { color: theme.brand }]}>
                        Resend Code
                      </Text>
                    </Pressable>
                  )}
                </View>

                <Button
                  title="Verify Email"
                  variant="primary"
                  size="lg"
                  rounded="full"
                  onPress={handleEmailOtpVerify}
                  style={styles.submitButton}
                />

                {/* Non-blocking: Still allow continuing to main screen without email verify */}
                <Pressable
                  onPress={() => {
                    setIsVerifyingEmail(false);
                  }}
                  hitSlop={8}
                  style={styles.secondaryOptionButton}>
                  <Text style={[styles.secondaryOptionText, { color: theme.textSecondary }]}>
                    Continue without verifying email
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  navIconButton: {
    width: 40,
    height: 40,
    borderRadius: Rounded.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillProgressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.three,
  },
  progressPill: {
    flex: 1,
    height: 6,
    borderRadius: Rounded.full,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 44,
    alignItems: 'flex-end',
  },
  skipButtonText: {
    fontFamily: Fonts?.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  pressedState: {
    opacity: 0.7,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  formWrapper: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  stepSection: {
    flex: 1,
    gap: Spacing.three,
  },
  titleBlock: {
    gap: 4,
    marginBottom: Spacing.one,
  },
  stepTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  stepSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '400',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  nameCol: {
    flex: 1,
    gap: 6,
  },
  changeActionPressable: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  changeActionText: {
    fontFamily: Fonts?.sans,
    fontSize: 13.5,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontFamily: Fonts?.sans,
    fontSize: 13.5,
    fontWeight: '600',
  },
  verifiedInlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Rounded.full,
  },
  verifiedInlineBadgeText: {
    fontFamily: Fonts?.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#10B981',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    height: 48,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: Fonts?.sans,
    fontSize: 14.5,
    height: '100%',
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryCodeText: {
    fontFamily: Fonts?.sans,
    fontSize: 14.5,
    fontWeight: '700',
  },
  codeDivider: {
    width: 1,
    height: 18,
  },
  verifyInlineButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Rounded.full,
  },
  verifyInlineButtonText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: Spacing.two,
  },
  otpBox: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontFamily: Fonts?.sans,
    fontSize: 24,
    fontWeight: '800',
  },
  hiddenOtpInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  resendRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.one,
  },
  resendTimerText: {
    fontFamily: Fonts?.sans,
    fontSize: 13.5,
  },
  resendActiveText: {
    fontFamily: Fonts?.sans,
    fontSize: 13.5,
    fontWeight: '700',
  },
  classChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  classChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Rounded.full,
    borderWidth: 1.5,
  },
  classChipText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
  },
  submitButton: {
    width: '100%',
    marginTop: Spacing.two,
  },
  secondaryOptionButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  secondaryOptionText: {
    fontFamily: Fonts?.sans,
    fontSize: 13.5,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
