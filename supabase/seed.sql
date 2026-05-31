-- Demo 种子数据草案。
-- 如果 Supabase 项目中已有数据，请替换这里的固定 UUID。

insert into posts (id, hub_slug, author_name, author_plugin, title, content, created_at)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'math-modeling',
    'quant_seeker_y2',
    'Optimization Starter Pack',
    'How do I write a convincing sensitivity analysis section?',
    'Our model works on the baseline assumptions, but I am not sure how to prove it is robust. What variables should I perturb first, and how should I present the result in the paper?',
    now() - interval '2 days'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'business-analytics',
    'finance_builder_y3',
    'Regression Debugger',
    'My regression result is significant but feels meaningless. What should I check?',
    'I found a statistically significant relationship in my coursework dataset, but the coefficient seems too small to explain anything useful. How should I interpret this?',
    now() - interval '1 day'
  )
on conflict (id) do nothing;

insert into comments (post_id, author_name, content, is_ai_generated, created_at)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Y3 modeling mentor',
    'Start with the variables your conclusion depends on most. Do not perturb everything equally; rank assumptions by how directly they affect the final recommendation.',
    false,
    now() - interval '1 day'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'Oracle',
    'A good sensitivity section usually has three parts: identify key assumptions, perturb them within a justified range, and explain whether the decision changes. If the decision remains stable, you can claim robustness; if it changes, explain the threshold.',
    true,
    now() - interval '12 hours'
  );
