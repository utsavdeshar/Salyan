    SELECT 
        count(DISTINCT o.person_id) AS 'vaccine after 24 months'
    FROM obs o
    INNER JOIN concept_name cn 
        ON o.concept_id = cn.concept_id
        AND cn.name = 'Vaccine start from 24-59 month'
        AND o.value_coded = 1
        AND date(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#'

