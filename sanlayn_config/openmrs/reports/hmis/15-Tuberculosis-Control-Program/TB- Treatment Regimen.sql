SELECT 
    age_g.age_f AS 'Age Group',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.treatment_regimen = '2HRZE+ 4HR'
                            AND raw.gender = 'F'
                    THEN
                        raw.person_id
                END),
            0) AS '2HRZE+ 4HR - F',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.treatment_regimen = '2HRZE+ 4HR'
                            AND raw.gender = 'M'
                    THEN
                        raw.person_id
                END),
            0) AS '2HRZE+ 4HR - M',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.treatment_regimen = '2HRZE + 7HRE'
                            AND raw.gender = 'F'
                    THEN
                        raw.person_id
                END),
            0) AS '2HRZE + 7HRE - F',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.treatment_regimen = '2HRZE + 7HRE'
                            AND raw.gender = 'M'
                    THEN
                        raw.person_id
                END),
            0) AS '2HRZE + 7HRE - M',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.treatment_regimen = '6HRZE'
                            AND raw.gender = 'F'
                    THEN
                        raw.person_id
                END),
            0) AS '6HRZE - F',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.treatment_regimen = '6HRZE'
                            AND raw.gender = 'M'
                    THEN
                        raw.person_id
                END),
            0) AS '6HRZE - M',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.treatment_regimen = '6HRZE + Lfx'
                            AND raw.gender = 'F'
                    THEN
                        raw.person_id
                END),
            0) AS '6HRZE + Lfx - F',
    IFNULL(COUNT(DISTINCT CASE
                    WHEN
                        raw.treatment_regimen = '6HRZE + Lfx'
                            AND raw.gender = 'M'
                    THEN
                        raw.person_id
                END),
            0) AS '6HRZE + Lfx - M'
FROM
    (SELECT 'Child(0-14)' AS age_f UNION SELECT 'Adults(>14)' AS age_f) AS age_g
        LEFT JOIN
    (SELECT 
        p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            cov.value_concept_full_name AS treatment_regimen,
            CASE
                WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 0 AND 14 THEN 'Child(0-14)'
                WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) > 14 THEN 'Adults(>14)'
            END AS Age_group,
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
        AND cov.concept_full_name = 'TB Intake-Treatment Regimen'
        AND cov.voided = 0
    WHERE
        DATE(o.obs_datetime) BETWEEN '2024-01-01' AND '2024-01-22') raw ON raw.Age_group = age_g.age_f
GROUP BY age_g.age_f
ORDER BY FIELD(age_g.age_f,
        'Child(0-14)',
        'Adults(>14)')