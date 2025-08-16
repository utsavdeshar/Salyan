SELECT 
    *
FROM
    (SELECT 
        'Pulmonary BC' AS Category,
            first_c.case_first,
            IFNULL(COUNT(DISTINCT CASE
                WHEN raw.gender = 'F' THEN raw.person_id
            END), 0) AS 'No_of_registered_cases_female',
            IFNULL(COUNT(DISTINCT CASE
                WHEN raw.gender = 'M' THEN raw.person_id
            END), 0) AS 'No_of_registered_cases_male'
    FROM
        (SELECT 'New Diagnosis' AS case_first UNION SELECT 'Relapse' AS case_first UNION SELECT 'Treatment after failure' AS case_first UNION SELECT 'Treatment after loss to follow-up' AS case_first UNION SELECT 'Other previously treated' AS case_first UNION SELECT 'Unknown previous treatment history' AS case_first) AS first_c
    LEFT JOIN (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            
            cov1.value_concept_full_name AS diag_category,
       
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
            name = 'Tuberculosis Intake Note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'TB Intake-Type'
        AND cov.voided = 0
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'TB intake-Diagnosis category'
        AND cov1.voided = 0
    WHERE
        DATE(o.obs_datetime) BETWEEN '2024-01-01' AND '2024-01-22'
            AND cov.value_concept_full_name = 'Pulmonary BC') raw ON raw.diag_category = first_c.case_first
    GROUP BY first_c.case_first
    ORDER BY FIELD(first_c.case_first, 'New Diagnosis', 'Relapse', 'Treatment after failure', 'Treatment after loss to follow-up', 'Other previously treated', 'Unknown previous treatment history')) first 
UNION (SELECT 
    'Pulmonary CD' AS Category,
    first_c.case_first,
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'No_of_registered_cases_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'No_of_registered_cases_male'
FROM
    (SELECT 'New Diagnosis' AS case_first UNION SELECT 'Relapse' AS case_first UNION SELECT 'other' AS case_first) AS first_c
        LEFT JOIN
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            cov1.value_concept_full_name AS diag_category,
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
            name = 'Tuberculosis Intake Note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'TB Intake-Type'
        AND cov.voided = 0
       LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'TB intake-Diagnosis category'
        AND cov1.voided = 0
    WHERE
        DATE(o.obs_datetime) BETWEEN '2024-01-01' AND '2024-01-22'
            AND cov.value_concept_full_name = 'Pulmonary CD') raw ON raw.diag_category = first_c.case_first
GROUP BY first_c.case_first
ORDER BY FIELD(first_c.case_first,
        'New Diagnosis',
        'Relapse',
        'other'))
        UNION (SELECT 
    'Extra Pulmonary' AS Category,
    first_c.case_first,
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'No_of_registered_cases_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'No_of_registered_cases_male'
FROM
    (SELECT 'New Diagnosis' AS case_first UNION SELECT 'Relapse' AS case_first UNION SELECT 'other' AS case_first) AS first_c
        LEFT JOIN
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            cov1.value_concept_full_name AS diag_category,
            
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
            name = 'Tuberculosis Intake Note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'TB Intake-Type'
        AND cov.voided = 0
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'TB intake-Diagnosis category'
        AND cov1.voided = 0
    WHERE
        DATE(o.obs_datetime) BETWEEN '2024-01-01' AND '2024-01-22'
            AND cov.value_concept_full_name = 'Extra Pulmonary') raw ON raw.diag_category = first_c.case_first
GROUP BY first_c.case_first
ORDER BY FIELD(first_c.case_first,
        'New Diagnosis',
        'Relapse',
        'other')) 
        UNION (SELECT 
    'hiv infected tb patient' AS Category,
    'all forms',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'No_of_registered_cases_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'No_of_registered_cases_male'
FROM
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            cov1.value_concept_full_name AS hiv_all,
            
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
            name = 'Tuberculosis Intake Note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'TB intake-Diagnosis category'
        AND cov1.voided = 0

    WHERE
        DATE(o.obs_datetime) BETWEEN '2024-01-01' AND '2024-01-22'
            AND cov1.value_concept_full_name = 'TB FU-HIV +ve all type') raw)