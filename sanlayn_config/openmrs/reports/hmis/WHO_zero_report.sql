SELECT concat("Week - ", week(o.obs_datetime)) As 'Week No',cn.name as 'Disease Name', count(cn.name) as 'Disease Count'
FROM obs o
  INNER JOIN concept_name cn
    ON cn.concept_id = o.value_coded AND cn.name in('Viral pneumonia, unspecified','Tetanus neonatorum', 'AFP', 'Measles') AND cn.concept_name_type = 'FULLY_SPECIFIED' AND
       cn.voided IS FALSE and date(o.obs_datetime) between '#startDate#' and '#endDate#'
                Group by week(o.obs_datetime),cn.name Desc;