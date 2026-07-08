export type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
};

export type ApiErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown;
  };
  requestId: string;
};

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export type UserStatus = 'active' | 'pending_registration';

export type UserProfile = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  defaultCurrency: string;
};

export type PublicUserProfile = {
  uuid: string;
  email: string | null;
  phoneNumber: string | null;
  paymentTag: string | null;
  status: UserStatus;
  userTypes: string[];
  profile: UserProfile;
};

export type AuthResponse = {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  user: PublicUserProfile;
};

export type VerificationResponse = {
  message: string;
  isVerified: true;
  onboardingSessionToken: string;
  currentStep: OnboardingStep;
};

export type MessageResponse = {
  message: string;
};

export type OnboardingStep = 'profile' | 'claim_tag' | 'pin';

export type OnboardingStepResponse = {
  currentStep: OnboardingStep;
  user: PublicUserProfile;
};

export type Wallet = {
  walletUuid: string;
  currency: string;
  availableBalance: number;
  ledgerBalance: number;
  status: 'active' | string;
};

export type TransactionDirection = 'credit' | 'debit' | string;

export type WalletTransaction = {
  uuid: string;
  reference: string;
  direction: TransactionDirection;
  entryType: string;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type TransactionRecord = {
  uuid: string;
  reference: string;
  type?: string;
  entryType?: string;
  direction: TransactionDirection;
  amount: number;
  currency: string;
  status: string;
  description?: string | null;
  balanceBefore?: number;
  balanceAfter?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type TransactionListFilters = {
  type?: string;
  status?: string;
  direction?: TransactionDirection;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
  minimumAmount?: number;
  maximumAmount?: number;
  cursor?: string;
  limit?: number;
};

export type TransactionListResponse = {
  items: TransactionRecord[];
  nextCursor: string | null;
};

export type Bank = {
  name: string;
  code: string;
  country: string;
  currency: string;
};

export type ResolvedBankAccount = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
};

export type ResolvedRecipient = {
  uuid: string;
  paymentTag: string;
  firstName: string;
  lastName: string;
};

export type TransferStatus = 'pending' | 'processing' | 'successful' | 'failed' | string;
export type TransferFundingSource = 'wallet' | 'card' | 'direct_debit';

export type TashTransfer = {
  reference: string;
  status: TransferStatus;
  amount: number;
  currency: string;
  senderWalletUuid: string;
  recipientWalletUuid: string;
  recipient: ResolvedRecipient;
};

export type BankTransfer = {
  reference: string;
  status: TransferStatus;
  amount: number;
  currency: string;
  walletUuid: string;
  bankCode: string;
  accountNumberLastFour: string;
  accountName: string;
};

export type TransferDetails = {
  reference: string;
  type: 'bank_transfer' | 'tash_transfer' | string;
  status: TransferStatus;
  amount: number;
  currency: string;
  description: string | null;
  createdAt: string;
};

export type Card = {
  uuid: string;
  brand: string;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string | null;
  bankName: string | null;
  country: string | null;
  currency: string;
  isDefault: boolean;
  status: 'active' | 'disabled' | string;
  lastChargedAt: string | null;
  createdAt: string;
};

export type CardRegistrationSessionStatus = 'created' | 'pending' | 'failed' | 'completed' | string;

export type CardRegistrationSession = {
  reference: string;
  status: CardRegistrationSessionStatus;
  authorizationUrl: string | null;
  expiresAt: string;
  metadata: Record<string, unknown>;
  failureReason: string | null;
};

export type DeletedResponse = {
  deleted: true;
};

export type CardFunding = {
  reference: string;
  status: TransferStatus;
  amount: number;
  currency: string;
  walletUuid: string;
  cardUuid: string;
};

export type DirectDebitMandateStatus =
  'pending' | 'requires_authorization' | 'active' | 'failed' | 'expired' | 'revoked';

export type DirectDebitMandate = {
  uuid: string;
  provider: string;
  bankName: string;
  accountName: string;
  accountNumberLastFour: string;
  bankCode: string;
  currency: string;
  maximumAmount: number;
  status: DirectDebitMandateStatus;
  metadata?: Record<string, unknown> | null;
  authorizedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  failureReason: string | null;
  createdAt: string;
};

export type DirectDebitFunding = {
  reference: string;
  status: TransferStatus;
  amount: number;
  currency: string;
  walletUuid: string;
  mandateUuid: string;
};

export type VirtualAccountType = 'static' | 'temporary' | string;
export type VirtualAccountPurpose = 'wallet_funding' | string;

export type VirtualAccount = {
  uuid: string;
  userId?: number;
  walletId?: number;
  walletUuid?: string;
  provider?: string;
  providerCustomerId?: string | null;
  providerAccountId?: string | null;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  currency: string;
  type: VirtualAccountType;
  purpose: VirtualAccountPurpose;
  status: string;
  expiresAt: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
};

export type PaymentSettings = {
  defaultCardId: number | null;
  defaultDirectDebitMandateId: number | null;
  defaultWalletId: number | null;
  requireTransactionPin: boolean;
  allowCardPayments: boolean;
  allowDirectDebitPayments: boolean;
  allowWalletPayments: boolean;
  allowMerchantPayments: boolean;
  dailyTransferLimit: number;
  dailyPaymentLimit: number;
  singleTransactionLimit: number;
  notificationPreferences: Record<string, unknown>;
};

export type RequestOptions = {
  accessToken?: string;
  idempotencyKey?: string;
  signal?: AbortSignal;
};
