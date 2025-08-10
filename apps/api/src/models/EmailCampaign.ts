import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface EmailCampaignAttributes {
  id: number;
  name: string;
  type: 'newsletter' | 'property_alert' | 'market_update' | 'custom';
  subject: string;
  template_id?: number;
  content: {
    html: string;
    text: string;
    variables: Record<string, any>;
  };
  recipients: {
    segment?: string; // 'all_clients', 'buyers', 'sellers', 'custom'
    user_ids?: number[];
    email_list?: string[];
  };
  scheduling: {
    send_type: 'immediate' | 'scheduled' | 'recurring';
    send_at?: Date;
    timezone?: string;
    recurring_pattern?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      end_date?: Date;
    };
  };
  statistics: {
    total_sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  created_by: number;
  sent_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface EmailCampaignCreationAttributes extends Optional<EmailCampaignAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class EmailCampaign extends Model<EmailCampaignAttributes, EmailCampaignCreationAttributes> implements EmailCampaignAttributes {
  public id!: number;
  public name!: string;
  public type!: 'newsletter' | 'property_alert' | 'market_update' | 'custom';
  public subject!: string;
  public template_id?: number;
  public content!: {
    html: string;
    text: string;
    variables: Record<string, any>;
  };
  public recipients!: {
    segment?: string;
    user_ids?: number[];
    email_list?: string[];
  };
  public scheduling!: {
    send_type: 'immediate' | 'scheduled' | 'recurring';
    send_at?: Date;
    timezone?: string;
    recurring_pattern?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      end_date?: Date;
    };
  };
  public statistics!: {
    total_sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  public status!: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  public created_by!: number;
  public sent_at?: Date;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Calculate open rate
  public get openRate(): number {
    if (this.statistics.delivered === 0) return 0;
    return (this.statistics.opened / this.statistics.delivered) * 100;
  }

  // Calculate click rate
  public get clickRate(): number {
    if (this.statistics.delivered === 0) return 0;
    return (this.statistics.clicked / this.statistics.delivered) * 100;
  }

  // Check if campaign is ready to send
  public isReadyToSend(): boolean {
    return this.status === 'draft' && 
           !!this.content?.html && this.content.html.length > 0 && 
           !!this.subject && this.subject.length > 0 &&
           !!(this.recipients?.user_ids?.length || 
            this.recipients?.email_list?.length ||
            this.recipients?.segment);
  }
}

EmailCampaign.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('newsletter', 'property_alert', 'market_update', 'custom'),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    template_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidContent(value: any) {
          if (!value.html || !value.text) {
            throw new Error('Content must include both HTML and text versions');
          }
        },
      },
    },
    recipients: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        hasRecipients(value: any) {
          if (!value.segment && !value.user_ids?.length && !value.email_list?.length) {
            throw new Error('Recipients must include segment, user_ids, or email_list');
          }
        },
      },
    },
    scheduling: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    statistics: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        total_sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'sent', 'failed'),
      defaultValue: 'draft',
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'EmailCampaign',
    tableName: 'email_campaigns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['created_by'],
      },
      {
        fields: ['sent_at'],
      },
    ],
  }
);