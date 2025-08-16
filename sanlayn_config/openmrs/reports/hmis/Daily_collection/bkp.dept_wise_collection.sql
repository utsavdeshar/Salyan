select 
u.username,
sum(if(o.value_coded='20044',1,0)) as 'Free Patient',
sum(if(o.value_coded='20045',1,0)) as 'Follow-up patient',
sum(if(o.value_coded='20046',1,0)) as 'OPD Patient',
sum(if(o.value_coded='20047',1,0)) as 'ER Patient',
sum(if(o.value_coded='20045',5,0)) as 'Follow-up Collection',
sum(if(o.value_coded='20046',40,0)) as 'OPD Collection',
sum(if(o.value_coded='20047',60,0)) as 'ER Collection',
sum(if(o.value_coded='20045',5,0))+sum(if(o.value_coded='20046',40,0))+sum(if(o.value_coded='20047',60,0)) as 'Total Collection'
from obs o
inner join users u
on u.user_id = o.creator
where o.concept_id=20048 and date(o.obs_datetime) between '#startDate#' and '#endDate#' and o.value_coded in (20044,20046,20046,20047)
group by u.username
