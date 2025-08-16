select
pi.identifier AS 'ID',
CONCAT_WS(' ', pn.given_name, pn.middle_name, pn.family_name) as 'Name',
TIMESTAMPDIFF(Year,p.birthdate,CURDATE()) AS age,
p.gender,
pa.city_village as 'VDC',
pa.address1 as 'Ward',
pa.county_district as 'District'
from visit v
inner join person p on p.person_id=v.patient_id
inner join patient_identifier pi on pi.patient_id=v.patient_id
inner join person_address pa on pa.person_id=v.patient_id
inner join person_name pn on pn.person_id=v.patient_id
where TIMESTAMPDIFF(Year,p.birthdate,CURDATE()) > 60  and date(v.date_created) between '#startDate#' and '#endDate#'
