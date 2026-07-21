-- فحص قراءة فقط: لا يغيّر الجداول أو البيانات أو السياسات.
-- شغّله في SQL Editor لمقارنة قاعدة الإنتاج بالمخطط الذي يعتمد عليه الكود.

with expected(table_name, column_name, expected_type) as (
  values
    ('progress', 'user_id', 'uuid'),
    ('progress', 'topic_code', 'text'),
    ('progress', 'level', 'integer'),
    ('progress', 'percent', 'integer'),
    ('progress', 'coverage', 'ARRAY'),
    ('progress', 'practice_percent', 'integer'),
    ('progress', 'practice_coverage', 'ARRAY'),
    ('progress', 'learn_completed', 'boolean'),
    ('progress', 'practice_completed', 'boolean'),
    ('progress', 'quiz_passed', 'boolean'),
    ('progress', 'quiz_score', 'integer'),
    ('progress', 'quiz_total', 'integer'),
    ('progress', 'updated_at', 'timestamp with time zone'),
    ('students', 'id', 'uuid'),
    ('students', 'full_name', 'text'),
    ('students', 'email', 'text'),
    ('students', 'pin_hash', 'text'),
    ('students', 'auth_user_id', 'uuid'),
    ('students', 'email_verified', 'boolean'),
    ('students', 'email_verified_at', 'timestamp with time zone'),
    ('students', 'created_at', 'timestamp with time zone'),
    ('students', 'updated_at', 'timestamp with time zone')
), actual as (
  select table_name, column_name, data_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name in ('progress', 'students')
)
select
  e.table_name,
  e.column_name,
  e.expected_type,
  a.data_type as actual_type,
  case
    when a.column_name is null then 'MISSING'
    when a.data_type <> e.expected_type then 'TYPE_MISMATCH'
    else 'OK'
  end as status
from expected e
left join actual a using (table_name, column_name)
order by e.table_name, e.column_name;

-- عرض المفاتيح والفهارس والسياسات الحالية للمراجعة فقط.
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename in ('progress', 'students')
order by tablename, indexname;

select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('progress', 'students')
order by tablename, policyname;
