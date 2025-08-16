SELECT value_test.name,
ifnull(final.less_than_40,0) as '<40',
ifnull(final.bet_40_and_70,0) as '40-70',
ifnull(final.greater_than_70,0) as '>70' FROM (
    SELECT 'RHCC - Screened' AS 'name'
    UNION
    SELECT 'RHCC - Suspected' AS 'name'
) AS value_test 
LEFT JOIN (
    SELECT 
        raw.value_concept_full_name,
        IFNULL(COUNT(DISTINCT CASE WHEN raw.age < 40 THEN raw.person_id END), 0) AS 'less_than_40',
        IFNULL(COUNT(DISTINCT CASE WHEN raw.age BETWEEN 40 AND 70 THEN raw.person_id END), 0) AS 'bet_40_and_70',
        IFNULL(COUNT(DISTINCT CASE WHEN raw.age > 70 THEN raw.person_id END), 0) AS 'greater_than_70'
    FROM (
        SELECT 
            p.person_id,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
            cov.value_concept_full_name
        FROM visit v
        INNER JOIN person p ON p.person_id = v.patient_id
        INNER JOIN encounter e ON e.visit_id = v.visit_id AND e.voided = 0
        INNER JOIN coded_obs_view cov ON cov.encounter_id = e.encounter_id
            AND cov.concept_full_name = 'RHCC - Breast cancer'
        WHERE DATE(v.date_created) BETWEEN '#startDate#' AND '#endDate#'
    ) AS raw) as final
    on value_test.name = final.value_concept_full_name


