select 
cn.name,
IF(o.concept_id IS NULL, 0, SUM(1)) as 'Total'
from
concept_name cn
left join obs o 
on o.value_coded = cn.concept_id
and  date(o.obs_datetime) between '#startDate#' and '#endDate#' 
left join concept_name cn1 on cn1.concept_id = o.concept_id
 and cn1.concept_name_type = 'FULLY_SPECIFIED'
 and cn1.name = 'PNC-Visit number'
where  
 cn.name in ('PNC-First Visit','PNC-Second Visit','PNC-Third Visit','PNC-Fourth Visit')
GROUP BY cn.name
ORDER BY FIELD(cn.name,'PNC-First Visit','PNC-Second Visit','PNC-Third Visit','PNC-Fourth Visit')