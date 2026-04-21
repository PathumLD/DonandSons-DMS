-- Fix the super admin unique index
-- Run this if you encounter the index creation error

DROP INDEX IF EXISTS "IX_users_IsSuperAdmin";

CREATE UNIQUE INDEX "IX_users_IsSuperAdmin" 
ON users ("IsSuperAdmin") 
WHERE "IsSuperAdmin" = true;
