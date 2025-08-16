SELECT 
    IFNULL(COUNT(DISTINCT o.person_id), 0) AS 'TB_register',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN cov.value_concept_full_name = 'Current Smoker' THEN p.person_id
                END),
            0) AS 'current_smoker'
FROM
    visit v
        INNER JOIN
    encounter e ON e.visit_id = v.visit_id
        INNER JOIN
    person p ON p.person_id = v.patient_id
        INNER JOIN
    obs o ON o.encounter_id = e.encounter_id
        AND o.concept_id IN (SELECT 
            concept_id
        FROM
            concept_name
        WHERE
            name IN ('Tuberculosis Intake Note')
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
        LEFT JOIN
    coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name IN ('CD, Smoking status')
        AND cov.voided = 0
WHERE
    v.voided = 0
        AND DATE(o.obs_datetime) BETWEEN '#startDate#' and '#endDate#'