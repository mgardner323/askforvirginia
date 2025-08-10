import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';

export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'client';
  profile: {
    first_name: string;
    last_name: string;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    license_number?: string;
    specializations: string[];
    areas_served: string[];
  };
  preferences: {
    property_types: string[];
    price_range: {
      min?: number;
      max?: number;
    };
    locations: string[];
  };
  saved_properties: number[];
  saved_searches: Array<{
    name: string;
    criteria: any;
    notifications: boolean;
  }>;
  last_login?: Date;
  is_verified: boolean;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public role!: 'admin' | 'agent' | 'client';
  public profile!: {
    first_name: string;
    last_name: string;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    license_number?: string;
    specializations: string[];
    areas_served: string[];
  };
  public preferences!: {
    property_types: string[];
    price_range: {
      min?: number;
      max?: number;
    };
    locations: string[];
  };
  public saved_properties!: number[];
  public saved_searches!: Array<{
    name: string;
    criteria: any;
    notifications: boolean;
  }>;
  public last_login?: Date;
  public is_verified!: boolean;
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Instance methods
  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  public async updateLastLogin(): Promise<void> {
    this.last_login = new Date();
    await this.save();
  }

  // Virtual getter for full name
  public get fullName(): string {
    return `${this.profile.first_name} ${this.profile.last_name}`;
  }

  // Override toJSON to exclude password
  public toJSON(): object {
    const values = { ...this.get() } as any;
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'agent', 'client'),
      defaultValue: 'client',
      allowNull: false,
    },
    profile: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        first_name: '',
        last_name: '',
        specializations: [],
        areas_served: [],
      },
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        property_types: [],
        price_range: {},
        locations: [],
      },
    },
    saved_properties: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    saved_searches: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);