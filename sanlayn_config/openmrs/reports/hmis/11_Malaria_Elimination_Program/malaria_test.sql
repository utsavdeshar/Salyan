select 
coalesce(sum(raw_data.total_count1),0) as Blood_sample_collect_PCD,
coalesce(sum(raw_data.negative),0) as RDT_only_total_test,
coalesce(sum(raw_data.positive),0) as Microscopy_and_RDT_total_test,
coalesce(sum(raw_data.positive),0) as Microscopy_and_RDT_total_positive_test
from (SELECT DISTINCT
  ts.name       AS dep,
  t.name        AS test,
  count(r.id)   AS total_count1,
  CASE WHEN t.id IN (SELECT test_id FROM clinlims.test_result WHERE tst_rslt_type = 'D') THEN count(r1.id) ELSE NULL END AS positive,
  CASE WHEN t.id IN (SELECT test_id FROM clinlims.test_result WHERE tst_rslt_type = 'D') THEN count(r2.id) ELSE NULL END AS negative
FROM clinlims.test_section ts
  INNER JOIN clinlims.test t ON ts.id = t.test_section_id AND t.is_active = 'Y'
  LEFT OUTER JOIN clinlims.analysis a ON t.id = a.test_id
  LEFT OUTER JOIN clinlims.result r ON a.id = r.analysis_id and cast(r.lastupdated as date) BETWEEN '#startDate#' AND '#endDate#' and r.value != ''
  LEFT OUTER JOIN clinlims.result r1 ON r1.result_type = 'D' and r1.value != '' and r.id=r1.id and r1.abnormal=true
  LEFT OUTER JOIN clinlims.result r2 on r2.result_type = 'D' and r2.value != '' and r.id=r2.id and r2.abnormal=false
  WHERE t.name IN ('MP Serology','Malaria Abs','Malaria Ags')
GROUP BY ts.name, t.name, t.id
order by ts.name)raw_data