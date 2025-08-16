SELECT 
    raw_data.username,
    raw_data.department_sent_to,
    CASE
        WHEN ROUND(raw_data.copayment_fee, 1) = ROUND(0.10, 1) THEN COUNT(raw_data.person_id)
    END AS total_person_co_payment,
    CASE
        WHEN ROUND(raw_data.copayment_fee, 2) = 0.10 THEN (5 * COUNT(raw_data.person_id) )
    END AS co_payment_collection
FROM
    (SELECT 
        u.username,
            (SELECT 
                    cn.name
                FROM
                    concept_name cn
                WHERE
                    cn.concept_id = o.value_coded
                        AND cn.concept_name_type = 'FULLY_SPECIFIED'
                        AND cn.voided = 0) AS 'department_sent_to',
            v.copayment_fee,
            o.person_id,
            o.obs_datetime
    FROM
        obs o
    INNER JOIN encounter e ON e.encounter_id = o.encounter_id
    INNER JOIN visit v ON v.visit_id = e.visit_id AND v.voided = 0
    INNER JOIN users u ON u.user_id = o.creator
    WHERE
        o.concept_id = (SELECT 
                cn.concept_id
            FROM
                concept_name cn
            WHERE
                cn.concept_name_type = 'FULLY_SPECIFIED'
                    AND cn.voided = 0
                    AND cn.name = 'Department Sent To')
            AND DATE(o.obs_datetime) 
         --   BETWEEN '2024-2-16' AND '2024-02-16'
             BETWEEN CAST('#startDate#' AS DATE) AND CAST('#endDate#' AS DATE)
            AND o.voided = 0
            AND ROUND(v.copayment_fee, 1) = 0.1) raw_data
WHERE
    raw_data.department_sent_to = 'OPD'
GROUP BY raw_data.username , raw_data.department_sent_to
