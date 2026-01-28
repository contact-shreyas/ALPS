-- CreateTable
CREATE TABLE "IngestedData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "ingestSchedule" TEXT,
    "processSchedule" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReportSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "email" TEXT,
    "frequency" TEXT NOT NULL,
    "days" TEXT,
    "time" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "metadata" TEXT
);

-- CreateTable
CREATE TABLE "State" (
    "stateId" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "geomGeoJSON" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "District" (
    "districtId" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "contactEmail" TEXT,
    "geomGeoJSON" TEXT NOT NULL,
    "bbox" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "District_stateCode_fkey" FOREIGN KEY ("stateCode") REFERENCES "State" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StateMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "radiance" REAL NOT NULL,
    "hotspots" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StateMetric_code_fkey" FOREIGN KEY ("code") REFERENCES "State" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DistrictMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "radiance" REAL NOT NULL,
    "hotspots" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DistrictMetric_code_fkey" FOREIGN KEY ("code") REFERENCES "District" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StateDailyMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "radiance" REAL NOT NULL,
    "hotspots" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StateDailyMetric_code_fkey" FOREIGN KEY ("code") REFERENCES "State" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DistrictDailyMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "radiance" REAL NOT NULL,
    "hotspots" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DistrictDailyMetric_code_fkey" FOREIGN KEY ("code") REFERENCES "District" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "districtId" TEXT,
    "entityId" TEXT,
    CONSTRAINT "Alert_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District" ("districtId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Alert_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetricHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "rating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "component" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Hotspot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "districtCode" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "brightness" REAL NOT NULL,
    "delta" REAL NOT NULL,
    "severity" TEXT NOT NULL,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "Hotspot_districtCode_fkey" FOREIGN KEY ("districtCode") REFERENCES "District" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "coveragePct" REAL NOT NULL,
    "lastUpdatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" TEXT,
    "sourceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Entity_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "valueNumeric" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Metric_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phase" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" TEXT,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "IngestedData_processedAt_idx" ON "IngestedData"("processedAt");

-- CreateIndex
CREATE INDEX "ReportSchedule_type_enabled_idx" ON "ReportSchedule"("type", "enabled");

-- CreateIndex
CREATE INDEX "ReportSchedule_lastSentAt_idx" ON "ReportSchedule"("lastSentAt");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");

-- CreateIndex
CREATE UNIQUE INDEX "District_code_key" ON "District"("code");

-- CreateIndex
CREATE INDEX "District_stateCode_idx" ON "District"("stateCode");

-- CreateIndex
CREATE INDEX "StateMetric_year_idx" ON "StateMetric"("year");

-- CreateIndex
CREATE UNIQUE INDEX "StateMetric_code_year_key" ON "StateMetric"("code", "year");

-- CreateIndex
CREATE INDEX "DistrictMetric_year_idx" ON "DistrictMetric"("year");

-- CreateIndex
CREATE UNIQUE INDEX "DistrictMetric_code_year_key" ON "DistrictMetric"("code", "year");

-- CreateIndex
CREATE INDEX "StateDailyMetric_date_idx" ON "StateDailyMetric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "StateDailyMetric_code_date_key" ON "StateDailyMetric"("code", "date");

-- CreateIndex
CREATE INDEX "DistrictDailyMetric_date_idx" ON "DistrictDailyMetric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DistrictDailyMetric_code_date_key" ON "DistrictDailyMetric"("code", "date");

-- CreateIndex
CREATE INDEX "Alert_code_level_idx" ON "Alert"("code", "level");

-- CreateIndex
CREATE INDEX "Alert_detectedAt_idx" ON "Alert"("detectedAt");

-- CreateIndex
CREATE INDEX "Alert_districtId_idx" ON "Alert"("districtId");

-- CreateIndex
CREATE INDEX "Alert_entityId_idx" ON "Alert"("entityId");

-- CreateIndex
CREATE INDEX "MetricHistory_type_timestamp_idx" ON "MetricHistory"("type", "timestamp");

-- CreateIndex
CREATE INDEX "AgentLog_component_idx" ON "AgentLog"("component");

-- CreateIndex
CREATE INDEX "AgentLog_timestamp_idx" ON "AgentLog"("timestamp");

-- CreateIndex
CREATE INDEX "Hotspot_districtCode_idx" ON "Hotspot"("districtCode");

-- CreateIndex
CREATE INDEX "Hotspot_severity_idx" ON "Hotspot"("severity");

-- CreateIndex
CREATE INDEX "Hotspot_detectedAt_idx" ON "Hotspot"("detectedAt");

-- CreateIndex
CREATE INDEX "ProcessLog_type_status_idx" ON "ProcessLog"("type", "status");

-- CreateIndex
CREATE INDEX "ProcessLog_createdAt_idx" ON "ProcessLog"("createdAt");

-- CreateIndex
CREATE INDEX "Source_kind_idx" ON "Source"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_code_key" ON "Entity"("code");

-- CreateIndex
CREATE INDEX "Entity_region_idx" ON "Entity"("region");

-- CreateIndex
CREATE INDEX "Entity_sourceId_idx" ON "Entity"("sourceId");

-- CreateIndex
CREATE INDEX "Metric_entityId_idx" ON "Metric"("entityId");

-- CreateIndex
CREATE INDEX "Metric_date_idx" ON "Metric"("date");

-- CreateIndex
CREATE INDEX "Event_phase_idx" ON "Event"("phase");

-- CreateIndex
CREATE INDEX "Event_at_idx" ON "Event"("at");
