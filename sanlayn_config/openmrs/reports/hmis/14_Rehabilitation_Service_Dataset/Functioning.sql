SELECT   
'RHS - Functioning' AS question,
ifnull(sum(if(raw_data.answer_full_name = 'RHS - Comprehension and interpretation',1,0)),0) as 'RHS - Comprehension and interpretation',
ifnull(sum(if(raw_data.answer_full_name = 'RHS - Critical thinking',1,0)),0) as 'RHS - Critical thinking',
ifnull(sum(if(raw_data.answer_full_name = 'RHS - Self care',1,0)),0) as 'RHS - Self care',
ifnull(sum(if(raw_data.answer_full_name = 'RHS - Intraction',1,0)),0) as 'RHS - Intraction',
ifnull(sum(if(raw_data.answer_full_name = 'RHS - Life activities',1,0)),0) as 'RHS - Life activities',
ifnull(sum(if(raw_data.answer_full_name = 'RHS - Participant',1,0)),0) as 'RHS - Participant'
FROM 
(select 
distinct o.person_id,
cn1.name AS answer_full_name
from obs o
inner join concept_name cn 
ON o.concept_id=cn.concept_id
AND cn.concept_name_type='FULLY_SPECIFIED'
AND cn.name = 'RHS - Functioning'
INNER JOIN concept_name cn1 
ON o.value_coded=cn1.concept_id
AND cn1.concept_name_type ='FULLY_SPECIFIED'
Where date(o.obs_datetime) between '#startDate#' AND	'#endDate#'
) raw_data