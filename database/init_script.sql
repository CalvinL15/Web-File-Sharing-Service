CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION "pg_cron";

CREATE TABLE IF NOT EXISTS files (
  file_id text PRIMARY KEY, -- sha256 string of the file
  -- file_uploader UUID,
  file_name text CHECK (file_name IS NOT NULL AND file_name != ''),
  file_size integer CHECK (file_size > 0 AND file_size <= 10485760), -- max file size: 10 MiB
  file_data bytea,  
  file_upload_time timestamp DEFAULT CURRENT_TIMESTAMP,
  last_download_time timestamp DEFAULT CURRENT_TIMESTAMP,
  file_type text,
  is_file_blocked boolean
  -- FOREIGN KEY (file_uploader) REFERENCES users(user_id) 
);

CREATE TABLE IF NOT EXISTS requests (
  request_id uuid PRIMARY KEY,
  file_id text,
  file_name text CHECK (file_name IS NOT NULL AND file_name != ''),
  request_reason text CHECK (request_reason IS NOT NULL and request_reason != ''),
  request_created_time timestamp DEFAULT CURRENT_TIMESTAMP,
  request_type integer CHECK (request_type = 0 OR request_type = 1), -- 0 = block, 1 = unblock
  request_status text DEFAULT 'Pending' CHECK (request_status = 'Pending' OR request_status = 'Declined' OR request_status = 'Accepted'),
  FOREIGN KEY (file_id) REFERENCES files(file_id)
);

CREATE OR REPLACE FUNCTION forbidden() RETURNS TRIGGER AS $$
  BEGIN
    IF TG_LEVEL = 'STATEMENT' THEN
      RAISE feature_not_supported;
    END IF;
    RETURN NULL;
  END;  
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION before_remove_files_func() RETURNS TRIGGER AS $$
  BEGIN
    DELETE FROM requests WHERE requests.file_id = OLD.file_id;
    RETURN OLD;
  END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_remove_files BEFORE DELETE ON files
  FOR EACH ROW
    WHEN (pg_trigger_depth() = 0)
      EXECUTE PROCEDURE before_remove_files_func(); 

CREATE TRIGGER before_truncate_files BEFORE TRUNCATE ON files
  WHEN (pg_trigger_depth() = 0)
    EXECUTE PROCEDURE forbidden(); 

-- CREATE TABLE IF NOT EXISTS users (
--   user_id UUID PRIMARY KEY,
--   username text CHECK (username IS NOT NULL AND length(username) >= 6),
--   passwrd text NOT NULL,
--   role number CHECK (role = 0 OR role = 1), -- 0 = normal user, 1 = admin
--   UNIQUE(username)
-- )

-- CREATE TABLE IF NOT EXISTS users_files_link (
--   username text, 
--   file_id text,
--   FOREIGN KEY (username) REFERENCES users(username),
--   FOREIGN KEY (file_id) REFERENCES files(file_id)
-- )
