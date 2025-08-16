SELECT 
    first_c.case_first AS tb_cases,
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.test_order = 'HIVTC, Gene Expert TB assessment at enrollment' THEN raw.person_id
                END),
            0) AS 'xpert MTB/RIF',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.test_order IN ('Sputum Smear' , 'Sputum Culture') THEN raw.person_id
                END),
            0) AS 'LPA'
FROM
    (SELECT 'New Diagnosis' AS case_first UNION SELECT 'Relapse' AS case_first) AS first_c
        LEFT JOIN
    (SELECT 
        p.person_id,
            cov.value_concept_full_name AS test_order,
            cov1.value_concept_full_name AS diag_category,
            o.obs_datetime
    FROM
        visit v
    INNER JOIN person p ON p.person_id = v.patient_id
    INNER JOIN encounter e ON e.visit_id = v.visit_id AND e.voided = 0
    INNER JOIN obs o ON o.encounter_id = e.encounter_id and  DATE(o.obs_datetime) BETWEEN '2024-10-01' AND '2024-11-16'
        AND o.concept_id = (SELECT 
            concept_id
        FROM
            concept_name
        WHERE
            name = 'Tuberculosis intake note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'Tuberculosis, Tests ordered'
        AND cov.voided = 0
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'TB intake-Diagnosis category'
        AND cov1.value_concept_full_name IN ('New Diagnosis' , 'Relapse')
        AND cov1.voided = 0) raw ON first_c.case_first = raw.diag_category
 GROUP BY first_c.case_first