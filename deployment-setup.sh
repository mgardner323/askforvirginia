#!/bin/bash

# Virginia Hodges Real Estate - Deployment Setup Script
# This script helps set up SSH keys and production configuration for deployment

echo "🚀 Virginia Hodges Real Estate - Deployment Setup"
echo "=================================================="
echo ""

# Check if running as admin
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  Don't run this script as root. Run as the web user." 
   exit 1
fi

# Function to generate SSH key if it doesn't exist
setup_ssh_keys() {
    echo "🔐 Setting up SSH keys for deployment..."
    
    if [ ! -f ~/.ssh/id_rsa ]; then
        echo "Generating SSH key pair..."
        ssh-keygen -t rsa -b 4096 -C "deployment@dev.askforvirginia.com" -f ~/.ssh/id_rsa -N ""
        echo "✅ SSH key generated at ~/.ssh/id_rsa"
    else
        echo "ℹ️  SSH key already exists at ~/.ssh/id_rsa"
    fi
    
    echo ""
    echo "📋 PUBLIC KEY (copy this to production server authorized_keys):"
    echo "================================================================"
    cat ~/.ssh/id_rsa.pub
    echo "================================================================"
    echo ""
    
    echo "To add this key to production server, run on PRODUCTION:"
    echo "mkdir -p ~/.ssh"
    echo "echo '$(cat ~/.ssh/id_rsa.pub)' >> ~/.ssh/authorized_keys"
    echo "chmod 700 ~/.ssh"
    echo "chmod 600 ~/.ssh/authorized_keys"
    echo ""
}

# Function to test SSH connection
test_ssh_connection() {
    echo "🔗 Testing SSH connection to production..."
    
    read -p "Enter production hostname (e.g., askforvirginia.com): " PROD_HOST
    read -p "Enter production username (e.g., virginia): " PROD_USER
    
    echo "Testing connection to $PROD_USER@$PROD_HOST..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "$PROD_USER@$PROD_HOST" 'echo "Connection successful"' 2>/dev/null; then
        echo "✅ SSH connection successful!"
    else
        echo "❌ SSH connection failed. Please check:"
        echo "   1. SSH key is added to production server"
        echo "   2. Production server is accessible"
        echo "   3. Username and hostname are correct"
        echo "   4. SSH service is running on production"
        return 1
    fi
}

# Function to create production database
setup_production_database() {
    echo "🗄️  Setting up production database..."
    
    read -p "Enter production database name [virginia_prod]: " PROD_DB_NAME
    PROD_DB_NAME=${PROD_DB_NAME:-virginia_prod}
    
    read -p "Enter production database username [virginia_prod]: " PROD_DB_USER
    PROD_DB_USER=${PROD_DB_USER:-virginia_prod}
    
    read -s -p "Enter production database password: " PROD_DB_PASS
    echo ""
    
    read -p "Enter production MySQL root password: " MYSQL_ROOT_PASS
    
    echo "Creating database and user on production server..."
    
    SSH_CMD="mysql -u root -p$MYSQL_ROOT_PASS -e \"
        CREATE DATABASE IF NOT EXISTS $PROD_DB_NAME;
        CREATE USER IF NOT EXISTS '$PROD_DB_USER'@'localhost' IDENTIFIED BY '$PROD_DB_PASS';
        GRANT ALL PRIVILEGES ON $PROD_DB_NAME.* TO '$PROD_DB_USER'@'localhost';
        FLUSH PRIVILEGES;
    \""
    
    if ssh "$PROD_USER@$PROD_HOST" "$SSH_CMD" 2>/dev/null; then
        echo "✅ Production database setup complete!"
        
        # Update .env file
        echo "📝 Updating .env configuration..."
        sed -i "s/PROD_DB_NAME=.*/PROD_DB_NAME=$PROD_DB_NAME/" apps/api/.env
        sed -i "s/PROD_DB_USER=.*/PROD_DB_USER=$PROD_DB_USER/" apps/api/.env
        sed -i "s/PROD_DB_PASS=.*/PROD_DB_PASS=$PROD_DB_PASS/" apps/api/.env
        sed -i "s/PROD_HOST=.*/PROD_HOST=$PROD_HOST/" apps/api/.env
        sed -i "s/PROD_USER=.*/PROD_USER=$PROD_USER/" apps/api/.env
        
        echo "✅ Environment configuration updated!"
    else
        echo "❌ Failed to create production database"
        return 1
    fi
}

# Function to sync database schema
sync_database_schema() {
    echo "📊 Syncing database schema to production..."
    
    # Export development schema
    echo "Exporting development schema..."
    mysqldump -u ${DB_USER:-virginia} -p${DB_PASSWORD:-Pinkhamster99!1} \
              -h ${DB_HOST:-localhost} ${DB_NAME:-virginia} \
              --no-data --routines --triggers > /tmp/schema.sql
    
    # Copy and import to production
    echo "Importing schema to production..."
    scp /tmp/schema.sql "$PROD_USER@$PROD_HOST:/tmp/schema.sql"
    
    ssh "$PROD_USER@$PROD_HOST" "mysql -u $PROD_DB_USER -p$PROD_DB_PASS $PROD_DB_NAME < /tmp/schema.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ Database schema synchronized!"
    else
        echo "❌ Schema sync failed"
        return 1
    fi
}

# Function to install dependencies on production
setup_production_dependencies() {
    echo "📦 Setting up production dependencies..."
    
    read -p "Enter production application path [/var/www/vhosts/askforvirginia.com/askforvirginia.com]: " PROD_PATH
    PROD_PATH=${PROD_PATH:-/var/www/vhosts/askforvirginia.com/askforvirginia.com}
    
    # Update .env with production path
    sed -i "s|PROD_PATH=.*|PROD_PATH=$PROD_PATH|" apps/api/.env
    
    echo "Installing Node.js dependencies on production..."
    ssh "$PROD_USER@$PROD_HOST" "cd $PROD_PATH && npm install --production"
    
    echo "✅ Production dependencies installed!"
}

# Main setup menu
main_menu() {
    echo "Select setup option:"
    echo "1. Generate SSH keys"
    echo "2. Test SSH connection"
    echo "3. Setup production database"
    echo "4. Sync database schema"
    echo "5. Setup production dependencies"
    echo "6. Complete setup (all steps)"
    echo "7. Exit"
    echo ""
    
    read -p "Enter option (1-7): " choice
    
    case $choice in
        1)
            setup_ssh_keys
            ;;
        2)
            test_ssh_connection
            ;;
        3)
            setup_production_database
            ;;
        4)
            sync_database_schema
            ;;
        5)
            setup_production_dependencies
            ;;
        6)
            echo "🚀 Running complete setup..."
            setup_ssh_keys
            echo ""
            if test_ssh_connection; then
                echo ""
                setup_production_database
                echo ""
                sync_database_schema
                echo ""
                setup_production_dependencies
                echo ""
                echo "🎉 Complete setup finished!"
                echo ""
                echo "Next steps:"
                echo "1. Log in to admin dashboard"
                echo "2. Go to Deployment section"
                echo "3. Test connection"
                echo "4. Run a dry-run deployment"
                echo "5. Deploy to production!"
            fi
            ;;
        7)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid option"
            main_menu
            ;;
    esac
    
    echo ""
    echo "Press Enter to continue..."
    read
    main_menu
}

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command -v ssh &> /dev/null; then
    echo "❌ SSH not found. Please install OpenSSH client."
    exit 1
fi

if ! command -v rsync &> /dev/null; then
    echo "❌ rsync not found. Please install rsync."
    exit 1
fi

if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL client not found. Please install MySQL client."
    exit 1
fi

echo "✅ All dependencies found!"
echo ""

# Load environment variables
if [ -f "apps/api/.env" ]; then
    source apps/api/.env
    echo "✅ Environment configuration loaded"
else
    echo "⚠️  .env file not found. Some features may not work properly."
fi

echo ""

# Start main menu
main_menu