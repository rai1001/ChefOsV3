'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Upload } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { useSuppliers } from '@/features/catalog'
import {
  OCR_MIME_TYPES,
  useCreateOcrJob,
  usePurchaseOrders,
  useTriggerOcrExtract,
  useUploadOcrDocument,
} from '@/features/procurement'

const uploadFormSchema = z.object({
  supplier_id: z.string().optional(),
  purchase_order_id: z.string().optional(),
  file: z.custom<File>(
    (value) => typeof File !== 'undefined' && value instanceof File,
    'Selecciona un documento'
  ),
})

type UploadFormValues = {
  supplier_id: string
  purchase_order_id: string
  file_list: FileList
}

export function OcrUploadForm({ hotelId }: { hotelId: string }) {
  const router = useRouter()
  const suppliers = useSuppliers({ hotelId, activeOnly: true }, { pageSize: 200 })
  const purchaseOrders = usePurchaseOrders(
    { hotelId, status: ['sent', 'received_partial'] },
    { pageSize: 200 }
  )
  const uploadDocument = useUploadOcrDocument()
  const createJob = useCreateOcrJob()
  const triggerExtract = useTriggerOcrExtract()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit } = useForm<UploadFormValues>({
    defaultValues: {
      supplier_id: '',
      purchase_order_id: '',
    },
  })

  const isPending =
    uploadDocument.isPending || createJob.isPending || triggerExtract.isPending

  const submit = async (values: UploadFormValues) => {
    setError(null)
    const parsed = uploadFormSchema.safeParse({
      supplier_id: values.supplier_id || undefined,
      purchase_order_id: values.purchase_order_id || undefined,
      file: values.file_list?.[0],
    })

    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(' · '))
      return
    }

    const file = parsed.data.file
    if (!OCR_MIME_TYPES.includes(file.type as (typeof OCR_MIME_TYPES)[number])) {
      setError('Formato no soportado')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('El documento supera 8 MB')
      return
    }

    const uploaded = await uploadDocument.mutateAsync({ hotelId, file })
    const jobId = await createJob.mutateAsync({
      hotel_id: hotelId,
      storage_path: uploaded.storage_path,
      mime_type: uploaded.mime_type,
      sha256: uploaded.sha256,
      supplier_id: parsed.data.supplier_id ?? null,
      purchase_order_id: parsed.data.purchase_order_id ?? null,
    })

    await triggerExtract.mutateAsync({ hotel_id: hotelId, job_id: jobId })
    router.push(`/procurement/ocr/jobs/${jobId}`)
  }

  const mutationError =
    uploadDocument.error?.message ?? createJob.error?.message ?? triggerExtract.error?.message

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div
        className="grid gap-4 rounded border p-4 md:grid-cols-2"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div>
          <label htmlFor="ocr-supplier" className="kpi-label mb-1 block">
            Proveedor detectado
          </label>
          <select
            id="ocr-supplier"
            {...register('supplier_id')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <option value="">Sin fijar</option>
            {(suppliers.data?.rows ?? []).map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ocr-po" className="kpi-label mb-1 block">
            Pedido vinculado
          </label>
          <select
            id="ocr-po"
            {...register('purchase_order_id')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <option value="">Sin pedido</option>
            {(purchaseOrders.data?.rows ?? []).map((order) => (
              <option key={order.id} value={order.id}>
                PO {order.id.slice(0, 8)} · {order.status}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="ocr-file" className="kpi-label mb-1 block">
            Documento
          </label>
          <input
            id="ocr-file"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register('file_list', { required: true })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
          <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
            PDF, JPG o PNG hasta 8 MB
          </p>
        </div>
      </div>

      {(error || mutationError) && (
        <p className="text-sm text-danger">{error ?? mutationError}</p>
      )}

      <Button type="submit" disabled={isPending}>
        <Upload className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Procesando' : 'Subir y extraer'}
      </Button>
    </form>
  )
}
