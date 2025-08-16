select
count(p.person_id) as 'More than >60 Patient'
from visit v
inner join person p on p.person_id=v.patient_id
where TIMESTAMPDIFF(Year,p.birthdate,CURDATE()) > 60  and date(v.date_created) between '#startDate#' and '#endDate#'
