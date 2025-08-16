select count(person_id) as "CBIMCI <2Months-Follow-Up"
from 
obs o
inner join concept_name cn
on o.concept_id=cn.concept_id
and o.voided=0
and cn.concept_name_type='FULLY_SPECIFIED'
inner join concept_name cn1
on o.value_coded=cn1.concept_id
and cn1.concept_name_type='FULLY_SPECIFIED'
and cn1.name='Follow up'
where cn.name ='Childhood Illness-<2 months, case'
And date(o.obs_datetime) between '#startDate#' and '#endDate#'