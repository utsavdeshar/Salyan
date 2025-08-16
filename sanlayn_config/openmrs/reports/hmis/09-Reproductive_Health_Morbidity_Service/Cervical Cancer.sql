SELECT 
    raw.age_group,
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.HIPV_DNA = 'RHCC - Screened' THEN raw.person_id
                END),
            0) AS 'HIPV_DNA - Screened',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.HIPV_DNA = 'RHCC - Positive' THEN raw.person_id
                END),
            0) AS 'HIPV_DNA - Positive',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.VIA = 'RHCC - Screened' THEN raw.person_id
                END),
            0) AS 'VIA - Screened',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.VIA = 'RHCC - Positive' THEN raw.person_id
                END),
            0) AS 'VIA - Positive',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.Pap_smear = 'RHCC - Screened' THEN raw.person_id
                END),
            0) AS 'Pap_smear - Screened',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.Pap_smear = 'RHCC - Positive' THEN raw.person_id
                END),
            0) AS 'Pap_smear - Positive'
FROM
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            CASE
                WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 30 AND 49 THEN '30-49'
                WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 50 THEN '50+'
                ELSE 'Other'
            END AS age_group,
            cov.value_concept_full_name AS HIPV_DNA,
            cov1.value_concept_full_name AS VIA,
            cov2.value_concept_full_name AS Pap_smear
    FROM
        visit v
    INNER JOIN person p ON p.person_id = v.patient_id
        AND p.gender = 'F'
    INNER JOIN encounter e ON e.visit_id = v.visit_id AND e.voided = 0
    INNER JOIN obs o ON o.encounter_id = e.encounter_id
        AND o.concept_id = (SELECT 
            concept_id
        FROM
            concept_name
        WHERE
            name = 'RHCC - Cervical cancer'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'RHCC - HIPV DNA'
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'RHCC - VIA'
    LEFT JOIN coded_obs_view cov2 ON cov2.encounter_id = e.encounter_id
        AND cov2.concept_full_name = 'RHCC - Pap smear & other'
    WHERE
        DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#') raw
WHERE
    raw.age_group IN ('30-49' , '50+')
GROUP BY age_group 
UNION SELECT 
    'Colposcopy_count', COUNT(o.person_id), '', '', '', '', ''
FROM
    obs o
WHERE
    o.concept_id = (SELECT 
            concept_id
        FROM
            concept_name
        WHERE
            name = 'RHCC - Colposcopy'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
        AND o.value_coded = (SELECT 
            concept_id
        FROM
            concept_name
        WHERE
            name = 'TRUE' AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
        AND DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#' 
UNION SELECT 
    'Ablative treatment count',
    COUNT(o.person_id),
    '',
    '',
    '',
    '',
    ''
FROM
    obs o
WHERE
    o.concept_id = (SELECT 
            concept_id
        FROM
            concept_name
        WHERE
            name = 'RHCC - Ablative treatment'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
        AND o.value_coded = (SELECT 
            concept_id
        FROM
            concept_name
        WHERE
            name = 'TRUE' AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
        AND DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#';