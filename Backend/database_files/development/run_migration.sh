#!/bin/bash

# Database connection details
DB_HOST="localhost"
DB_USER="root"
DB_PASS=""
DB_NAME="aside_posproject"

# Migration file
MIGRATION_FILE="update_user_filtering.sql"

echo "=========================================="
echo "Running Role System Migration"
echo "=========================================="
echo ""
echo "Database: $DB_NAME"
echo "Migration: $MIGRATION_FILE"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "ERROR: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Run the migration
echo "Executing migration..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "Migration completed successfully!"
    echo "=========================================="
    echo ""
    echo "Verifying migration..."
    echo ""

    # Verify the created_by column exists
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "DESCRIBE users;" | grep "created_by"

    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ created_by column verified"
        echo ""
        echo "Migration successful! Please restart your backend server."
    else
        echo ""
        echo "⚠ Warning: created_by column not found. Please check manually."
    fi
else
    echo ""
    echo "=========================================="
    echo "Migration failed!"
    echo "=========================================="
    echo "Please check the error messages above."
    exit 1
fi
