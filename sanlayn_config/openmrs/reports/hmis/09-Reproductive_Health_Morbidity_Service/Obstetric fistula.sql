SELECT 
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.value_concept_full_name IN ('RHCC - Screened') THEN raw.person_id
                END),
            0) AS 'RHCC - Screened',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.value_concept_full_name IN ('RHCC - Suspected') THEN raw.person_id
                END),
            0) AS 'RHCC - Suspected',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.value_concept_full_name IN ('RHCC - Referred') THEN raw.person_id
                END),
            0) AS 'RHCC - Referred',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.value_concept_full_name IN ('RHCC - Operation') THEN raw.person_id
                END),
            0) AS 'RHCC - Operation'
FROM
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            cov.value_concept_full_name
    FROM
        visit v
    INNER JOIN person p ON p.person_id = v.patient_id
    INNER JOIN encounter e ON e.visit_id = v.visit_id AND e.voided = 0
    INNER JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'Obstetric fistula'
    WHERE
        DATE(v.date_created) BETWEEN '#startDate#' AND '#endDate#') raw

