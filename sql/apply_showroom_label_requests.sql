-- Migration: AddShowroomLabelRequests
-- This script creates the showroom_label_requests table

CREATE TABLE IF NOT EXISTS showroom_label_requests (
    "Id" UUID NOT NULL PRIMARY KEY,
    outlet_id UUID NOT NULL,
    text_1 VARCHAR(100) NOT NULL,
    text_2 VARCHAR(100),
    label_count INTEGER NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedById" UUID,
    "UpdatedById" UUID,
    
    CONSTRAINT "FK_showroom_label_requests_outlets_outlet_id" 
        FOREIGN KEY (outlet_id) 
        REFERENCES outlets("Id") 
        ON DELETE CASCADE,
        
    CONSTRAINT "FK_showroom_label_requests_users_CreatedById" 
        FOREIGN KEY ("CreatedById") 
        REFERENCES users("Id") 
        ON DELETE SET NULL,
        
    CONSTRAINT "FK_showroom_label_requests_users_UpdatedById" 
        FOREIGN KEY ("UpdatedById") 
        REFERENCES users("Id") 
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_showroom_label_requests_CreatedById" 
    ON showroom_label_requests("CreatedById");

CREATE INDEX IF NOT EXISTS "IX_showroom_label_requests_outlet_id" 
    ON showroom_label_requests(outlet_id);

CREATE INDEX IF NOT EXISTS "IX_showroom_label_requests_UpdatedById" 
    ON showroom_label_requests("UpdatedById");

-- Insert migration history record
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260429040000_AddShowroomLabelRequests', '10.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;
