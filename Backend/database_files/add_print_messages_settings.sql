-- Add header_message and footer_message settings for all existing stores
-- Run this SQL to add the new print message fields

USE aside_posproject;

-- Add header_message for all stores that don't have it
INSERT INTO settings (store_id, setting_key, setting_value)
SELECT DISTINCT store_id, 'header_message', ''
FROM settings
WHERE store_id NOT IN (
    SELECT store_id FROM settings WHERE setting_key = 'header_message'
)
GROUP BY store_id;

-- Add footer_message for all stores that don't have it
INSERT INTO settings (store_id, setting_key, setting_value)
SELECT DISTINCT store_id, 'footer_message', 'Thank you for your business!'
FROM settings
WHERE store_id NOT IN (
    SELECT store_id FROM settings WHERE setting_key = 'footer_message'
)
GROUP BY store_id;

-- Show the results
SELECT 'Print message settings added!' as message;
SELECT store_id, setting_key, setting_value
FROM settings
WHERE setting_key IN ('header_message', 'footer_message')
ORDER BY store_id, setting_key;
