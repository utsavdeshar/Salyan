SELECT 
ifnull(SUM(IF(first_concept.age <12, 1, 0)),0)  AS "2 to 11 Month ",
ifnull(SUM(IF(first_concept.age >12 and first_concept.age<24, 1, 0)),0) AS "12 to 24 months"
FROM
(select 
o.person_id as id,
TIMESTAMPDIFF(month,person.birthdate,CURDATE()) AS age 
from obs o
inner join concept_name cn 
on o.concept_id=cn.concept_id
and cn.name in ('Death note-Primary cause of death' , 'Death note-Secondary cause of death', 'Death note-Tertiary cause of death')
inner join person
on o.person_id=person.person_id
where date(obs_datetime) between '#startDate#' and '#startDate#') first_concept