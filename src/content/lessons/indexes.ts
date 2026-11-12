import type { Lesson, SqlLabData } from '../types'

const lab: SqlLabData = {
  id: 'lab-indexes',
  title: 'Row ၂ သိန်းပေါ်မှာ index ရဲ့ အကျိုးကို တိုင်းကြည့်မယ်',
  schema: `-- row 200,000 ပါတယ်
CREATE TABLE users (
  id     integer,
  email  text,     -- 'user1@mail.com' … 'user200000@mail.com'
  age    integer   -- 18 မှ 78
);`,
  seed: `CREATE TABLE users AS
SELECT g AS id, 'user' || g || '@mail.com' AS email, (18 + (g * 7919) % 61)::int AS age
FROM generate_series(1, 200000) AS g;
ANALYZE users;`,
  tasks: [
    {
      prompt:
        'Index မရှိသေးခင် အခြေအနေကို အရင်တိုင်းမယ်။ ပေးထားတဲ့ query ကို Run ပြီး ရလဒ်ထဲက <code>Seq Scan</code>၊ <code>Rows Removed by Filter</code> နဲ့ <code>Execution Time</code> ကို ရှာကြည့်ပါ။',
      starter: "EXPLAIN ANALYZE\nSELECT * FROM users WHERE email = 'user150000@mail.com';",
      solution: "EXPLAIN ANALYZE\nSELECT * FROM users WHERE email = 'user150000@mail.com';",
      match: 'Seq Scan on users',
    },
    {
      prompt: '<code>email</code> column ပေါ်မှာ index တစ်ခုဆောက်ပါ။ နာမည်ကို <code>idx_users_email</code> လို့ပေးပါ။',
      solution: 'CREATE INDEX idx_users_email ON users (email);',
      verify: "SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'users' AND indexdef LIKE '%(email)%'",
      expect: [['1']],
    },
    {
      prompt:
        'ပထမလေ့ကျင့်ခန်းက query ကိုပဲ ပြန် Run ပါ။ <code>Index Scan</code> ဖြစ်သွားရမယ်။ <code>Execution Time</code> ဘယ်နှစ်ဆ မြန်သွားလဲ နှိုင်းကြည့်ပါ။',
      starter: "EXPLAIN ANALYZE\nSELECT * FROM users WHERE email = 'user150000@mail.com';",
      solution: "EXPLAIN ANALYZE\nSELECT * FROM users WHERE email = 'user150000@mail.com';",
      match: 'Index (Only )?Scan',
    },
    {
      prompt:
        'Index ရှိတိုင်း သုံးတာမဟုတ်ဘူး။ <code>age</code> ပေါ်မှာ index ဆောက်ပြီး (<code>CREATE INDEX idx_users_age ON users (age);</code>) <code>WHERE age &gt; 20</code> နဲ့ရှာတဲ့ query ကို <code>EXPLAIN</code> လုပ်ကြည့်ပါ။ Statement နှစ်ခုလုံးကို တစ်ခါတည်း Run လို့ရတယ်။ Planner က ဘာလို့ <code>Seq Scan</code> ကိုပဲ ရွေးလဲ စဉ်းစားပါ။',
      starter: 'CREATE INDEX IF NOT EXISTS idx_users_age ON users (age);\n\nEXPLAIN SELECT * FROM users WHERE age > 20;',
      solution: 'CREATE INDEX IF NOT EXISTS idx_users_age ON users (age);\n\nEXPLAIN SELECT * FROM users WHERE age > 20;',
      match: 'Seq Scan on users',
    },
    {
      prompt:
        'Column ကို function ထဲထည့်လိုက်ရင် ရိုးရိုး index ကို သုံးလို့မရတော့ဘူး။ ပေးထားတဲ့ query ကို Run ကြည့်ပါ (<code>Seq Scan</code> ဖြစ်မယ်)။ ပြီးရင် <code>lower(email)</code> ပေါ်မှာ <strong>expression index</strong> ဆောက်ပြီး ပြန် Run ပါ။ Index ကိုသုံးတဲ့ plan ထွက်ရင် အောင်ပြီ။',
      starter: "EXPLAIN\nSELECT * FROM users WHERE lower(email) = 'user150000@mail.com';",
      solution:
        "CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));\n\nEXPLAIN\nSELECT * FROM users WHERE lower(email) = 'user150000@mail.com';",
      match: 'idx_users_email_lower',
    },
  ],
}

export const indexes: Lesson = {
  id: 'indexes-explain',
  title: 'Index နဲ့ EXPLAIN: query ဘာလို့နှေးလဲ ရှာမယ်',
  summary:
    'Development မှာ row ၁၀၀ နဲ့ မြန်နေတဲ့ API က production မှာ row သန်းချီလာတဲ့အခါ စက္ကန့်နဲ့ချီ ကြာသွားတတ်တယ်။ အကြောင်းရင်းက အများအားဖြင့် index မရှိတာပါ။ ဒီအခန်းမှာ အဲဒါကို မျက်စိနဲ့မြင်ပြီး ကိုယ်တိုင်တိုင်းကြည့်မယ်။',
  minutes: 35,
  blocks: [
    {
      type: 'prose',
      html: `
<h2>Index မရှိရင် PostgreSQL က ဘယ်လိုရှာလဲ</h2>
<p>စာအုပ်တစ်အုပ်ထဲက စကားလုံးတစ်လုံးကို ရှာတယ်ဆိုပါစို့။ နည်း ၂ နည်းရှိတယ်။ စာမျက်နှာ ၁ ကနေ အဆုံးထိ တစ်ရွက်ချင်းလှန်ရှာတာ၊ ဒါမှမဟုတ် နောက်ဆုံးက အညွှန်း (index) ကိုကြည့်ပြီး စာမျက်နှာကို တန်းသွားတာ။ Database လည်း အတူတူပဲ။</p>
<p>ရှာမယ့် id ကို slider နဲ့ရွေးပြီး နည်းနှစ်ခုကို ပြိုင်ခိုင်းကြည့်ပါ။</p>`,
    },
    { type: 'indexscan' },
    {
      type: 'prose',
      html: `
<h2>B-tree က ဘာလို့ မြန်တာလဲ</h2>
<p>PostgreSQL ရဲ့ default index အမျိုးအစားက <span class="t-pg">B-tree</span> ပါ။ Key တွေကို <strong>စီထားပြီးသား</strong> သစ်ပင်ပုံစံ သိမ်းထားတယ်။ အဆင့်တစ်ဆင့်ဆင်းတိုင်း ရှာစရာအပိုင်းက အများကြီးကျဉ်းသွားတယ်။ Page တစ်ခုထဲမှာ key ရာဂဏန်းဆံ့တာမို့ row သန်းရာချီရှိတဲ့ table မှာတောင် သစ်ပင်အမြင့်က ၃–၄ ဆင့်ပဲ ရှိတယ်။</p>
<p>စီထားပြီးသားမို့ B-tree က <code>=</code> တင်မက <code>&lt;</code>၊ <code>&gt;</code>၊ <code>BETWEEN</code>၊ <code>ORDER BY</code>၊ <code>LIKE 'abc%'</code> (ရှေ့ကစတဲ့ pattern) တွေအတွက်ပါ အသုံးဝင်တယ်။ <code>LIKE '%abc'</code> အတွက်တော့ မရဘူး၊ စာအုပ်အညွှန်းမှာ "c နဲ့ဆုံးတဲ့ စကားလုံး" ကို ရှာလို့မရသလိုပဲ။</p>

<h2>EXPLAIN က database ရဲ့ အစီအစဉ်ကို ပြတယ်</h2>
<p>Query တစ်ခုရဲ့ရှေ့မှာ <code>EXPLAIN</code> ထည့်လိုက်ရင် PostgreSQL က query ကို မ run ဘဲ ဘယ်လို run မလဲဆိုတဲ့ <strong>plan</strong> ကိုပြတယ်။ <code>EXPLAIN ANALYZE</code> ကတော့ တကယ် run ပြီး အချိန်အစစ်ပါ ပြတယ်။</p>`,
    },
    {
      type: 'code',
      lang: 'sql',
      file: 'explain output',
      code: `EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user150000@mail.com';

Seq Scan on users  (cost=0.00..3972.00 rows=1 width=27) (actual time=25.4..34.2 rows=1 loops=1)
  Filter: (email = 'user150000@mail.com'::text)
  Rows Removed by Filter: 199999        -- row တစ်ခုရဖို့ 199,999 ခုကို ဖတ်ပြီး လွှင့်ပစ်ရတယ်
Execution Time: 34.445 ms`,
    },
    {
      type: 'prose',
      html: `
<table>
<thead><tr><th>မြင်ရတာ</th><th>အဓိပ္ပာယ်</th></tr></thead>
<tbody>
<tr><td><code>Seq Scan</code></td><td>Table တစ်ခုလုံးကို ဖတ်တယ်။ Table သေးရင်၊ row အများစုကိုယူမှာဆိုရင် ဒါက မှန်တဲ့ရွေးချယ်မှု</td></tr>
<tr><td><code>Index Scan</code></td><td>Index ကနေရှာပြီး table ထဲက row ကို သွားယူတယ်</td></tr>
<tr><td><code>Index Only Scan</code></td><td>လိုတဲ့ column အားလုံး index ထဲမှာရှိလို့ table ကို မထိတော့ဘူး</td></tr>
<tr><td><code>Bitmap Heap Scan</code></td><td>Row အတော်များများကိုက်တဲ့အခါ index ကနေ တည်နေရာတွေစုပြီးမှ table ကို တစ်ခါတည်းဖတ်တယ်</td></tr>
<tr><td><code>cost=0.00..3972.00</code></td><td>Planner ရဲ့ ခန့်မှန်းကုန်ကျစရိတ် (ယူနစ်မရှိ)။ ဒုတိယဂဏန်းက စုစုပေါင်း</td></tr>
<tr><td><code>rows=1</code></td><td>ခန့်မှန်း row အရေအတွက်။ <code>actual … rows</code> နဲ့ အများကြီးကွာနေရင် statistics ဟောင်းနေတာ၊ <code>ANALYZE</code> လုပ်ပါ</td></tr>
</tbody>
</table>

<h2>Index က အလကားမရဘူး</h2>
<ul>
<li><strong>Write တိုင်း နှေးတယ်။</strong> <code>INSERT</code>၊ <code>UPDATE</code>၊ <code>DELETE</code> လုပ်တိုင်း index တိုင်းကိုပါ ပြင်ရတယ်။ Index ၁၀ ခုရှိတဲ့ table ထဲ row တစ်ခုထည့်ရင် နေရာ ၁၁ ခုမှာ ရေးရတယ်။</li>
<li><strong>နေရာယူတယ်။</strong> Index တွေက table ထက်တောင် ကြီးသွားတတ်တယ်။</li>
<li><strong>ရွေးချယ်မှုနည်းတဲ့ column မှာ အသုံးမဝင်ဘူး။</strong> <code>paid</code> လို true/false ပဲရှိတဲ့ column မှာ row တစ်ဝက်ကိုက်နေရင် index ကနေ တစ်ခုချင်းသွားယူတာထက် table တစ်ခုလုံးဖတ်တာက ပိုမြန်တယ်။ Planner က အဲဒါကိုသိလို့ index ကို လျစ်လျူရှုတယ်။</li>
</ul>

<h2>Composite index နဲ့ ဘယ်ဘက်ဆုံး စည်းမျဉ်း</h2>
<p>Column တစ်ခုထက်ပိုတဲ့ index ကို ဖုန်းလမ်းညွှန်စာအုပ်လို မြင်ကြည့်ပါ။ မျိုးရိုးနာမည်နဲ့အရင်စီ၊ ပြီးမှ နာမည်နဲ့စီထားတယ်။ မျိုးရိုးနာမည်သိရင် မြန်မြန်ရှာနိုင်တယ်၊ နာမည်တစ်ခုတည်းသိရင်တော့ တစ်အုပ်လုံးလှန်ရတယ်။</p>`,
    },
    {
      type: 'code',
      lang: 'sql',
      file: 'composite.sql',
      code: `CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- index ကို သုံးနိုင်တယ်
SELECT * FROM orders WHERE user_id = 42;
SELECT * FROM orders WHERE user_id = 42 AND created_at > now() - interval '7 days';
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 10;   -- sort လုပ်စရာတောင်မလိုဘူး

-- index ကို ကောင်းကောင်းသုံးလို့မရဘူး (ဘယ်ဘက်ဆုံး column မပါ)
SELECT * FROM orders WHERE created_at > now() - interval '7 days';`,
    },
    {
      type: 'note',
      tone: 'tip',
      html: 'ဘယ် column မှာ index တင်ရမလဲ မသေချာရင် ဒီ ၃ ခုက စပါ။ <code>WHERE</code> ထဲမှာ မကြာခဏပါတဲ့ column၊ <code>JOIN</code> လုပ်တဲ့ foreign key column (PostgreSQL က foreign key အတွက် index အလိုအလျောက် မဆောက်ပေးဘူး)၊ <code>ORDER BY</code> + <code>LIMIT</code> နဲ့ pagination လုပ်တဲ့ column။ <code>PRIMARY KEY</code> နဲ့ <code>UNIQUE</code> ကတော့ index အလိုအလျောက်ပါပြီးသား။',
    },
    {
      type: 'prose',
      html: `<h2>လက်တွေ့</h2>
<p>Row ၂ သိန်းပါတဲ့ table တစ်ခုကို browser ထဲမှာ ဆောက်ပေးထားတယ်။ လေ့ကျင့်ခန်းတွေကို အစဉ်လိုက်လုပ်ပါ၊ အရင်ဟာရဲ့ရလဒ်ပေါ်မှာ နောက်ဟာက ဆက်ဆောက်တာမို့ပါ။ ပြထားတဲ့ အချိန်တွေက သင့်စက်ပေါ်မူတည်ပြီး ကွာပါလိမ့်မယ်။</p>`,
    },
    { type: 'sql', lab },
  ],
}
