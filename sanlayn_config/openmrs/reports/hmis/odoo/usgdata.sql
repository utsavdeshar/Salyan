select 
raw.category,
sum(raw.qty)
from
(
select 
case when AI.type = 'out_refund' then -AIL.quantity else AIL.quantity end as qty ,
PC."name" as category  
from
((account_invoice  AI left join account_invoice_line AIL
        on AI.id= AIL.invoice_id)
    left join
        product_template PT
        on PT.id = AIL.product_id)
        left join product_category PC
        on PC.id= PT.categ_id
  where 
  AI.date_invoice >= '#startDate#' and
  AI.date_invoice <= '#endDate#' and
AI.state in('paid','open') and 
PC.id in (153,9,4)
) raw
group by raw.category