SELECT 
    first_answers.answer_name,
    SUM(IF(raw_data_final.gender = 'F', 1, 0)) AS 'Female_Count',
    SUM(IF(raw_data_final.gender = 'M', 1, 0)) AS 'Male_Count'
FROM
    (SELECT 'Breast cancer' AS answer_name 
     UNION SELECT 'Cervical/ uteri cancer'
     UNION SELECT 'Lung/bronchial cancer'
     UNION SELECT 'Oesophagus cancer'
     UNION SELECT 'Stomach cancer'
     UNION SELECT 'Thyroid cancer'
     UNION SELECT 'Liver cancer'
     UNION SELECT 'Pancreatic cancer'
     UNION SELECT 'Bone/bone marrow cancer'
     UNION SELECT 'Gall bladder cancer'
     UNION SELECT 'Colorectal (colon with rectum) cancer'
     UNION SELECT 'Oral cancer'
     UNION SELECT 'Lymphoma'
     UNION SELECT 'Ovary cancer'
     UNION SELECT 'Urinary bladder cancer'
     UNION SELECT 'Nasopharyngeal cancer'
     UNION SELECT 'Head & neck cancer'
     UNION SELECT 'Other cancer'
     UNION SELECT 'Haematological malignancy') first_answers
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
    WHERE hdm.hmis IN (
        'Breast cancer', 'Cervical/ uteri cancer', 'Lung/bronchial cancer', 
        'Oesophagus cancer', 'Stomach cancer','Thyroid cancer', 'Liver cancer', 
        'Pancreatic cancer', 'Bone/bone marrow cancer', 'Gall bladder cancer', 
        'Colorectal (colon with rectum) cancer', 'Oral cancer', 'Lymphoma',
        'Ovary cancer', 'Urinary bladder cancer', 'Nasopharyngeal cancer', 
        'Head & neck cancer', 'Other cancer','Haematological malignancy')) raw_data_final 
    ON first_answers.answer_name = raw_data_final.hmis
GROUP BY first_answers.answer_name
ORDER BY FIELD(first_answers.answer_name,  
    'Breast cancer', 'Cervical/ uteri cancer', 'Lung/bronchial cancer', 
    'Oesophagus cancer','Stomach cancer', 'Thyroid cancer', 'Liver cancer', 
    'Pancreatic cancer', 'Bone/bone marrow cancer', 'Gall bladder cancer', 
    'Colorectal (colon with rectum) cancer', 'Oral cancer', 'Lymphoma',
    'Ovary cancer', 'Urinary bladder cancer', 'Nasopharyngeal cancer', 
    'Head & neck cancer', 'Other cancer','Haematological malignancy');
