#!/bin/bash

# Split Payment Migration Script
# This adds the columns needed to track split payments properly

echo "============================================"
echo "  Split Payment Database Migration"
echo "============================================"
echo ""

# Database details
DB_USER="root"
DB_NAME="aside_posproject"

echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Check if migration file exists
if [ ! -f "fix_payment_schema.sql" ]; then
    echo "❌ Error: fix_payment_schema.sql not found!"
    echo "   Make sure you're in the Backend directory"
    exit 1
fi

echo "📝 Running migration..."
echo ""

# Run the migration (assumes no password for root)
mysql -u $DB_USER $DB_NAME < fix_payment_schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Verifying changes..."
    echo ""

    # Verify the changes
    mysql -u $DB_USER $DB_NAME -e "DESCRIBE sales;" | grep -E "cash_amount|online_amount|online_method|store_id|payment_method"

    echo ""
    echo "============================================"
    echo "  ✅ Split Payment Support Enabled!"
    echo "============================================"
    echo ""
    echo "Next steps:"
    echo "1. Restart your backend server"
    echo "2. Test split payment in POS"
    echo "3. Check sales list - you'll see split payments!"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "Common issues:"
    echo "- MySQL password required? Try: mysql -u root -p $DB_NAME < fix_payment_schema.sql"
    echo "- Wrong database name? Check config.js"
    echo "- Already migrated? Check if columns exist: DESCRIBE sales;"
    echo ""
fi
