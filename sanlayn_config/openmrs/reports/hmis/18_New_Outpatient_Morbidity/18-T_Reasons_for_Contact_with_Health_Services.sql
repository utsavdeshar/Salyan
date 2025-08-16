SELECT 
    first_answers.answer_name,
    SUM(IF(raw_data_final.gender = 'F', 1, 0)) AS 'Female_Count',
    SUM(IF(raw_data_final.gender = 'M', 1, 0)) AS 'Male_Count'
FROM
    (SELECT 'General examination' AS answer_name 
     UNION SELECT 'Routine general health checkup'
     UNION SELECT 'Screeing Examination for infectious disease'
     UNION SELECT 'Screening Examination for Neoplasms'
     UNION SELECT 'Counseling'
     UNION SELECT 'Reason Associated with Reproduction'
     UNION SELECT 'Procreative management'
     UNION SELECT 'Pregnancy examination'
     UNION SELECT 'Antenatal screening'
     UNION SELECT 'Postpartum care or Examination'
     UNION SELECT 'Problems related to unwanted pregnancy'
     UNION SELECT 'Menopausal counseling'
     UNION SELECT 'Blood donor'
     UNION SELECT 'Follow up care involving plastic surgery'
     UNION SELECT 'Care involving Dialysis'
     UNION SELECT 'Care involving Rehabilitation procedures'
     UNION SELECT 'Radiotherapy session'
     UNION SELECT 'Chemotherapy session'
     UNION SELECT 'Palliative care'
     UNION SELECT 'Acquired absence of body structure') first_answers
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
        'General examination', 'Routine general health checkup', 
        'Screeing Examination for infectious disease', 
        'Screening Examination for Neoplasms', 'Counseling', 
        'Reason Associated with Reproduction', 'Procreative management', 
        'Pregnancy examination', 'Antenatal screening', 
        'Postpartum care or Examination', 
        'Problems related to unwanted pregnancy', 'Menopausal counseling', 
        'Blood donor', 'Follow up care involving plastic surgery', 
        'Care involving Dialysis', 
        'Care involving Rehabilitation procedures', 
        'Radiotherapy session', 'Chemotherapy session', 
        'Palliative care', 'Acquired absence of body structure')) raw_data_final 
    ON first_answers.answer_name = raw_data_final.hmis
GROUP BY first_answers.answer_name
ORDER BY FIELD(first_answers.answer_name,  
    'General examination', 'Routine general health checkup', 
    'Screeing Examination for infectious disease', 
    'Screening Examination for Neoplasms', 'Counseling', 
    'Reason Associated with Reproduction', 'Procreative management', 
    'Pregnancy examination', 'Antenatal screening', 
    'Postpartum care or Examination', 
    'Problems related to unwanted pregnancy', 'Menopausal counseling', 
    'Blood donor', 'Follow up care involving plastic surgery', 
    'Care involving Dialysis', 
    'Care involving Rehabilitation procedures', 
    'Radiotherapy session', 'Chemotherapy session', 
    'Palliative care', 'Acquired absence of body structure');
