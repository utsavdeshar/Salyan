select distinct
pi.identifier as 'Patient ID',
concat_ws(' ', pn.given_name,pn.middle_name,pn.family_name) as 'Patient Name',
u.username as 'Register By',
cn.name as 'Fee Information'
from obs o 
inner join person_name pn 
on o.person_id=pn.person_id
inner join users u
on u.user_id=o.creator
inner join concept_name cn
on o.value_coded=cn.concept_id
AND cn.concept_name_type='FULLY_SPECIFIED'
inner join 
patient_identifier pi
on o.person_id=pi.patient_id
where o.concept_id=20048 and date(o.obs_datetime) between '#startDate#' and '#endDate#' and o.value_coded in (20044,20046,20046,20047)