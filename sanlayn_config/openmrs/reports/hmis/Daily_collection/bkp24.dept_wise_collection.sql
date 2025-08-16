SELECT 
    q1.username,
    q1.`Free Patient`,
    q1.`Follow-up Patient`,
    q1.`OPD Patient`,
    q1.`ER Patient`,
    q1.`Follow-up Collection`,
    q1.`OPD Collection`,
    q1.`ER Collection`,
    q1.`Total Collection`,
    COALESCE(q2.total_person_co_payment, 0) AS "Co-Payment Person",
    COALESCE(q2.co_payment_collection, 0) AS "Co-Payment Collection",
    q1.`Total Collection` + COALESCE(q2.co_payment_collection, 0) AS "Grand Total"
FROM (
    SELECT 
        u.username,
        SUM(IF(o.value_coded = '20044', 1, 0)) AS 'Free Patient',
        SUM(IF(o.value_coded = '20045', 1, 0)) AS 'Follow-up Patient',
        SUM(IF(o.value_coded = '20046', 1, 0)) AS 'OPD Patient',
        SUM(IF(o.value_coded = '20047', 1, 0)) AS 'ER Patient',
        SUM(IF(o.value_coded = '20045', 5, 0)) AS 'Follow-up Collection',
        SUM(IF(o.value_coded = '20046', 40, 0)) AS 'OPD Collection',
        SUM(IF(o.value_coded = '20047', 60, 0)) AS 'ER Collection',
        SUM(IF(o.value_coded = '20045', 5, 0)) + 
        SUM(IF(o.value_coded = '20046', 40, 0)) + 
        SUM(IF(o.value_coded = '20047', 60, 0)) AS 'Total Collection'
    FROM obs o
    INNER JOIN users u ON u.user_id = o.creator
    WHERE o.concept_id = 20048 
    AND o.voided =0
    -- AND o.creator NOT IN (4, 111, 104)
      AND DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#'
      AND o.value_coded IN (20044, 20045, 20046, 20047)
    GROUP BY u.username
) q1
LEFT JOIN (
    SELECT 
        raw_data.username,
        raw_data.department_sent_to,
        COUNT(raw_data.person_id) AS total_person_co_payment,
        5 * COUNT(raw_data.person_id) AS co_payment_collection
    FROM (
        SELECT 
            u.username,
            (SELECT cn.name
             FROM concept_name cn
             WHERE cn.concept_id = o.value_coded
               AND cn.concept_name_type = 'FULLY_SPECIFIED'
               AND cn.voided = 0) AS 'department_sent_to',
            v.copayment_fee,
            o.person_id,
            o.obs_datetime
        FROM obs o
        INNER JOIN encounter e ON e.encounter_id = o.encounter_id
        INNER JOIN visit v ON v.visit_id = e.visit_id AND v.voided = 0
        INNER JOIN users u ON u.user_id = o.creator
        WHERE o.concept_id = (SELECT cn.concept_id
                              FROM concept_name cn
                              WHERE cn.concept_name_type = 'FULLY_SPECIFIED'
                                AND cn.voided = 0
                                AND cn.name = 'Department Sent To')
          AND DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#'
          AND o.voided = 0
          AND ROUND(v.copayment_fee, 1) = 0.1
    ) raw_data
    WHERE raw_data.department_sent_to = 'OPD'
    GROUP BY raw_data.username, raw_data.department_sent_to
) q2 ON q1.username = q2.username
UNION ALL

SELECT 
    'Total' AS username,
    NULL AS `Free Patient`,
    NULL AS `Follow-up Patient`,
    NULL AS `OPD Patient`,
    NULL AS `ER Patient`,
    NULL AS `Follow-up Collection`,
    NULL AS `OPD Collection`,
    NULL AS `ER Collection`,
    NULL AS `Total Collection`,
    NULL AS total_person_co_payment,
    NULL AS co_payment_collection,
    SUM(q1.`Total Collection` + COALESCE(q2.co_payment_collection, 0)) AS Grand_Total
FROM (
    SELECT 
        SUM(IF(o.value_coded = '20044', 1, 0)) AS 'Free Patient',
        SUM(IF(o.value_coded = '20045', 1, 0)) AS 'Follow-up Patient',
        SUM(IF(o.value_coded = '20046', 1, 0)) AS 'OPD Patient',
        SUM(IF(o.value_coded = '20047', 1, 0)) AS 'ER Patient',
        SUM(IF(o.value_coded = '20045', 5, 0)) AS 'Follow-up Collection',
        SUM(IF(o.value_coded = '20046', 40, 0)) AS 'OPD Collection',
        SUM(IF(o.value_coded = '20047', 60, 0)) AS 'ER Collection',
        SUM(IF(o.value_coded = '20045', 5, 0)) + 
        SUM(IF(o.value_coded = '20046', 40, 0)) + 
        SUM(IF(o.value_coded = '20047', 60, 0)) AS 'Total Collection'
    FROM obs o
    INNER JOIN users u ON u.user_id = o.creator
    WHERE o.concept_id = 20048 
      AND DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#'
      AND o.value_coded IN (20044, 20045, 20046, 20047)
) q1
LEFT JOIN (
    SELECT 
        COUNT(raw_data.person_id) AS total_person_co_payment,
        5 * COUNT(raw_data.person_id) AS co_payment_collection
    FROM (
        SELECT 
            u.username,
            (SELECT cn.name
             FROM concept_name cn
             WHERE cn.concept_id = o.value_coded
               AND cn.concept_name_type = 'FULLY_SPECIFIED'
               AND cn.voided = 0) AS 'department_sent_to',
            v.copayment_fee,
            o.person_id,
            o.obs_datetime
        FROM obs o
        INNER JOIN encounter e ON e.encounter_id = o.encounter_id
        INNER JOIN visit v ON v.visit_id = e.visit_id AND v.voided = 0
        INNER JOIN users u ON u.user_id = o.creator
        WHERE o.concept_id = (SELECT cn.concept_id
                              FROM concept_name cn
                              WHERE cn.concept_name_type = 'FULLY_SPECIFIED'
                                AND cn.voided = 0
                                AND cn.name = 'Department Sent To')
          AND DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#'
          AND o.voided = 0
          AND ROUND(v.copayment_fee, 1) = 0.1
    ) raw_data
    WHERE raw_data.department_sent_to = 'OPD'
) q2 ON 1=1;
