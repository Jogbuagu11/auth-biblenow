-- Add birthdate and gender columns to auth_signups table
-- Migration: 20241220000000_add_birthdate_gender_to_auth_signups

-- Add birthdate column (DATE type to store birth date)
ALTER TABLE auth_signups 
ADD COLUMN birthdate DATE;

-- Add gender column (TEXT type to store gender values like 'male', 'female', etc.)
ALTER TABLE auth_signups 
ADD COLUMN gender TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN auth_signups.birthdate IS 'User birth date stored in YYYY-MM-DD format';
COMMENT ON COLUMN auth_signups.gender IS 'User gender (e.g., male, female, other)';

-- Create an index on birthdate for potential age-based queries
CREATE INDEX idx_auth_signups_birthdate ON auth_signups(birthdate);

-- Create an index on gender for potential gender-based analytics
CREATE INDEX idx_auth_signups_gender ON auth_signups(gender); 