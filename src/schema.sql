-- Table to store user information
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL DEFAULT '',
    "name" TEXT DEFAULT NULL,
    "email" TEXT DEFAULT NULL,
    "emailVerified" DATETIME DEFAULT NULL,
    "image" TEXT DEFAULT NULL,
    PRIMARY KEY ("id")
);
-- Table to store account information
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT NULL,
    "type" TEXT NOT NULL DEFAULT NULL,
    "provider" TEXT NOT NULL DEFAULT NULL,
    "providerAccountId" TEXT NOT NULL DEFAULT NULL,
    "refresh_token" TEXT DEFAULT NULL,
    "access_token" TEXT DEFAULT NULL,
    "expires_at" INTEGER DEFAULT NULL,
    "token_type" TEXT DEFAULT NULL,
    "scope" TEXT DEFAULT NULL,
    "id_token" TEXT DEFAULT NULL,
    "session_state" TEXT DEFAULT NULL,
    "oauth_token_secret" TEXT DEFAULT NULL,
    "oauth_token" TEXT DEFAULT NULL,
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
    PRIMARY KEY ("id")
);
-- Table to store session information
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT NULL,
    "expires" DATETIME NOT NULL DEFAULT NULL,
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
    PRIMARY KEY ("sessionToken")
);
-- Table to store verification tokens
CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL DEFAULT NULL,
    "expires" DATETIME NOT NULL DEFAULT NULL,
    PRIMARY KEY ("token")
);
-- Table to store organization information
CREATE TABLE IF NOT EXISTS "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("adminId") REFERENCES "users" ("id") ON DELETE CASCADE
);
-- Table to store platform information
CREATE TABLE IF NOT EXISTS "platforms" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "callbackUrl" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE
);
-- Table to establish many-to-many relationship between platforms and moderators
CREATE TABLE IF NOT EXISTS "platformModerators" (
    "platformId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    PRIMARY KEY ("platformId", "userId"),
    FOREIGN KEY ("platformId") REFERENCES "platforms" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
);
-- Table to store all recorded cases and their current status
CREATE TABLE IF NOT EXISTS "cases" (
    "platformId" TEXT NOT NULL,
    "relevantId" TEXT NOT NULL,
    -- content, account, community
    "kind" TEXT NOT NULL,
    -- resolved, unresolved
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "assignedTo" TEXT DEFAULT NULL,
    "assignedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("platformId", "relevantId", "kind"),
    FOREIGN KEY ("platformId") REFERENCES "platforms" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("assignedTo") REFERENCES "users" ("id") ON DELETE
    SET NULL
);
-- Table to store all actions
CREATE TABLE IF NOT EXISTS "actions" (
    "platformId" TEXT NOT NULL,
    "relevantId" TEXT NOT NULL,
    "authorId" TEXT,
    -- content, account, community
    "kind" TEXT NOT NULL,
    "actionInfo" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("platformId") REFERENCES "platforms" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("platformId", "relevantId", "kind") REFERENCES "cases" ("platformId", "relevantId", "kind") ON DELETE CASCADE
);
-- Table to store all views of cases, to track skipped cases
CREATE TABLE IF NOT EXISTS "caseViews" (
    "userId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "relevantId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "viewedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId", "platformId", "relevantId", "kind"),
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("platformId", "relevantId", "kind") REFERENCES "cases" ("platformId", "relevantId", "kind") ON DELETE CASCADE
);
-- Table to store all invitations
CREATE TABLE IF NOT EXISTS "invitation" (
    "platformId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    FOREIGN KEY ("platformId") REFERENCES "platforms" ("id") ON DELETE CASCADE,
    PRIMARY KEY ("platformId", "email")
);
-- Table to store all rules
CREATE TABLE IF NOT EXISTS "rules" (
    "ruleId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "readableName" TEXT NOT NULL,
    -- JSON string
    "information" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("ruleId"),
    FOREIGN KEY ("platformId") REFERENCES "platforms" ("id") ON DELETE CASCADE
);
-- Accounts table indexes
CREATE INDEX IF NOT EXISTS "accountsUserIdIdx" ON "accounts" ("userId");
CREATE INDEX IF NOT EXISTS "accountsProviderLookupIdx" ON "accounts" ("provider", "providerAccountId");
-- Users table indexes
CREATE INDEX IF NOT EXISTS "usersEmailIdx" ON "users" ("email");
-- Organizations table indexes
CREATE INDEX IF NOT EXISTS "organizationsIdx" ON "organizations" ("adminId");
-- Platforms table indexes
CREATE INDEX IF NOT EXISTS "platformsIdx" ON "platforms" ("organizationId");
-- PlatformModerators table indexes
CREATE INDEX IF NOT EXISTS "idxPlatformModeratorsPlatformId" ON "platformModerators" ("platformId");
CREATE INDEX IF NOT EXISTS "idxPlatformModeratorsUserId" ON "platformModerators" ("userId");
-- Cases table indexes
CREATE INDEX IF NOT EXISTS "casesStatusIdx" ON "cases" ("status");
CREATE INDEX IF NOT EXISTS "casesAssignedToIdx" ON "cases" ("assignedTo");
CREATE INDEX IF NOT EXISTS "casesCreatedAtIdx" ON "cases" ("createdAt");
CREATE INDEX IF NOT EXISTS "casesStatusAssignedIdx" ON "cases" ("status", "assignedAt");
-- Actions table indexes
CREATE INDEX IF NOT EXISTS "idxActions" ON "actions" ("platformId", "relevantId", "kind");
CREATE INDEX IF NOT EXISTS "actionsAuthorIdIdx" ON "actions" ("authorId");
CREATE INDEX IF NOT EXISTS "actionsCreatedAtIdx" ON "actions" ("createdAt");
-- Invitation table indexes
CREATE INDEX IF NOT EXISTS "idxInvitationEmail" ON "invitation" ("email");
CREATE INDEX IF NOT EXISTS "idxInvitationPlatform" ON "invitation" ("platformId");