select
 -- Heart > 6200,8795,9274,9275,9285,9286,9289,9296,9297,9300,9326,9327,10256,10483,12694
IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in (6200,8795,9274,9275,9285,9286,9289,9296,9297,9300,9326,9327,10256,10483,12694) and result.gender = 'M', 1, 0))) as 'Heart Patient-Male' ,
IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in (6200,8795,9274,9275,9285,9286,9289,9296,9297,9300,9326,9327,10256,10483,12694) and result.gender = 'F', 1, 0))) as 'Heart Patient-Female',
-- Kidney > 5680,8825,8838,9832,9833,9834,10194,10195,10197,10524
IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in (5680,8825,8838,9832,9833,9834,10194,10195,10197,10524) and result.gender = 'M', 1, 0))) as 'Kidney Patient-Male' ,
IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in (5680,8825,8838,9832,9833,9834,10194,10195,10197,10524) and result.gender = 'F', 1, 0))) as 'Kidney Patient-Female',
-- cancer 
 IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in (29761,29899,29900) and result.gender = 'M', 1, 0))) as 'Cancer Patient-Male' ,
 IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in (29761,29899,29900) and result.gender = 'F', 1, 0))) as 'Cancer Patient-Female' ,
 -- Head Injury	> '2723','10565','10803'
 IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in ('2723','10565','10803') and result.gender = 'M', 1, 0))) as 'Head Injury Patient-Male' ,
 IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in ('2723','10565','10803') and result.gender = 'F', 1, 0))) as 'Head Injury Patient-Female' ,
 -- Spinal Injury > '10790','10791'
 IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in ('10790','10791') and result.gender = 'M', 1, 0))) as 'Spinal Injury Patient-Male' ,
 IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in ('10790','10791') and result.gender = 'F', 1, 0))) as 'Spinal Injury Patient-Female', 
-- Alzheimer > '2523','9025','9138'
IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in ('2523','9025','9138') and result.gender = 'M', 1, 0))) as 'Alzheimer Patient-Male' ,
 IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in ('2523','9025','9138') and result.gender = 'F', 1, 0))) as 'Alzheimer Patient-Female' ,
-- Parkinson > 6184,9030,9134,10824,11105,11120,11121,11171,11203
 IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in (6184,9030,9134,10824,11105,11120,11121,11171,11203) and result.gender = 'M', 1, 0))) as 'Parkinson Patient-Male' ,
 IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in (6184,9030,9134,10824,11105,11120,11121,11171,11203) and result.gender = 'F', 1, 0))) as 'Parkinson Patient-Female' ,
-- Sickle Cell Anaemia	 > 8926,8927
IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in (8926,8927) and result.gender = 'M', 1, 0))) as 'Sickle Cell Anaemia Patient-Male' ,
 IF(result.person_id IS NULL, 0, SUM(IF(result.value_coded in (8926,8927) and result.gender = 'F', 1, 0))) as 'Sickle Cell Anaemia Patient-Female' 

 From
(SELECT distinct
p.person_id,
p.gender,
o.value_coded,
(select name from concept_name where concept_id = o.value_coded AND
       o.voided IS FALSE and concept_name_type = 'FULLY_SPECIFIED' and voided = '0') as Diag
FROM
person p
INNER JOIN
patient_identifier pi ON p.person_id = pi.patient_id
AND pi.identifier != 'BAH200052'
AND pi.voided = '0'
INNER JOIN
visit v ON v.patient_id = p.person_id
INNER JOIN
obs o ON o.person_id = p.person_id
and o.voided = '0'
and o.concept_id = '15' AND o.value_coded in (29761,29899,29900,6200,8795,9274,9275,9285,9286,
9289,9296,9297,9300,9326,9327,10256,10483,12694,5680,8825,8838,9832,9833,9834,10194,10195,10197,
10524,'2723','10565','10803','10790','10791','2523','9025','9138',6184,9030,9134,10824,11105,11120,11121,11171,11203,8926,8927)
where p.voided = '0'
and date(o.obs_datetime) between '#startDate#' and '#endDate#') as result