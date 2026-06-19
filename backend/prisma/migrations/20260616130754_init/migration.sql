-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "daily_car_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "car_fuel_type" TEXT NOT NULL DEFAULT 'none',
    "public_transport_km_per_week" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cycling_km_per_week" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "short_flights_per_year" INTEGER NOT NULL DEFAULT 0,
    "long_flights_per_year" INTEGER NOT NULL DEFAULT 0,
    "monthly_electricity_kwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "renewable_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "diet_type" TEXT NOT NULL DEFAULT 'mixed',
    "clothing_items_per_year" INTEGER NOT NULL DEFAULT 0,
    "electronics_items_per_year" INTEGER NOT NULL DEFAULT 0,
    "transport_emission" DOUBLE PRECISION NOT NULL,
    "energy_emission" DOUBLE PRECISION NOT NULL,
    "food_emission" DOUBLE PRECISION NOT NULL,
    "shopping_emission" DOUBLE PRECISION NOT NULL,
    "total_emission" DOUBLE PRECISION NOT NULL,
    "sustainability_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimated_savings" DOUBLE PRECISION NOT NULL,
    "priority" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulations" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "scenario_name" TEXT NOT NULL,
    "scenario_params" JSONB NOT NULL,
    "original_emission" DOUBLE PRECISION NOT NULL,
    "projected_emission" DOUBLE PRECISION NOT NULL,
    "reduction_percentage" DOUBLE PRECISION NOT NULL,
    "annual_savings_kg" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "assessments_user_id_idx" ON "assessments"("user_id");

-- CreateIndex
CREATE INDEX "assessments_created_at_idx" ON "assessments"("created_at");

-- CreateIndex
CREATE INDEX "recommendations_assessment_id_idx" ON "recommendations"("assessment_id");

-- CreateIndex
CREATE INDEX "simulations_assessment_id_idx" ON "simulations"("assessment_id");

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
