import type { Lesson, SqlLabData, TableStepsData, TSRow } from '../types'

const cols = ['id', 'customer', 'city', 'amount']
const all: (string | number)[][] = [
  [1, 'Aung', 'Yangon', 50],
  [2, 'Su', 'Mandalay', 15],
  [3, 'Kyaw', 'Yangon', 80],
  [4, 'Mya', 'Bago', 40],
  [5, 'Hla', 'Mandalay', 60],
  [6, 'Zaw', 'Yangon', 10],
  [7, 'Nilar', 'Mandalay', 90],
  [8, 'Thida', 'Taunggyi', 25],
]
const row = (r: (string | number)[], extra: Partial<TSRow> = {}): TSRow => ({ key: 'r' + r[0], cells: r, ...extra })
const groupOf: Record<string, number> = { Mandalay: 0, Yangon: 1, Bago: 2, Taunggyi: 3 }
const kept = all.filter((r) => (r[3] as number) >= 20)
// Groups appear in the order their city is first seen; ORDER BY later moves Mandalay to the top.
const appear = ['Yangon', 'Mandalay', 'Bago', 'Taunggyi']
const grouped = [...kept].sort((a, b) => appear.indexOf(a[2] as string) - appear.indexOf(b[2] as string))
const agg = (city: string, total: number, extra: Partial<TSRow> = {}): TSRow => ({
  key: 'g' + city,
  cells: [city, total],
  group: groupOf[city],
  ...extra,
})

const evaluation: TableStepsData = {
  title: 'Query တစ်ခုကို PostgreSQL က ဘယ်အစီအစဉ်နဲ့ တွက်လဲ',
  query: [
    { id: 'select', text: 'SELECT city, SUM(amount) AS total' },
    { id: 'from', text: 'FROM orders' },
    { id: 'where', text: 'WHERE amount >= 20' },
    { id: 'group', text: 'GROUP BY city' },
    { id: 'order', text: 'ORDER BY total DESC' },
    { id: 'limit', text: 'LIMIT 2;' },
  ],
  steps: [
    {
      clause: 'from',
      title: 'FROM: ဘယ် table ကနေ စမလဲ',
      note: 'ရေးတဲ့အခါ <code>SELECT</code> ကအရင်လာပေမဲ့ PostgreSQL က <code>FROM</code> ကနေ စတွက်တယ်။ <code>orders</code> table ထဲက row ၈ ခုလုံးက စမှတ်ပါ။',
      columns: cols,
      rows: all.map((r) => row(r)),
    },
    {
      clause: 'where',
      title: 'WHERE: row တစ်ခုချင်းစီကို စစ်ထုတ်တယ်',
      note: '<code>amount >= 20</code> မဟုတ်တဲ့ row ၂ ခု (Su နဲ့ Zaw) ပြုတ်သွားတယ်။ <code>WHERE</code> က group မဖွဲ့ခင် row တစ်ခုချင်းပေါ်မှာ အလုပ်လုပ်တာမို့ ဒီနေရာမှာ <code>SUM()</code> လို aggregate ကို သုံးလို့မရဘူး။',
      columns: cols,
      rows: all.map((r) => row(r, { out: (r[3] as number) < 20 })),
    },
    {
      clause: 'group',
      title: 'GROUP BY: တန်ဖိုးတူတဲ့ row တွေကို အုပ်စုဖွဲ့တယ်',
      note: 'ကျန်တဲ့ row ၆ ခုကို <code>city</code> တူရာ စုလိုက်တယ်။ အုပ်စု ၄ စု ဖြစ်သွားတယ်။ ဒီအဆင့်ပြီးရင် ရလဒ်ထဲမှာ <strong>အုပ်စုတစ်စုကို row တစ်ခု</strong>ပဲ ကျန်တော့မယ်။',
      columns: cols,
      rows: grouped.map((r) => row(r, { group: groupOf[r[2] as string] })),
    },
    {
      clause: 'select',
      title: 'SELECT: ပြမယ့် column တွေကို တွက်တယ်',
      note: 'အခုမှ <code>SELECT</code> အလှည့်ရောက်တယ်။ အုပ်စုတစ်စုစီအတွက် <code>SUM(amount)</code> ကိုတွက်ပြီး <code>total</code> လို့ နာမည်ပေးတယ်။ <code>total</code> ဆိုတဲ့နာမည်က ဒီအဆင့်မှာမှ ပေါ်လာတာမို့ <code>WHERE total > 100</code> လို့ရေးရင် error တက်တာပါ။',
      columns: ['city', 'total'],
      rows: [agg('Yangon', 130), agg('Mandalay', 150), agg('Bago', 40), agg('Taunggyi', 25)],
    },
    {
      clause: 'order',
      title: 'ORDER BY: ရလဒ်ကို စီတယ်',
      note: '<code>SELECT</code> ပြီးမှ run တာမို့ <code>total</code> ဆိုတဲ့ alias ကို ဒီမှာ သုံးလို့ရတယ်။ <code>ORDER BY</code> မပါရင် row တွေရဲ့ အစီအစဉ်ကို PostgreSQL က <strong>အာမမခံဘူး</strong>၊ ဒီနေ့ရတဲ့အစီအစဉ်နဲ့ မနက်ဖြန်ရတာ မတူနိုင်ဘူး။',
      columns: ['city', 'total'],
      rows: [agg('Mandalay', 150), agg('Yangon', 130), agg('Bago', 40), agg('Taunggyi', 25)],
    },
    {
      clause: 'limit',
      title: 'LIMIT: အပေါ်ဆုံးက လိုသလောက်ပဲ ယူတယ်',
      note: 'နောက်ဆုံးအဆင့်မှာ ပထမ ၂ ခုပဲ ချန်တယ်။ ဒါကြောင့် <code>LIMIT</code> ကို <code>ORDER BY</code> မပါဘဲသုံးရင် ဘယ် row တွေရမလဲ မသေချာဘူး။',
      columns: ['city', 'total'],
      rows: [agg('Mandalay', 150), agg('Yangon', 130), agg('Bago', 40, { out: true }), agg('Taunggyi', 25, { out: true })],
    },
  ],
}

const lab: SqlLabData = {
  id: 'lab-sql-basics',
  title: 'orders table ပေါ်မှာ ကိုယ်တိုင်ရေးကြည့်မယ်',
  schema: `CREATE TABLE orders (
  id        integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer  text    NOT NULL,
  city      text    NOT NULL,
  amount    integer NOT NULL CHECK (amount > 0),
  paid      boolean NOT NULL DEFAULT false
);`,
  seed: `CREATE TABLE orders (
  id        integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer  text    NOT NULL,
  city      text    NOT NULL,
  amount    integer NOT NULL CHECK (amount > 0),
  paid      boolean NOT NULL DEFAULT false
);
INSERT INTO orders (customer, city, amount, paid) VALUES
  ('Aung', 'Yangon', 50, true), ('Su', 'Mandalay', 15, true), ('Kyaw', 'Yangon', 80, false),
  ('Mya', 'Bago', 40, true), ('Hla', 'Mandalay', 60, false), ('Zaw', 'Yangon', 10, true),
  ('Nilar', 'Mandalay', 90, true), ('Thida', 'Taunggyi', 25, false);`,
  tasks: [
    {
      prompt: 'Mandalay မြို့က order တွေရဲ့ <code>customer</code> နဲ့ <code>amount</code> ကို ထုတ်ပါ။',
      starter: 'SELECT * FROM orders;',
      solution: "SELECT customer, amount FROM orders WHERE city = 'Mandalay';",
    },
    {
      prompt: 'ငွေမချေရသေးတဲ့ (<code>paid</code> က false) order တွေထဲက <code>amount</code> အများဆုံး ၂ ခုရဲ့ <code>id</code> နဲ့ <code>amount</code> ကို အများဆုံးကနေ စီပြီးထုတ်ပါ။',
      solution: 'SELECT id, amount FROM orders WHERE NOT paid ORDER BY amount DESC LIMIT 2;',
      ordered: true,
    },
    {
      prompt: 'မြို့တစ်မြို့စီမှာ order ဘယ်နှစ်ခုရှိလဲနဲ့ စုစုပေါင်း <code>amount</code> ဘယ်လောက်လဲ ထုတ်ပါ။ Column ၃ ခု: မြို့၊ အရေအတွက်၊ စုစုပေါင်း။',
      solution: 'SELECT city, COUNT(*), SUM(amount) FROM orders GROUP BY city;',
    },
    {
      prompt: 'စုစုပေါင်း <code>amount</code> က 100 ထက်များတဲ့ မြို့တွေကိုပဲ မြို့နာမည်နဲ့ စုစုပေါင်း ထုတ်ပါ။ (<code>WHERE</code> နဲ့ မရဘူး၊ ဘာကြောင့်လဲ အထက်က animation ကို ပြန်ကြည့်ပါ)',
      solution: 'SELECT city, SUM(amount) FROM orders GROUP BY city HAVING SUM(amount) > 100;',
    },
    {
      prompt: 'Zaw ရဲ့ order <code>amount</code> ကို 35 လို့ပြင်ပါ။ <code>WHERE</code> မထည့်မိရင် row အားလုံးပြောင်းသွားမယ်၊ သတိထားပါ။ မှားသွားရင် "Database ကို မူလအတိုင်းပြန်ထားမယ်" ကိုနှိပ်ပါ။',
      solution: "UPDATE orders SET amount = 35 WHERE customer = 'Zaw';",
      verify: "SELECT COUNT(*) FILTER (WHERE amount = 35), COUNT(*) FILTER (WHERE customer = 'Zaw' AND amount = 35) FROM orders",
      expect: [['1', '1']],
    },
    {
      prompt: 'Pathein မြို့က Wai ဆိုတဲ့ customer အတွက် amount 70 နဲ့ order အသစ်တစ်ခုထည့်ပြီး database ကထုတ်ပေးတဲ့ <code>id</code> ကို တစ်ခါတည်း ပြန်ယူပါ။',
      solution: "INSERT INTO orders (customer, city, amount) VALUES ('Wai', 'Pathein', 70) RETURNING id;",
      verify: "SELECT customer, city, amount::text, paid::text FROM orders WHERE customer = 'Wai'",
      expect: [['Wai', 'Pathein', '70', 'false']],
    },
  ],
}

export const sqlBasics: Lesson = {
  id: 'sql-basics',
  title: 'Table နဲ့ SQL အခြေခံ',
  summary:
    'ORM တွေက SQL ကို ဖုံးထားပေးပေမဲ့ query နှေးတဲ့အခါ၊ ဒေတာမှားတဲ့အခါ SQL ကိုပဲ ပြန်ကြည့်ရတယ်။ ဒီအခန်းမှာ browser ထဲက PostgreSQL အစစ်ပေါ်မှာ ကိုယ်တိုင် query ရေးမယ်။',
  minutes: 35,
  blocks: [
    {
      type: 'prose',
      html: `
<h2>PostgreSQL က ဒေတာကို ဘယ်လိုသိမ်းလဲ</h2>
<p>Relational database မှာ ဒေတာကို <span class="t-pg">table</span> တွေထဲ သိမ်းတယ်။ Table တစ်ခုမှာ <span class="t-pg">column</span> တွေ (ဘာအချက်အလက်တွေပါလဲ၊ ဘာ type လဲ) ကို ကြိုသတ်မှတ်ထားရပြီး ဒေတာတစ်ခုစီက <span class="t-pg">row</span> တစ်ခုဖြစ်တယ်။</p>
<p>MongoDB လို document database နဲ့ အဓိကကွာတာက <strong>schema ကို database ကိုယ်တိုင်က စောင့်ကြပ်ပေးတာ</strong>ပါ။ <code>amount</code> ကို integer လို့သတ်မှတ်ထားရင် စာသားထည့်လို့မရဘူး။ <code>NOT NULL</code> လို့ပြောထားရင် ဗလာထားလို့မရဘူး။ App code မှာ bug ရှိလည်း မှားတဲ့ဒေတာက database ထဲ ဝင်မလာနိုင်ဘူး။</p>`,
    },
    {
      type: 'code',
      lang: 'sql',
      file: 'orders.sql',
      code: `CREATE TABLE orders (
  id        integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,  -- database က 1, 2, 3… ထုတ်ပေးတယ်
  customer  text    NOT NULL,
  city      text    NOT NULL,
  amount    integer NOT NULL CHECK (amount > 0),               -- စည်းကမ်းကို database ထဲမှာ ရေးထားတာ
  paid      boolean NOT NULL DEFAULT false
);`,
    },
    {
      type: 'prose',
      html: `
<h3>အသုံးများတဲ့ data type တွေ</h3>
<table>
<thead><tr><th>Type</th><th>သုံးတဲ့နေရာ</th><th>မှတ်ချက်</th></tr></thead>
<tbody>
<tr><td><code>integer</code> / <code>bigint</code></td><td>ကိန်းပြည့်၊ id</td><td>Row သန်း ၂၀၀၀ ကျော်နိုင်ရင် <code>bigint</code></td></tr>
<tr><td><code>numeric(12,2)</code></td><td>ငွေကြေး</td><td><code>float</code> ကို ငွေအတွက် ဘယ်တော့မှမသုံးပါနဲ့၊ 0.1 + 0.2 ပြဿနာရှိတယ်</td></tr>
<tr><td><code>text</code></td><td>စာသား</td><td>PostgreSQL မှာ <code>varchar(n)</code> ထက် မနှေးဘူး</td></tr>
<tr><td><code>boolean</code></td><td>true / false</td><td></td></tr>
<tr><td><code>timestamptz</code></td><td>အချိန်</td><td>Time zone ပါတဲ့ဟာကို အမြဲသုံးပါ</td></tr>
<tr><td><code>uuid</code></td><td>ခန့်မှန်းမရတဲ့ id</td><td>URL မှာပေါ်မယ့် id တွေအတွက်</td></tr>
<tr><td><code>jsonb</code></td><td>ပုံစံမသေတဲ့ ဒေတာ</td><td>Index တင်လို့ရတယ်</td></tr>
</tbody>
</table>

<h2>ရေးတဲ့အစီအစဉ်နဲ့ တွက်တဲ့အစီအစဉ် မတူဘူး</h2>
<p>SQL ကို စသင်တဲ့သူတွေ အများဆုံး ခလုတ်တိုက်တာ ဒီနေရာပါ။ Query ကို <code>SELECT</code> ကနေစရေးရပေမဲ့ database က <code>FROM</code> ကနေ စတွက်တယ်။ ဒါကိုသိရင် "ဘာလို့ <code>WHERE</code> ထဲမှာ alias သုံးမရတာလဲ"၊ "<code>WHERE</code> နဲ့ <code>HAVING</code> ဘာကွာလဲ" ဆိုတာတွေ အလိုလိုရှင်းသွားတယ်။ <strong>နောက်အဆင့်</strong> ကိုနှိပ်ပြီး row တွေ ဘယ်လိုပြောင်းသွားလဲ ကြည့်ပါ။</p>`,
    },
    { type: 'tablesteps', data: evaluation },
    {
      type: 'prose',
      html: `
<p><code>HAVING</code> က ဒီ query ထဲမှာ မပါပေမဲ့ <code>GROUP BY</code> နဲ့ <code>SELECT</code> ကြားမှာ run တယ်။ <code>WHERE</code> က row တွေကို group မဖွဲ့ခင် စစ်ထုတ်ပြီး <code>HAVING</code> က group တွေကို ဖွဲ့ပြီးမှ စစ်ထုတ်တယ်။ အပြည့်အစုံက <strong>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</strong>။</p>

<h2>ဒေတာပြောင်းတဲ့ statement ၃ ခု</h2>`,
    },
    {
      type: 'code',
      lang: 'sql',
      file: 'write.sql',
      code: `INSERT INTO orders (customer, city, amount)
VALUES ('Wai', 'Pathein', 70)
RETURNING id;                       -- ထည့်လိုက်တဲ့ row ရဲ့ id ကို တစ်ခါတည်းပြန်ယူ

UPDATE orders SET paid = true
WHERE id = 3;                       -- WHERE မပါရင် row အားလုံး ပြောင်းသွားမယ်

DELETE FROM orders
WHERE id = 3
RETURNING *;                        -- ဖျက်လိုက်တဲ့ row ကို ပြန်ကြည့်`,
    },
    {
      type: 'note',
      tone: 'warn',
      html: '<code>NULL</code> က "တန်ဖိုးမသိ" လို့ ဆိုလိုတာမို့ <code>= NULL</code> နဲ့ နှိုင်းလို့မရဘူး၊ ရလဒ်က အမြဲ <code>NULL</code> ဖြစ်ပြီး row တစ်ခုမှ မထွက်ဘူး။ <code>IS NULL</code> / <code>IS NOT NULL</code> ကို သုံးရတယ်။',
    },
    {
      type: 'prose',
      html: `<h2>လက်တွေ့</h2>
<p>အောက်က editor က server ဆီ ဘာမှမပို့ပါဘူး။ PostgreSQL ကို WebAssembly အဖြစ် compile လုပ်ထားတဲ့ PGlite က ဒီ browser tab ထဲမှာပဲ run နေတာပါ။ ပထမဆုံး Run တဲ့အခါ download လုပ်ရလို့ စက္ကန့်အနည်းငယ် ကြာနိုင်တယ်။ စိတ်ကြိုက် query ရေးကြည့်လို့ရတယ်၊ ဖျက်မိလည်း ပြန်ထားလို့ရတယ်။</p>`,
    },
    { type: 'sql', lab },
  ],
}
