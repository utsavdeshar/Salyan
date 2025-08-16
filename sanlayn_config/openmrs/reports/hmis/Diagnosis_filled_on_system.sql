
SELECT
pi.identifier AS 'IP',
CONCAT_WS(' ', pn.given_name, pn.middle_name, pn.family_name) as 'Name',
TIMESTAMPDIFF(Year,p.birthdate,CURDATE()) AS age,
p.gender,
pa.city_village as 'VDC',
if(o.concept_id=15,'Coded Diagnosis','Non Coded Diagnosis') as'Diagnosis type',
date(o.obs_datetime) as 'date_diagnosed',
pa.address1 as 'Ward',
pa.county_district as 'District',
l.name AS 'Department Visit',
(select name from concept_name where concept_id = o.value_coded AND
       o.voided IS FALSE and concept_name_type = 'FULLY_SPECIFIED' and voided = '0') as 'Coded Diagnosis',
o.value_text as 'Non-Coded Diagnosis',
u.username as User
FROM
person p
INNER JOIN
patient_identifier pi ON p.person_id = pi.patient_id
-- AND pi.identifier != 'CKT100208'
AND pi.voided = '0'
INNER JOIN
person_name pn ON pn.person_id = p.person_id
AND pn.voided = '0'
INNER JOIN
person_address pa ON pa.person_id = pn.person_id
AND pa.voided = '0'
INNER JOIN
visit v ON v.patient_id = p.person_id
INNER JOIN
obs o ON o.person_id = p.person_id
and o.voided = '0'
-- Coded / Non Coded
and o.concept_id in ('14','15') 
INNER JOIN users u
on o.creator=u.user_id
inner join location l 
on o.location_id=l.location_id
where p.voided = '0'
and date(o.obs_datetime) between '#startDate#' and '#endDate#'
group by IP, Name, age, gender, VDC, Ward, District, 'Coded Diagnosis'
ORDER BY date_diagnosed ASC;
