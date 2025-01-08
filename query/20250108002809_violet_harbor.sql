/*
  # Add WhatsApp field and enhance startup ideas

  1. Changes
    - Add whatsapp_number to users table
    - Add terms_and_conditions to startup_ideas table
  
  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE users ADD COLUMN whatsapp_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'startup_ideas' AND column_name = 'terms_and_conditions'
  ) THEN
    ALTER TABLE startup_ideas ADD COLUMN terms_and_conditions text;
  END IF;
END $$;