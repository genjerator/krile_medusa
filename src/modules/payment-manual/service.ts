import { AbstractPaymentProvider, PaymentSessionStatus } from "@medusajs/framework/utils"
import {
  AuthorizePaymentInput, AuthorizePaymentOutput,
  CancelPaymentInput, CancelPaymentOutput,
  CapturePaymentInput, CapturePaymentOutput,
  DeletePaymentInput, DeletePaymentOutput,
  GetPaymentStatusInput, GetPaymentStatusOutput,
  InitiatePaymentInput, InitiatePaymentOutput,
  RefundPaymentInput, RefundPaymentOutput,
  RetrievePaymentInput, RetrievePaymentOutput,
  UpdatePaymentInput, UpdatePaymentOutput,
} from "@medusajs/framework/types"

class ManualPaymentProviderService extends AbstractPaymentProvider {
  static identifier = "manual"

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    return { id: `manual-${Date.now()}`, data: {} }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    return { data: input.data ?? {}, status: PaymentSessionStatus.AUTHORIZED }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: input.data ?? {} }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return { data: input.data ?? {} }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    return { status: PaymentSessionStatus.AUTHORIZED }
  }

  async getWebhookActionAndData(data: any): Promise<any> {
    return { action: "not_supported" as const }
  }
}

export default ManualPaymentProviderService
