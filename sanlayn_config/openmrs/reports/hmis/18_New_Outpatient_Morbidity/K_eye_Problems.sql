SELECT 
    first_answers.answer_name,
    SUM(IF(raw_data_final.gender = 'F', 1, 0)) AS 'Female_Count',
    SUM(IF(raw_data_final.gender = 'M', 1, 0)) AS 'Male_Count'
FROM
    (SELECT 'Conjunctivitis' AS answer_name 
     UNION SELECT 'Trachoma'
     UNION SELECT 'Cataract'
     UNION SELECT 'Blindness'
     UNION SELECT 'Refractive error'
     UNION SELECT 'Glaucoma'
     UNION SELECT 'Colour blindness'
     UNION SELECT 'Exophthalmos'
     UNION SELECT 'Stye (External Hordelum)'
     UNION SELECT 'Chalazion'
     UNION SELECT 'Pterygium'
     UNION SELECT 'Diabetic retinopathy'
     UNION SELECT 'Hypertensive retinopathy'
     UNION SELECT 'Entropion'
     UNION SELECT 'Traumatic eye disease'
     UNION SELECT 'Uveitis'
     UNION SELECT 'Macular degeneration (age related)'
     UNION SELECT 'Amblyopia (lazy eye)'
     UNION SELECT 'Squint'
     UNION SELECT 'Retinitis pigmentosa'
     UNION SELECT 'Night blindness/visual disturbance'
     UNION SELECT 'Retinoblastoma'
     UNION SELECT 'Red eye'
     UNION SELECT 'Blepharitis') first_answers
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
        'Conjunctivitis', 'Trachoma', 'Cataract', 'Blindness', 
        'Refractive error', 'Glaucoma', 'Colour blindness', 
        'Exophthalmos', 'Stye (External Hordelum)', 'Chalazion', 
        'Pterygium', 'Diabetic retinopathy', 'Hypertensive retinopathy', 
        'Entropion', 'Traumatic eye disease', 'Uveitis', 
        'Macular degeneration (age related)', 'Amblyopia (lazy eye)', 
        'Squint', 'Retinitis pigmentosa', 'Night blindness/visual disturbance', 
        'Retinoblastoma', 'Red eye', 'Blepharitis')) raw_data_final 
    ON first_answers.answer_name = raw_data_final.hmis
GROUP BY first_answers.answer_name
ORDER BY FIELD(first_answers.answer_name,  
    'Conjunctivitis', 'Trachoma', 'Cataract', 'Blindness', 
    'Refractive error', 'Glaucoma', 'Colour blindness', 
    'Exophthalmos', 'Stye (External Hordelum)', 'Chalazion', 
    'Pterygium', 'Diabetic retinopathy', 'Hypertensive retinopathy', 
    'Entropion', 'Traumatic eye disease', 'Uveitis', 
    'Macular degeneration (age related)', 'Amblyopia (lazy eye)', 
    'Squint', 'Retinitis pigmentosa', 'Night blindness/visual disturbance', 
    'Retinoblastoma', 'Red eye', 'Blepharitis');
