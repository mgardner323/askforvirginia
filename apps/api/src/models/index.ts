// Export models
export { Property } from './Property';
export type { PropertyAttributes, PropertyCreationAttributes } from './Property';

export { User } from './User';
export type { UserAttributes, UserCreationAttributes } from './User';

export { BlogPost } from './BlogPost';
export type { BlogPostAttributes, BlogPostCreationAttributes } from './BlogPost';

export { MarketReport } from './MarketReport';
export type { MarketReportAttributes, MarketReportCreationAttributes } from './MarketReport';

export { MLSListing } from './MLSListing';
export type { MLSListingAttributes, MLSListingCreationAttributes } from './MLSListing';

export { EmailCampaign } from './EmailCampaign';
export type { EmailCampaignAttributes, EmailCampaignCreationAttributes } from './EmailCampaign';

export { EmailTemplate } from './EmailTemplate';
export type { EmailTemplateAttributes, EmailTemplateCreationAttributes } from './EmailTemplate';

export { FeaturedNews } from './FeaturedNews';
export type { FeaturedNewsAttributes, FeaturedNewsCreationAttributes } from './FeaturedNews';

export { Settings } from './Settings';
export type { SettingsAttributes, SettingsCreationAttributes } from './Settings';

export { Credentials } from './Credentials';
export type { CredentialsAttributes, CredentialsCreationAttributes } from './Credentials';

export { VideoSettings } from './VideoSettings';
export type { VideoSettingsAttributes, VideoSettingsCreationAttributes } from './VideoSettings';

export { BlogMedia } from './BlogMedia';
export type { BlogMediaAttributes, BlogMediaCreationAttributes } from './BlogMedia';

// Import models for associations
import { User } from './User';
import { Property } from './Property';
import { BlogPost } from './BlogPost';
import { MLSListing } from './MLSListing';
import { EmailCampaign } from './EmailCampaign';
import { EmailTemplate } from './EmailTemplate';
import { FeaturedNews } from './FeaturedNews';
import { BlogMedia } from './BlogMedia';

// Set up associations
// User -> Property relationship (agent)
User.hasMany(Property, {
  foreignKey: 'agent_id',
  as: 'properties'
});

Property.belongsTo(User, {
  foreignKey: 'agent_id',
  as: 'agent'
});

// User -> BlogPost relationship (author)
User.hasMany(BlogPost, {
  foreignKey: 'author_id',
  as: 'blog_posts'
});

BlogPost.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author'
});

// MLSListing -> Property relationship
MLSListing.belongsTo(Property, {
  foreignKey: 'property_id',
  as: 'property'
});

Property.hasOne(MLSListing, {
  foreignKey: 'property_id',
  as: 'mls_listing'
});

// User -> EmailCampaign relationship (creator)
User.hasMany(EmailCampaign, {
  foreignKey: 'created_by',
  as: 'email_campaigns'
});

EmailCampaign.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// User -> EmailTemplate relationship (creator)
User.hasMany(EmailTemplate, {
  foreignKey: 'created_by',
  as: 'email_templates'
});

EmailTemplate.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// User -> FeaturedNews relationship (creator)
User.hasMany(FeaturedNews, {
  foreignKey: 'created_by',
  as: 'featured_news'
});

FeaturedNews.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// User -> BlogMedia relationship (uploader)
User.hasMany(BlogMedia, {
  foreignKey: 'uploaded_by',
  as: 'uploaded_media'
});

BlogMedia.belongsTo(User, {
  foreignKey: 'uploaded_by',
  as: 'uploader'
});

export { sequelize } from '../config/database';