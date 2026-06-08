import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { NotificationType } from '../enums/notification-type.enum';
import { ReferenceType } from '../enums/reference-type.enum';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({
  timestamps: true,
})
export class Notification {
  @Prop({
    required: true,
    index: true,
  })
  userId: string;

  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  message: string;

  @Prop({
    required: true,
    enum: NotificationType,
    index: true,
  })
  type: NotificationType;

  @Prop({
    default: false,
    index: true,
  })
  isRead: boolean;

  @Prop()
  referenceId?: string;

  @Prop({
    enum: ReferenceType,
  })
  referenceType?: ReferenceType;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: {},
  })
  metadata: Record<string, unknown>;

  @Prop({ default: false, index: true })
  isDemoSeed?: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, referenceId: 1 });
