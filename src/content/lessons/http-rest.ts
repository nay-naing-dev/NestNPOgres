import type { FlowScene, Lesson } from '../types'

const scene: FlowScene = {
  title: 'HTTP request တစ်ခု သွားပြီးပြန်လာပုံ',
  width: 760,
  height: 130,
  nodes: [
    { id: 'client', label: 'Client', sub: 'browser / mobile app', x: 10, y: 38, w: 170, kind: 'client' },
    { id: 'api', label: 'API server', sub: 'NestJS', x: 295, y: 38, w: 170, kind: 'nest' },
    { id: 'db', label: 'PostgreSQL', sub: 'database', x: 580, y: 38, w: 170, kind: 'pg' },
  ],
  edges: [
    ['client', 'api'],
    ['api', 'db'],
  ],
  scenarios: [
    {
      id: 'ok',
      label: 'GET အောင်မြင်',
      steps: [
        {
          at: 'client',
          title: 'Client က request ကို တည်ဆောက်တယ်',
          note: 'Request တစ်ခုမှာ အပိုင်း ၄ ပိုင်းပါတယ်။ <code>GET</code> ဆိုတဲ့ method၊ <code>/users/42</code> ဆိုတဲ့ path၊ header တွေ၊ ပြီးတော့ (ရှိရင်) body။ GET မှာ body မပါပါဘူး။',
          lang: 'http',
          code: 'GET /users/42 HTTP/1.1\nHost: api.example.com\nAccept: application/json\nAuthorization: Bearer eyJhbGciOi...',
        },
        {
          from: 'client',
          to: 'api',
          packet: 'GET /users/42',
          title: 'Request က network ပေါ်ကနေ server ဆီ သွားတယ်',
          note: 'DNS က domain ကို IP address ပြောင်းပေးပြီး၊ TCP connection (HTTPS ဆိုရင် TLS ပါ) ပေါ်ကနေ စာသားအဖြစ် ပို့တာပါ။ Server က port တစ်ခုမှာ (ဥပမာ 3000) နားထောင်နေတယ်။',
        },
        {
          at: 'api',
          title: 'Server က method နဲ့ path ကိုကြည့်ပြီး handler ရွေးတယ်',
          note: 'ဒါကို <strong>routing</strong> လို့ခေါ်တယ်။ <code>GET /users/:id</code> နဲ့ကိုက်တဲ့ function ကိုရှာပြီး <code>id = "42"</code> ကို parameter အဖြစ် ထုတ်ပေးတယ်။ URL ထဲကလာတာမှန်သမျှ string ပဲဆိုတာ သတိထားပါ။',
        },
        {
          from: 'api',
          to: 'db',
          packet: 'SELECT … id = 42',
          tone: 'data',
          title: 'Server က database ကို မေးတယ်',
          note: 'Server ကိုယ်တိုင်က ဒေတာကို မသိမ်းထားပါဘူး။ Request တိုင်းအတွက် database ဆီက လိုတာကို သွားယူတယ်။ ဒီခရီးက request တစ်ခုမှာ အချိန်အကြာဆုံးအပိုင်း ဖြစ်တတ်တယ်။',
          lang: 'sql',
          code: 'SELECT id, name, email FROM users WHERE id = 42;',
        },
        {
          from: 'db',
          to: 'api',
          packet: '1 row',
          tone: 'data',
          title: 'Database က row တစ်ခု ပြန်ပေးတယ်',
          note: 'PostgreSQL က ရလဒ်ကို row တွေအဖြစ် ပြန်ပေးတယ်။ Server က ဒါကို JavaScript object အဖြစ် ပြောင်းယူတယ်။',
        },
        {
          from: 'api',
          to: 'client',
          packet: '200 OK',
          tone: 'res',
          title: 'Server က status code နဲ့ JSON ကို ပြန်ပို့တယ်',
          note: 'Response မှာ status code၊ header နဲ့ body ပါတယ်။ <code>200</code> က "အောင်မြင်တယ်၊ ဒီမှာ မင်းတောင်းတာ" လို့ ဆိုလိုတယ်။',
          lang: 'http',
          code: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{ "id": 42, "name": "Aye Aye", "email": "aye@example.com" }',
        },
      ],
    },
    {
      id: 'notfound',
      label: 'မရှိတဲ့ id (404)',
      steps: [
        {
          from: 'client',
          to: 'api',
          packet: 'GET /users/999',
          title: 'မရှိတဲ့ user ကို တောင်းတယ်',
          note: 'Request ပုံစံက မှန်တယ်။ ဒါပေမဲ့ id 999 ဆိုတဲ့ user က database ထဲမှာ မရှိဘူး။',
        },
        {
          from: 'api',
          to: 'db',
          packet: 'SELECT … id = 999',
          tone: 'data',
          title: 'Server က database ကို မေးကြည့်တယ်',
          note: 'ရှိမရှိကို server က ကြိုမသိနိုင်ဘူး။ မေးကြည့်မှ သိတာ။',
        },
        {
          from: 'db',
          to: 'api',
          packet: '0 rows',
          tone: 'data',
          title: 'Database က row မရှိဘူးလို့ ပြန်ဖြေတယ်',
          note: 'ဒါက database error မဟုတ်ဘူး။ Query က အောင်မြင်တယ်၊ ရလဒ်က ဗလာဖြစ်နေတာပါ။ ဘာလုပ်ရမလဲ ဆုံးဖြတ်ရမှာက server ရဲ့တာဝန်။',
        },
        {
          from: 'api',
          to: 'client',
          packet: '404 Not Found',
          tone: 'err',
          title: 'Server က 404 ပြန်တယ်',
          note: '<code>200</code> နဲ့ <code>null</code> ပြန်တာ မလုပ်ပါနဲ့။ Client က status code ကိုကြည့်ပြီး ဘာဖြစ်လဲ သိနိုင်ရမယ်။ <code>4xx</code> ဆိုတာ "client ဘက်က တောင်းတာ မှားတယ်" လို့ ဆိုလိုတယ်။',
          lang: 'http',
          code: 'HTTP/1.1 404 Not Found\nContent-Type: application/json\n\n{ "statusCode": 404, "message": "User 999 not found" }',
        },
      ],
    },
    {
      id: 'invalid',
      label: 'Body မှားတဲ့ POST (400)',
      steps: [
        {
          at: 'client',
          title: 'Client က email မပါတဲ့ body ပို့မယ်',
          note: 'User အသစ်ဆောက်ဖို့ <code>POST /users</code> ကို သုံးတယ်။ ဒီတစ်ခါ body ထဲမှာ <code>email</code> ကျန်ခဲ့တယ်။',
          lang: 'http',
          code: 'POST /users HTTP/1.1\nContent-Type: application/json\n\n{ "name": "Kyaw Kyaw" }',
        },
        {
          from: 'client',
          to: 'api',
          packet: 'POST /users',
          title: 'Request က server ဆီ ရောက်တယ်',
          note: 'Server က body ကို JSON အဖြစ် parse လုပ်ပြီး လိုအပ်တဲ့ field တွေ ပါမပါ၊ type မှန်မမှန် စစ်တယ်။ ဒါကို <strong>validation</strong> လို့ခေါ်တယ်။',
        },
        {
          at: 'api',
          title: 'Validation မအောင်ဘူး၊ database ဆီ မသွားတော့ဘူး',
          note: 'မှားနေတဲ့ ဒေတာကို database ထိ မရောက်ခင် အစောဆုံးနေရာမှာ တားတာ အကောင်းဆုံးပဲ။ NestJS မှာ ဒီအလုပ်ကို <strong>pipe</strong> က လုပ်ပေးတယ်။ နောက်သင်ခန်းစာမှာ တွေ့ရမယ်။',
        },
        {
          from: 'api',
          to: 'client',
          packet: '400 Bad Request',
          tone: 'err',
          title: 'Server က 400 နဲ့ ဘာမှားလဲ ပြန်ပြောတယ်',
          note: 'Error response ကောင်းတစ်ခုက ဘယ် field က ဘာကြောင့်မှားလဲ ပြောပြတယ်။ Client developer က ဒါကိုကြည့်ပြီး ပြင်နိုင်ရမယ်။',
          lang: 'http',
          code: 'HTTP/1.1 400 Bad Request\nContent-Type: application/json\n\n{ "statusCode": 400, "message": ["email must be an email"] }',
        },
      ],
    },
  ],
}

export const httpRest: Lesson = {
  id: 'http-rest',
  title: 'HTTP နဲ့ REST API အလုပ်လုပ်ပုံ',
  summary:
    'Express နဲ့ route ရေးဖူးပြီးသားဆိုရင် ဒီအခန်းက အမြန်ပြန်နွှေးတာပါ။ နောက်အခန်းတွေက ဒီအခြေခံပေါ်မှာ ဆောက်မှာမို့ request တစ်ခုရဲ့ ခရီးစဉ်ကို သေချာမြင်ထားပါ။',
  minutes: 15,
  blocks: [
    {
      type: 'prose',
      html: `
<p>Backend ဆိုတာ အနှစ်ချုပ်ရရင် <strong>request လက်ခံ၊ ဒေတာကို ဖတ်/ပြင်၊ response ပြန်ပေး</strong> ဆိုတဲ့ အလုပ်တစ်ခုတည်းကို အကြိမ်သန်းပေါင်းများစွာ လုပ်နေတာပါ။ NestJS ကလည်း၊ PostgreSQL ကလည်း ဒီအလုပ်ကို စနစ်တကျ၊ ယုံကြည်ရအောင် လုပ်ဖို့ ကိရိယာတွေပါပဲ။</p>
<p>အောက်က animation မှာ <strong>ဖွင့်မယ်</strong> ကိုနှိပ်ပြီး request တစ်ခု သွားပြီးပြန်လာတာကို ကြည့်ပါ။ အပေါ်က scenario ခလုတ်တွေနဲ့ အမှားဖြစ်တဲ့အခါ ဘယ်လိုကွာသွားလဲ ပြောင်းကြည့်ပါ။</p>`,
    },
    { type: 'flow', scene },
    {
      type: 'prose',
      html: `
<h2>HTTP method တွေက ရည်ရွယ်ချက်ကို ပြောတယ်</h2>
<p>Path က <em>ဘာကို</em> (resource) လို့ပြောပြီး method က <em>ဘာလုပ်မလဲ</em> လို့ပြောတယ်။</p>
<table>
<thead><tr><th>Method</th><th>ရည်ရွယ်ချက်</th><th>ဥပမာ</th><th>Idempotent</th></tr></thead>
<tbody>
<tr><td><code>GET</code></td><td>ဖတ်မယ်</td><td><code>GET /tasks</code></td><td>ဟုတ်</td></tr>
<tr><td><code>POST</code></td><td>အသစ်ဆောက်မယ်</td><td><code>POST /tasks</code></td><td>မဟုတ်</td></tr>
<tr><td><code>PUT</code></td><td>တစ်ခုလုံး အစားထိုးမယ်</td><td><code>PUT /tasks/7</code></td><td>ဟုတ်</td></tr>
<tr><td><code>PATCH</code></td><td>တစ်စိတ်တစ်ပိုင်း ပြင်မယ်</td><td><code>PATCH /tasks/7</code></td><td>အာမမခံ</td></tr>
<tr><td><code>DELETE</code></td><td>ဖျက်မယ်</td><td><code>DELETE /tasks/7</code></td><td>ဟုတ်</td></tr>
</tbody>
</table>
<p><strong>Idempotent</strong> ဆိုတာ တူညီတဲ့ request ကို တစ်ကြိမ်ပို့ပို့၊ ဆယ်ကြိမ်ပို့ပို့ server ပေါ်က အခြေအနေ အတူတူပဲ ဖြစ်တာကို ဆိုလိုတယ်။ Network ပြတ်လို့ client က ထပ်ပို့တဲ့အခါ ဒါက အရေးကြီးလာတယ်။ <code>POST /payments</code> ကို နှစ်ခါပို့မိရင် ငွေနှစ်ခါဖြတ်သွားနိုင်တာကြောင့် အဲဒီလိုနေရာတွေမှာ idempotency key သုံးကြတယ်။ ဒါကို အဆင့်မြင့်အခန်းမှာ ပြန်တွေ့မယ်။</p>

<h2>Status code တွေကို အုပ်စုလိုက်မှတ်ပါ</h2>
<table>
<thead><tr><th>အုပ်စု</th><th>အဓိပ္ပာယ်</th><th>အသုံးများတာ</th></tr></thead>
<tbody>
<tr><td><code>2xx</code></td><td>အောင်မြင်တယ်</td><td><code>200</code> OK၊ <code>201</code> Created၊ <code>204</code> No Content</td></tr>
<tr><td><code>3xx</code></td><td>တခြားနေရာကို သွားပါ</td><td><code>301</code>၊ <code>304</code> Not Modified</td></tr>
<tr><td><code>4xx</code></td><td>Client ဘက်က မှားတယ်</td><td><code>400</code>၊ <code>401</code>၊ <code>403</code>၊ <code>404</code>၊ <code>409</code>၊ <code>422</code>၊ <code>429</code></td></tr>
<tr><td><code>5xx</code></td><td>Server ဘက်က မှားတယ်</td><td><code>500</code>၊ <code>502</code>၊ <code>503</code></td></tr>
</tbody>
</table>
<p>လူတွေ အရောဆုံးက <code>401</code> နဲ့ <code>403</code> ပါ။ <code>401</code> က "မင်းဘယ်သူလဲ ငါမသိဘူး" (login မဝင်ရသေး/token မမှန်)၊ <code>403</code> က "မင်းဘယ်သူလဲ ငါသိတယ်၊ ဒါပေမဲ့ မင်းမှာ ခွင့်ပြုချက်မရှိဘူး" ပါ။</p>

<h2>REST ဆိုတာ URL ကို resource အလိုက် စီတဲ့ စည်းကမ်း</h2>
<ul>
<li>Path မှာ <strong>noun အများကိန်း</strong> သုံးပါ။ <code>/tasks</code>၊ <code>/users/42/tasks</code>။ <code>/getTasks</code>၊ <code>/createTask</code> လို verb မထည့်ပါနဲ့၊ verb က method ထဲမှာ ရှိပြီးသား။</li>
<li>Filter၊ sort၊ page တွေကို <strong>query string</strong> နဲ့ပို့ပါ။ <code>GET /tasks?status=open&amp;page=2</code>။</li>
<li>Server က <strong>stateless</strong> ဖြစ်ရမယ်။ Request တစ်ခုချင်းစီမှာ လိုအပ်တာအားလုံး (ဥပမာ token) ပါလာရမယ်။ Server memory ထဲမှာ "ဒီ user က login ဝင်ထားတယ်" လို့ မှတ်မထားဘူး။ ဒါမှ server ကို အလုံးရေတိုးပြီး scale လုပ်လို့ရတယ်။</li>
</ul>`,
    },
    {
      type: 'note',
      tone: 'tip',
      html: 'နောက်အခန်းတွေက code တွေကို စမ်းဖို့ <code>curl</code> ဒါမှမဟုတ် VS Code ရဲ့ REST Client / Thunder Client extension တစ်ခုခု အဆင်သင့်ထားပါ။ Windows မှာ PowerShell ရဲ့ <code>curl</code> က alias ဖြစ်နေလို့ <code>curl.exe</code> လို့ရိုက်ပါ။',
    },
    {
      type: 'challenge',
      data: {
        id: 'ch-rest-design',
        title: 'စာကြည့်တိုက် API တစ်ခုကို စာရွက်ပေါ်မှာ ဒီဇိုင်းဆွဲပါ',
        brief:
          '<p>Code မရေးသေးပါဘူး။ စာအုပ် (book) နဲ့ ငှားရမ်းမှု (loan) ဆိုတဲ့ resource နှစ်ခုပါတဲ့ စာကြည့်တိုက်စနစ်အတွက် endpoint စာရင်းကို ချရေးကြည့်ပါ။ Endpoint တစ်ခုစီအတွက် method၊ path၊ အောင်မြင်ရင်ပြန်မယ့် status code နဲ့ ဖြစ်နိုင်တဲ့ error status code ကို ရေးပါ။</p>',
        requirements: [
          'စာအုပ်အားလုံးကို စာရေးသူအလိုက် filter လုပ်ပြီး ကြည့်လို့ရတယ်',
          'စာအုပ်တစ်အုပ်ချင်းကို ကြည့်၊ အသစ်ထည့်၊ ပြင်၊ ဖျက် လုပ်လို့ရတယ်',
          'စာအုပ်တစ်အုပ်ကို ငှားတဲ့ endpoint ရှိတယ် (ငှားပြီးသားစာအုပ်ဆို ဘာ status ပြန်မလဲ စဉ်းစားပါ)',
          'User တစ်ယောက် ငှားထားတဲ့ စာအုပ်စာရင်းကို ကြည့်လို့ရတယ်',
          'Path တွေထဲမှာ verb မပါဘူး',
        ],
        hints: [
          'ငှားရမ်းမှုကို resource တစ်ခုအဖြစ် မြင်ကြည့်ပါ။ "စာအုပ်ငှားတယ်" ဆိုတာ "loan အသစ်တစ်ခု ဆောက်တယ်" နဲ့ အတူတူပဲ။',
          'ငှားပြီးသားစာအုပ်ကို ထပ်ငှားတာက request ပုံစံမမှားဘူး၊ လက်ရှိအခြေအနေနဲ့ ပဋိပက္ခဖြစ်တာ။ <code>409 Conflict</code> က အဲဒီအတွက်ပါ။',
        ],
        solution: [
          {
            file: 'library-api.http',
            lang: 'http',
            code: `GET    /books?author=Mya+Than+Tint   200
GET    /books/:id                    200 | 404
POST   /books                        201 | 400
PATCH  /books/:id                    200 | 400 | 404
DELETE /books/:id                    204 | 404

POST   /loans   { "bookId": 12 }     201 | 400 | 404 (စာအုပ်မရှိ) | 409 (ငှားပြီးသား)
PATCH  /loans/:id  { "returned": true }   200 | 404
GET    /users/:id/loans              200 | 404`,
          },
        ],
      },
    },
  ],
}
