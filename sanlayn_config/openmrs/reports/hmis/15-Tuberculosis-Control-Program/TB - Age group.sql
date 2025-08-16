    SELECT 
    first_term.name1 AS Type_of_TB,
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 0 and 4  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female 0-4',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 0 and 4  AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'Male 0-4',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 5 and 14  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female 5-14',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 5 and 14  AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'Male 5-14',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 15 and 24  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female 15-24',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 15 and 24  AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'Male 15-24',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 25 and 34  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female 25-34',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 25 and 34  AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'Male 25-34',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 35 and 44  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female 35-44',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 35 and 44  AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'Male 35-44',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 45 and 54  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female 45-54',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 45 and 54  AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'Male 45-54',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 55 and 64  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female 55-64',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age between 55 and 64  AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'Male 55-64',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age >= 65  AND raw.gender = 'F' THEN raw.person_id
                END),
            0) AS 'Female >= 65 ',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.age >= 65  AND raw.gender = 'M' THEN raw.person_id
                END),
            0) AS 'Male >= 65 '
               
FROM
    (SELECT 'New' AS name1 UNION SELECT 'Relapse' AS name1 UNION SELECT 'Other' AS name1) AS first_term
        LEFT JOIN
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            case when cov.value_concept_full_name = 'New Diagnosis' then 'New'
            when  cov.value_concept_full_name = 'Relapse' then 'Relapse'
            else 'Other'
                end AS tb_diag_category,
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
    inner JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'TB intake-Diagnosis category'
        AND cov.voided = 0

    WHERE
        DATE(o.obs_datetime) BETWEEN '2024-01-08' AND '2024-01-09') raw ON raw.tb_diag_category = first_term.name1
GROUP BY first_term.name1
order by field(first_term.name1,'New','Relapse','Other')