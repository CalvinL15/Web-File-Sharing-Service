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
  file_id text,
  request_reason text CHECK (request_reason IS NOT NULL and request_reason != ''),
  request_type integer CHECK (request_type = 0 OR request_type = 1), -- 0 = block, 1 = unblock
  request_status text DEFAULT 'Pending' CHECK (request_status = 'Pending' OR request_status = 'Declined' OR request_status = 'Accepted'),
  FOREIGN KEY (file_id) REFERENCES files(file_id) 
);

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


