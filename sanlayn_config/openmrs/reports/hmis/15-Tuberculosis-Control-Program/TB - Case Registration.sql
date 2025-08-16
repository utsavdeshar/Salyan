    SELECT 
    first_term.name1 AS Type_of_TB,
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='New Diagnosis'  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female -new',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='New Diagnosis' AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'male -new',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='Relapse'  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female -Relapse',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='Relapse' AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'male -Relapse',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='Treatment after failure'  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female -taf',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='Treatment after failure' AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'male -taf',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='Treatment after loss to follow-up'  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female -talf',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='Treatment after loss to follow-up' AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'male -talf',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='Other previously treated'  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female -opt',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='Other previously treated' AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'male -opt',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='Previous treatment history unknown'  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female -upth',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.tb_diag_category ='Previous treatment history unknown' AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'male -upth'
FROM
    (SELECT 'Extra Pulmonary' AS name1 UNION SELECT 'Pulmonary CD' AS name1 UNION SELECT 'Pulmonary BC' AS name1) AS first_term
        LEFT JOIN
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
                 cov.value_concept_full_name AS TB_intake_Type,
       cov1.value_concept_full_name AS tb_diag_category,
            p.gender
    FROM
        visit v
    INNER JOIN person p ON p.person_id = v.patient_id
    INNER JOIN encounter e ON e.visit_id = v.visit_id AND e.voided = 0
    INNER JOIN obs o ON o.encounter_id = e.encounter_id
        AND o.concept_id = (SELECT 
            concept_id
        FROM
            concept_name
        WHERE
            name = 'Tuberculosis Intake Note' AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'TB intake-Diagnosis category'
        AND cov1.voided = 0
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'TB Intake-Type'
        AND cov.voided = 0
    WHERE
        DATE(o.obs_datetime) BETWEEN '2024-01-08' AND '2024-01-09') raw ON raw.TB_intake_Type = first_term.name1
GROUP BY first_term.name1