SELECT 
    *
FROM
    (SELECT 
        'Pulmonary BC' AS Category,
            first_c.case_first,
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'F'
                        AND raw.treatment_out = 'Treatment cured'
                THEN
                    raw.person_id
            END), 0) AS 'No_of_cured_female',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'M'
                        AND raw.treatment_out = 'Treatment cured'
                THEN
                    raw.person_id
            END), 0) AS 'No_of_cured_male',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'F'
                        AND raw.treatment_out = 'Treatment Completed'
                THEN
                    raw.person_id
            END), 0) AS 'Treatment_Completed_female',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'M'
                        AND raw.treatment_out = 'Treatment Completed'
                THEN
                    raw.person_id
            END), 0) AS 'Treatment_Completed_male',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'F'
                        AND raw.treatment_out = 'Treatment failed'
                THEN
                    raw.person_id
            END), 0) AS 'Treatment_failed_female',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'M'
                        AND raw.treatment_out = 'Treatment failed'
                THEN
                    raw.person_id
            END), 0) AS 'Treatment_failed_male',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'F'
                        AND raw.treatment_out = 'Death During Treatment'
                THEN
                    raw.person_id
            END), 0) AS 'Treatment_death_female',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'M'
                        AND raw.treatment_out = 'Death During Treatment'
                THEN
                    raw.person_id
            END), 0) AS 'Treatment_death_male',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'F'
                        AND raw.treatment_out = 'Lost to Follow-up'
                THEN
                    raw.person_id
            END), 0) AS 'lost_to_follow_up_female',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'M'
                        AND raw.treatment_out = 'Lost to Follow-up'
                THEN
                    raw.person_id
            END), 0) AS 'lost_to_follow_up_male',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'F'
                        AND raw.treatment_out = 'Not evaluated'
                THEN
                    raw.person_id
            END), 0) AS 'Not_evaluated_female',
            IFNULL(COUNT(DISTINCT CASE
                WHEN
                    raw.gender = 'M'
                        AND raw.treatment_out = 'Not evaluated'
                THEN
                    raw.person_id
            END), 0) AS 'Not_evaluated_male'
    FROM
        (SELECT 'New Diagnosis' AS case_first UNION SELECT 'Relapse' AS case_first UNION SELECT 'Treatment after failure' AS case_first UNION SELECT 'Treatment after loss to follow-up' AS case_first UNION SELECT 'Other previously treated' AS case_first UNION SELECT 'Unknown previous treatment history' AS case_first) AS first_c
    LEFT JOIN (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            cov.value_concept_full_name AS tb_intake_type,
            cov1.value_concept_full_name AS diag_category,
            cov2.value_concept_full_name AS treatment_out,
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
            name = 'Tuberculosis follow up Note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'TB Intake-Type'
        AND cov.voided = 0
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'TB FU-Diagnosis category'
        AND cov1.voided = 0
    LEFT JOIN coded_obs_view cov2 ON cov2.encounter_id = e.encounter_id
        AND cov2.concept_full_name = 'TB FU-Treatment outcome'
        AND cov2.voided = 0
    WHERE
        DATE(o.obs_datetime)  BETWEEN '2024-01-08' AND '2024-01-21'
            AND cov.value_concept_full_name = 'Pulmonary BC') raw ON raw.diag_category = first_c.case_first
    GROUP BY first_c.case_first
    ORDER BY FIELD(first_c.case_first, 'New Diagnosis', 'Relapse', 'Treatment after failure', 'Treatment after loss to follow-up', 'Other previously treated', 'Unknown previous treatment history')) first 
UNION (SELECT 
    'Pulmonary CD' AS Category,
    first_c.case_first,
    '' AS 'No_of_cured_female',
    '' AS 'No_of_cured_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Treatment Completed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_Completed_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Treatment Completed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_Completed_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Treatment failed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_failed_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Treatment failed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_failed_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Death During Treatment'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_death_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Death During Treatment'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_death_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Lost to Follow-up'
                    THEN
                        raw.person_id
                END),
            0) AS 'lost_to_follow_up_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Lost to Follow-up'
                    THEN
                        raw.person_id
                END),
            0) AS 'lost_to_follow_up_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Not evaluated'
                    THEN
                        raw.person_id
                END),
            0) AS 'Not_evaluated_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Not evaluated'
                    THEN
                        raw.person_id
                END),
            0) AS 'Not_evaluated_male'
FROM
    (SELECT 'New Diagnosis' AS case_first UNION SELECT 'Relapse' AS case_first UNION SELECT 'other' AS case_first) AS first_c
        LEFT JOIN
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
                        case when cov1.value_concept_full_name = 'New Diagnosis' then 'New Diagnosis'
            when cov1.value_concept_full_name = 'Relapse' then 'Relapse'
            else 'other' end 
           -- cov1.value_concept_full_name
            AS diag_category,
          --  cov1.value_concept_full_name AS diag_category,
            cov2.value_concept_full_name AS treatment_out,
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
            name = 'Tuberculosis follow up Note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'TB Intake-Type'
        AND cov.voided = 0
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'TB FU-Diagnosis category'
        AND cov1.voided = 0
    LEFT JOIN coded_obs_view cov2 ON cov2.encounter_id = e.encounter_id
        AND cov2.concept_full_name = 'TB FU-Treatment outcome'
        AND cov2.voided = 0
    WHERE
        DATE(o.obs_datetime) BETWEEN '2024-01-08' AND '2024-01-21'
            AND cov.value_concept_full_name = 'Pulmonary CD') raw ON raw.diag_category = first_c.case_first
GROUP BY first_c.case_first
ORDER BY FIELD(first_c.case_first,
        'New Diagnosis',
        'Relapse',
        'other')) UNION (SELECT 
    'Extra Pulmonary' AS Category,
    first_c.case_first,
    '' AS 'No_of_cured_female',
    '' AS 'No_of_cured_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Treatment Completed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_Completed_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Treatment Completed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_Completed_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Treatment failed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_failed_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Treatment failed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_failed_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Death During Treatment'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_death_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Death During Treatment'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_death_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Lost to Follow-up'
                    THEN
                        raw.person_id
                END),
            0) AS 'lost_to_follow_up_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Lost to Follow-up'
                    THEN
                        raw.person_id
                END),
            0) AS 'lost_to_follow_up_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Not evaluated'
                    THEN
                        raw.person_id
                END),
            0) AS 'Not_evaluated_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Not evaluated'
                    THEN
                        raw.person_id
                END),
            0) AS 'Not_evaluated_male'
FROM
    (SELECT 'New Diagnosis' AS case_first UNION SELECT 'Relapse' AS case_first UNION SELECT 'other' AS case_first) AS first_c
        LEFT JOIN
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
                        case when cov1.value_concept_full_name = 'New Diagnosis' then 'New Diagnosis'
            when cov1.value_concept_full_name = 'Relapse' then 'Relapse'
            else 'other' end 
           -- cov1.value_concept_full_name
            AS diag_category,
           -- cov1.value_concept_full_name AS diag_category,
            cov2.value_concept_full_name AS treatment_out,
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
            name = 'Tuberculosis follow up Note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
        AND cov.concept_full_name = 'TB Intake-Type'
        AND cov.voided = 0
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'TB FU-Diagnosis category'
        AND cov1.voided = 0
    LEFT JOIN coded_obs_view cov2 ON cov2.encounter_id = e.encounter_id
        AND cov2.concept_full_name = 'TB FU-Treatment outcome'
        AND cov2.voided = 0
    WHERE
        DATE(o.obs_datetime) BETWEEN   '2024-01-08' AND '2024-01-21'
            AND cov.value_concept_full_name = 'Extra Pulmonary') raw ON raw.diag_category = first_c.case_first
GROUP BY first_c.case_first
ORDER BY FIELD(first_c.case_first,
        'New Diagnosis',
        'Relapse',
        'other')) UNION (SELECT 
    'hiv infected tb patient' AS Category,
    'all forms',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Treatment cured'
                    THEN
                        raw.person_id
                END),
            0) AS 'No_of_cured_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Treatment cured'
                    THEN
                        raw.person_id
                END),
            0) AS 'No_of_cured_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Treatment Completed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_Completed_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Treatment Completed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_Completed_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Treatment failed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_failed_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Treatment failed'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_failed_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Death During Treatment'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_death_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Death During Treatment'
                    THEN
                        raw.person_id
                END),
            0) AS 'Treatment_death_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Lost to Follow-up'
                    THEN
                        raw.person_id
                END),
            0) AS 'lost_to_follow_up_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Lost to Follow-up'
                    THEN
                        raw.person_id
                END),
            0) AS 'lost_to_follow_up_male',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'F'
                            AND raw.treatment_out = 'Not evaluated'
                    THEN
                        raw.person_id
                END),
            0) AS 'Not_evaluated_female',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.gender = 'M'
                            AND raw.treatment_out = 'Not evaluated'
                    THEN
                        raw.person_id
                END),
            0) AS 'Not_evaluated_male'
FROM
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            cov1.value_concept_full_name AS hiv_all,
            cov2.value_concept_full_name AS treatment_out,
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
            name = 'Tuberculosis follow up Note'
                AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN coded_obs_view cov1 ON cov1.encounter_id = e.encounter_id
        AND cov1.concept_full_name = 'TB FU-Diagnosis category'
        AND cov1.voided = 0
    LEFT JOIN coded_obs_view cov2 ON cov2.encounter_id = e.encounter_id
        AND cov2.concept_full_name = 'TB FU-Treatment outcome'
        AND cov2.voided = 0
    WHERE
        DATE(o.obs_datetime) BETWEEN '2024-01-08' AND '2024-01-21'
            AND cov1.value_concept_full_name = 'TB FU-HIV +ve all type') raw)