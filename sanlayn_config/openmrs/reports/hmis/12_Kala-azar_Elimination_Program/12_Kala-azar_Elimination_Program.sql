    SELECT 
    first_term.name1 AS Patient_type,
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age < 5 AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female < 5',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age < 5 AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'male < 5',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age >= 5 AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female >= 5',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age >= 5 AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'male >= 5',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.method_of_diag = 'Kalaazar-RK39' THEN raw.person_id
                END),
            0) AS 'Kalaazar-RK39',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.method_of_diag = 'Kalaazar-BM' THEN raw.person_id
                END),
            0) AS 'Kalaazar-BM',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.method_of_diag = 'Kalaazar-SP' THEN raw.person_id
                END),
            0) AS 'Kalaazar-SP',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.method_of_diag = 'Others' THEN raw.person_id
                END),
            0) AS 'Others method',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.treated_with = 'Kalaazar-Liposomal amphotericin B / mitefosie' THEN raw.person_id
                END),
            0) AS 'Kalaazar-Liposomal amphotericin B / mitefosie',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.treated_with = 'Others' THEN raw.person_id
                END),
            0) AS 'Others',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.death_date IS NOT NULL
                            AND raw.gender = 'F'
                    THEN
                        raw.person_id
                END),
            0) AS 'Female death',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.death_date IS NOT NULL
                            AND raw.gender = 'M'
                    THEN
                        raw.person_id
                END),
            0) AS 'Male death'
FROM
    (SELECT 'Within District' AS name1 UNION SELECT 'Outside District' AS name1 UNION SELECT 'Foreigner' AS name1) AS first_term
        LEFT JOIN
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            CASE
                WHEN cov.value_concept_full_name = 'Indigenous' THEN 'Within District'
                WHEN cov.value_concept_full_name = 'Imported' THEN 'Outside District'
                ELSE 'Foreigner'
            END AS Patient_Type,
            cov1.value_concept_full_name AS method_of_diag,
            cov2.value_concept_full_name AS treated_with,
            o1.value_datetime AS death_date,
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
            name = 'Kalazar note' AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'Kalaazar-Method of Diagnosis'
        AND cov1.voided = 0
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'Kalaazar-Classification'
        AND cov.voided = 0
    LEFT JOIN coded_obs_view cov2 ON cov2.encounter_id = e.encounter_id
        AND cov2.concept_full_name = 'Kalaazar-Treated with'
        AND cov2.voided = 0
        left JOIN obs o1 ON o1.encounter_id = e.encounter_id
        AND o1.concept_id = (SELECT 
            concept_id
        FROM
            concept_name
        WHERE
            name = 'Kalaazar-Death date' AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    WHERE
        DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#') raw ON raw.Patient_Type = first_term.name1
GROUP BY first_term.name1
ORDER BY FIELD(first_term.name1,'Within District','Outside District','Foreigner')