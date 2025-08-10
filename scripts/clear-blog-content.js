/**
 * Blog Content Deletion Script for Virginia Real Estate
 * Clears all existing blog posts from the database
 * MUST be run after database backup is created
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'api', '.env') });

// Database configuration
const sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'virginia',
    username: process.env.DB_USER || 'virginia',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    dialect: 'mariadb',
    logging: false, // Reduce noise
    define: {
        timestamps: true,
        underscored: true
    }
});

// Import BlogPost model
const BlogPost = sequelize.define('BlogPost', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    content: {
        type: Sequelize.TEXT('long'),
        allowNull: false
    },
    excerpt: {
        type: Sequelize.TEXT
    },
    featured_image: {
        type: Sequelize.STRING
    },
    category: {
        type: Sequelize.STRING,
        defaultValue: 'general'
    },
    tags: {
        type: Sequelize.JSON
    },
    status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    published_at: {
        type: Sequelize.DATE
    },
    author_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    views: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    meta_title: {
        type: Sequelize.STRING
    },
    meta_description: {
        type: Sequelize.TEXT
    }
}, {
    tableName: 'blog_posts',
    timestamps: true,
    underscored: true
});

async function clearBlogContent() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connection established');
        
        console.log('\n📊 Analyzing current blog content...');
        
        // Get current blog post count
        const currentCount = await BlogPost.count();
        console.log(`📝 Current blog posts: ${currentCount}`);
        
        if (currentCount === 0) {
            console.log('💡 No blog posts found. Database already clean.');
            return;
        }
        
        // Get some sample data before deletion (for verification)
        const samplePosts = await BlogPost.findAll({
            attributes: ['id', 'title', 'slug', 'status', 'created_at'],
            limit: 5,
            order: [['created_at', 'DESC']]
        });
        
        console.log('\n📋 Sample posts to be deleted:');
        samplePosts.forEach(post => {
            console.log(`   ID: ${post.id} | ${post.title} | ${post.status} | ${post.created_at}`);
        });
        
        console.log('\n⚠️  WARNING: About to delete ALL blog posts!');
        console.log('   This action cannot be undone without database restore.');
        console.log('   Ensure backup was created successfully before proceeding.\n');
        
        // Prompt for confirmation in production (skip in automated environments)
        if (process.env.NODE_ENV !== 'automated') {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            const answer = await new Promise((resolve) => {
                rl.question('Type "DELETE ALL BLOGS" to confirm deletion: ', (answer) => {
                    rl.close();
                    resolve(answer);
                });
            });
            
            if (answer !== 'DELETE ALL BLOGS') {
                console.log('❌ Deletion cancelled by user');
                return;
            }
        }
        
        console.log('🗑️  Starting blog post deletion...');
        
        // Delete all blog posts
        const deletedCount = await BlogPost.destroy({
            where: {},
            truncate: true // This is faster for deleting all records
        });
        
        console.log(`✅ Successfully deleted ${deletedCount || currentCount} blog posts`);
        
        // Verify deletion
        const remainingCount = await BlogPost.count();
        if (remainingCount === 0) {
            console.log('✅ Verification: Blog posts table is now empty');
        } else {
            console.log(`⚠️  Warning: ${remainingCount} blog posts still remain`);
        }
        
        console.log('\n🎯 Blog Content Deletion Summary:');
        console.log(`   Posts deleted: ${currentCount}`);
        console.log(`   Remaining posts: ${remainingCount}`);
        console.log(`   Database: ${process.env.DB_NAME}`);
        console.log(`   Timestamp: ${new Date().toISOString()}`);
        
        console.log('\n✅ Blog content deletion completed successfully!');
        console.log('📝 Ready for Phase 6: Advanced Admin Settings');
        
    } catch (error) {
        console.error('❌ Blog content deletion failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the deletion if this script is executed directly
if (require.main === module) {
    clearBlogContent();
}

module.exports = { clearBlogContent };