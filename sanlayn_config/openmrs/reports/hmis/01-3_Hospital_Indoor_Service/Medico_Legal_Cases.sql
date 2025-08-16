SELECT 
    IFNULL(SUM(IF(final.Gender = 'F', 1, 0)),0) AS Female_Count,
    IFNULL(SUM(IF(final.Gender = 'M', 1, 0)),0) AS Male_Count
FROM
(
    SELECT 
        DISTINCT o.person_id AS id,
        p.gender AS Gender
    FROM obs o
    INNER JOIN concept_name cn 
        ON o.concept_id = cn.concept_id
        AND cn.name = 'OPD-Gender based violence'
        AND o.value_coded = 1
    INNER JOIN person p 
        ON o.person_id = p.person_id
        AND date(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#'
) AS final;
