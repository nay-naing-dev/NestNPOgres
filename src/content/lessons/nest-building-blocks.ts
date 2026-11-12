import type { FlowScene, Lesson } from '../types'

const scene: FlowScene = {
  title: 'App စတက်တဲ့အခါ Nest က ဘာတွေလုပ်လဲ',
  width: 760,
  height: 322,
  nodes: [
    { id: 'main', label: 'main.ts', sub: 'bootstrap()', x: 20, y: 16, w: 150, kind: 'plain' },
    { id: 'app', label: 'AppModule', sub: '@Module', x: 305, y: 16, w: 150, kind: 'nest' },
    { id: 'users', label: 'UsersModule', sub: '@Module', x: 590, y: 16, w: 150, kind: 'nest' },
    { id: 'ioc', label: 'DI container', sub: 'provider registry', x: 280, y: 128, w: 200, kind: 'client' },
    { id: 'repo', label: 'UsersRepository', sub: '@Injectable', x: 20, y: 240, w: 160, kind: 'nest' },
    { id: 'svc', label: 'UsersService', sub: '@Injectable', x: 300, y: 240, w: 160, kind: 'nest' },
    { id: 'ctrl', label: 'UsersController', sub: '@Controller', x: 580, y: 240, w: 160, kind: 'nest' },
  ],
  edges: [
    ['main', 'app'],
    ['app', 'users'],
    ['users', 'ioc'],
    ['ioc', 'repo'],
    ['ioc', 'svc'],
    ['ioc', 'ctrl'],
  ],
  scenarios: [
    {
      id: 'boot',
      label: 'bootstrap',
      steps: [
        {
          at: 'main',
          title: 'main.ts က root module ကို Nest ဆီ ပေးတယ်',
          note: 'App တစ်ခုလုံးရဲ့ အစက ဒီတစ်ကြောင်းပါ။ Nest ကို "<code>AppModule</code> ကနေစပြီး ငါ့ app ကို တည်ဆောက်ပေး" လို့ပြောတာ။',
          code: 'async function bootstrap() {\n  const app = await NestFactory.create(AppModule);\n  await app.listen(3000);\n}\nbootstrap();',
        },
        {
          from: 'main',
          to: 'app',
          packet: 'create(AppModule)',
          title: 'Nest က @Module decorator ထဲက metadata ကို ဖတ်တယ်',
          note: '<code>@Module()</code> က class ကို ဘာမှမပြောင်းဘူး။ "ဒီ module မှာ ဘာတွေပါလဲ" ဆိုတဲ့ မှတ်စုကို class ပေါ်မှာ ကပ်ထားပေးတာပဲ။ Nest က အဲဒီမှတ်စုကို ဖတ်တယ်။',
          code: '@Module({\n  imports: [UsersModule],\n})\nexport class AppModule {}',
        },
        {
          from: 'app',
          to: 'users',
          packet: 'imports',
          title: 'imports ကိုလိုက်ပြီး module graph တစ်ခုလုံးကို ရှာတယ်',
          note: 'Module တစ်ခုက တခြား module တွေကို import လုပ်ထားနိုင်တယ်။ Nest က အကုန်လိုက်ဖတ်ပြီး app ထဲမှာ ဘာ module တွေရှိလဲ၊ တစ်ခုနဲ့တစ်ခု ဘယ်လိုဆက်နေလဲ မြေပုံဆွဲတယ်။',
          code: '@Module({\n  controllers: [UsersController],\n  providers: [UsersService, UsersRepository],\n  exports: [UsersService],\n})\nexport class UsersModule {}',
        },
        {
          from: 'users',
          to: 'ioc',
          packet: 'providers',
          title: 'Provider တွေကို DI container ထဲ စာရင်းသွင်းတယ်',
          note: 'ဒီအဆင့်မှာ object တစ်ခုမှ မဆောက်ရသေးဘူး။ "<code>UsersService</code> လိုချင်ရင် ဒီ class ကနေဆောက်ရမယ်" ဆိုတဲ့ စာရင်းကိုပဲ မှတ်ထားတာ။ Class ကိုယ်တိုင်က သော့ (token) ဖြစ်တယ်။',
        },
        {
          from: 'ioc',
          to: 'repo',
          packet: 'new',
          tone: 'data',
          title: 'ဘာမှမမှီခိုတဲ့ provider ကို အရင်ဆောက်တယ်',
          note: '<code>UsersRepository</code> ရဲ့ constructor က ဘာမှမတောင်းဘူး။ ဒါကြောင့် container က သူ့ကို အရင်ဆုံး <code>new</code> လုပ်ပြီး သိမ်းထားတယ်။',
          code: "@Injectable()\nexport class UsersRepository {\n  private users = [{ id: 1, name: 'Aye Aye' }];\n\n  findAll() {\n    return this.users;\n  }\n}",
        },
        {
          from: 'ioc',
          to: 'svc',
          packet: 'new(repo)',
          tone: 'data',
          title: 'Constructor ကိုကြည့်ပြီး လိုတာကို ထည့်ပေးတယ်',
          note: 'ဒါက <strong>dependency injection</strong> ပါပဲ။ <code>UsersService</code> က <code>UsersRepository</code> ကို ကိုယ်တိုင် <code>new</code> မလုပ်ဘူး၊ constructor မှာ "ငါဒါလိုတယ်" လို့ပဲ ကြေညာတယ်။ TypeScript က parameter type တွေကို metadata အဖြစ် ထုတ်ပေးထားလို့ Nest က ဘာထည့်ပေးရမလဲ သိတယ်။',
          code: '@Injectable()\nexport class UsersService {\n  constructor(private readonly repo: UsersRepository) {}\n\n  findAll() {\n    return this.repo.findAll();\n  }\n}',
        },
        {
          from: 'ioc',
          to: 'ctrl',
          packet: 'new(service)',
          tone: 'data',
          title: 'Controller ကိုလည်း အလားတူ ဆောက်တယ်',
          note: 'Controller က service ကို တောင်းတယ်၊ container က စောစောကဆောက်ထားတဲ့ instance <em>တစ်ခုတည်းကိုပဲ</em> ပေးတယ်။ Default အားဖြင့် provider တိုင်းက <strong>singleton</strong> ဖြစ်တယ်၊ app တစ်ခုလုံးမှာ တစ်ခုပဲရှိတယ်။',
          code: "@Controller('users')\nexport class UsersController {\n  constructor(private readonly users: UsersService) {}\n\n  @Get()\n  findAll() {\n    return this.users.findAll();\n  }\n}",
        },
        {
          at: 'ctrl',
          title: 'Route တွေကို မှတ်ပုံတင်ပြီး port ကို နားထောင်တယ်',
          note: 'နောက်ဆုံးမှာ Nest က <code>@Get()</code>၊ <code>@Post()</code> တွေကိုဖတ်ပြီး <code>GET /users → UsersController.findAll</code> ဆိုတဲ့ route table ကို အောက်ခံ HTTP server (default က Express) ထဲ ထည့်တယ်။ Terminal မှာ <code>Mapped {/users, GET} route</code> ဆိုတဲ့ log ကို မြင်ရမယ်။',
        },
      ],
    },
  ],
}

export const nestBlocks: Lesson = {
  id: 'nest-building-blocks',
  title: 'Module, Controller, Provider နဲ့ Dependency Injection',
  summary:
    'Express မှာ ဖိုင်တွေကို ကိုယ့်စိတ်ကြိုက် စီရတယ်။ NestJS က ဖွဲ့စည်းပုံကို သတ်မှတ်ပေးထားပြီး အစိတ်အပိုင်းတွေကို သူကိုယ်တိုင် ချိတ်ဆက်ပေးတယ်။ အဲဒီ ချိတ်ဆက်ပုံကို ဒီအခန်းမှာ မြင်ရမယ်။',
  minutes: 30,
  blocks: [
    {
      type: 'prose',
      html: `
<h2>Express နဲ့ ဘာကွာလဲ</h2>
<p>Express app တစ်ခုက ကြီးလာတာနဲ့ မေးခွန်းတွေ ပေါ်လာတယ်။ Database connection ကို ဘယ်မှာဆောက်ပြီး ဘယ်လိုလက်ဆင့်ကမ်းမလဲ။ Validation ကို ဘယ်မှာရေးမလဲ။ Test ရေးတဲ့အခါ database အစစ်ကို ဘယ်လိုအစားထိုးမလဲ။ Team တိုင်းက ကိုယ့်နည်းကိုယ့်ဟန်နဲ့ ဖြေကြတယ်။</p>
<p>NestJS က ဒီမေးခွန်းတွေအတွက် အဖြေတစ်ခုတည်း သတ်မှတ်ပေးထားတယ်။ အခြေခံအုတ်မြစ် ၃ ခုပဲ ရှိတယ်။</p>
<table>
<thead><tr><th>အစိတ်အပိုင်း</th><th>တာဝန်</th><th>Express နဲ့ယှဉ်ရင်</th></tr></thead>
<tbody>
<tr><td><span class="t-nest">Controller</span></td><td>HTTP request လက်ခံ၊ response ပြန်</td><td>Router + route handler</td></tr>
<tr><td><span class="t-nest">Provider</span> (service)</td><td>Business logic၊ database နဲ့ဆက်သွယ်</td><td>ကိုယ်တိုင်ခွဲရေးထားတဲ့ helper module တွေ</td></tr>
<tr><td><span class="t-nest">Module</span></td><td>ဆက်စပ်တဲ့ controller နဲ့ provider တွေကို အုပ်စုဖွဲ့</td><td>တိုက်ရိုက်ညီတာ မရှိ</td></tr>
</tbody>
</table>

<h2>Project အသစ်တစ်ခု စမယ်</h2>`,
    },
    {
      type: 'code',
      lang: 'bash',
      file: 'terminal',
      code: `npm i -g @nestjs/cli
nest new tasks-api        # package manager မေးရင် npm ရွေးပါ
cd tasks-api
npm run start:dev         # ဖိုင်ပြင်တိုင်း အလိုအလျောက် restart လုပ်တယ်`,
    },
    {
      type: 'prose',
      html: `
<p><code>http://localhost:3000</code> ကိုဖွင့်ရင် <code>Hello World!</code> မြင်ရမယ်။ <code>src/</code> ထဲမှာ <code>main.ts</code>၊ <code>app.module.ts</code>၊ <code>app.controller.ts</code>၊ <code>app.service.ts</code> ဆိုပြီး အထက်က အုတ်မြစ် ၃ ခုလုံး ပါပြီးသား။</p>
<p>Feature အသစ်တစ်ခုအတွက် ဖိုင်တွေကို လက်နဲ့မဆောက်ဘဲ CLI ကို သုံးပါ။ ဖိုင်ဆောက်ပေးရုံမက module ထဲကိုလည်း အလိုအလျောက် စာရင်းသွင်းပေးတယ်။</p>`,
    },
    {
      type: 'code',
      lang: 'bash',
      file: 'terminal',
      code: `nest g module users
nest g controller users
nest g service users`,
    },
    {
      type: 'prose',
      html: `
<h2>ဒီအပိုင်းအစတွေကို ဘယ်သူက ချိတ်ပေးလဲ</h2>
<p>Nest code တွေထဲမှာ <code>new UsersService()</code> လို့ ဘယ်နေရာမှာမှ မရေးရပါဘူး။ ချိတ်ဆက်တဲ့အလုပ်ကို Nest ရဲ့ <strong>DI container</strong> က app စတက်ချိန်မှာ လုပ်ပေးတာပါ။ အဆင့်ဆင့်ကြည့်ပါ။</p>`,
    },
    { type: 'flow', scene },
    {
      type: 'prose',
      html: `
<h2>ဘာလို့ ကိုယ်တိုင် new မလုပ်တာလဲ</h2>
<ul>
<li><strong>Test ရေးရလွယ်တယ်။</strong> <code>UsersService</code> ကို test တဲ့အခါ database အစစ်နဲ့ချိတ်ထားတဲ့ repository အစား အတုတစ်ခု (mock) ကို ထည့်ပေးလိုက်ရုံပဲ။ Service code ကို တစ်လုံးမှ ပြင်စရာမလိုဘူး။</li>
<li><strong>တစ်ခုတည်းကို မျှသုံးတယ်။</strong> Database connection pool လိုဟာမျိုးကို နေရာတိုင်းက instance တစ်ခုတည်းကို သုံးသင့်တယ်။ Container က အဲဒါကို အာမခံပေးတယ်။</li>
<li><strong>အစီအစဉ်ကို စိတ်ပူစရာမလိုဘူး။</strong> ဘယ်ဟာကို အရင်ဆောက်ရမလဲဆိုတာ container က dependency graph ကိုကြည့်ပြီး ဆုံးဖြတ်တယ်။</li>
</ul>

<h2>Module က နယ်နိမိတ်ပါ</h2>
<p>Provider တစ်ခုက သူ့ module အတွင်းမှာပဲ မြင်ရတယ်။ တခြား module ကသုံးချင်ရင် အဆင့် ၂ ဆင့်လိုတယ်။ ပိုင်ရှင် module က <code>exports</code> ထဲထည့်ရမယ်၊ သုံးမယ့် module က ပိုင်ရှင် module ကို <code>imports</code> ထဲထည့်ရမယ်။</p>`,
    },
    {
      type: 'code',
      lang: 'ts',
      file: 'orders.module.ts',
      code: `@Module({
  imports: [UsersModule],          // UsersModule က export လုပ်ထားတာတွေကို သုံးခွင့်ရတယ်
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}

@Injectable()
export class OrdersService {
  // UsersService ကို UsersModule က exports ထဲထည့်ထားလို့ ဒီမှာ inject လုပ်လို့ရတယ်
  constructor(private readonly users: UsersService) {}
}`,
    },
    {
      type: 'note',
      tone: 'warn',
      html: "Nest စသုံးသူတိုင်း တွေ့ရတဲ့ error က <code>Nest can't resolve dependencies of the OrdersService (?)</code> ပါ။ မေးခွန်းသင်္ကေတနေရာက provider ကို container က ရှာမတွေ့ဘူးလို့ ဆိုလိုတာ။ အများအားဖြင့် <code>exports</code> မထည့်ထားတာ ဒါမှမဟုတ် module ကို <code>imports</code> မလုပ်ထားတာကြောင့်ပါ။",
    },
    {
      type: 'prose',
      html: `
<h2>အဆင့်မြင့် သိထားသင့်တာ ၂ ခု</h2>
<h3>Custom provider</h3>
<p><code>providers: [UsersService]</code> ဆိုတာ တကယ်တော့ <code>{ provide: UsersService, useClass: UsersService }</code> ရဲ့ အတိုကောက်ပါ။ အရှည်ပုံစံကိုသုံးပြီး token တစ်ခုအတွက် ဘာပေးမလဲ ကိုယ်တိုင်သတ်မှတ်နိုင်တယ်။ Config တန်ဖိုးတွေ၊ third-party library client တွေအတွက် သုံးတယ်။</p>`,
    },
    {
      type: 'code',
      lang: 'ts',
      file: 'custom-providers.ts',
      code: `providers: [
  { provide: 'API_KEY', useValue: process.env.API_KEY },
  { provide: PaymentGateway, useClass: isProd ? StripeGateway : FakeGateway },
  {
    provide: 'PG_POOL',
    inject: [ConfigService],
    useFactory: (config: ConfigService) => new Pool({ connectionString: config.get('DATABASE_URL') }),
  },
]

// သုံးတဲ့ဘက်မှာ string token ဆိုရင် @Inject နဲ့ ပြောပေးရတယ်
constructor(@Inject('PG_POOL') private readonly pool: Pool) {}`,
    },
    {
      type: 'prose',
      html: `
<h3>Provider scope</h3>
<p>Default က singleton ပါ။ <code>@Injectable({ scope: Scope.REQUEST })</code> လို့ရေးရင် request တိုင်းအတွက် instance အသစ်ဆောက်တယ်။ ဒါပေမဲ့ request-scoped provider ကို inject လုပ်တဲ့ class တိုင်းကလည်း request-scoped ဖြစ်သွားပြီး request တိုင်းမှာ ပြန်ဆောက်ရလို့ နှေးတယ်။ တကယ်မလိုဘဲ မသုံးပါနဲ့။ Singleton service ထဲမှာ request နဲ့ဆိုင်တဲ့ ဒေတာ (ဥပမာ လက်ရှိ user) ကို property အဖြစ် သိမ်းမထားမိဖို့ပဲ သတိထားပါ၊ request အားလုံးက အဲဒီ instance တစ်ခုတည်းကို မျှသုံးနေတာမို့ပါ။</p>`,
    },
    {
      type: 'challenge',
      data: {
        id: 'ch-tasks-module',
        title: 'Tasks module ကို memory ထဲက ဒေတာနဲ့ ဆောက်ပါ',
        brief:
          '<p><code>nest new tasks-api</code> နဲ့ဆောက်ထားတဲ့ project ထဲမှာ <code>tasks</code> ဆိုတဲ့ feature module တစ်ခု ထည့်ပါ။ Database မသုံးသေးဘဲ service ထဲက array တစ်ခုထဲမှာပဲ သိမ်းပါ။ ဒီ project ကို နောက်အခန်းနဲ့ mini project မှာ ဆက်သုံးမယ်။</p>',
        requirements: [
          '<code>nest g</code> command တွေနဲ့ <code>TasksModule</code>၊ <code>TasksController</code>၊ <code>TasksService</code> ဆောက်ထားတယ်',
          '<code>GET /tasks</code> က task အားလုံးကို array အဖြစ် ပြန်တယ်',
          '<code>GET /tasks/:id</code> က task တစ်ခုပြန်တယ်၊ မရှိရင် <code>404</code> ပြန်တယ်',
          '<code>POST /tasks</code> က body ထဲက <code>title</code> နဲ့ task အသစ်ဆောက်ပြီး <code>201</code> ပြန်တယ်',
          'Controller ထဲမှာ array ကို တိုက်ရိုက်မကိုင်ဘူး၊ service ကနေတစ်ဆင့်ပဲ သုံးတယ်',
        ],
        hints: [
          "Path parameter ကို <code>@Param('id')</code>၊ body ကို <code>@Body()</code> decorator နဲ့ ယူပါ။",
          "<code>@Param('id')</code> က string ပြန်ပေးတယ်။ <code>@Param('id', ParseIntPipe) id: number</code> လို့ရေးရင် number အဖြစ် ပြောင်းပေးတယ်။",
          'မရှိရင် service ထဲမှာ <code>throw new NotFoundException()</code> လုပ်ပါ။ Nest က အဲဒါကို 404 response အဖြစ် အလိုအလျောက်ပြောင်းပေးတယ်။',
        ],
        solution: [
          {
            file: 'src/tasks/tasks.service.ts',
            lang: 'ts',
            code: `import { Injectable, NotFoundException } from '@nestjs/common';

export interface Task {
  id: number;
  title: string;
  done: boolean;
}

@Injectable()
export class TasksService {
  private tasks: Task[] = [];
  private nextId = 1;

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: number): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException('Task ' + id + ' not found');
    return task;
  }

  create(title: string): Task {
    const task = { id: this.nextId++, title, done: false };
    this.tasks.push(task);
    return task;
  }
}`,
          },
          {
            file: 'src/tasks/tasks.controller.ts',
            lang: 'ts',
            code: `import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  findAll() {
    return this.tasks.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasks.findOne(id);
  }

  @Post() // POST က default အနေနဲ့ 201 ပြန်တယ်
  create(@Body('title') title: string) {
    return this.tasks.create(title);
  }
}`,
          },
        ],
      },
    },
  ],
}
