SELECT 
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.quitted_smoking_status = 'Current Smoker' THEN raw.person_id
                END),
            0) AS 'Current Smoker',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.quitted_smoking_status = '2 months' THEN raw.person_id
                END),
            0) AS '2 months',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.quitted_smoking_status = '5 months' THEN raw.person_id
                END),
            0) AS '5 months',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.quitted_smoking_status = 'End of treatment' THEN raw.person_id
                END),
            0) AS 'End of treatment'
FROM
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            cov.value_concept_full_name AS quitted_smoking_status,
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
            name = 'Tuberculosis Follow up note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    INNER JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'TBFU, Quitted Smoking status'
        AND cov.voided = 0
    WHERE
        DATE(o.obs_datetime) BETWEEN '2024-01-01' AND '2024-01-22') raw