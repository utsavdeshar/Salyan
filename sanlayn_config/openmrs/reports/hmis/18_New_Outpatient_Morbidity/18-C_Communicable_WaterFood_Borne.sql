  SELECT 
    first_answers.answer_name,
    SUM(IF(raw_data_final.gender = 'F', 1, 0)) AS 'Female_Count',
    SUM(IF(raw_data_final.gender = 'M', 1, 0)) AS 'Male_Count'
FROM
    (SELECT 'Typhoid (Enteric Fever)' AS answer_name UNION SELECT 'Acute gastro-enteritis (AGE)' AS answer_name UNION SELECT 'Ameobic Dysentery/Amoebiasis' AS answer_name UNION SELECT 'Bacillary Dysentery/Shigellosis' AS answer_name UNION SELECT 'Presumed non-infectious diarrhoea' AS answer_name UNION SELECT 'Cholera' AS answer_name UNION SELECT 'Intestinal Worms' AS answer_name UNION SELECT 'Jaundice' AS answer_name UNION SELECT 'Hepatitis A' AS answer_name UNION SELECT 'Hepatitis E' AS answer_name UNION SELECT 'Volume Depletion (Dehydration)' AS answer_name UNION SELECT 'Bacterial Intestinal infection' AS answer_name) first_answers
        LEFT JOIN
    (SELECT DISTINCT
        hdm.HMIS_ICD_CODE AS code_hmis,
            hdm.hmis,
            raw_data.person_id,
            raw_data.encounter_id,
            raw_data.gender,
            raw_data.age
    FROM	
        (SELECT DISTINCT
        cov.person_id AS 'Person_id',
            cov2.person_id AS 'pid',
            cov.encounter_id,
            p.gender AS 'gender',
            TIMESTAMPDIFF(YEAR, p.birthdate, v.date_created) AS age,
            cov.value_concept_full_name AS 'Diagnoses',
            DATE(v.date_created) AS date
    FROM
        visit v
    INNER JOIN encounter e ON e.visit_id = v.visit_id AND e.voided = 0
    INNER JOIN visit_type vt ON vt.visit_type_id = v.visit_type_id
        AND vt.name IN ('OPD')
    INNER JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.voided = 0
        AND cov.concept_id = 15
    INNER JOIN person p ON p.person_id = v.patient_id
    LEFT JOIN coded_obs_view cov2 ON cov2.person_id = p.person_id
        AND cov2.voided = 0
        AND cov2.concept_id = 15
        AND DATE(cov2.obs_datetime) < DATE(cov.obs_datetime)
        AND cov2.value_concept_full_name = cov.value_concept_full_name
    WHERE
        DATE(cov.obs_datetime) BETWEEN '#startDate#' AND '#endDate#'
            AND v.voided = 0) raw_data
    INNER JOIN hmis_diag_map hdm ON hdm.ICDName = raw_data.Diagnoses
    WHERE
        hdm.hmis IN ('Typhoid (Enteric Fever)' , 'Acute gastro-enteritis (AGE)', 'Ameobic Dysentery/Amoebiasis', 'Bacillary Dysentery/Shigellosis', 'Presumed non-infectious diarrhoea', 'Cholera', 'Intestinal Worms', 'Jaundice', 'Hepatitis A', 'Hepatitis E', 'Volume Depletion (Dehydration)', 'Bacterial Intestinal infection')) raw_data_final ON first_answers.answer_name = raw_data_final.hmis
GROUP BY first_answers.answer_name
ORDER BY FIELD(first_answers.answer_name,
        'Typhoid (Enteric Fever)',
        'Acute gastro-enteritis (AGE)',
        'Ameobic Dysentery/Amoebiasis',
        'Bacillary Dysentery/Shigellosis',
        'Presumed non-infectious diarrhoea',
        'Cholera',
        'Intestinal Worms',
        'Jaundice',
        'Hepatitis A',
        'Hepatitis E',
        'Volume Depletion (Dehydration)',
        'Bacterial Intestinal infection');                