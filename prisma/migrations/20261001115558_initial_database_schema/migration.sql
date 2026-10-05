-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('collaborator', 'operations');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('notebook', 'monitor', 'cable', 'camera', 'accessory');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('available', 'maintenance');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("user_id","tenant_id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "asset_tag" TEXT NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'available',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "borrower_id" UUID NOT NULL,
    "borrowed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMPTZ(6) NOT NULL,
    "returned_at" TIMESTAMPTZ(6),
    "returned_by" UUID,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "memberships_tenant_id_idx" ON "memberships"("tenant_id");

-- CreateIndex
CREATE INDEX "equipment_tenant_id_status_idx" ON "equipment"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_tenant_id_asset_tag_key" ON "equipment"("tenant_id", "asset_tag");

-- CreateIndex
CREATE INDEX "loans_tenant_id_returned_at_idx" ON "loans"("tenant_id", "returned_at");

-- CreateIndex
CREATE INDEX "loans_tenant_id_borrower_id_returned_at_idx" ON "loans"("tenant_id", "borrower_id", "returned_at");

-- CreateIndex
CREATE INDEX "loans_equipment_id_returned_at_idx" ON "loans"("equipment_id", "returned_at");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A resource can have only one active loan at a time.
CREATE UNIQUE INDEX "loans_active_equipment_key"
    ON "loans"("equipment_id")
    WHERE "returned_at" IS NULL;

-- Supabase Auth owns user records; the application stores only their UUIDs.
ALTER TABLE "memberships"
    ADD CONSTRAINT "memberships_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "loans"
    ADD CONSTRAINT "loans_borrower_id_fkey"
    FOREIGN KEY ("borrower_id") REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE "loans"
    ADD CONSTRAINT "loans_returned_by_fkey"
    FOREIGN KEY ("returned_by") REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "equipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "loans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.has_tenant_membership(target_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM memberships
        WHERE tenant_id = target_tenant_id
          AND user_id = auth.uid()
    );
$$;

CREATE POLICY "tenant_members_can_read_tenants"
    ON "tenants" FOR SELECT
    USING (public.has_tenant_membership(id));

CREATE POLICY "users_can_read_memberships_in_their_tenants"
    ON "memberships" FOR SELECT
    USING (public.has_tenant_membership(tenant_id));

CREATE POLICY "tenant_members_can_read_equipment"
    ON "equipment" FOR SELECT
    USING (public.has_tenant_membership(tenant_id));

CREATE POLICY "tenant_members_can_read_loans"
    ON "loans" FOR SELECT
    USING (public.has_tenant_membership(tenant_id));

CREATE POLICY "tenant_members_can_read_audit_logs"
    ON "audit_logs" FOR SELECT
    USING (public.has_tenant_membership(tenant_id));
