select count(distinct(o.person_id)) from obs o
inner join concept_name as cn 
on o.concept_id=cn.concept_id and cn.voided='0'
and date(o.obs_datetime) between '#startDate#' and '#endDate#' and cn.name='Delivery note'