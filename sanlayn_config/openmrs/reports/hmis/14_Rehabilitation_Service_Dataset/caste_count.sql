SELECT 
SUM(IF(final.caste = "1 - Dalit",1,0)) AS "Dalit",
SUM(IF(final.caste = "2 - Janajati",1,0)) AS "Janajati",
SUM(IF(final.caste = "3 - Madhesi",1,0)) AS "Madhesi",
SUM(IF(final.caste = "4 - Muslim",1,0)) AS "Muslim",
SUM(IF(final.caste = "5 - Brahman/Chhetri",1,0)) AS "Brahman/Chhetri",
SUM(IF(final.caste = "6 - Others",1,0)) AS "Others"

FROM
(select  
distinct nonVoidedQuestionObs.person_id,
cn.name AS "caste"

from nonVoidedQuestionObs 
 Inner join person p on p.person_id = nonVoidedQuestionObs.person_id
 inner join person_attribute pa on pa.person_id = p.person_id and pa.person_attribute_type_id = 13
 inner join concept_name cn on cn.concept_id = pa.value and cn.concept_name_type = 'FULLY_SPECIFIED'
 
where
 question_full_name in ('Rehabitation service (RHS) note')
AND DATE(obs_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#')
) AS final ;