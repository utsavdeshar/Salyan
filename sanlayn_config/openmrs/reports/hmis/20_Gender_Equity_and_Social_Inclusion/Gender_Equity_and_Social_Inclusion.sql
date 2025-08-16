SELECT  
    caste_lookup.answer_concept_name AS 'Caste/Ethnicity',
    IFNULL(full_immunization.full_immunization_female, 0) AS 'Full Immunization Female',
    IFNULL(full_immunization.full_immunization_male, 0) AS 'Full Immunization Male',
    IFNULL(cbimci_u2.cbimci_female_u2, 0) AS 'Enroll in CBIMCI programme-Female_0-2_months',
    IFNULL(cbimci_u2.cbimci_male_u2, 0) AS 'Enroll in CBIMCI programme-Male_0-2_months',
    IFNULL(cbimci.cbimci_female, 0) AS 'Enroll in CBIMCI programme-Female 2-59_months',
    IFNULL(cbimci.cbimci_male, 0) AS 'Enroll in CBIMCI programme-Male 2-59_months',
    IFNULL(underweight.underweight_female, 0) AS 'Underweight Children(<2years)-Female',
    IFNULL(underweight.underweight_male, 0) AS 'Underweight Children(<2years)-Male',
    IFNULL(delivery.delivery_count, 0) AS 'Institutional Delivery',
    IFNULL(abortion.abortion_count, 0) AS 'Abortion Cases',
    IFNULL(leprosy_cases.leprosy_cases_female, 0) AS 'Leprosy patient cases-Female',
    IFNULL(leprosy_cases.leprosy_cases_male, 0) AS 'Leprosy patient cases-Male',
    IFNULL(tb_cases.tb_cases_female, 0) AS 'TB patient cases-Female',
    IFNULL(tb_cases.tb_cases_male, 0) AS 'TB patient cases-Male',
    IFNULL(op_cases.op_cases_female, 0) AS 'Morethen 5 Years New OPD Patient-Female',
    IFNULL(op_cases.op_cases_male, 0) AS 'Morethen 5 Years New OPD Patient-Male',
    IFNULL(ip_cases.ip_cases_female, 0) AS 'In patient cases-Female',
    IFNULL(ip_cases.ip_cases_male, 0) AS 'In patient cases-Male',
	IFNULL(ocmc_visit.ocmc_female, 0) AS 'OCMC Visit-Female',
    IFNULL(ocmc_visit.ocmc_male, 0) AS 'OCMC Visit-Male'


FROM (
    SELECT answer_concept_name, answer_concept_id
    FROM concept_answer_view
    WHERE question_concept_name = 'Caste'
) AS caste_lookup

LEFT JOIN (
    SELECT caste.answer_concept_name AS caste_ethnicity,
        SUM(IF(p.gender = 'F', 1, 0)) AS cbimci_female,
        SUM(IF(p.gender = 'M', 1, 0)) AS cbimci_male
    FROM visit v
    JOIN person p ON v.patient_id = p.person_id
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id AND pat.name = 'Caste'
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN obs_view o ON e.encounter_id = o.encounter_id
        AND o.concept_full_name = 'CBIMNCI (2 to 59 months child)' AND o.voided = 0
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value AND caste.question_concept_name = 'Caste'
    WHERE DATE(v.date_started) BETWEEN '#startDate#' AND '#endDate#'
    GROUP BY caste.answer_concept_name
) cbimci ON cbimci.caste_ethnicity = caste_lookup.answer_concept_name

LEFT JOIN (
    SELECT caste.answer_concept_name AS caste_ethnicity,
        SUM(IF(p.gender = 'F', 1, 0)) AS cbimci_female_u2,
        SUM(IF(p.gender = 'M', 1, 0)) AS cbimci_male_u2
    FROM visit v
    JOIN person p ON v.patient_id = p.person_id
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id AND pat.name = 'Caste'
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN obs_view o ON e.encounter_id = o.encounter_id
        AND o.concept_full_name = 'CBIMNCI (<2 months child)' AND o.voided = 0
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value AND caste.question_concept_name = 'Caste'
    WHERE DATE(v.date_started) BETWEEN '#startDate#' AND '#endDate#'
    GROUP BY caste.answer_concept_name
) cbimci_u2 ON cbimci_u2.caste_ethnicity = caste_lookup.answer_concept_name

LEFT JOIN (
    SELECT caste.answer_concept_name AS caste_ethnicity,
        SUM(IF(p.gender = 'F', 1, 0)) AS full_immunization_female,
        SUM(IF(p.gender = 'M', 1, 0)) AS full_immunization_male
    FROM visit v
    JOIN person p ON v.patient_id = p.person_id
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id AND pat.name = 'Caste'
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN obs_view o ON e.encounter_id = o.encounter_id
        AND o.concept_full_name = 'Vaccine-Measles or rubella'
        AND o.value_coded = '605'
        AND o.voided = 0
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value AND caste.question_concept_name = 'Caste'
    WHERE DATE(v.date_started) BETWEEN '#startDate#' AND '#endDate#'
    GROUP BY caste.answer_concept_name
) full_immunization ON full_immunization.caste_ethnicity = caste_lookup.answer_concept_name

LEFT JOIN (
    SELECT caste.answer_concept_name AS caste_ethnicity,
        SUM(IF(p.gender = 'F', 1, 0)) AS underweight_female,
        SUM(IF(p.gender = 'M', 1, 0)) AS underweight_male
    FROM visit v
    JOIN person p ON v.patient_id = p.person_id
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id AND pat.name = 'Caste'
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN coded_obs_view co ON e.encounter_id = co.encounter_id
        AND co.concept_full_name = 'IMAM, Indicator'
        AND co.value_concept_full_name IN ('SAM', 'MAM')
        AND co.voided = 0
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value AND caste.question_concept_name = 'Caste'
    WHERE DATE(v.date_started) BETWEEN '#startDate#' AND '#endDate#'
        AND TIMESTAMPDIFF(MONTH, p.birthdate, v.date_started) <= 24
    GROUP BY caste.answer_concept_name
) underweight ON underweight.caste_ethnicity = caste_lookup.answer_concept_name

LEFT JOIN (
    SELECT caste.answer_concept_name AS caste_ethnicity,
        COUNT(DISTINCT p.person_id) AS delivery_count
    FROM visit v
    JOIN person p ON v.patient_id = p.person_id
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id AND pat.name = 'Caste'
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN obs_view o ON e.encounter_id = o.encounter_id
        AND o.voided = 0
    JOIN coded_obs_view c ON o.obs_group_id = c.obs_group_id
        AND c.concept_full_name = 'Delivery-Delivery service done by'
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value AND caste.question_concept_name = 'Caste'
    WHERE DATE(e.encounter_datetime) BETWEEN '#startDate#' AND '#endDate#'
    GROUP BY caste.answer_concept_name
) delivery ON delivery.caste_ethnicity = caste_lookup.answer_concept_name

LEFT JOIN (
    SELECT caste.answer_concept_name AS caste_ethnicity,
        COUNT(DISTINCT p.person_id) AS abortion_count
    FROM visit v
    JOIN person p ON v.patient_id = p.person_id
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id AND pat.name = 'Caste'
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN coded_obs_view co ON e.encounter_id = co.encounter_id
        AND co.concept_full_name = 'SA-visit type'
        AND co.value_concept_full_name IS NOT NULL
        AND co.voided = 0
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value AND caste.question_concept_name = 'Caste'
    WHERE DATE(v.date_started) BETWEEN '#startDate#' AND '#endDate#'
    GROUP BY caste.answer_concept_name
) abortion ON abortion.caste_ethnicity = caste_lookup.answer_concept_name

LEFT JOIN (
    SELECT caste.answer_concept_name AS caste_ethnicity,
        SUM(IF(p.gender = 'F', 1, 0)) AS leprosy_cases_female,
        SUM(IF(p.gender = 'M', 1, 0)) AS leprosy_cases_male
    FROM visit v
    JOIN person p ON v.patient_id = p.person_id
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id AND pat.name = 'Caste'
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN coded_obs_view co ON e.encounter_id = co.encounter_id
        AND co.concept_full_name = 'Leprosy, Case Type'
        AND co.value_concept_full_name = 'New Patients'
        AND co.voided = 0
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value AND caste.question_concept_name = 'Caste'
    WHERE DATE(e.encounter_datetime) BETWEEN '#startDate#' AND '#endDate#'
    GROUP BY caste.answer_concept_name
) leprosy_cases ON leprosy_cases.caste_ethnicity = caste_lookup.answer_concept_name

LEFT JOIN (
    SELECT caste.answer_concept_name AS caste_ethnicity,
        SUM(IF(p.gender = 'F', 1, 0)) AS tb_cases_female,
        SUM(IF(p.gender = 'M', 1, 0)) AS tb_cases_male
    FROM visit v
    JOIN person p ON v.patient_id = p.person_id
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id AND pat.name = 'Caste'
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN coded_obs_view co ON e.encounter_id = co.encounter_id
        AND co.concept_full_name = 'TB intake-Diagnosis category'
        AND co.value_concept_full_name = 'New diagnosis'
        AND co.voided = 0
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value AND caste.question_concept_name = 'Caste'
    WHERE DATE(e.encounter_datetime) BETWEEN '#startDate#' AND '#endDate#'
    GROUP BY caste.answer_concept_name
) tb_cases ON tb_cases.caste_ethnicity = caste_lookup.answer_concept_name

LEFT JOIN (
    SELECT caste.answer_concept_name AS caste_ethnicity,
        SUM(IF(p.gender = 'F', 1, 0)) AS op_cases_female,
        SUM(IF(p.gender = 'M', 1, 0)) AS op_cases_male
    FROM visit v
    JOIN visit_type vt ON v.visit_type_id = vt.visit_type_id AND vt.name = 'OPD'
    JOIN person p ON v.patient_id = p.person_id
        AND TIMESTAMPDIFF(YEAR, p.birthdate, v.date_started) >= 5
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id AND pat.name = 'Caste'
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value AND caste.question_concept_name = 'Caste'
    WHERE DATE(p.date_created) BETWEEN '#startDate#' AND '#endDate#'
    GROUP BY caste.answer_concept_name
) op_cases ON op_cases.caste_ethnicity = caste_lookup.answer_concept_name

LEFT JOIN (
    SELECT caste.answer_concept_name AS caste_ethnicity,
        SUM(IF(p.gender = 'F', 1, 0)) AS ip_cases_female,
        SUM(IF(p.gender = 'M', 1, 0)) AS ip_cases_male
    FROM visit v
    JOIN person p ON v.patient_id = p.person_id
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id AND pat.name = 'Caste'
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN coded_obs_view co ON e.encounter_id = co.encounter_id
        AND co.concept_full_name = 'Discharge-Inpatient outcome'
        AND co.voided = 0
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value AND caste.question_concept_name = 'Caste'
    WHERE DATE(e.encounter_datetime) BETWEEN '#startDate#' AND '#endDate#'
    GROUP BY caste.answer_concept_name
) ip_cases ON ip_cases.caste_ethnicity = caste_lookup.answer_concept_name
LEFT JOIN (
    SELECT
        caste.answer_concept_name AS caste_ethnicity,
        SUM(IF(p.gender = 'F', 1, 0)) AS ocmc_female,
        SUM(IF(p.gender = 'M', 1, 0)) AS ocmc_male
    FROM visit v
    JOIN person p ON v.patient_id = p.person_id
    JOIN person_attribute pa ON pa.person_id = p.person_id
    JOIN person_attribute_type pat ON pa.person_attribute_type_id = pat.person_attribute_type_id
        AND pat.name = 'Caste'
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN obs_view o ON e.encounter_id = o.encounter_id
        AND o.concept_full_name = 'OCMC - Visit'
        AND o.voided = 0
    JOIN concept_answer_view caste ON caste.answer_concept_id = pa.value
        AND caste.question_concept_name = 'Caste'
    WHERE DATE(e.encounter_datetime) BETWEEN '#startDate#' AND '#endDate#'
    GROUP BY caste.answer_concept_name
) ocmc_visit ON ocmc_visit.caste_ethnicity = caste_lookup.answer_concept_name

GROUP BY caste_lookup.answer_concept_name;
