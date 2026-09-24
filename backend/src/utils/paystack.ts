const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  return key;
}

interface PaystackRequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
}

async function paystackRequest<T>(
  path: string,
  options: PaystackRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
    },
    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });

  const data = (await response.json()) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Paystack request failed with status ${response.status}`,
    );
  }

  return data;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    transaction_date: string;
    gateway_response: string;
    channel: string;
    ip_address?: string;
    metadata?: unknown;
    fees?: number;
    authorization?: unknown;
    customer?: {
      id?: number;
      email?: string;
      customer_code?: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    };
  };
}

export async function initializePaystackTransaction(payload: {
  email: string;
  amount: number;
  reference: string;
  currency?: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitializeResponse> {
  return paystackRequest<PaystackInitializeResponse>(
    "/transaction/initialize",
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerifyResponse> {
  return paystackRequest<PaystackVerifyResponse>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}