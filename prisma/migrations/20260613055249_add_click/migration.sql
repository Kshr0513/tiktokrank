-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Click" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Click_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Click" ("createdAt", "id", "ipHash", "videoId") SELECT "createdAt", "id", "ipHash", "videoId" FROM "Click";
DROP TABLE "Click";
ALTER TABLE "new_Click" RENAME TO "Click";
CREATE INDEX "Click_videoId_idx" ON "Click"("videoId");
CREATE INDEX "Click_createdAt_idx" ON "Click"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
