import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  tenant?:         mongoose.Types.ObjectId;
  invoiceNumber:   string;
  patient:         mongoose.Types.ObjectId;
  doctor?:         mongoose.Types.ObjectId;
  appointment?:    mongoose.Types.ObjectId;
  items: {
    description: string;
    category:    'consultation' | 'medicine' | 'lab' | 'bed' | 'procedure' | 'other';
    quantity:    number;
    unitPrice:   number;
    total:       number;
  }[];
  subtotal:        number;
  discount:        number;
  discountType:    'fixed' | 'percent';
  tax:             number;
  taxPercent:      number;
  totalAmount:     number;
  paidAmount:      number;
  dueAmount:       number;
  status:          'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  dueDate:         string;
  insuranceCompany?: string;
  insuranceClaim?:   string;
  insuranceAmount?:  number;
  notes:           string;
  payments: {
    amount:        number;
    method:        string;
    date:          string;
    reference:     string;
  }[];
}

const InvoiceSchema = new Schema<IInvoice>({
  tenant:          { type: Schema.Types.ObjectId, ref: 'Tenant'      },
  invoiceNumber:   { type: String, required: true, unique: true       },
  patient:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:          { type: Schema.Types.ObjectId, ref: 'User'         },
  appointment:     { type: Schema.Types.ObjectId, ref: 'Appointment'  },
  items: [{
    description: { type: String, required: true },
    category:    { type: String, enum: ['consultation','medicine','lab','bed','procedure','other'], default: 'consultation' },
    quantity:    { type: Number, default: 1    },
    unitPrice:   { type: Number, required: true },
    total:       { type: Number, required: true },
  }],
  subtotal:        { type: Number, default: 0    },
  discount:        { type: Number, default: 0    },
  discountType:    { type: String, enum: ['fixed','percent'], default: 'fixed' },
  tax:             { type: Number, default: 0    },
  taxPercent:      { type: Number, default: 0    },
  totalAmount:     { type: Number, default: 0    },
  paidAmount:      { type: Number, default: 0    },
  dueAmount:       { type: Number, default: 0    },
  status:          { type: String, enum: ['draft','sent','partial','paid','overdue','cancelled'], default: 'draft' },
  dueDate:         { type: String, default: ''   },
  insuranceCompany:{ type: String, default: ''   },
  insuranceClaim:  { type: String, default: ''   },
  insuranceAmount: { type: Number, default: 0    },
  notes:           { type: String, default: ''   },
  payments: [{
    amount:    { type: Number, required: true },
    method:    { type: String, required: true },
    date:      { type: String, required: true },
    reference: { type: String, default: ''   },
  }],
}, { timestamps: true });

export default mongoose.models.Invoice ||
  mongoose.model<IInvoice>('Invoice', InvoiceSchema);