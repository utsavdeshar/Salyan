select
   lmt.department as department,
   lmt.dhis2_test_name as test_name,
   COALESCE(SUM(raw_data.total_count), 0) AS total,
   COALESCE(SUM(raw_data.positive), 0) AS positive,
   COALESCE(SUM(raw_data.negative), 0) AS negative
from
   lab_map_test lmt 
   left join
      (
         SELECT DISTINCT
            ts.name AS department,
            t.name AS name,
            count(r.id) AS total_count,
            CASE
               WHEN
                  t.id IN 
                  (
                     SELECT
                        test_id 
                     FROM
                        clinlims.test_result 
                     WHERE
                        tst_rslt_type = 'D' 
                  )
               THEN
                  count(r1.id) 
               ELSE
                  NULL 
            END
            AS positive, 
            CASE
               WHEN
                  t.id IN 
                  (
                     SELECT
                        test_id 
                     FROM
                        clinlims.test_result 
                     WHERE
                        tst_rslt_type = 'D' 
                  )
               THEN
                  count(r2.id) 
               ELSE
                  NULL 
            END
            AS negative 
         FROM
            clinlims.test_section ts 
            INNER JOIN
               clinlims.test t 
               ON ts.id = t.test_section_id 
               AND t.is_active = 'Y' 
            LEFT OUTER JOIN
               clinlims.analysis a 
               ON t.id = a.test_id 
            LEFT OUTER JOIN
               clinlims.result r 
               ON a.id = r.analysis_id 
               and cast(r.lastupdated as date) BETWEEN '#startDate#' AND '#endDate#' 
               and r.value != '' 
            LEFT OUTER JOIN
               clinlims.result r1 
               ON r1.result_type = 'D' 
               and r1.value != '' 
               and r.id = r1.id 
               and r1.abnormal = true 
            LEFT OUTER JOIN
               clinlims.result r2 
               on r2.result_type = 'D' 
               and r2.value != '' 
               and r.id = r2.id 
               and r2.abnormal = false 
         WHERE
            ts.name = 'Parasitology Department' 
         GROUP BY
            ts.name, t.name, t.id 
      )
      raw_data 
      on lmt.ehr_test_name = raw_data.name 
      and lmt.department = raw_data.department 
where
   lmt.department = 'Parasitology Department' 
   and lmt.is_active = 'Y' 
group by
   lmt.department , lmt.dhis2_test_name 
order by
   CASE
      when
         lmt.dhis2_test_name = 'STOOL RE' 
      THEN
         1 
      when
         lmt.dhis2_test_name = 'OCCULT BLOOD' 
      THEN
         2 
      when
         lmt.dhis2_test_name = 'REDUCING SUGAR' 
      THEN
         3 
      when
         lmt.dhis2_test_name = 'URINE RE' 
      THEN
         4 
      when
         lmt.dhis2_test_name = 'BILE SALTS' 
      THEN
         5 
      when
         lmt.dhis2_test_name = 'BILE PIGMENTS' 
      THEN
         6 
      when
         lmt.dhis2_test_name = 'UROBILINOGEN ' 
      THEN
         7 
         when
         lmt.dhis2_test_name = 'PORPHOBILINOGEN' 
      THEN
         8
      when
         lmt.dhis2_test_name = 'ACETONE' 
      THEN
         9 
      when
         lmt.dhis2_test_name = 'CHYLE' 
      THEN
         10 
         when
         lmt.dhis2_test_name = 'SPECIFIC GRAVITY' 
      THEN
         11
         when
         lmt.dhis2_test_name = 'BENCE JONES PROTIEN' 
      THEN
         12
      when
         lmt.dhis2_test_name = 'SEMEN ANLYSIS' 
      THEN
         13 
      when
         lmt.dhis2_test_name = 'OTHER' 
      THEN
         14
   END