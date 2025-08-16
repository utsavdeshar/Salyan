SELECT
pi.identifier AS 'Patient_Id',
CONCAT_WS(' ', pn.given_name, pn.middle_name, pn.family_name) as 'Name',
TIMESTAMPDIFF(Year,p.birthdate,CURDATE()) AS 'Age in Year',
TIMESTAMPDIFF(Month,p.birthdate,CURDATE()) AS 'Age in Month',
p.gender as 'Gender',
pa.county_district as 'District',
pa.city_village as 'Municipality',
pa.address1 as 'Ward',
date(o.obs_datetime) as 'date_diagnosed',
cn.name as 'Diagnosis'
FROM
person p
INNER JOIN
patient_identifier pi ON p.person_id = pi.patient_id
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
inner join 
concept_name cn
on o.value_coded=cn.concept_id
and o.concept_id = '15' AND cn.name in ('Acute Gastro‐Enteritis (AGE)', 'Cholera, Unspecified', 'Dengue', 'Dengue fever [classical dengue]','Dengue haemorrhagic fever', 'Dengue, unspecified','Typhoid fever','Other parasitologically confirmed malaria','Unspecified malaria','SARI-Severe Acute Respiratory Infection','Diphtheria, unspecified','Unspecified jaundice','Meningitis due to other and unspecified causes','Measles') -- EDCD
where p.voided = '0'
and date(o.obs_datetime) between '#startDate#' and '#endDate#'
group by Patient_Id, Name, 'Age in Year','Age in Month', Gender, District, Municipality, Ward,  Diagnosis
ORDER BY date_diagnosed ASC;
