-- Expand program_type enum to support school-level courses
ALTER TYPE public.program_type ADD VALUE IF NOT EXISTS '10th';
ALTER TYPE public.program_type ADD VALUE IF NOT EXISTS '12th Arts';
ALTER TYPE public.program_type ADD VALUE IF NOT EXISTS '12th Commerce';
ALTER TYPE public.program_type ADD VALUE IF NOT EXISTS '12th Science';

-- Add comprehensive personal & education details to students table
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS father_name text,
  ADD COLUMN IF NOT EXISTS mother_name text,
  ADD COLUMN IF NOT EXISTS dob date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS employment_status text,
  ADD COLUMN IF NOT EXISTS marital_status text,
  ADD COLUMN IF NOT EXISTS religion text,
  ADD COLUMN IF NOT EXISTS aadhar_number text,
  ADD COLUMN IF NOT EXISTS abc_id text,
  ADD COLUMN IF NOT EXISTS deb_id text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS state text,
  -- 10th education
  ADD COLUMN IF NOT EXISTS edu_10_board text,
  ADD COLUMN IF NOT EXISTS edu_10_year integer,
  ADD COLUMN IF NOT EXISTS edu_10_marks text,
  ADD COLUMN IF NOT EXISTS edu_10_percentage numeric,
  ADD COLUMN IF NOT EXISTS edu_10_result text,
  -- 12th / Diploma education
  ADD COLUMN IF NOT EXISTS edu_12_board text,
  ADD COLUMN IF NOT EXISTS edu_12_year integer,
  ADD COLUMN IF NOT EXISTS edu_12_marks text,
  ADD COLUMN IF NOT EXISTS edu_12_percentage numeric,
  ADD COLUMN IF NOT EXISTS edu_12_result text,
  -- Degree education
  ADD COLUMN IF NOT EXISTS edu_degree_university text,
  ADD COLUMN IF NOT EXISTS edu_degree_year integer,
  ADD COLUMN IF NOT EXISTS edu_degree_marks text,
  ADD COLUMN IF NOT EXISTS edu_degree_percentage numeric,
  ADD COLUMN IF NOT EXISTS edu_degree_result text;