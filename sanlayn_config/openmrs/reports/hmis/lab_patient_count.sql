SELECT SUM(monthly_patient_count) AS "Lab Patient Count"
FROM (
    SELECT DATE_TRUNC('month', lastupdated) AS month,
           COUNT(DISTINCT patient_id) AS monthly_patient_count
    FROM sample_human
    WHERE lastupdated BETWEEN DATE '#startDate#' AND DATE '#endDate#'
    GROUP BY DATE_TRUNC('month', lastupdated)
) AS monthly_data;

