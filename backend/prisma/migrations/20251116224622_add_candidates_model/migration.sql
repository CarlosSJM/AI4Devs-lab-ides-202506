-- CreateTable
CREATE TABLE "candidates" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_education" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "institution" VARCHAR(255) NOT NULL,
    "degree" VARCHAR(255),
    "field_of_study" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "gpa" DECIMAL(3,2),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_experience" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "company" VARCHAR(255) NOT NULL,
    "position" VARCHAR(255) NOT NULL,
    "department" VARCHAR(255),
    "location" VARCHAR(255),
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "salary" DECIMAL(12,2),
    "currency" VARCHAR(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_documents" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100) NOT NULL,
    "document_type" VARCHAR(50) NOT NULL DEFAULT 'cv',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");

-- CreateIndex
CREATE INDEX "candidates_email_idx" ON "candidates"("email");

-- CreateIndex
CREATE INDEX "candidates_status_idx" ON "candidates"("status");

-- CreateIndex
CREATE INDEX "candidates_created_at_idx" ON "candidates"("created_at");

-- CreateIndex
CREATE INDEX "candidates_last_name_first_name_idx" ON "candidates"("last_name", "first_name");

-- CreateIndex
CREATE INDEX "candidate_education_candidate_id_idx" ON "candidate_education"("candidate_id");

-- CreateIndex
CREATE INDEX "candidate_education_institution_idx" ON "candidate_education"("institution");

-- CreateIndex
CREATE INDEX "candidate_experience_candidate_id_idx" ON "candidate_experience"("candidate_id");

-- CreateIndex
CREATE INDEX "candidate_experience_company_idx" ON "candidate_experience"("company");

-- CreateIndex
CREATE INDEX "candidate_experience_position_idx" ON "candidate_experience"("position");

-- CreateIndex
CREATE INDEX "candidate_documents_candidate_id_idx" ON "candidate_documents"("candidate_id");

-- CreateIndex
CREATE INDEX "candidate_documents_document_type_idx" ON "candidate_documents"("document_type");

-- CreateIndex
CREATE INDEX "candidate_documents_uploaded_at_idx" ON "candidate_documents"("uploaded_at");

-- AddForeignKey
ALTER TABLE "candidate_education" ADD CONSTRAINT "candidate_education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_experience" ADD CONSTRAINT "candidate_experience_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_documents" ADD CONSTRAINT "candidate_documents_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
