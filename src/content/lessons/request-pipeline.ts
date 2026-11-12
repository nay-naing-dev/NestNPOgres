import type { FlowScene, FlowStep, Lesson } from '../types'

const enter: FlowStep[] = [
  {
    from: 'client',
    to: 'mw',
    packet: 'POST /tasks',
    title: 'Middleware က အရင်ဆုံး လက်ခံတယ်',
    note: 'Express middleware နဲ့ အတူတူပါပဲ။ <code>req</code> နဲ့ <code>res</code> ကိုပဲ မြင်ရပြီး ဒီ request က ဘယ် controller ရဲ့ ဘယ် method ဆီသွားမလဲ <em>မသိဘူး</em>။ Request ID ထည့်တာ၊ CORS၊ body parsing လို ယေဘုယျအလုပ်တွေအတွက် သင့်တော်တယ်။',
    code: `@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.headers['x-request-id'] ??= randomUUID();
    next(); // မခေါ်ရင် request က ဒီမှာပဲ ရပ်နေမယ်
  }
}`,
  },
  {
    from: 'mw',
    to: 'guard',
    packet: 'POST /tasks',
    title: 'Guard က ဝင်ခွင့်ရှိမရှိ ဆုံးဖြတ်တယ်',
    note: 'Guard ရဲ့အလုပ်က မေးခွန်းတစ်ခုတည်း။ <strong>ဒီ request ကို ဆက်သွားခွင့်ပေးမလား။</strong> <code>true</code> ပြန်ရင် ဆက်သွားမယ်၊ <code>false</code> ပြန်ရင် သို့မဟုတ် exception ပစ်ရင် ရပ်မယ်။ Middleware နဲ့မတူတာက <code>ExecutionContext</code> ကနေတစ်ဆင့် ဘယ် handler ဆီသွားမလဲ သိတာ၊ ဒါကြောင့် <code>@Roles(\'admin\')</code> လို metadata ကိုဖတ်ပြီး ဆုံးဖြတ်နိုင်တယ်။',
    code: `@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.headers['x-api-key'] !== process.env.API_KEY) {
      throw new UnauthorizedException('API key မမှန်ပါ');
    }
    return true;
  }
}`,
  },
]

const scene: FlowScene = {
  title: 'Request တစ်ခုက NestJS ထဲမှာ ဖြတ်သွားရတဲ့ အလွှာများ',
  width: 800,
  height: 290,
  nodes: [
    { id: 'client', label: 'Client', x: 10, y: 24, kind: 'client' },
    { id: 'mw', label: 'Middleware', sub: 'use()', x: 170, y: 24, kind: 'nest' },
    { id: 'guard', label: 'Guard', sub: 'canActivate()', x: 330, y: 24, kind: 'nest' },
    { id: 'int', label: 'Interceptor', sub: 'intercept()', x: 490, y: 24, kind: 'nest' },
    { id: 'pipe', label: 'Pipe', sub: 'transform()', x: 650, y: 24, kind: 'nest' },
    { id: 'ctrl', label: 'Controller', sub: 'route handler', x: 650, y: 210, kind: 'nest' },
    { id: 'svc', label: 'Service', sub: 'business logic', x: 490, y: 210, kind: 'nest' },
    { id: 'pg', label: 'PostgreSQL', x: 330, y: 210, kind: 'pg' },
    { id: 'filter', label: 'Exception filter', sub: 'catch()', x: 10, y: 210, w: 150, kind: 'nest' },
  ],
  edges: [
    ['client', 'mw'],
    ['mw', 'guard'],
    ['guard', 'int'],
    ['int', 'pipe'],
    ['pipe', 'ctrl'],
    ['ctrl', 'svc'],
    ['svc', 'pg'],
    ['ctrl', 'int', 'quiet'],
    ['guard', 'filter', 'quiet'],
    ['pipe', 'filter', 'quiet'],
    ['filter', 'client', 'quiet'],
  ],
  scenarios: [
    {
      id: 'ok',
      label: 'အောင်မြင်တဲ့ request',
      steps: [
        ...enter,
        {
          from: 'guard',
          to: 'int',
          packet: 'POST /tasks',
          title: 'Interceptor ရဲ့ "အရင်" အပိုင်း run တယ်',
          note: 'Interceptor က handler ကို <strong>ဝိုင်းပတ်ထားတယ်</strong>။ <code>next.handle()</code> မခေါ်ခင်ရေးတဲ့ code က handler မတိုင်ခင် run ပြီး၊ <code>.pipe(...)</code> ထဲက code က handler ပြီးမှ run တယ်။ ဒီမှာ အချိန်စမှတ်လိုက်တယ်။',
          code: `@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const startedAt = Date.now();               // handler မတိုင်ခင်

    return next.handle().pipe(
      tap(() => {                               // handler ပြီးမှ
        console.log(req.method, req.url, Date.now() - startedAt, 'ms');
      }),
    );
  }
}`,
        },
        {
          from: 'int',
          to: 'pipe',
          packet: '{ title: "…" }',
          title: 'Pipe က handler ရဲ့ argument တွေကို ပြောင်း/စစ်တယ်',
          note: 'Pipe က handler ကိုပေးမယ့် argument တစ်ခုချင်းစီပေါ်မှာ အလုပ်လုပ်တယ်။ အလုပ် ၂ မျိုးရှိတယ်။ <strong>transform</strong> (<code>"42"</code> ကို <code>42</code> ပြောင်း၊ JSON object ကို DTO class instance ပြောင်း) နဲ့ <strong>validate</strong> (မမှန်ရင် <code>400</code> ပစ်)။',
          code: `export class CreateTaskDto {
  @IsString()
  @Length(3, 80)
  title: string;

  @IsOptional()
  @IsInt() @Min(1) @Max(3)
  priority?: number;
}

// main.ts မှာ တစ်ခါတည်း global သတ်မှတ်
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));`,
        },
        {
          from: 'pipe',
          to: 'ctrl',
          packet: 'CreateTaskDto',
          title: 'Controller method က စစ်ပြီးသား ဒေတာကို ရတယ်',
          note: 'ဒီနေရာရောက်ရင် ဝင်ခွင့်လည်းစစ်ပြီးပြီ၊ ဒေတာလည်းမှန်ပြီ။ ဒါကြောင့် controller က ပါးပါးလေးပဲ ဖြစ်သင့်တယ်၊ service ကိုလှမ်းခေါ်ပြီး ရလဒ်ကို return လုပ်ရုံပဲ။',
          code: `@Post()
create(@Body() dto: CreateTaskDto) {
  return this.tasks.create(dto);
}`,
        },
        {
          from: 'ctrl',
          to: 'svc',
          packet: 'create(dto)',
          title: 'Service က business logic ကို လုပ်တယ်',
          note: 'Service က HTTP အကြောင်း ဘာမှမသိသင့်ဘူး။ <code>req</code>၊ <code>res</code> ကို မကိုင်ဘူး။ ဒါမှ တူညီတဲ့ service ကို queue worker၊ cron job၊ WebSocket gateway တွေကနေလည်း ပြန်သုံးလို့ရတယ်။',
        },
        {
          from: 'svc',
          to: 'pg',
          packet: 'INSERT',
          tone: 'data',
          title: 'Database ထဲ သိမ်းတယ်',
          note: 'Service က repository/ORM ကနေတစ်ဆင့် PostgreSQL ကို query ပို့တယ်။',
          lang: 'sql',
          code: "INSERT INTO tasks (title, priority) VALUES ($1, $2) RETURNING *;",
        },
        {
          from: 'pg',
          to: 'svc',
          packet: '1 row',
          tone: 'data',
          title: 'သိမ်းလိုက်တဲ့ row ပြန်ရတယ်',
          note: '<code>RETURNING *</code> ကြောင့် database က ထုတ်ပေးတဲ့ <code>id</code>၊ <code>created_at</code> တွေပါ တစ်ခါတည်း ပြန်ရတယ်။ Query နောက်တစ်ခါ ထပ်ပို့စရာမလိုဘူး။',
        },
        {
          from: 'svc',
          to: 'ctrl',
          packet: 'Task',
          tone: 'res',
          title: 'Service က Task ကို return လုပ်တယ်',
          note: 'Controller method က object တစ်ခုကို return လုပ်လိုက်ရုံပဲ။ <code>res.json()</code> ခေါ်စရာမလိုဘူး၊ Nest က JSON ပြောင်းပေးတယ်။',
        },
        {
          from: 'ctrl',
          to: 'int',
          packet: 'Task',
          tone: 'res',
          title: 'Interceptor ရဲ့ "ပြီးမှ" အပိုင်း run တယ်',
          note: 'Response က interceptor ကို ပြန်ဖြတ်တယ်။ ဒီနေရာမှာ ကြာချိန်ကို log ထုတ်တာ၊ response ပုံစံကို <code>{ data: ... }</code> အဖြစ် ထုပ်ပေးတာ၊ cache ထဲသိမ်းတာတွေ လုပ်နိုင်တယ်။',
          code: `return next.handle().pipe(
  map((data) => ({ data })),   // response အားလုံးကို ပုံစံတူအောင် ထုပ်
);`,
        },
        {
          from: 'int',
          to: 'client',
          packet: '201 Created',
          tone: 'res',
          title: 'Client ဆီ response ပြန်ရောက်တယ်',
          note: 'အစီအစဉ်ကို ပြန်ချုပ်ရင် <strong>Middleware → Guard → Interceptor (အရင်) → Pipe → Handler → Interceptor (ပြီးမှ)</strong>။ လမ်းမှာ exception တစ်ခုခုပစ်ရင် Exception filter ဆီရောက်မယ်။ တခြား scenario နှစ်ခုကို ကြည့်ပါ။',
        },
      ],
    },
    {
      id: 'unauth',
      label: 'Guard က ပယ်ချတယ် (401)',
      steps: [
        ...enter,
        {
          from: 'guard',
          to: 'filter',
          packet: 'UnauthorizedException',
          tone: 'err',
          title: 'Guard က exception ပစ်တယ်',
          note: 'API key မပါလို့ guard က <code>UnauthorizedException</code> ပစ်လိုက်တယ်။ Interceptor၊ pipe၊ controller၊ service တစ်ခုမှ <strong>မ run တော့ဘူး</strong>။ Database ကိုလည်း မထိဘူး။ ခွင့်မပြုတဲ့ request ကို အစောဆုံး ဖြတ်ချတာက စျေးအသက်သာဆုံးပဲ။',
        },
        {
          from: 'filter',
          to: 'client',
          packet: '401 Unauthorized',
          tone: 'err',
          title: 'Exception filter က error ကို response အဖြစ် ပြောင်းတယ်',
          note: 'Nest မှာ built-in filter တစ်ခုပါပြီးသားမို့ <code>HttpException</code> အမျိုးအစားတွေကို သင့်တော်တဲ့ status code နဲ့ JSON အဖြစ် အလိုအလျောက်ပြောင်းပေးတယ်။ ပုံစံကို ကိုယ်တိုင်ထိန်းချင်ရင် filter ကိုယ်ပိုင်ရေးတယ်။',
          code: `@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const status = exception.getStatus();

    ctx.getResponse<Response>().status(status).json({
      statusCode: status,
      message: exception.message,
      path: ctx.getRequest<Request>().url,
      timestamp: new Date().toISOString(),
    });
  }
}`,
        },
      ],
    },
    {
      id: 'invalid',
      label: 'Validation မအောင် (400)',
      steps: [
        ...enter,
        {
          from: 'guard',
          to: 'int',
          packet: 'POST /tasks',
          title: 'Guard ကိုဖြတ်ပြီး interceptor ထဲဝင်တယ်',
          note: 'API key မှန်လို့ guard က ခွင့်ပြုတယ်။ Interceptor ရဲ့ "အရင်" အပိုင်း run တယ်။',
        },
        {
          from: 'int',
          to: 'pipe',
          packet: '{ title: "a" }',
          title: 'Pipe က body ကို စစ်တယ်',
          note: '<code>title</code> က စာလုံး ၃ လုံးအနည်းဆုံး ရှိရမယ်လို့ DTO မှာ သတ်မှတ်ထားတယ်။ <code>"a"</code> က တစ်လုံးတည်း။',
        },
        {
          from: 'pipe',
          to: 'filter',
          packet: 'BadRequestException',
          tone: 'err',
          title: 'ValidationPipe က exception ပစ်တယ်',
          note: 'Controller method ကို <strong>လုံးဝမခေါ်ဘူး</strong>။ ဒါကြောင့် handler ထဲမှာ <code>if (!dto.title) ...</code> လို စစ်ဆေးမှုတွေ ရေးစရာမလိုတော့တာ။',
        },
        {
          from: 'filter',
          to: 'client',
          packet: '400 Bad Request',
          tone: 'err',
          title: 'ဘာမှားလဲ အသေးစိတ်ပါတဲ့ 400 ပြန်တယ်',
          note: 'class-validator က မအောင်တဲ့ စည်းကမ်းတိုင်းကို စာရင်းလုပ်ပေးတယ်။',
          lang: 'json',
          code: `{
  "statusCode": 400,
  "message": ["title must be longer than or equal to 3 characters"],
  "error": "Bad Request"
}`,
        },
      ],
    },
  ],
}

export const requestPipeline: Lesson = {
  id: 'request-pipeline',
  title: 'Request pipeline: middleware ကနေ exception filter အထိ',
  summary:
    'NestJS မှာ အရေးအကြီးဆုံး ပုံရိပ်တစ်ခုကို ရွေးရမယ်ဆိုရင် ဒါပါပဲ။ Request တစ်ခုက controller ဆီမရောက်ခင် အလွှာ ၄ လွှာကို ဖြတ်ရတယ်။ ဘယ်အလုပ်ကို ဘယ်အလွှာမှာ ရေးရမလဲ သိသွားရင် Nest code က ရှင်းသွားမယ်။',
  minutes: 35,
  blocks: [
    {
      type: 'prose',
      html: `
<p>Express မှာ အရာအားလုံးက middleware ပါ။ Auth လည်း middleware၊ validation လည်း middleware၊ logging လည်း middleware။ NestJS က ဒီအလုပ်တွေကို <strong>ရည်ရွယ်ချက်အလိုက် အမျိုးအစားခွဲ</strong>ထားပြီး အမျိုးအစားတစ်ခုစီက သတ်မှတ်ထားတဲ့ အချိန်မှာပဲ run တယ်။</p>
<p>အောက်မှာ scenario ၃ ခုရှိတယ်။ အောင်မြင်တဲ့ဟာကို အရင်ကြည့်ပြီးမှ ကျန်နှစ်ခုကိုကြည့်ပါ။ Request က ဘယ်နေရာမှာ ရပ်သွားလဲ၊ ဘယ်အလွှာတွေ <em>မ run တော့</em>လဲဆိုတာ အဓိကပါ။</p>`,
    },
    { type: 'flow', scene },
    {
      type: 'prose',
      html: `
<h2>ဘယ်အလုပ်ကို ဘယ်မှာရေးမလဲ</h2>
<table>
<thead><tr><th>အလွှာ</th><th>ဖြေတဲ့မေးခွန်း</th><th>သုံးတဲ့နေရာ</th></tr></thead>
<tbody>
<tr><td><span class="t-nest">Middleware</span></td><td>Request ကို route မရွေးခင် ဘာပြင်ဆင်မလဲ</td><td>Request ID၊ CORS၊ helmet၊ raw body</td></tr>
<tr><td><span class="t-nest">Guard</span></td><td>ဒီ request ကို ခွင့်ပြုမလား</td><td>Authentication၊ role၊ rate limit</td></tr>
<tr><td><span class="t-nest">Interceptor</span></td><td>Handler ရဲ့ အရင်နဲ့အပြီးမှာ ဘာထပ်လုပ်မလဲ</td><td>Logging၊ response ပုံစံပြောင်း၊ cache၊ timeout</td></tr>
<tr><td><span class="t-nest">Pipe</span></td><td>Input က မှန်လား၊ ဘာ type ဖြစ်ရမလဲ</td><td>Validation၊ <code>ParseIntPipe</code>၊ default တန်ဖိုး</td></tr>
<tr><td><span class="t-nest">Exception filter</span></td><td>Error ကို client ဆီ ဘယ်ပုံစံနဲ့ ပြန်မလဲ</td><td>Error format၊ database error ကို HTTP error ပြောင်း</td></tr>
</tbody>
</table>

<h2>ဘယ်အတိုင်းအတာမှာ ချိတ်မလဲ</h2>
<p>Guard၊ interceptor၊ pipe၊ filter အားလုံးကို အဆင့် ၃ ဆင့်မှာ ချိတ်လို့ရတယ်။ Method တစ်ခုတည်းအတွက်၊ controller တစ်ခုလုံးအတွက်၊ app တစ်ခုလုံး (global) အတွက်။</p>`,
    },
    {
      type: 'code',
      lang: 'ts',
      file: 'binding-levels.ts',
      code: `// ၁။ Method တစ်ခုတည်း
@UseGuards(ApiKeyGuard)
@Post()
create(@Body() dto: CreateTaskDto) {}

// ၂။ Controller တစ်ခုလုံး
@UseInterceptors(LoggingInterceptor)
@Controller('tasks')
export class TasksController {}

// ၃။ Global: main.ts မှာ (ရိုးရှင်းပေမဲ့ DI သုံးလို့မရဘူး)
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

// ၃။ Global: module ထဲမှာ (constructor မှာ တခြား provider တွေ inject လုပ်လို့ရတယ်)
@Module({
  providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class AppModule {}`,
    },
    {
      type: 'prose',
      html: `
<p>အမျိုးအစားတူ အများကြီးရှိရင် <strong>global → controller → method</strong> အစီအစဉ်နဲ့ run တယ်။ Interceptor ရဲ့ "ပြီးမှ" အပိုင်းနဲ့ exception filter တွေကတော့ ပြောင်းပြန်၊ အတွင်းဆုံးက အရင် run တယ်။ ကြက်သွန်နီအလွှာတွေလို မြင်ကြည့်ပါ။ ဝင်တဲ့အခါ အပြင်ကနေအတွင်း၊ ထွက်တဲ့အခါ အတွင်းကနေအပြင်။</p>

<h2>ValidationPipe ရဲ့ option ၃ ခုကို အမြဲဖွင့်ထားပါ</h2>
<ul>
<li><code>whitelist: true</code> က DTO မှာ မကြေညာထားတဲ့ field တွေကို ဖယ်ပစ်တယ်။ Client က <code>{ "title": "x", "isAdmin": true }</code> လို့ပို့လာရင် <code>isAdmin</code> က service ဆီ မရောက်တော့ဘူး။ ဒါက mass assignment တိုက်ခိုက်မှုကို ကာကွယ်တာ။</li>
<li><code>forbidNonWhitelisted: true</code> က ဖယ်ရုံမက <code>400</code> ပါ ပြန်တယ်။</li>
<li><code>transform: true</code> က plain object ကို DTO class instance အဖြစ်ပြောင်းပြီး <code>@Param('id') id: number</code> လို type ကြေညာထားတာတွေကိုလည်း ပြောင်းပေးတယ်။</li>
</ul>`,
    },
    {
      type: 'note',
      tone: 'tip',
      html: 'class-validator က decorator တွေကို သုံးတာမို့ DTO တွေကို <code>interface</code> နဲ့မရေးဘဲ <code>class</code> နဲ့ရေးရတယ်။ Interface က compile ပြီးရင် ပျောက်သွားလို့ runtime မှာ စစ်စရာ ဘာမှမကျန်ဘူး။ <code>npm i class-validator class-transformer</code> လုပ်ဖို့ မမေ့ပါနဲ့။',
    },
    {
      type: 'challenge',
      data: {
        id: 'ch-pipeline',
        title: 'Tasks API မှာ အလွှာ ၃ လွှာ ထည့်ပါ',
        brief:
          '<p>ရှေ့အခန်းက <code>tasks-api</code> project ကို ဆက်သုံးပါ။ Guard၊ interceptor နဲ့ validation pipe ကို ကိုယ်တိုင်ထည့်ပြီး animation ထဲက scenario ၃ ခုလုံးကို ကိုယ့်စက်မှာ ပြန်ဖြစ်အောင် လုပ်ကြည့်ပါ။</p>',
        requirements: [
          '<code>POST /tasks</code> ကို <code>x-api-key</code> header မပါရင် <code>401</code> ပြန်တယ်',
          '<code>GET /tasks</code> ကတော့ key မလိုဘဲ ရတယ်',
          'Request တိုင်းအတွက် method၊ URL နဲ့ ကြာချိန် (ms) ကို console မှာ log ထုတ်တယ်',
          '<code>title</code> က စာလုံး ၃ လုံးအောက်ဆိုရင် <code>400</code> ပြန်တယ်၊ controller method ကို မရောက်ဘူး',
          'Body ထဲက မလိုတဲ့ field တွေ (ဥပမာ <code>isAdmin</code>) ကို ဖယ်ပစ်တယ်',
          'Guard က 401 ပြန်တဲ့အခါ interceptor ရဲ့ log မထွက်ဘူးဆိုတာ ကိုယ်တိုင်မြင်ပြီးပြီ (ဘာကြောင့်လဲ ရှင်းပြနိုင်တယ်)',
        ],
        hints: [
          '<code>nest g guard common/api-key</code> နဲ့ <code>nest g interceptor common/logging</code> က အရိုးစုကို ဆောက်ပေးတယ်။',
          'Guard ကို <code>create</code> method ပေါ်မှာပဲ <code>@UseGuards()</code> နဲ့ချိတ်ပါ။ Interceptor ကိုတော့ <code>main.ts</code> မှာ <code>app.useGlobalInterceptors()</code> နဲ့ global ချိတ်ပါ။',
          'နောက်ဆုံးအချက်အတွက်: guard က interceptor ထက် အရင် run တယ်။ Guard က exception ပစ်ရင် interceptor ရဲ့ <code>intercept()</code> ကို လုံးဝမခေါ်ဘူး။ 401 တွေကိုပါ log ချင်ရင် middleware ဒါမှမဟုတ် exception filter ထဲမှာ ရေးရမယ်။',
        ],
        solution: [
          {
            file: 'src/common/api-key.guard.ts',
            lang: 'ts',
            code: `import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const expected = process.env.API_KEY ?? 'dev-secret';
    if (req.headers['x-api-key'] !== expected) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }
}`,
          },
          {
            file: 'src/common/logging.interceptor.ts',
            lang: 'ts',
            code: `import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const startedAt = Date.now();
    return next.handle().pipe(
      tap(() => console.log(req.method, req.url, Date.now() - startedAt + 'ms')),
    );
  }
}`,
          },
          {
            file: 'src/tasks/dto/create-task.dto.ts',
            lang: 'ts',
            code: `import { IsString, Length } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @Length(3, 80)
  title: string;
}`,
          },
          {
            file: 'src/main.ts',
            lang: 'ts',
            code: `import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(3000);
}
bootstrap();`,
          },
          {
            file: 'src/tasks/tasks.controller.ts (ပြောင်းတဲ့အပိုင်း)',
            lang: 'ts',
            code: `@UseGuards(ApiKeyGuard)
@Post()
create(@Body() dto: CreateTaskDto) {
  return this.tasks.create(dto.title);
}`,
          },
          {
            file: 'စမ်းကြည့်ရန်',
            lang: 'bash',
            code: `curl.exe -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\\"title\\":\\"Learn Nest\\"}"
# 401

curl.exe -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -H "x-api-key: dev-secret" -d "{\\"title\\":\\"a\\"}"
# 400

curl.exe -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -H "x-api-key: dev-secret" -d "{\\"title\\":\\"Learn Nest\\",\\"isAdmin\\":true}"
# 201, isAdmin မပါတော့ဘူး`,
          },
        ],
      },
    },
  ],
}
