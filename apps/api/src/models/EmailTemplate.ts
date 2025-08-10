import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface EmailTemplateAttributes {
  id: number;
  name: string;
  type: 'newsletter' | 'property_alert' | 'market_update' | 'welcome' | 'custom';
  subject_template: string;
  html_template: string;
  text_template: string;
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'array';
    required: boolean;
    description: string;
    default_value?: any;
  }>;
  preview_data?: Record<string, any>;
  is_active: boolean;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface EmailTemplateCreationAttributes extends Optional<EmailTemplateAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class EmailTemplate extends Model<EmailTemplateAttributes, EmailTemplateCreationAttributes> implements EmailTemplateAttributes {
  public id!: number;
  public name!: string;
  public type!: 'newsletter' | 'property_alert' | 'market_update' | 'welcome' | 'custom';
  public subject_template!: string;
  public html_template!: string;
  public text_template!: string;
  public variables!: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'array';
    required: boolean;
    description: string;
    default_value?: any;
  }>;
  public preview_data?: Record<string, any>;
  public is_active!: boolean;
  public created_by!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Render template with provided data
  public renderTemplate(data: Record<string, any>): { subject: string; html: string; text: string } {
    const renderString = (template: string, variables: Record<string, any>): string => {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? String(variables[key]) : match;
      });
    };

    // Merge with default values
    const mergedData = { ...this.getDefaultValues(), ...data };

    return {
      subject: renderString(this.subject_template, mergedData),
      html: renderString(this.html_template, mergedData),
      text: renderString(this.text_template, mergedData),
    };
  }

  // Get default values for all variables
  private getDefaultValues(): Record<string, any> {
    const defaults: Record<string, any> = {};
    this.variables.forEach(variable => {
      if (variable.default_value !== undefined) {
        defaults[variable.name] = variable.default_value;
      }
    });
    return defaults;
  }

  // Validate that all required variables are provided
  public validateVariables(data: Record<string, any>): { isValid: boolean; missingVariables: string[] } {
    const required = this.variables.filter(v => v.required).map(v => v.name);
    const missing = required.filter(name => data[name] === undefined);
    
    return {
      isValid: missing.length === 0,
      missingVariables: missing
    };
  }
}

EmailTemplate.init(
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
      type: DataTypes.ENUM('newsletter', 'property_alert', 'market_update', 'welcome', 'custom'),
      allowNull: false,
    },
    subject_template: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    html_template: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    text_template: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    variables: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    preview_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'EmailTemplate',
    tableName: 'email_templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['created_by'],
      },
    ],
  }
);