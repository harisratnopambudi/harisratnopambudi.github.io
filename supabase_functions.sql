-- FUNCTION: generate_license_key
-- DESCRIPTION: Generates a 28-character alpha-numeric-symbol license key.
-- RETURN: Text (The generated key)
-- USAGE: select generate_license_key('buyer@email.com', 'ProductName');

CREATE OR REPLACE FUNCTION generate_license_key(buyer_email TEXT, product_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  -- Character pool: Uppercase + Digits + Symbols (mimicking legacy logic)
  -- Combined length approx: 26 + 10 + 12 = 48 chars
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*-_+=!?';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Generate a 28-character random string
  -- matching the length of the old client-side key
  FOR i IN 1..28 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  
  RETURN result;
END;
$$;
