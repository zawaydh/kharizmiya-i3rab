-- فحص قراءة فقط: لا يغيّر الجداول أو البيانات أو السياسات.
-- شغّله بعد الترقية. يجب أن تكون الحالات OK وأعداد المخالفات صفرًا.

begin transaction read only;

with expected(table_name, column_name, expected_type) as (
  values
    ('progress', 'user_id', 'uuid'),
    ('progress', 'topic_code', 'text'),
    ('progress', 'level', 'integer'),
    ('progress', 'percent', 'integer'),
    ('progress', 'coverage', 'jsonb'),
    ('progress', 'practice_percent', 'integer'),
    ('progress', 'practice_coverage', 'jsonb'),
    ('progress', 'learn_completed', 'boolean'),
    ('progress', 'practice_completed', 'boolean'),
    ('progress', 'quiz_passed', 'boolean'),
    ('progress', 'quiz_score', 'integer'),
    ('progress', 'quiz_total', 'integer'),
    ('progress', 'certificate_earned_at', 'timestamp with time zone'),
    ('progress', 'updated_at', 'timestamp with time zone'),
    ('students', 'id', 'uuid'),
    ('students', 'full_name', 'text'),
    ('students', 'email', 'text'),
    ('students', 'pin_hash', 'text'),
    ('students', 'auth_user_id', 'uuid'),
    ('students', 'email_verified', 'boolean'),
    ('students', 'email_verified_at', 'timestamp with time zone'),
    ('students', 'created_at', 'timestamp with time zone'),
    ('students', 'updated_at', 'timestamp with time zone'),
    ('app_error_events', 'id', 'uuid'),
    ('app_error_events', 'user_id', 'uuid'),
    ('app_error_events', 'source', 'text'),
    ('app_error_events', 'message', 'text'),
    ('app_error_events', 'digest', 'text'),
    ('app_error_events', 'route', 'text'),
    ('app_error_events', 'user_agent', 'text'),
    ('app_error_events', 'created_at', 'timestamp with time zone')
), actual as (
  select table_name, column_name, data_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name in ('progress', 'students', 'app_error_events')
)
select
  'column' as check_group,
  e.table_name,
  e.column_name as item,
  e.expected_type,
  a.data_type as actual_value,
  case
    when a.column_name is null then 'MISSING'
    when a.data_type <> e.expected_type then 'TYPE_MISMATCH'
    else 'OK'
  end as status
from expected e
left join actual a using (table_name, column_name)
order by e.table_name, e.column_name;

select
  'rls' as check_group,
  c.relname as table_name,
  'row_level_security' as item,
  'enabled' as expected_type,
  case when c.relrowsecurity then 'enabled' else 'disabled' end as actual_value,
  case when c.relrowsecurity then 'OK' else 'RLS_DISABLED' end as status
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('progress', 'students', 'app_error_events')
  and c.relkind = 'r'
order by c.relname;

with expected_indexes(table_name, index_name) as (
  values
    ('progress', 'progress_user_topic_level_unique'),
    ('progress', 'progress_user_updated_at_idx'),
    ('students', 'students_email_unique_lower'),
    ('students', 'students_auth_user_id_unique'),
    ('app_error_events', 'app_error_events_created_at_idx'),
    ('app_error_events', 'app_error_events_user_created_at_idx')
)
select
  'index' as check_group,
  e.table_name,
  e.index_name as item,
  'present' as expected_type,
  case when i.indexname is null then 'missing' else 'present' end as actual_value,
  case when i.indexname is null then 'MISSING' else 'OK' end as status
from expected_indexes e
left join pg_indexes i
  on i.schemaname = 'public'
 and i.tablename = e.table_name
 and i.indexname = e.index_name
order by e.table_name, e.index_name;

with expected_policies(table_name, policy_name, command_name) as (
  values
    ('progress', 'Progress: read own', 'SELECT'),
    ('students', 'Students: read own', 'SELECT'),
    ('students', 'Students: insert own', 'INSERT'),
    ('students', 'Students: update own or claim old row', 'UPDATE')
)
select
  'policy' as check_group,
  e.table_name,
  e.policy_name as item,
  e.command_name as expected_type,
  coalesce(p.cmd, 'missing') as actual_value,
  case
    when p.policyname is null then 'MISSING'
    when p.cmd <> e.command_name then 'COMMAND_MISMATCH'
    else 'OK'
  end as status
from expected_policies e
left join pg_policies p
  on p.schemaname = 'public'
 and p.tablename = e.table_name
 and p.policyname = e.policy_name
order by e.table_name, e.policy_name;

select 'client_progress_write_policies' as check_name, count(*)::bigint as violation_count
from pg_policies
where schemaname = 'public'
  and tablename = 'progress'
  and cmd in ('INSERT', 'UPDATE', 'DELETE');

select 'client_progress_write_grants' as check_name, count(*)::bigint as violation_count
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'progress'
  and grantee in ('anon', 'authenticated')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE');

select 'client_error_event_grants' as check_name, count(*)::bigint as violation_count
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'app_error_events'
  and grantee in ('anon', 'authenticated');

select 'client_error_event_policies' as check_name, count(*)::bigint as violation_count
from pg_policies
where schemaname = 'public'
  and tablename = 'app_error_events';

select 'duplicate_progress_rows' as check_name, count(*)::bigint as violation_count
from (
  select user_id, topic_code, level
  from public.progress
  group by user_id, topic_code, level
  having count(*) > 1
) duplicates
union all
select 'invalid_percent', count(*)::bigint
from public.progress
where percent is null or percent < 0 or percent > 100
union all
select 'invalid_practice_percent', count(*)::bigint
from public.progress
where practice_percent is null or practice_percent < 0 or practice_percent > 100
union all
select 'invalid_coverage_json', count(*)::bigint
from public.progress
where coverage is null or jsonb_typeof(coverage) <> 'array'
union all
select 'invalid_practice_coverage_json', count(*)::bigint
from public.progress
where practice_coverage is null or jsonb_typeof(practice_coverage) <> 'array'
union all
select 'invalid_quiz_score', count(*)::bigint
from public.progress
where quiz_score < 0
   or quiz_total < 0
   or (quiz_score is not null and quiz_total is not null and quiz_score > quiz_total)
union all
select 'null_required_progress_values', count(*)::bigint
from public.progress
where practice_percent is null
   or learn_completed is null
   or practice_completed is null
   or quiz_passed is null
   or updated_at is null
union all
select 'eligible_without_certificate_date', count(*)::bigint
from public.progress
where certificate_earned_at is null
  and (learn_completed = true or percent >= 100)
  and (practice_completed = true or practice_percent >= 100)
  and (
    quiz_passed = true
    or (quiz_total > 0 and quiz_score is not null and quiz_score::numeric / quiz_total::numeric >= 0.80)
  )
union all
select 'students_without_email', count(*)::bigint
from public.students
where email is null or trim(email) = ''
union all
select 'duplicate_student_emails', count(*)::bigint
from (
  select lower(trim(email))
  from public.students
  where email is not null and trim(email) <> ''
  group by lower(trim(email))
  having count(*) > 1
) duplicate_emails
union all
select 'duplicate_student_auth_users', count(*)::bigint
from (
  select auth_user_id
  from public.students
  where auth_user_id is not null
  group by auth_user_id
  having count(*) > 1
) duplicate_auth_users
order by check_name;

select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename in ('progress', 'students', 'app_error_events')
order by tablename, indexname;

select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('progress', 'students', 'app_error_events')
order by tablename, policyname;

-- بوابة حاسمة لـpsql وCI: لا يكفي عرض النتائج؛ أي مخالفة تنهي الأمر بخطأ.
do $verification$
declare
  failures text[] := array[]::text[];
begin
  if to_regclass('public.progress') is null
    or to_regclass('public.students') is null
    or to_regclass('public.app_error_events') is null then
    raise exception 'SCHEMA_VERIFICATION_FAILED:missing_required_table'
      using errcode = 'check_violation';
  end if;

  if exists (
    with expected(table_name, column_name, expected_type) as (
      values
        ('progress', 'user_id', 'uuid'),
        ('progress', 'topic_code', 'text'),
        ('progress', 'level', 'integer'),
        ('progress', 'percent', 'integer'),
        ('progress', 'coverage', 'jsonb'),
        ('progress', 'practice_percent', 'integer'),
        ('progress', 'practice_coverage', 'jsonb'),
        ('progress', 'learn_completed', 'boolean'),
        ('progress', 'practice_completed', 'boolean'),
        ('progress', 'quiz_passed', 'boolean'),
        ('progress', 'quiz_score', 'integer'),
        ('progress', 'quiz_total', 'integer'),
        ('progress', 'certificate_earned_at', 'timestamp with time zone'),
        ('progress', 'updated_at', 'timestamp with time zone'),
        ('students', 'id', 'uuid'),
        ('students', 'full_name', 'text'),
        ('students', 'email', 'text'),
        ('students', 'pin_hash', 'text'),
        ('students', 'auth_user_id', 'uuid'),
        ('students', 'email_verified', 'boolean'),
        ('students', 'email_verified_at', 'timestamp with time zone'),
        ('students', 'created_at', 'timestamp with time zone'),
        ('students', 'updated_at', 'timestamp with time zone'),
        ('app_error_events', 'id', 'uuid'),
        ('app_error_events', 'user_id', 'uuid'),
        ('app_error_events', 'source', 'text'),
        ('app_error_events', 'message', 'text'),
        ('app_error_events', 'digest', 'text'),
        ('app_error_events', 'route', 'text'),
        ('app_error_events', 'user_agent', 'text'),
        ('app_error_events', 'created_at', 'timestamp with time zone')
    )
    select 1
    from expected e
    left join information_schema.columns c
      on c.table_schema = 'public'
     and c.table_name = e.table_name
     and c.column_name = e.column_name
    where c.column_name is null or c.data_type <> e.expected_type
  ) then
    failures := array_append(failures, 'columns');
  end if;

  if exists (
    select 1
    from (values ('progress'), ('students'), ('app_error_events')) expected(table_name)
    left join pg_class c on c.relname = expected.table_name and c.relkind = 'r'
    left join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
    where c.oid is null or n.oid is null or not c.relrowsecurity
  ) then
    failures := array_append(failures, 'rls');
  end if;

  if exists (
    with expected(table_name, index_name) as (
      values
        ('progress', 'progress_user_topic_level_unique'),
        ('progress', 'progress_user_updated_at_idx'),
        ('students', 'students_email_unique_lower'),
        ('students', 'students_auth_user_id_unique'),
        ('app_error_events', 'app_error_events_created_at_idx'),
        ('app_error_events', 'app_error_events_user_created_at_idx')
    )
    select 1
    from expected e
    left join pg_indexes i
      on i.schemaname = 'public'
     and i.tablename = e.table_name
     and i.indexname = e.index_name
    where i.indexname is null
  ) then
    failures := array_append(failures, 'indexes');
  end if;

  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'progress') <> 1
    or not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'progress'
        and policyname = 'Progress: read own' and cmd = 'SELECT'
    ) then
    failures := array_append(failures, 'progress_policies');
  end if;

  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'students') <> 3
    or exists (
      with expected(policy_name, command_name) as (
        values
          ('Students: read own', 'SELECT'),
          ('Students: insert own', 'INSERT'),
          ('Students: update own or claim old row', 'UPDATE')
      )
      select 1
      from expected e
      left join pg_policies p
        on p.schemaname = 'public'
       and p.tablename = 'students'
       and p.policyname = e.policy_name
       and p.cmd = e.command_name
      where p.policyname is null
    ) then
    failures := array_append(failures, 'student_policies');
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_error_events'
  ) then
    failures := array_append(failures, 'error_event_policies');
  end if;

  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'progress'
      and grantee in ('anon', 'authenticated')
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
  ) then
    failures := array_append(failures, 'progress_write_grants');
  end if;

  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'app_error_events'
      and grantee in ('anon', 'authenticated')
  ) then
    failures := array_append(failures, 'error_event_grants');
  end if;

  if exists (
    select 1 from public.progress
    group by user_id, topic_code, level
    having count(*) > 1
  )
  or exists (
    select 1 from public.progress
    where percent is null or percent < 0 or percent > 100
       or practice_percent is null or practice_percent < 0 or practice_percent > 100
       or coverage is null or jsonb_typeof(coverage) <> 'array'
       or practice_coverage is null or jsonb_typeof(practice_coverage) <> 'array'
       or learn_completed is null or practice_completed is null or quiz_passed is null
       or updated_at is null
       or quiz_score < 0 or quiz_total < 0
       or (quiz_score is not null and quiz_total is not null and quiz_score > quiz_total)
  ) then
    failures := array_append(failures, 'progress_data');
  end if;

  if exists (
    select 1 from public.progress
    where certificate_earned_at is null
      and (learn_completed = true or percent >= 100)
      and (practice_completed = true or practice_percent >= 100)
      and (
        quiz_passed = true
        or (quiz_total > 0 and quiz_score is not null and quiz_score::numeric / quiz_total::numeric >= 0.80)
      )
  ) then
    failures := array_append(failures, 'certificate_dates');
  end if;

  if exists (
    select 1 from public.students where email is null or trim(email) = ''
  )
  or exists (
    select 1 from public.students
    where auth_user_id is not null
    group by auth_user_id
    having count(*) > 1
  )
  or exists (
    select 1 from public.students
    where email is not null and trim(email) <> ''
    group by lower(trim(email))
    having count(*) > 1
  ) then
    failures := array_append(failures, 'student_data');
  end if;

  if cardinality(failures) > 0 then
    raise exception 'SCHEMA_VERIFICATION_FAILED:%', array_to_string(failures, ',')
      using errcode = 'check_violation';
  end if;

  raise notice 'SCHEMA_VERIFICATION_OK';
end
$verification$;

commit;
