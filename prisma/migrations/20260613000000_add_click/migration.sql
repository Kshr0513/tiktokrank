CREATE TABLE "Click" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Click_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Click_videoId_idx" ON "Click"("videoId");
CREATE INDEX "Click_createdAt_idx" ON "Click"("createdAt");
CREATE UNIQUE INDEX "Click_videoId_ipHash_createdAt_idx" ON "Click"("videoId", "ipHash", date("createdAt"));
