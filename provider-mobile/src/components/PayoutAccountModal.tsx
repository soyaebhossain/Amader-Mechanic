import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { PayoutMethod } from '../types/earnings';
import { EARNINGS_KEYS } from '../hooks/useProviderEarnings';
import { validatePayoutForm } from '../utils/payoutValidation';

interface PayoutAccountModalProps {
  visible: boolean;
  onClose: () => void;
  initialData?: {
    preferred_method: PayoutMethod;
    bkash_wallet_number?: string | null;
    bank_name?: string | null;
    branch_name?: string | null;
    routing_number?: string | null;
    account_number?: string | null;
    account_holder_name?: string | null;
  };
}

export const PayoutAccountModal: React.FC<PayoutAccountModalProps> = ({
  visible,
  onClose,
  initialData,
}) => {
  const qc = useQueryClient();

  // Wizard Step: 'DETAILS' | 'OTP_VERIFY'
  const [step, setStep] = useState<'DETAILS' | 'OTP_VERIFY'>('DETAILS');

  // Form Fields
  const [method, setMethod] = useState<PayoutMethod>(initialData?.preferred_method || 'BKASH');
  const [bkashWallet, setBkashWallet] = useState(initialData?.bkash_wallet_number || '');
  const [bankName, setBankName] = useState(initialData?.bank_name || '');
  const [branchName, setBranchName] = useState(initialData?.branch_name || '');
  const [routingNumber, setRoutingNumber] = useState(initialData?.routing_number || '');
  const [accountNumber, setAccountNumber] = useState(initialData?.account_number || '');
  const [accountHolderName, setAccountHolderName] = useState(initialData?.account_holder_name || '');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep('DETAILS');
      setMethod(initialData?.preferred_method || 'BKASH');
      setBkashWallet(initialData?.bkash_wallet_number || '');
      setBankName(initialData?.bank_name || '');
      setBranchName(initialData?.branch_name || '');
      setRoutingNumber(initialData?.routing_number || '');
      setAccountNumber(initialData?.account_number || '');
      setAccountHolderName(initialData?.account_holder_name || '');
      setOtpCode('');
      setFormErrors({});
    }
  }, [visible, initialData]);

  // Resend countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'OTP_VERIFY' && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  const constructPayload = () => {
    return method === 'BKASH'
      ? {
          preferred_method: 'BKASH',
          bkash_wallet_number: bkashWallet.replace(/[\s-]/g, ''),
        }
      : {
          preferred_method: 'BANK_TRANSFER',
          bank_name: bankName.trim(),
          branch_name: branchName.trim(),
          routing_number: routingNumber.trim(),
          account_number: accountNumber.trim(),
          account_holder_name: accountHolderName.trim(),
        };
  };

  // Step 1: Initiate OTP
  const handleRequestOtp = async () => {
    const { isValid, errors } = validatePayoutForm(method, {
      bkashWallet,
      bankName,
      branchName,
      routingNumber,
      accountNumber,
      accountHolderName,
    });

    if (!isValid) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const payload = constructPayload();
      const { data } = await apiClient.post('/financial/provider/payout-account/request-change/', payload);
      setMaskedPhone(data.masked_phone || '');
      setTimerSeconds(60);
      setStep('OTP_VERIFY');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'ওটিপি পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।';
      Alert.alert('ব্যর্থ', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Confirm OTP
  const handleConfirmOtp = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('ভুল ওটিপি', 'সঠিক ৬-সংখ্যার ওটিপি কোডটি টাইপ করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/financial/provider/payout-account/confirm-change/', { otp: otpCode });
      Alert.alert('সফল', 'আপনার উত্তোলনের অ্যাকাউন্ট সফলভাবে হালনাগাদ করা হয়েছে।');
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.wallet() });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'ওটিপি যাচাইকরণ ব্যর্থ হয়েছে।';
      Alert.alert('ভুল ওটিপি', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {step === 'DETAILS' ? 'উত্তোলন অ্যাকাউন্ট পরিবর্তন' : 'নিরাপত্তা যাচাইকরণ (OTP)'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {step === 'DETAILS' ? (
              <>
                <View style={styles.methodToggle}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, method === 'BKASH' && styles.toggleBtnActive]}
                    onPress={() => {
                      setMethod('BKASH');
                      setFormErrors({});
                    }}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={16}
                      color={method === 'BKASH' ? '#0F766E' : '#64748B'}
                    />
                    <Text style={[styles.toggleText, method === 'BKASH' && styles.toggleTextActive]}>
                      বিকাশ (bKash)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleBtn, method === 'BANK_TRANSFER' && styles.toggleBtnActive]}
                    onPress={() => {
                      setMethod('BANK_TRANSFER');
                      setFormErrors({});
                    }}
                  >
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color={method === 'BANK_TRANSFER' ? '#0F766E' : '#64748B'}
                    />
                    <Text style={[styles.toggleText, method === 'BANK_TRANSFER' && styles.toggleTextActive]}>
                      ব্যাংক (BEFTN)
                    </Text>
                  </TouchableOpacity>
                </View>

                {method === 'BKASH' ? (
                  <View style={styles.formSection}>
                    <Text style={styles.fieldLabel}>বিকাশ ওয়ালেট নম্বর</Text>
                    <TextInput
                      style={[styles.input, formErrors.bkashWallet && styles.inputError]}
                      placeholder="017XXXXXXXX"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      value={bkashWallet}
                      onChangeText={(val) => {
                        setBkashWallet(val);
                        if (formErrors.bkashWallet) setFormErrors((prev) => ({ ...prev, bkashWallet: '' }));
                      }}
                    />
                    {formErrors.bkashWallet && <Text style={styles.errorText}>{formErrors.bkashWallet}</Text>}
                  </View>
                ) : (
                  <View style={styles.formSection}>
                    <Text style={styles.fieldLabel}>অ্যাকাউন্টধারীর পূর্ণ নাম</Text>
                    <TextInput
                      style={[styles.input, formErrors.accountHolderName && styles.inputError]}
                      placeholder="ব্যাংক চেকবই অনুযায়ী নাম"
                      placeholderTextColor="#94A3B8"
                      value={accountHolderName}
                      onChangeText={(val) => setAccountHolderName(val)}
                    />
                    {formErrors.accountHolderName && <Text style={styles.errorText}>{formErrors.accountHolderName}</Text>}

                    <Text style={styles.fieldLabel}>ব্যাংকের নাম</Text>
                    <TextInput
                      style={[styles.input, formErrors.bankName && styles.inputError]}
                      placeholder="যেমন: BRAC Bank PLC"
                      placeholderTextColor="#94A3B8"
                      value={bankName}
                      onChangeText={(val) => setBankName(val)}
                    />
                    {formErrors.bankName && <Text style={styles.errorText}>{formErrors.bankName}</Text>}

                    <Text style={styles.fieldLabel}>শাখার নাম</Text>
                    <TextInput
                      style={[styles.input, formErrors.branchName && styles.inputError]}
                      placeholder="যেমন: মিরপুর শাখা"
                      placeholderTextColor="#94A3B8"
                      value={branchName}
                      onChangeText={(val) => setBranchName(val)}
                    />
                    {formErrors.branchName && <Text style={styles.errorText}>{formErrors.branchName}</Text>}

                    <Text style={styles.fieldLabel}>অ্যাকাউন্ট নম্বর</Text>
                    <TextInput
                      style={[styles.input, formErrors.accountNumber && styles.inputError]}
                      placeholder="অ্যাকাউন্ট নম্বর"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      value={accountNumber}
                      onChangeText={(val) => setAccountNumber(val)}
                    />
                    {formErrors.accountNumber && <Text style={styles.errorText}>{formErrors.accountNumber}</Text>}

                    <Text style={styles.fieldLabel}>রাউটিং নম্বর (৯ ডিজিট)</Text>
                    <TextInput
                      style={[styles.input, formErrors.routingNumber && styles.inputError]}
                      placeholder="যেমন: 060261735"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={9}
                      value={routingNumber}
                      onChangeText={(val) => setRoutingNumber(val)}
                    />
                    {formErrors.routingNumber && <Text style={styles.errorText}>{formErrors.routingNumber}</Text>}
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleRequestOtp}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>পরবর্তী ধাপ ও ওটিপি পাঠান</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              /* Step 2: OTP Entry */
              <View style={styles.otpSection}>
                <View style={styles.shieldIcon}>
                  <Ionicons name="shield-checkmark" size={38} color="#0D9488" />
                </View>

                <Text style={styles.otpInstructions}>
                  আপনার রেজিস্টার্ড নম্বর <Text style={styles.boldText}>{maskedPhone}</Text>-এ একটি ৬-সংখ্যার ওটিপি কোড পাঠানো হয়েছে।
                </Text>

                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.submitButton, (isSubmitting || otpCode.length !== 6) && styles.submitButtonDisabled]}
                  onPress={handleConfirmOtp}
                  disabled={isSubmitting || otpCode.length !== 6}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>যাচাই ও সংরক্ষণ করুন</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                  {timerSeconds > 0 ? (
                    <Text style={styles.resendTimerText}>
                      পুনরায় ওটিপি পাঠানো যাবে {timerSeconds} সেকেন্ড পর
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleRequestOtp} disabled={isSubmitting}>
                      <Text style={styles.resendLinkText}>আবার ওটিপি কোড পাঠান</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={styles.backButton} onPress={() => setStep('DETAILS')}>
                  <Text style={styles.backButtonText}>← তথ্যে ফিরে যান</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginVertical: 16,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#0F766E',
  },
  formSection: {
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  otpSection: {
    alignItems: 'center',
    paddingTop: 16,
  },
  shieldIcon: {
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: 40,
    marginBottom: 12,
  },
  otpInstructions: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  otpInput: {
    width: '75%',
    letterSpacing: 16,
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#0D9488',
    paddingVertical: 8,
    marginVertical: 24,
    color: '#0F172A',
  },
  resendContainer: {
    marginTop: 18,
  },
  resendTimerText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  resendLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
});
