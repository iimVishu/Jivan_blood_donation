import mongoose, { Schema, model, models } from 'mongoose';

const AuditLogSchema = new Schema({
  action: { 
    type: String, 
    required: true,
    enum: ['CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED', 'EXPORTED', 'UPDATE_CAMP_STATUS']
  },
  entityType: { 
    type: String, 
    required: true,
    enum: ['Appointment', 'Request', 'BloodBank', 'User', 'Emergency', 'Camp']
  },
  entityId: { 
    type: Schema.Types.ObjectId, 
    required: true 
  },
  performedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  performedByRole: {
    type: String
  },
  previousState: { type: Schema.Types.Mixed },
  newState: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, immutable: true } // Un-editable by schema definition
}, {
  timestamps: false // We use an immutable timestamp
});

// Force creating the model again in dev
if (process.env.NODE_ENV === 'development') {
  delete models.AuditLog;
}

const AuditLog = (models.AuditLog || model('AuditLog', AuditLogSchema)) as mongoose.Model<any>;

export default AuditLog;
