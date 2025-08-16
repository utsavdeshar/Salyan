SELECT 
ifnull(SUM(IF(first_concept.age <8, 1, 0)),0)  AS "0-7 days ",
ifnull(SUM(IF(first_concept.age >7 and first_concept.age<29, 1, 0)),0) AS "8-28 days",
ifnull(SUM(IF(first_concept.age >28 and first_concept.age<60, 1, 0)),0) AS "29-59 days"
FROM
(select 
o.person_id as id,
TIMESTAMPDIFF(day,person.birthdate,CURDATE()) AS age 
from obs o
inner join concept_name cn 
on o.concept_id=cn.concept_id
and cn.name in ('Death Note, Primary Cause of Death' , 'Death Note, Secondary Cause of Death', 'Death Note, Tertiary Cause of Death')
inner join person
on o.person_id=person.person_id
where date(obs_datetime) between '#startDate#' and '#startDate#') first_concept