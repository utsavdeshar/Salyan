SELECT 
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.screened = 'TRUE'  THEN raw.person_id
                END),
            0) AS 'Screened',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.ring_pessary = 'TRUE' THEN raw.person_id
                END),
            0) AS 'ring_pessary',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.referred = 'TRUE' THEN raw.person_id
                END),
            0) AS 'referred',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.operation = 'TRUE' THEN raw.person_id
                END),
            0) AS 'operation',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.prolpase_finding = 'RHCC - Stage 1 & 2' THEN raw.person_id
                END),
            0) AS 'prolpase_finding Stage 1 & 2',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.prolpase_finding = 'RHCC - Stage 3' THEN raw.person_id
                END),
            0) AS 'prolpase_finding Stage 3',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.prolpase_finding = 'RHCC - Stage 4' THEN raw.person_id
                END),
            0) AS 'prolpase_finding Stage 4'
FROM
    (SELECT 
        p.person_id,
            cov.value_concept_full_name AS referred,
            cov1.value_concept_full_name AS screened,
            cov2.value_concept_full_name AS operation,
            cov3.value_concept_full_name AS ring_pessary,
            cov4.value_concept_full_name AS prolpase_finding
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
            name = 'Reproduction health complication care (RHCC) note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'RHCC - Uterine prolpase referred'
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'RHCC - Uterine prolpase screened'
    LEFT JOIN coded_obs_view cov2 ON cov2.encounter_id = e.encounter_id
        AND cov2.concept_full_name = 'RHCC - Uterine prolpase operation'
    LEFT JOIN coded_obs_view cov3 ON cov3.encounter_id = e.encounter_id
        AND cov3.concept_full_name = 'RHSS - Ring pessary'
    LEFT JOIN coded_obs_view cov4 ON cov4.encounter_id = e.encounter_id
        AND cov4.concept_full_name = 'RHCC - Prolpase finding'
    WHERE
        DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#') raw
